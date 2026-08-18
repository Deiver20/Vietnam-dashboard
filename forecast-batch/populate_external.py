"""Script independiente: solo descarga external features de Yahoo Finance y los guarda en REAM."""
from __future__ import annotations

import sys
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env")

sys.path.insert(0, str(ROOT))

from pipeline.compute_external import compute_and_store_external  # noqa: E402
from pipeline.upsert_ream import get_conn  # noqa: E402

print("[POPULATE_EXTERNAL] Conectando a REAM...")
conn = get_conn()
conn.close()
print("[POPULATE_EXTERNAL] Descargando features de Yahoo Finance...")
n = compute_and_store_external()

print(f"\n[POPULATE_EXTERNAL] Completado — {n} filas en external_features")