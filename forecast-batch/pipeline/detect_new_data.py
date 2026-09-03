"""Detección de nueva data y carga desde REAM (agmdatabase)."""
from __future__ import annotations

from datetime import date, datetime
from typing import Any

import pandas as pd

from .upsert_ream import fetch_last_run, fetch_pending_runs, update_run_status


def load_trade_records(
    *,
    pais_codigo: str = "VIE",
    industria: str = "Rend",
    flujo: str = "Imp",
    page_size: int = 5000,
) -> pd.DataFrame:
    """Carga trade_records_enriquecido de un país/industria/flujo desde REAM (paginando)."""
    import psycopg2
    import psycopg2.extras
    from .ream_client import get_conn

    rows: list[dict] = []
    start = 0
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            while True:
                cur.execute(
                    """
                    SELECT fecha, volumen_mt, cif_total, fob_total, producto_final, pais_codigo, industria, flujo
                    FROM public.trade_records_enriquecido
                    WHERE pais_codigo = %s AND industria = %s AND flujo = %s
                      AND fecha IS NOT NULL
                    ORDER BY fecha ASC
                    LIMIT %s OFFSET %s
                    """,
                    (pais_codigo, industria, flujo, page_size, start),
                )
                batch = [dict(r) for r in cur.fetchall()]
                if not batch:
                    break
                rows.extend(batch)
                if len(batch) < page_size:
                    break
                start += page_size
    finally:
        conn.close()

    df = pd.DataFrame(rows)
    if df.empty:
        return df

    df["fecha"] = pd.to_datetime(df["fecha"], errors="coerce")
    df = df.dropna(subset=["fecha"]).reset_index(drop=True)
    df = df.rename(columns={"producto_final": "product"})
    df["volumen_mt"] = pd.to_numeric(df["volumen_mt"], errors="coerce")
    df["quantity"] = df["volumen_mt"]
    # Imports CIF, exports FOB; BRA declara FOB en ambos flujos (ver tradeService.valueColumn)
    if str(pais_codigo).upper() == "BRA":
        value_col = "fob_total"
    else:
        value_col = "fob_total" if flujo == "Exp" else "cif_total"
    df["value_total"] = pd.to_numeric(df[value_col], errors="coerce")
    df["cif_unit_calc"] = df["value_total"] / df["quantity"]

    df = df[df["fecha"] >= pd.Timestamp("2022-01-01")].reset_index(drop=True)
    return df


def fetch_scopes(activo: bool = True, min_rows: int = 500) -> list[dict]:
    """Devuelve las combinaciones país/industria/flujo a procesar.

    Se derivan de los datos reales en trade_records_enriquecido (la fuente de
    verdad) con datos desde 2022, para que cualquier país cargado se procese sin
    depender de configuración manual. Se filtran scopes con muy pocas filas.
    """
    from .ream_client import get_conn
    import psycopg2
    import psycopg2.extras

    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """
                SELECT pais_codigo, industria, flujo, COUNT(*) AS n
                FROM public.trade_records_enriquecido
                WHERE fecha >= '2022-01-01' AND fecha IS NOT NULL
                GROUP BY pais_codigo, industria, flujo
                HAVING COUNT(*) >= %s
                ORDER BY pais_codigo, industria, flujo
                """,
                (min_rows,),
            )
            rows = [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()

    scopes: list[dict] = []
    for r in rows:
        key = (r.get("pais_codigo"), r.get("industria"), r.get("flujo"))
        if not all(key):
            continue
        scopes.append({"pais_codigo": key[0], "industria": key[1], "flujo": key[2]})
    return scopes


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


def needs_new_run(current_max_date: date | None, scope: dict[str, str]) -> bool:
    """Devuelve True si hay un forecast_runs 'success' más viejo que current_max_date para el scope."""
    if current_max_date is None:
        return False
    last = fetch_last_run(status="success", scope=scope)
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


def claim_next_run(scope: dict[str, str]) -> dict | None:
    """Toma el siguiente forecast_runs 'pending' del scope y lo marca 'running'. Devuelve el row o None."""
    pending = fetch_pending_runs(scope=scope)
    if not pending:
        return None
    run = pending[0]
    update_run_status(run["id"], status="running", started_at=datetime.utcnow().isoformat())
    run["status"] = "running"
    return run


def get_run_products(run: dict) -> list[str]:
    """Devuelve la lista de productos a procesar. Por defecto: los del run o 13 hardcodeados."""
    if run.get("products"):
        return run["products"]
    return [
        "Blood meal", "Bone meal", "Feather meal", "Fish meal",
        "Meat and bone meal", "Poultry by-product meal",
        "Soybean meal", "Rapeseed meal", "Sunflower meal", "Cotton seed meal",
        "Wheat bran", "Rice bran", "Corn gluten meal",
    ]