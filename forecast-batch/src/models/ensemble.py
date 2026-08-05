import pandas as pd
import numpy as np
from .base_model import BaseModel, compute_metrics


class EnsembleModel(BaseModel):
    def __init__(self, models: list[BaseModel]):
        super().__init__("Ensemble")
        self.models = models
        self.weights = None

    def fit(self, train: pd.DataFrame, target: str = "CIF_Price", freq: str = "D"):
        for m in self.models:
            try:
                if hasattr(m, "fit") and "freq" in m.fit.__code__.co_varnames:
                    m.fit(train, target, freq=freq)
                else:
                    m.fit(train, target)
            except Exception as e:
                print(f"       ⚠ {m.name} falló en fit: {e}")

    def predict(self, future_df=None, periods: int = 90) -> np.ndarray:
        preds_list = []
        for m in self.models:
            try:
                p = m.predict(periods=periods)
                preds_list.append(p)
            except Exception as e:
                print(f"       ⚠ {m.name} falló en predict: {e}")

        if not preds_list:
            raise RuntimeError("Ningún modelo pudo predecir")

        min_len = min(len(p) for p in preds_list)
        preds_list = [p[:min_len] for p in preds_list]

        if self.weights is None:
            self.weights = np.ones(len(preds_list)) / len(preds_list)

        weighted = np.zeros(min_len)
        for w, p in zip(self.weights, preds_list):
            weighted += w * p
        return weighted

    def predict_intervals(self, periods: int = 90, alpha: float = 0.10) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        all_lower = []
        all_preds = []
        all_upper = []
        for m in self.models:
            try:
                lo, pr, hi = m.predict_intervals(periods=periods, alpha=alpha)
                all_lower.append(lo)
                all_preds.append(pr)
                all_upper.append(hi)
            except Exception as e:
                print(f"       ⚠ {m.name} falló en predict_intervals: {e}")

        if not all_preds:
            return self.predict(periods=periods)

        min_len = min(len(p) for p in all_preds)
        all_lower = [p[:min_len] for p in all_lower]
        all_preds = [p[:min_len] for p in all_preds]
        all_upper = [p[:min_len] for p in all_upper]

        if self.weights is None:
            self.weights = np.ones(len(all_preds)) / len(all_preds)

        w_lower = np.zeros(min_len)
        w_preds = np.zeros(min_len)
        w_upper = np.zeros(min_len)
        for w, lo, pr, hi in zip(self.weights, all_lower, all_preds, all_upper):
            w_lower += w * lo
            w_preds += w * pr
            w_upper += w * hi
        return w_lower, w_preds, w_upper

    def set_weights_from_metrics(self, metrics_list: list[dict]):
        """Ponderar por inverso de RMSE."""
        rmses = np.array([m.get("RMSE", 1e6) for m in metrics_list])
        inv_rmses = 1.0 / (rmses + 1e-6)
        self.weights = inv_rmses / inv_rmses.sum()
