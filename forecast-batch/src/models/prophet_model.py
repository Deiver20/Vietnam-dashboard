import pandas as pd
import numpy as np
from prophet import Prophet
from .base_model import BaseModel


class ProphetModel(BaseModel):
    def __init__(self, freq="D", yearly_seasonality=True, weekly_seasonality=True, daily_seasonality=False):
        super().__init__("Prophet")
        self.freq = freq
        self._yearly = yearly_seasonality
        self._weekly = weekly_seasonality if freq == "D" else False
        self._daily = daily_seasonality if freq == "D" else False
        self.fitted = None
        self._future_frame = None

    def fit(self, train: pd.DataFrame, target: str = "CIF_Price"):
        df = train.rename(columns={"Date": "ds", target: "y"})[["ds", "y"]].copy()
        df["ds"] = pd.to_datetime(df["ds"])
        df = df.dropna(subset=["y"])
        if len(df) < 30:
            raise ValueError(f"Solo {len(df)} puntos — insuficiente para Prophet")
        self.fitted = Prophet(
            yearly_seasonality=self._yearly,
            weekly_seasonality=self._weekly,
            daily_seasonality=self._daily,
        )
        self.fitted.fit(df)

    def predict(self, future_df=None, periods: int = 90) -> np.ndarray:
        if self.fitted is None:
            raise RuntimeError("Modelo no entrenado")
        future_freq = "MS" if self.freq == "M" else "D"
        future = self.fitted.make_future_dataframe(periods=periods, freq=future_freq)
        forecast = self.fitted.predict(future)
        self._last_forecast = forecast
        self._future_frame = forecast.tail(periods)
        preds = forecast["yhat"].values[-periods:]
        return np.maximum(preds, 0)

    def predict_intervals(self, periods: int = 90, alpha: float = 0.10) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        if self.fitted is None:
            raise RuntimeError("Modelo no entrenado")
        if getattr(self, "_last_forecast", None) is None:
            self.predict(periods=periods)
        fc = getattr(self, "_last_forecast", None)
        if fc is not None:
            lower = fc["yhat_lower"].values[-periods:]
            upper = fc["yhat_upper"].values[-periods:]
            preds = fc["yhat"].values[-periods:]
            return np.maximum(lower, 0), np.maximum(preds, 0), np.maximum(upper, 0)
        preds = self.predict(periods=periods)
        return preds, preds, preds
