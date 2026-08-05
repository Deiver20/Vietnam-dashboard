import pandas as pd
import numpy as np
from catboost import CatBoostRegressor
from .base_model import BaseModel

EXCLUDE_FROM_FEATURES = {"date", "Date", "cif_price", "CIF_Price", "Product", "Exporter", "Importer",
                         "transactions", "Transactions", "Month", "MonthNum", "Year", "MA30"}


class CatBoostModel(BaseModel):
    def __init__(self, iterations=500, depth=5, learning_rate=0.05):
        super().__init__("CatBoost")
        self.iterations = iterations
        self.depth = depth
        self.learning_rate = learning_rate
        self.fitted = None
        self._low_model = None
        self._high_model = None
        self._last_features = None
        self._feature_cols = []
        self.freq = "D"

    def fit(self, train: pd.DataFrame, target: str = "CIF_Price", freq: str = "D"):
        self.freq = freq
        self._feature_cols = [c for c in train.columns
                              if c not in EXCLUDE_FROM_FEATURES]
        if not self._feature_cols:
            raise ValueError("No hay features disponibles — ejecuta features.py primero")
        X = train[self._feature_cols].values
        y = train[target].values
        mask = ~np.isnan(X).any(axis=1) & ~np.isnan(y)
        X, y = X[mask], y[mask]

        base_params = {
            "iterations": self.iterations,
            "depth": self.depth,
            "learning_rate": self.learning_rate,
            "verbose": 0,
            "random_seed": 42,
        }

        self.fitted = CatBoostRegressor(
            **base_params, loss_function="RMSE",
        )
        self.fitted.fit(X, y)

        self._low_model = CatBoostRegressor(
            **base_params, loss_function="Quantile:alpha=0.10",
        )
        self._low_model.fit(X, y)

        self._high_model = CatBoostRegressor(
            **base_params, loss_function="Quantile:alpha=0.90",
        )
        self._high_model.fit(X, y)

        self._last_features = train[self._feature_cols].iloc[-1:].copy()

    def predict(self, future_df=None, periods: int = 90) -> np.ndarray:
        return self._predict_with_model(self.fitted, periods)

    def predict_intervals(self, periods: int = 90, alpha: float = 0.10) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        if self.fitted is None:
            raise RuntimeError("Modelo no entrenado")
        if self._low_model is not None:
            lower = self._predict_with_model(self._low_model, periods)
        else:
            lower = self.predict(periods=periods)
        preds = self._predict_with_model(self.fitted, periods)
        if self._high_model is not None:
            upper = self._predict_with_model(self._high_model, periods)
        else:
            upper = preds
        lower = np.maximum(lower, 0)
        preds = np.maximum(preds, 0)
        upper = np.maximum(upper, 0)
        for i in range(len(preds)):
            a, b, c = sorted([lower[i], preds[i], upper[i]])
            lower[i], preds[i], upper[i] = a, b, c
        return lower, preds, upper

    def _predict_with_model(self, model, periods: int) -> np.ndarray:
        last = self._last_features.copy()
        preds = []
        for _ in range(periods):
            p = model.predict(last[self._feature_cols].values)
            preds.append(float(p))
            last = self._advance_features(last, float(p))
        return np.array(preds)

    def explain(self) -> dict | None:
        if self.fitted is None:
            return None
        try:
            shap_values = self.fitted.get_feature_importance(
                type="ShapValues",
                data=np.array([row for row in self._last_features[self._feature_cols].values]),
            )
            shap_vals = shap_values[0, :-1]
            mean_abs = np.abs(shap_vals)
            idxs = np.argsort(-mean_abs)
            return {
                "features": [self._feature_cols[i] for i in idxs],
                "importance": [float(mean_abs[i]) for i in idxs],
                "shap_values_last": [float(shap_vals[i]) for i in idxs],
            }
        except Exception:
            return None

    def _advance_features(self, last_row: pd.DataFrame, new_price: float) -> pd.DataFrame:
        new = last_row.copy()

        lag_cols = sorted(
            [c for c in self._feature_cols if c.startswith("lag_")],
            key=lambda x: int(x.split("_")[1]),
        )
        if lag_cols:
            shortest = lag_cols[0]
            new[shortest] = new_price
            for i in range(len(lag_cols) - 1, 0, -1):
                larger = lag_cols[i]
                smaller = lag_cols[i - 1]
                if smaller in last_row.columns:
                    new[larger] = float(last_row[smaller].values[0])

        rolling_mean_cols = [c for c in self._feature_cols if c.startswith("rolling_mean_")]
        for col in rolling_mean_cols:
            try:
                window = int(col.split("_")[-1])
            except ValueError:
                continue
            decay = (window - 1) / window
            new[col] = float(last_row[col].values[0]) * decay + new_price * (1.0 / window)

        for col in [c for c in self._feature_cols if c.startswith("rolling_std_")]:
            new[col] = last_row[col].values[0]

        if self.freq == "M":
            prev_month = int(last_row["month"].values[0])
            nm = (prev_month % 12) + 1
            new["month"] = nm
            new["quarter"] = (nm - 1) // 3 + 1
            new["month_sin"] = np.sin(2 * np.pi * nm / 12)
            new["month_cos"] = np.cos(2 * np.pi * nm / 12)
        else:
            if "dayofweek" in new.columns:
                d = (int(last_row["dayofweek"].values[0]) + 1) % 7
                new["dayofweek"] = d
                new["dayofweek_sin"] = np.sin(2 * np.pi * d / 7)
                new["dayofweek_cos"] = np.cos(2 * np.pi * d / 7)
            if "month" in new.columns:
                prev_month = int(last_row["month"].values[0])
                nm = (prev_month % 12) + 1
                new["month"] = nm
                new["quarter"] = (nm - 1) // 3 + 1
                new["month_sin"] = np.sin(2 * np.pi * nm / 12)
                new["month_cos"] = np.cos(2 * np.pi * nm / 12)

        return new
