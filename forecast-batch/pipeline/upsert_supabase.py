"""Cliente Supabase + helpers de upsert para el batch de proyecciones."""
from __future__ import annotations

import os
from typing import Any, Iterable

from supabase import Client, create_client


def get_client() -> Client:
    """Crea un cliente Supabase con la service key (escritura completa)."""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise RuntimeError(
            "Faltan SUPABASE_URL o SUPABASE_SERVICE_KEY en el entorno. "
            "Configúralas en .env o variables de entorno."
        )
    return create_client(url, key)


def _to_jsonable(value: Any) -> Any:
    import math

    if value is None:
        return None
    if isinstance(value, float) and math.isnan(value):
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    if isinstance(value, (int, float, str, bool)):
        return value
    if isinstance(value, dict):
        return {k: _to_jsonable(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_to_jsonable(v) for v in value]
    return str(value)


def upsert(
    client: Client,
    table: str,
    rows: Iterable[dict],
    on_conflict: str | None = None,
    chunk_size: int = 500,
) -> int:
    """Upsert por chunks. Devuelve el total de filas procesadas."""
    batch = list(rows)
    if not batch:
        return 0

    payload = [_to_jsonable(r) for r in batch]
    total = 0
    for i in range(0, len(payload), chunk_size):
        chunk = payload[i : i + chunk_size]
        kwargs: dict[str, Any] = {"json": chunk}
        if on_conflict:
            kwargs["on_conflict"] = on_conflict
        client.table(table).upsert(chunk, **( {"on_conflict": on_conflict} if on_conflict else {} )).execute()
        total += len(chunk)
    return total


def delete_where(client: Client, table: str, column: str, value: Any) -> int:
    """Borra filas de una tabla donde `column = value`. Devuelve count."""
    resp = client.table(table).delete().eq(column, value).execute()
    return len(resp.data or [])


def fetch_last_run(client: Client, status: str = "success") -> dict | None:
    """Devuelve el último forecast_runs con el status dado."""
    resp = (
        client.table("forecast_runs")
        .select("*")
        .eq("status", status)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if resp.data:
        return resp.data[0]
    return None


def fetch_pending_runs(client: Client) -> list[dict]:
    """Devuelve todos los forecast_runs en estado 'pending'."""
    resp = (
        client.table("forecast_runs")
        .select("*")
        .eq("status", "pending")
        .order("created_at", desc=False)
        .execute()
    )
    return resp.data or []


def update_run_status(
    client: Client,
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
    payload: dict[str, Any] = {"status": status, "updated_at": "now()"}
    if started_at is not None:
        payload["started_at"] = started_at
    if completed_at is not None:
        payload["completed_at"] = completed_at
    if duration_sec is not None:
        payload["duration_sec"] = duration_sec
    if data_through is not None:
        payload["data_through"] = data_through
    if error_message is not None:
        payload["error_message"] = error_message
    if products_count is not None:
        payload["products_count"] = products_count
    if products is not None:
        payload["products"] = products
    if frequencies is not None:
        payload["frequencies"] = frequencies
    if horizons is not None:
        payload["horizons"] = horizons
    payload = {k: v for k, v in payload.items() if v is not None}
    payload["updated_at"] = "now()"
    client.table("forecast_runs").update(_to_jsonable(payload)).eq("id", run_id).execute()
