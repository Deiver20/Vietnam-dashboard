"""Cálculo y persistencia de external features (USDVND, CORN, SOYMEAL) vía yfinance."""
from __future__ import annotations

import sys
from datetime import date, datetime, timedelta
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from src.data_external import EXTERNAL_TICKERS, fetch_external_features  # noqa: E402

from .upsert_ream import upsert


def compute_and_store_external(
    *,
    start_date: date | None = None,
) -> int:
    """Descarga features externos y los upsert en `external_features`. Devuelve filas escritas."""
    if start_date is None:
        start_date = date(2019, 1, 1)

    print(f"[EXTERNAL] Descargando yfinance desde {start_date}...")
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

    rows = df.to_dict(orient="records")
    print(f"[EXTERNAL] {len(rows)} filas → upsert a REAM")
    n = upsert("external_features", rows, on_conflict="date")
    return n
