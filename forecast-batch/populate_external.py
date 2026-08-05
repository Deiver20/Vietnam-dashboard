"""Script independiente: solo descarga external features de Yahoo Finance y los guarda en Supabase."""
from __future__ import annotations

import sys
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env")

sys.path.insert(0, str(ROOT))

from pipeline.compute_external import compute_and_store_external
from pipeline.upsert_supabase import get_client

print("[POPULATE_EXTERNAL] Conectando a Supabase...")
client = get_client()
print("[POPULATE_EXTERNAL] Descargando features de Yahoo Finance...")
n = compute_and_store_external(client)

print(f"\n[POPULATE_EXTERNAL] Completado — {n} filas en external_features")

resp = client.table("external_features").select("count", count="exact", head=True).execute()
print(f"[POPULATE_EXTERNAL] Total en tabla: {resp.count} filas")
