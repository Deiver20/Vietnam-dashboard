"""Cliente PostgreSQL (REAM/agmdatabase) para el batch de proyecciones.

La BD de trade del Dashboard Vietnam vive en la instancia REAM (agmdatabase).
El batch lee `trade_records_enriquecido` y escribe `eda_*`/`forecast_*` en REAM.
"""
from __future__ import annotations

import os
from typing import Any, Iterable, Sequence

import psycopg2
import psycopg2.extras


def _conn_kwargs() -> dict[str, Any]:
    host = os.environ.get("REAM_DB_HOST")
    if not host:
        raise RuntimeError(
            "Falta REAM_DB_HOST en el entorno. La BD de trade es REAM (agmdatabase); "
            "configura REAM_DB_HOST/PORT/NAME/USER/PASSWORD en .env o variables de entorno."
        )
    sslmode = "disable" if str(os.environ.get("REAM_DB_SSL", "")).lower() in ("false", "disable", "0") else "require"
    return {
        "host": host,
        "port": int(os.environ.get("REAM_DB_PORT", "5432")),
        "dbname": os.environ.get("REAM_DB_NAME"),
        "user": os.environ.get("REAM_DB_USER"),
        "password": os.environ.get("REAM_DB_PASSWORD"),
        "sslmode": sslmode,
        "connect_timeout": 15,
    }


def get_conn():
    """Abre una conexión psycopg2 a REAM."""
    return psycopg2.connect(**_conn_kwargs())


def _to_db_value(value: Any) -> Any:
    import math

    if value is None:
        return None
    if isinstance(value, float) and math.isnan(value):
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return value


def upsert(table: str, rows: Iterable[dict], on_conflict: str | None = None, chunk_size: int = 500) -> int:
    """Upsert por chunks en REAM. Devuelve el total de filas procesadas."""
    batch = list(rows)
    if not batch:
        return 0

    columns = [c for c in {k for r in batch for k in r.keys()} if c != "id"]
    col_sql = ", ".join(columns)

    if on_conflict:
        update_cols = [c for c in columns if c not in {x.strip() for x in on_conflict.split(",")}]
        if update_cols:
            set_sql = ", ".join(f"{c} = EXCLUDED.{c}" for c in update_cols)
            conflict_sql = f" ON CONFLICT ({on_conflict}) DO UPDATE SET {set_sql}"
        else:
            conflict_sql = f" ON CONFLICT ({on_conflict}) DO NOTHING"
    else:
        conflict_sql = ""

    sql = f"INSERT INTO public.{table} ({col_sql}) VALUES %s{conflict_sql}"

    total = 0
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            for i in range(0, len(batch), chunk_size):
                chunk = batch[i : i + chunk_size]
                values = [[_to_db_value(r.get(c)) for c in columns] for r in chunk]
                psycopg2.extras.execute_values(cur, sql, values, page_size=chunk_size)
                total += len(chunk)
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
    return total


def delete_where(table: str, column: str, value: Any) -> int:
    """Borra filas de una tabla donde `column = value`. Devuelve count."""
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(f"DELETE FROM public.{table} WHERE {column} = %s", (value,))
            count = cur.rowcount
        conn.commit()
        return count
    finally:
        conn.close()


def fetch_all(table: str, columns: str = "*", where: str | None = None, order_by: str | None = None, limit: int | None = None) -> list[dict]:
    """Consulta simple por columnas. Devuelve list[dict]."""
    sql = f"SELECT {columns} FROM public.{table}"
    params: list[Any] = []
    if where:
        sql += f" WHERE {where}"
    if order_by:
        sql += f" ORDER BY {order_by}"
    if limit:
        sql += f" LIMIT {limit}"
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params)
            rows = cur.fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def fetch_last_run(status: str = "success", scope: dict[str, str] | None = None) -> dict | None:
    """Devuelve el último forecast_runs con el status dado (y scope opcional)."""
    where = "status = %s"
    params: list[Any] = [status]
    for col, val in (scope or {}).items():
        where += f" AND {col} = %s"
        params.append(val)
    sql = f"SELECT * FROM public.forecast_runs WHERE {where} ORDER BY created_at DESC LIMIT 1"
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params)
            row = cur.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def fetch_pending_runs(scope: dict[str, str] | None = None) -> list[dict]:
    """Devuelve los forecast_runs en estado 'pending' (y scope opcional)."""
    where = "status = 'pending'"
    params: list[Any] = []
    for col, val in (scope or {}).items():
        where += f" AND {col} = %s"
        params.append(val)
    sql = f"SELECT * FROM public.forecast_runs WHERE {where} ORDER BY created_at ASC"
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params)
            rows = cur.fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def update_run_status(
    run_id: str,
    *,
    status: str,
    started_at: str | None = None,
    completed_at: str | None = None,
    duration_sec: float | None = None,
    data_through: str | None = None,
    error_message: str | None = None,
    products_count: int | None = None,
    products: list[str] | None = None,
    frequencies: list[str] | None = None,
    horizons: list[int] | None = None,
) -> None:
    """Actualiza el estado de un run en forecast_runs."""
    fields = ["status = %s", "updated_at = now()"]
    params: list[Any] = [status]
    for col, val in (
        ("started_at", started_at),
        ("completed_at", completed_at),
        ("duration_sec", duration_sec),
        ("data_through", data_through),
        ("error_message", error_message),
        ("products_count", products_count),
        ("products", products),
        ("frequencies", frequencies),
        ("horizons", horizons),
    ):
        if val is not None:
            fields.append(f"{col} = %s")
            params.append(val)
    params.append(run_id)
    sql = f"UPDATE public.forecast_runs SET {', '.join(fields)} WHERE id = %s"
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params)
        conn.commit()
    finally:
        conn.close()