import pandas as pd
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

EXTERNAL_COLS = ["fx_usdvnd", "corn_fut", "soymeal_fut"]


def build_calendar_features(df: pd.DataFrame, freq: str = "D") -> pd.DataFrame:
    df = df.copy()
    date_col = "Date" if "Date" in df.columns else "date"
    df["month"] = df[date_col].dt.month
    df["quarter"] = df[date_col].dt.quarter
    df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
    df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)

    if freq == "D":
        df["dayofweek"] = df[date_col].dt.dayofweek
        df["dayofyear"] = df[date_col].dt.dayofyear
        df["is_month_start"] = df[date_col].dt.is_month_start.astype(int)
        df["is_month_end"] = df[date_col].dt.is_month_end.astype(int)
        df["dayofweek_sin"] = np.sin(2 * np.pi * df["dayofweek"] / 7)
        df["dayofweek_cos"] = np.cos(2 * np.pi * df["dayofweek"] / 7)

    return df


def build_lag_features(df: pd.DataFrame, target: str = "CIF_Price", lags: list[int] = None) -> pd.DataFrame:
    if lags is None:
        lags = [1, 7, 30, 90]
    df = df.copy()
    for lag in lags:
        df[f"lag_{lag}"] = df[target].shift(lag)
    return df


def build_rolling_features(df: pd.DataFrame, target: str = "CIF_Price", windows: list[int] = None) -> pd.DataFrame:
    if windows is None:
        windows = [7, 30, 90]
    df = df.copy()
    for w in windows:
        df[f"rolling_mean_{w}"] = df[target].shift(1).rolling(window=w, min_periods=1).mean()
        df[f"rolling_std_{w}"] = df[target].shift(1).rolling(window=w, min_periods=1).std()
    return df


def build_all_features(df: pd.DataFrame, target: str = "CIF_Price", freq: str = "D") -> pd.DataFrame:
    date_col = "Date" if "Date" in df.columns else "date"
    df = df.sort_values(date_col).reset_index(drop=True)
    df = build_calendar_features(df, freq=freq)

    if freq == "M":
        df = build_lag_features(df, target, lags=[1, 3, 6, 12])
        df = build_rolling_features(df, target, windows=[3, 6, 12])
    else:
        df = build_lag_features(df, target)
        df = build_rolling_features(df, target)

    for ext_col in EXTERNAL_COLS:
        if ext_col in df.columns:
            if freq == "M":
                df = build_lag_features(df, ext_col, lags=[1, 3, 6, 12])
                df = build_rolling_features(df, ext_col, windows=[3, 6, 12])
            else:
                df = build_lag_features(df, ext_col)
                df = build_rolling_features(df, ext_col)

    return df


def load_series(name: str, prefix: str = "") -> pd.DataFrame:
    path = DATA_DIR / f"{prefix}series_{name}.parquet"
    return pd.read_parquet(path)


def prepare_ml_data(df: pd.DataFrame, group_cols: list[str], freq: str = "D") -> pd.DataFrame:
    """Apply feature engineering per group (product, exporter, etc.)."""
    results = []
    for _, grp in df.groupby(group_cols):
        grp = build_all_features(grp, freq=freq)
        results.append(grp)
    result = pd.concat(results, ignore_index=True)
    return result.dropna(subset=["lag_1"])
