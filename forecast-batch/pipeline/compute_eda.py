"""Cálculo y persistencia de series EDA + métricas agregadas."""
from __future__ import annotations

import sys
from datetime import date, datetime
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from .upsert_ream import upsert  # noqa: E402


def _aggregate(df: pd.DataFrame, freq: str) -> pd.DataFrame:
    """Agrega df de Vietnam (filtrado por Power BI) a frecuencia D o M."""
    out = df.copy()
    if freq == "D":
        out["date"] = out["fecha"].dt.normalize()
    else:  # M
        out["date"] = out["fecha"].dt.to_period("M").dt.to_timestamp()

    g = (
        out.groupby(["date"])  # ya viene filtrado por product
        .agg(cif_price=("cif_unit_calc", "mean"), transactions=("cif_unit_calc", "count"))
        .reset_index()
    )
    return g


def _fill_gaps(s: pd.DataFrame, freq: str) -> pd.DataFrame:
    """Rellena fechas faltantes con interpolación."""
    if s.empty:
        return s
    s = s.sort_values("date").reset_index(drop=True)
    full_range = pd.date_range(start=s["date"].min(), end=s["date"].max(), freq="D" if freq == "D" else "MS")
    s = s.set_index("date").reindex(full_range).rename_axis("date").reset_index()
    limit = 7 if freq == "D" else 3
    s["cif_price"] = s["cif_price"].interpolate(method="linear", limit=limit, limit_direction="both")
    s["transactions"] = s["transactions"].fillna(0).astype(int)
    return s


def _merge_external(s: pd.DataFrame, ext: pd.DataFrame) -> pd.DataFrame:
    """Merge con external features por fecha (forward-fill dentro del rango)."""
    if ext.empty:
        s["fx_usdvnd"] = np.nan
        s["corn_fut"] = np.nan
        s["soymeal_fut"] = np.nan
        return s

    e = ext.copy()
    e["date"] = pd.to_datetime(e["date"])
    out = pd.merge(s, e, on="date", how="left")
    for col in ("fx_usdvnd", "corn_fut", "soymeal_fut"):
        out[col] = out[col].ffill().bfill()
    return out


def _add_rolling(s: pd.DataFrame, freq: str) -> pd.DataFrame:
    """Calcula rolling mean/std para ventanas S/M/L (7/30/90 ó 3/6/12)."""
    if freq == "D":
        windows = {"s": 7, "m": 30, "l": 90}
    else:
        windows = {"s": 3, "m": 6, "l": 12}

    target = "cif_price"
    s["rolling_mean_s"] = s[target].shift(1).rolling(windows["s"], min_periods=1).mean()
    s["rolling_mean_m"] = s[target].shift(1).rolling(windows["m"], min_periods=1).mean()
    s["rolling_mean_l"] = s[target].shift(1).rolling(windows["l"], min_periods=1).mean()
    s["rolling_std_s"] = s[target].shift(1).rolling(windows["s"], min_periods=1).std()
    s["rolling_std_m"] = s[target].shift(1).rolling(windows["m"], min_periods=1).std()
    s["rolling_std_l"] = s[target].shift(1).rolling(windows["l"], min_periods=1).std()
    return s


def _build_product_series(
    df: pd.DataFrame, product: str, freq: str, ext: pd.DataFrame
) -> tuple[pd.DataFrame, dict]:
    """Pipeline ETL para un (product, freq). Retorna (series_df, metrics_dict)."""
    pdf = df[df["product"] == product].copy()
    if pdf.empty:
        return pd.DataFrame(), {}

    s = _aggregate(pdf, freq)
    s = _fill_gaps(s, freq)
    s = _merge_external(s, ext)
    s = _add_rolling(s, freq)

    if s["cif_price"].dropna().empty:
        return pd.DataFrame(), {}

    metrics = {
        "current_price": float(s["cif_price"].dropna().iloc[-1]),
        "mean_price": float(s["cif_price"].mean()),
        "min_price": float(s["cif_price"].min()),
        "max_price": float(s["cif_price"].max()),
        "volatility": float(s["cif_price"].std()),
        "last_date": s["date"].max().date().isoformat() if hasattr(s["date"].max(), "date") else str(s["date"].max()),
        "data_points": int(s["cif_price"].notna().sum()),
        "fx_usdvnd": float(s["fx_usdvnd"].dropna().iloc[-1]) if s["fx_usdvnd"].notna().any() else None,
        "corn_fut": float(s["corn_fut"].dropna().iloc[-1]) if s["corn_fut"].notna().any() else None,
        "soymeal_fut": float(s["soymeal_fut"].dropna().iloc[-1]) if s["soymeal_fut"].notna().any() else None,
        "correlation_cif_fx": _safe_corr(s["cif_price"], s["fx_usdvnd"]),
        "correlation_cif_corn": _safe_corr(s["cif_price"], s["corn_fut"]),
        "correlation_cif_soy": _safe_corr(s["cif_price"], s["soymeal_fut"]),
    }
    return s, metrics


def _safe_corr(a: pd.Series, b: pd.Series) -> float | None:
    try:
        if a.dropna().empty or b.dropna().empty:
            return None
        return float(a.corr(b))
    except Exception:
        return None


def compute_and_store_eda(
    run_id: str,
    df: pd.DataFrame,
    products: list[str],
    ext: pd.DataFrame,
    *,
    frequencies: tuple[str, ...] = ("D", "M"),
    pais_codigo: str = "VIE",
    industria: str = "Rend",
    flujo: str = "Imp",
) -> dict:
    """Para cada (product × freq): construye la serie, calcula métricas, upsert en REAM.

    Retorna un dict con conteos: {series: int, metrics: int}.
    """
    if df.empty:
        return {"series": 0, "metrics": 0}

    series_rows: list[dict] = []
    metrics_rows: list[dict] = []

    for product in products:
        for freq in frequencies:
            s, m = _build_product_series(df, product, freq, ext)
            if s.empty or not m:
                print(f"       · {product} {freq}: sin datos")
                continue

            for _, r in s.iterrows():
                series_rows.append(
                    {
                        "run_id": run_id,
                        "product": product,
                        "frequency": freq,
                        "year": int(r["date"].year) if hasattr(r["date"], "year") else None,
                        "month": int(r["date"].month) if hasattr(r["date"], "month") else None,
                        "date": r["date"].date().isoformat() if hasattr(r["date"], "date") else str(r["date"]),
                        "cif_price": _to_float(r.get("cif_price")),
                        "transactions": int(r.get("transactions", 0)) if pd.notna(r.get("transactions")) else 0,
                        "fx_usdvnd": _to_float(r.get("fx_usdvnd")),
                        "corn_fut": _to_float(r.get("corn_fut")),
                        "soymeal_fut": _to_float(r.get("soymeal_fut")),
                        "rolling_mean_s": _to_float(r.get("rolling_mean_s")),
                        "rolling_mean_m": _to_float(r.get("rolling_mean_m")),
                        "rolling_mean_l": _to_float(r.get("rolling_mean_l")),
                        "rolling_std_s": _to_float(r.get("rolling_std_s")),
                        "rolling_std_m": _to_float(r.get("rolling_std_m")),
                        "rolling_std_l": _to_float(r.get("rolling_std_l")),
                        "pais_codigo": pais_codigo,
                        "industria": industria,
                        "flujo": flujo,
                    }
                )

            metrics_rows.append(
                {
                    "run_id": run_id,
                    "product": product,
                    "frequency": freq,
                    "year": int(s["date"].dt.year.max()) if not s.empty else None,
                    "pais_codigo": pais_codigo,
                    "industria": industria,
                    "flujo": flujo,
                    **m,
                }
            )
            print(f"       · {product} {freq}: {len(s)} puntos (CIF {m['current_price']:.2f})")

    n_series = 0
    n_metrics = 0
    if series_rows:
        n_series = upsert(
            "eda_series",
            series_rows,
            on_conflict="run_id,product,frequency,date,pais_codigo,industria,flujo",
        )
        print(f"[EDA] upsert eda_series: {n_series} filas")
    if metrics_rows:
        n_metrics = upsert(
            "eda_metrics",
            metrics_rows,
            on_conflict="run_id,product,frequency,pais_codigo,industria,flujo",
        )
        print(f"[EDA] upsert eda_metrics: {n_metrics} filas")

    return {"series": n_series, "metrics": n_metrics}


def _to_float(v):
    try:
        if v is None or (isinstance(v, float) and np.isnan(v)):
            return None
        return float(v)
    except Exception:
        return None
