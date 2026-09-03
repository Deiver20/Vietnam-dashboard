"""Cálculo y persistencia de external features (FX per-country, CORN, SOYMEAL) vía yfinance."""
from __future__ import annotations

import sys
from datetime import date, datetime, timedelta
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from src.data_external import EXTERNAL_TICKERS, fetch_external_features, fetch_external_features_for_country  # noqa: E402

from .upsert_ream import upsert


def compute_and_store_external(
    *,
    start_date: date | None = None,
    pais_codigo: str | None = None,
) -> int:
    """Descarga features externos y los upsert en `external_features` (per-country). Devuelve filas escritas."""
    if start_date is None:
        start_date = date(2019, 1, 1)

    # Per-country FX: VIE=USDVND, COL=USDCOP. Corn/Soy remain global (CME).
    country = (pais_codigo or "VIE").upper()
    print(f"[EXTERNAL] Descargando yfinance {country} desde {start_date}...")
    if pais_codigo:
        df = fetch_external_features_for_country(country, start_date=pd.Timestamp(start_date))
    else:
        df = fetch_external_features(start_date=pd.Timestamp(start_date))
    if df.empty:
        print("[EXTERNAL] DataFrame vacío — nada que guardar")
        return 0

    df = df.rename(
        columns={
            "Date": "date",
            "FX_USDVND": "fx_usdvnd",
            "CORN_FUT": "corn_fut",
            "SOYMEAL_FUT": "soymeal_fut",
        }
    )
    df["date"] = pd.to_datetime(df["date"]).dt.date
    df = df.dropna(subset=["date"]).reset_index(drop=True)
    # Per-country upsert: column pais_codigo now exists (migration 013)
    df["pais_codigo"] = country
    # If table still lacks pais_codigo (old DB), fallback to date-only upsert
    try:
        rows = df.to_dict(orient="records")
        print(f"[EXTERNAL] {len(rows)} filas {country} → upsert a REAM (date,pais_codigo)")
        n = upsert("external_features", rows, on_conflict="date,pais_codigo")
        return n
    except Exception as e:
        if "pais_codigo" in str(e):
            df = df.drop(columns=["pais_codigo"])
            rows = df.to_dict(orient="records")
            print(f"[EXTERNAL] fallback global upsert {len(rows)} filas (sin pais_codigo): {e}")
            n = upsert("external_features", rows, on_conflict="date")
            return n
        raise
