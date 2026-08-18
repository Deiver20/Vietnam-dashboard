"""Compatibilidad con el batch: helpers de upsert contra REAM (agmdatabase).

Sustituye a upsert_supabase.py — la BD de trade/forecast vive en REAM, no Supabase.
Re-exporta la misma API para minimizar cambios en los módulos del pipeline.
"""
from __future__ import annotations

from .ream_client import (  # noqa: F401
    delete_where,
    fetch_last_run,
    fetch_pending_runs,
    get_conn,
    update_run_status,
    upsert,
)

__all__ = [
    "delete_where",
    "fetch_last_run",
    "fetch_pending_runs",
    "get_conn",
    "update_run_status",
    "upsert",
]