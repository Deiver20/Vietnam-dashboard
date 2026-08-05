from abc import ABC, abstractmethod
import pandas as pd
import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error


def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> dict[str, float]:
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_true, y_pred)
    mask = y_true != 0
    mape = np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100 if mask.sum() > 0 else np.nan
    return {"RMSE": rmse, "MAE": mae, "MAPE": mape}


class BaseModel(ABC):
    def __init__(self, name: str = "base"):
        self.name = name
        self.model = None
        self.metrics = {}

    @abstractmethod
    def fit(self, train: pd.DataFrame, target: str = "CIF_Price"):
        ...

    @abstractmethod
    def predict(self, future_df: pd.DataFrame | None = None, periods: int = 90) -> np.ndarray:
        ...

    def predict_intervals(self, periods: int = 90, alpha: float = 0.10) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Retorna (lower, preds, upper). Sobrescribir segun modelo."""
        preds = self.predict(periods=periods)
        return preds, preds, preds

    def evaluate(self, y_true: np.ndarray, y_pred: np.ndarray):
        self.metrics = compute_metrics(y_true, y_pred)
        return self.metrics
