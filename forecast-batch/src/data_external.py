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

# Per-country FX ticker. Corn/Soy remain global (CME). FX column keeps legacy name fx_usdvnd but value is per-country.
FX_TICKER_BY_COUNTRY: dict[str, str] = {
    "VIE": "USDVND=X",
    "COL": "USDCOP=X",
    "CHI": "USDCLP=X",
    "BRA": "USDBRL=X",
    "ARG": "USDARS=X",
}
FX_TICKER_ALIASES: dict[str, list[str]] = {
    "COL": ["USDCOP=X", "COP=X"],
    "VIE": ["USDVND=X"],
    "CHI": ["USDCLP=X", "CLP=X"],
    "BRA": ["USDBRL=X", "BRL=X"],
    "ARG": ["USDARS=X", "ARS=X"],
}


@lru_cache(maxsize=4)
def fetch_external_raw() -> pd.DataFrame:
    """Descarga datos historicos de Yahoo Finance y retorna DataFrame diario (VIE default)."""
    print("[EXTERNAL] Descargando datos de Yahoo Finance (global VIE)...")
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


def _fetch_fx_series(country: str, start_date: str | pd.Timestamp = "2019-01-01") -> pd.Series:
    """Fetch FX series for a specific country, trying aliases."""
    country = (country or "VIE").upper()
    aliases = FX_TICKER_ALIASES.get(country) or [FX_TICKER_BY_COUNTRY.get(country, "USDVND=X")]
    last_err: Exception | None = None
    for ticker in aliases:
        try:
            print(f"[EXTERNAL] Fetching FX {country} ticker {ticker} ...")
            raw = yf.download(ticker, start="2019-01-01", progress=False)
            if raw.empty:
                continue
            if "Adj Close" in raw.columns:
                col = raw["Adj Close"]
            else:
                col = raw["Close"]
            # yfinance returns Series or DataFrame with one column
            if isinstance(col, pd.DataFrame):
                col = col.iloc[:, 0]
            col = col.asfreq("D").ffill()
            col.name = "FX_USDVND"
            # slice to start_date for consistency
            col = col[pd.to_datetime(col.index) >= pd.to_datetime(start_date)]
            if col.notna().any():
                print(f"       FX {country} {ticker}: {len(col)} dias, last={col.dropna().iloc[-1]:.2f}")
                return col
        except Exception as e:
            last_err = e
            print(f"       FX {country} {ticker} failed: {e}")
            continue
    raise RuntimeError(f"No FX data for {country} (tried {aliases}): {last_err}")


@lru_cache(maxsize=8)
def fetch_external_raw_for_country(country: str) -> pd.DataFrame:
    """Descarga FX per-country + corn/soy globales, retorna DataFrame con FX_USDVND per country."""
    country = (country or "VIE").upper()
    print(f"[EXTERNAL] Descargando datos per-country {country}...")
    # Fetch FX per country
    fx = _fetch_fx_series(country, start_date="2019-01-01")
    # Fetch corn/soy global (VIE default includes them; reuse but drop FX)
    base = fetch_external_raw()
    # base has FX_USDVND (VIE), CORN_FUT, SOYMEAL_FUT ; we replace FX with per-country
    df = pd.DataFrame({"FX_USDVND": fx})
    # Align corn/soy from base (reindex to fx index)
    if "CORN_FUT" in base.columns:
        df["CORN_FUT"] = base["CORN_FUT"].reindex(df.index).ffill().bfill()
    if "SOYMEAL_FUT" in base.columns:
        df["SOYMEAL_FUT"] = base["SOYMEAL_FUT"].reindex(df.index).ffill().bfill()
    df = df.asfreq("D").ffill()
    df.index.name = "Date"
    print(f"       {country} {len(df)} dias, NaNs {df.isna().sum().sum()}")
    return df


def fetch_external_features(start_date: str | pd.Timestamp = "2019-01-01") -> pd.DataFrame:
    """Retorna DataFrame con columnas: Date, FX_USDVND, CORN_FUT, SOYMEAL_FUT (VIE default)."""
    raw = fetch_external_raw()
    df = raw.reset_index()
    df.columns = ["Date"] + list(EXTERNAL_TICKERS.keys())
    df["Date"] = pd.to_datetime(df["Date"])
    start = pd.to_datetime(start_date)
    df = df[df["Date"] >= start]
    return df.reset_index(drop=True)


def fetch_external_features_for_country(country: str, start_date: str | pd.Timestamp = "2019-01-01") -> pd.DataFrame:
    """Retorna DataFrame per-country: Date, FX_USDVND (COP for COL, VND for VIE), CORN_FUT, SOYMEAL_FUT."""
    raw = fetch_external_raw_for_country(country)
    df = raw.reset_index()
    # raw index is Date, columns are FX_USDVND, CORN_FUT, SOYMEAL_FUT
    df.columns = ["Date", "FX_USDVND", "CORN_FUT", "SOYMEAL_FUT"]
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
