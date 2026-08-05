import pandas as pd
import numpy as np
import warnings
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX
from .base_model import BaseModel

warnings.filterwarnings("ignore")


class ARIMAModel(BaseModel):
    def __init__(self, order=(2, 1, 2), seasonal_order=(1, 0, 1, 7)):
        super().__init__("ARIMA")
        self.order = order
        self.seasonal_order = seasonal_order
        self.fitted = None

    def fit(self, train: pd.DataFrame, target: str = "CIF_Price"):
        ts = train[target].values.astype(float)
        min_seasonal = 3 * self.seasonal_order[3] if len(self.seasonal_order) > 3 else 0
        use_seasonal = len(ts) >= min_seasonal
        try:
            if use_seasonal:
                self.fitted = SARIMAX(
                    ts,
                    order=self.order,
                    seasonal_order=self.seasonal_order,
                    enforce_stationarity=False,
                    enforce_invertibility=False,
                ).fit(disp=False)
            else:
                self.fitted = ARIMA(ts, order=self.order).fit()
        except Exception:
            self.fitted = ARIMA(ts, order=self.order).fit()

    def predict(self, future_df=None, periods: int = 90) -> np.ndarray:
        if self.fitted is None:
            raise RuntimeError("Modelo no entrenado")
        return self.fitted.forecast(steps=periods)

    def predict_intervals(self, periods: int = 90, alpha: float = 0.10) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        if self.fitted is None:
            raise RuntimeError("Modelo no entrenado")
        fc = self.fitted.get_forecast(steps=periods)
        ci = fc.conf_int(alpha=alpha)
        preds = fc.predicted_mean
        lower = np.maximum(ci[:, 0], 0)
        upper = np.maximum(ci[:, 1], 0)
        return lower, np.maximum(preds, 0), upper


class AutoARIMAModel(BaseModel):
    """Prueba varios órdenes y elige el de menor AIC."""
    def __init__(self):
        super().__init__("AutoARIMA")
        self.fitted = None

    def fit(self, train: pd.DataFrame, target: str = "CIF_Price"):
        ts = train[target].values.astype(float)
        best_aic = np.inf
        best_order = (1, 1, 1)
        for p in range(0, 4):
            for q in range(0, 4):
                try:
                    m = ARIMA(ts, order=(p, 1, q)).fit()
                    if m.aic < best_aic:
                        best_aic = m.aic
                        best_order = (p, 1, q)
                except Exception:
                    pass
        self.fitted = ARIMA(ts, order=best_order).fit()
        self.order = best_order

    def predict(self, future_df=None, periods: int = 90) -> np.ndarray:
        if self.fitted is None:
            raise RuntimeError("Modelo no entrenado")
        return self.fitted.forecast(steps=periods)
