"""Entry point del batch de proyecciones.

Uso:
    python run_batch.py                # procesa el siguiente run 'pending' o crea uno nuevo
    python run_batch.py --force        # crea un run aunque ya haya success reciente
    python run_batch.py --dry-run      # muestra qué haría sin escribir en Supabase

Variables de entorno (o .env):
    SUPABASE_URL
    SUPABASE_SERVICE_KEY
"""
from __future__ import annotations

import argparse
import os
import sys
import time
from datetime import date, datetime
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from pipeline.compute_eda import compute_and_store_eda
from pipeline.compute_external import compute_and_store_external
from pipeline.compute_forecast import compute_and_store_forecast
from pipeline.detect_new_data import (
    apply_powerbi_filter,
    claim_next_run,
    data_through_date,
    get_products,
    get_run_products,
    load_trade_records,
    needs_new_run,
)
from pipeline.upsert_supabase import (
    fetch_last_run,
    get_client,
    update_run_status,
)


def _read_external_features(client, max_date: date | None) -> "pd.DataFrame":
    import pandas as pd

    q = client.table("external_features").select("date,fx_usdvnd,corn_fut,soymeal_fut").order("date", desc=False)
    if max_date is not None:
        q = q.lte("date", max_date.isoformat())
    resp = q.execute()
    df = pd.DataFrame(resp.data or [])
    if df.empty:
        return df
    df["date"] = pd.to_datetime(df["date"])
    return df


def main() -> int:
    load_dotenv(ROOT / ".env")

    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="Fuerza un nuevo run aunque haya success reciente")
    parser.add_argument("--dry-run", action="store_true", help="Solo muestra qué haría, no escribe en Supabase")
    parser.add_argument("--skip-external", action="store_true", help="Omite descarga de yfinance")
    parser.add_argument("--skip-eda", action="store_true", help="Omite cálculo EDA")
    parser.add_argument("--skip-forecast", action="store_true", help="Omite cálculo de forecasts")
    args = parser.parse_args()

    print("=" * 70)
    print("FORECAST BATCH — Viet Nam Rendering Imports (Dashboard Vietnam)")
    print("=" * 70)

    client = get_client()
    t0 = time.time()

    # 1. Cargar trade_records --------------------------------------------------------
    print("\n[1/5] Cargando trade_records de Supabase (VNM/Rend/I)...")
    raw = load_trade_records(client)
    print(f"       Filas crudas: {len(raw)}")
    df = apply_powerbi_filter(raw)
    print(f"       Post-filtro Power BI: {len(df)}")
    if df.empty:
        print("       ⚠ No hay datos — abortando")
        return 1

    max_date = data_through_date(df)
    print(f"       Rango fechas: {df['fecha'].min().date()} → {max_date}")
    products = get_products(df)
    print(f"       Productos únicos: {len(products)}")
    print(f"       {products}")

    # 2. Decidir run --------------------------------------------------------------
    print("\n[2/5] Decidiendo run...")
    if not args.force and not needs_new_run(client, max_date):
        print("       ✓ Datos sin cambios desde el último run exitoso — nada que hacer")
        return 0

    # Si no hay pending, crear uno
    from pipeline.upsert_supabase import fetch_pending_runs

    pending = fetch_pending_runs(client)
    if pending and not args.force:
        run = claim_next_run(client)
        if run is None:
            print("       No se pudo reclamar un run — abortando")
            return 1
        run_id = run["id"]
        print(f"       ✓ Run 'pending' reclamado: {run_id}")
    else:
        # Crear run manual
        from supabase import Client  # noqa: F401
        resp = client.table("forecast_runs").insert(
            {
                "status": "running",
                "trigger_source": "manual",
                "started_at": datetime.utcnow().isoformat(),
                "data_through": max_date.isoformat() if max_date else None,
            }
        ).execute()
        run_id = resp.data[0]["id"]
        print(f"       ✓ Nuevo run manual creado: {run_id}")

    if args.dry_run:
        print("\n[DRY-RUN] Modo dry-run activado — no se escribirá nada en Supabase")
        print(f"          Run ID: {run_id}")
        print(f"          Productos: {len(products)}")
        print(f"          Frecuencias: D, M")
        return 0

    run_products = get_run_products(client, {"products": products})

    # 3. External features --------------------------------------------------------
    print("\n[3/5] External features (yfinance → Supabase)...")
    if not args.skip_external:
        n_ext = compute_and_store_external(client, start_date=date(2019, 1, 1))
        print(f"       {n_ext} filas en external_features")
    ext = _read_external_features(client, max_date)
    print(f"       Cargadas {len(ext)} filas desde Supabase")

    # 4. EDA ----------------------------------------------------------------------
    print("\n[4/5] Análisis Exploratorio...")
    if not args.skip_eda:
        eda_counts = compute_and_store_eda(
            client, run_id, df, run_products, ext, frequencies=("D", "M")
        )
        print(f"       {eda_counts['series']} series, {eda_counts['metrics']} métricas")
    else:
        eda_counts = {"series": 0, "metrics": 0}

    # 5. Forecast -----------------------------------------------------------------
    print("\n[5/5] Proyecciones (5 modelos × 4 horizontes × 2 freq × N productos)...")
    if not args.skip_forecast:
        fc_counts = compute_and_store_forecast(
            client, run_id, df, ext, run_products, frequencies=("D", "M")
        )
        print(f"       {fc_counts['results']} puntos forecast, {fc_counts['metrics']} métricas")
    else:
        fc_counts = {"results": 0, "metrics": 0}

    # 6. Finalizar ----------------------------------------------------------------
    duration = round(time.time() - t0, 2)
    update_run_status(
        client,
        run_id,
        status="success",
        completed_at=datetime.utcnow().isoformat(),
        duration_sec=duration,
        data_through=max_date.isoformat() if max_date else None,
        products_count=len(run_products),
        products=run_products,
        frequencies=["D", "M"],
        horizons=[30, 60, 90, 120, 3, 6, 9, 12],
    )
    print("\n" + "=" * 70)
    print(f"✓ Run {run_id} COMPLETADO en {duration}s")
    print(f"  Productos: {len(run_products)} | EDA: {eda_counts} | Forecast: {fc_counts}")
    print("=" * 70)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise
