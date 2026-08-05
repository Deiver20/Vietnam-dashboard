"""Detección de nueva data y carga desde Supabase."""
from __future__ import annotations

from datetime import date, datetime
from typing import Any

import pandas as pd
from supabase import Client

from .upsert_supabase import fetch_last_run, fetch_pending_runs, update_run_status


def load_trade_records(
    client: Client,
    *,
    pais_codigo: str = "VIE",
    industria: str = "Rend",
    flujo: str = "Imp",
    page_size: int = 5000,
) -> pd.DataFrame:
    """Carga trade_records_enriquecido de Vietnam/Rend/Import desde Supabase (paginando)."""
    rows: list[dict] = []
    start = 0
    while True:
        resp = (
            client.table("trade_records_enriquecido")
            .select("fecha,volumen_mt,cif_total,producto_final,pais_codigo,industria,flujo")
            .eq("pais_codigo", pais_codigo)
            .eq("industria", industria)
            .eq("flujo", flujo)
            .not_.is_("fecha", "null")
            .order("fecha", desc=False)
            .range(start, start + page_size - 1)
            .execute()
        )
        batch = resp.data or []
        if not batch:
            break
        rows.extend(batch)
        if len(batch) < page_size:
            break
        start += page_size

    df = pd.DataFrame(rows)
    if df.empty:
        return df

    df["fecha"] = pd.to_datetime(df["fecha"], errors="coerce")
    df = df.dropna(subset=["fecha"]).reset_index(drop=True)
    df = df.rename(columns={"producto_final": "product"})
    df["volumen_mt"] = pd.to_numeric(df["volumen_mt"], errors="coerce")
    df["quantity"] = df["volumen_mt"]
    df["cif_total"] = pd.to_numeric(df["cif_total"], errors="coerce")
    df["cif_unit_calc"] = df["cif_total"] / df["quantity"]

    df = df[df["fecha"] >= pd.Timestamp("2022-01-01")].reset_index(drop=True)
    return df


def apply_powerbi_filter(df: pd.DataFrame) -> pd.DataFrame:
    """Replica el filtro de Power BI: quantity > 18, 20 <= cif_unit < 5000."""
    if df.empty:
        return df
    out = df[df["quantity"] > 18].copy()
    out = out[(out["cif_unit_calc"] >= 20) & (out["cif_unit_calc"] < 5000)]
    return out.reset_index(drop=True)


def get_products(df: pd.DataFrame) -> list[str]:
    """Devuelve la lista de productos únicos ordenada."""
    if df.empty or "product" not in df.columns:
        return []
    return sorted(df["product"].dropna().unique().tolist())


def data_through_date(df: pd.DataFrame) -> date | None:
    """Última fecha presente en el DataFrame."""
    if df.empty or "fecha" not in df.columns:
        return None
    return df["fecha"].max().date()


def needs_new_run(client: Client, current_max_date: date | None) -> bool:
    """Devuelve True si hay un forecast_runs 'success' más viejo que current_max_date."""
    if current_max_date is None:
        return False
    last = fetch_last_run(client, status="success")
    if last is None:
        return True
    last_data_through = last.get("data_through")
    if not last_data_through:
        return True
    if isinstance(last_data_through, str):
        try:
            last_data_through = datetime.fromisoformat(last_data_through.replace("Z", "+00:00")).date()
        except ValueError:
            return True
    return current_max_date > last_data_through


def claim_next_run(client: Client) -> dict | None:
    """Toma el siguiente forecast_runs 'pending' y lo marca 'running'. Devuelve el row o None."""
    pending = fetch_pending_runs(client)
    if not pending:
        return None
    run = pending[0]
    update_run_status(client, run["id"], status="running", started_at=datetime.utcnow().isoformat())
    run["status"] = "running"
    return run


def get_run_products(client: Client, run: dict) -> list[str]:
    """Devuelve la lista de productos a procesar. Por defecto: los del run o 13 hardcodeados."""
    if run.get("products"):
        return run["products"]
    return [
        "Blood meal", "Bone meal", "Feather meal", "Fish meal",
        "Meat and bone meal", "Poultry by-product meal",
        "Soybean meal", "Rapeseed meal", "Sunflower meal", "Cotton seed meal",
        "Wheat bran", "Rice bran", "Corn gluten meal",
    ]
