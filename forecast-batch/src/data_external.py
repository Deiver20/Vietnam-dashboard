import pandas as pd
import numpy as np
from pathlib import Path
from functools import lru_cache
import yfinance as yf

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

EXTERNAL_TICKERS = {
    "FX_USDVND": "USDVND=X",
    "CORN_FUT": "ZC=F",
    "SOYMEAL_FUT": "ZM=F",
}


@lru_cache(maxsize=1)
def fetch_external_raw() -> pd.DataFrame:
    """Descarga datos historicos de Yahoo Finance y retorna DataFrame diario."""
    print("[EXTERNAL] Descargando datos de Yahoo Finance...")
    tickers = list(EXTERNAL_TICKERS.values())
    raw = yf.download(tickers, start="2019-01-01", progress=False)
    if "Adj Close" in raw.columns:
        prices = raw["Adj Close"]
    else:
        prices = raw["Close"]

    prices.columns = list(EXTERNAL_TICKERS.keys())
    prices = prices.asfreq("D")
    prices = prices.ffill()
    print(f"       {len(prices)} dias, {prices.isna().sum().sum()} NaNs")
    return prices


def fetch_external_features(start_date: str | pd.Timestamp = "2019-01-01") -> pd.DataFrame:
    """Retorna DataFrame con columnas: Date, FX_USDVND, CORN_FUT, SOYMEAL_FUT."""
    raw = fetch_external_raw()
    df = raw.reset_index()
    df.columns = ["Date"] + list(EXTERNAL_TICKERS.keys())
    df["Date"] = pd.to_datetime(df["Date"])
    start = pd.to_datetime(start_date)
    df = df[df["Date"] >= start]
    return df.reset_index(drop=True)


def merge_external(series_df: pd.DataFrame) -> pd.DataFrame:
    """Agrega features externos a una serie temporal (diaria o mensual)."""
    ext = fetch_external_features(start_date=series_df["Date"].min())
    series_df = series_df.copy()
    series_df["Date"] = pd.to_datetime(series_df["Date"])
    merged = pd.merge(series_df, ext, on="Date", how="left")
    merged[["FX_USDVND", "CORN_FUT", "SOYMEAL_FUT"]] = merged[
        ["FX_USDVND", "CORN_FUT", "SOYMEAL_FUT"]
    ].ffill().bfill()
    return merged


def aggregate_external_monthly(ext_daily: pd.DataFrame) -> pd.DataFrame:
    """Agrega features externos a frecuencia mensual (media del mes)."""
    ext = ext_daily.copy()
    ext["Date"] = pd.to_datetime(ext["Date"])
    ext["Month"] = ext["Date"].dt.to_period("M").dt.to_timestamp()
    monthly = ext.groupby("Month")[list(EXTERNAL_TICKERS.keys())].mean().reset_index()
    monthly = monthly.rename(columns={"Month": "Date"})
    return monthly


def get_monthly_external(start_date: str | pd.Timestamp = "2019-01-01") -> pd.DataFrame:
    """Retorna features externos mensuales."""
    daily = fetch_external_features(start_date=start_date)
    return aggregate_external_monthly(daily)


if __name__ == "__main__":
    df = get_monthly_external()
    print(df.head())
    print(f"\n{len(df)} meses, columnas: {list(df.columns)}")
