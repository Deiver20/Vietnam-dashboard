"""Entry point del batch de proyecciones.

Uso:
    python run_batch.py                # procesa el siguiente run 'pending' o crea uno nuevo por país
    python run_batch.py --force        # crea un run aunque haya success reciente
    python run_batch.py --dry-run      # muestra qué haría sin escribir en REAM
    python run_batch.py --countries VIE,BRA   # limita a ciertos países

Variables de entorno (o .env):
    REAM_DB_HOST / REAM_DB_PORT / REAM_DB_NAME / REAM_DB_USER / REAM_DB_PASSWORD
"""
from __future__ import annotations

import argparse
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
    fetch_scopes,
    get_products,
    get_run_products,
    load_trade_records,
    needs_new_run,
)
from pipeline.upsert_ream import (
    fetch_last_run,
    fetch_pending_runs,
    get_conn,
    update_run_status,
)


def _read_external_features(max_date: date | None, pais_codigo: str | None = None) -> "pd.DataFrame":
    import pandas as pd
    import psycopg2
    import psycopg2.extras

    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            # Per-country external: VIE=USDVND, COL=USDCOP. Filter by pais_codigo if column exists.
            has_pais = True
            try:
                cur.execute("SELECT 1 FROM information_schema.columns WHERE table_name='external_features' AND column_name='pais_codigo'")
                has_pais = cur.fetchone() is not None
            except Exception:
                has_pais = False
            if max_date is not None:
                if has_pais and pais_codigo:
                    cur.execute(
                        "SELECT date, fx_usdvnd, corn_fut, soymeal_fut FROM public.external_features WHERE date <= %s AND pais_codigo = %s ORDER BY date ASC",
                        (max_date.isoformat(), pais_codigo.upper()),
                    )
                    rows = [dict(r) for r in cur.fetchall()]
                    # Fallback to legacy global rows if per-country empty
                    if not rows:
                        cur.execute(
                            "SELECT date, fx_usdvnd, corn_fut, soymeal_fut FROM public.external_features WHERE date <= %s ORDER BY date ASC",
                            (max_date.isoformat(),),
                        )
                        rows = [dict(r) for r in cur.fetchall()]
                else:
                    cur.execute(
                        "SELECT date, fx_usdvnd, corn_fut, soymeal_fut FROM public.external_features WHERE date <= %s ORDER BY date ASC",
                        (max_date.isoformat(),),
                    )
                    rows = [dict(r) for r in cur.fetchall()]
            else:
                if has_pais and pais_codigo:
                    cur.execute(
                        "SELECT date, fx_usdvnd, corn_fut, soymeal_fut FROM public.external_features WHERE pais_codigo = %s ORDER BY date ASC",
                        (pais_codigo.upper(),),
                    )
                    rows = [dict(r) for r in cur.fetchall()]
                    if not rows:
                        cur.execute("SELECT date, fx_usdvnd, corn_fut, soymeal_fut FROM public.external_features ORDER BY date ASC")
                        rows = [dict(r) for r in cur.fetchall()]
                else:
                    cur.execute("SELECT date, fx_usdvnd, corn_fut, soymeal_fut FROM public.external_features ORDER BY date ASC")
                    rows = [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()
    df = pd.DataFrame(rows)
    if df.empty:
        return df
    df["date"] = pd.to_datetime(df["date"])
    return df


def _create_run(scope: dict[str, str], max_date: date | None) -> str:
    """Crea un forecast_runs 'running' con su país/industria/flujo. Devuelve el run_id."""
    import uuid

    run_id = str(uuid.uuid4())
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO public.forecast_runs
                    (id, status, trigger_source, started_at, data_through,
                     pais_codigo, industria, flujo)
                VALUES (%s, 'running', 'manual', %s, %s, %s, %s, %s)
                """,
                (
                    run_id,
                    datetime.utcnow().isoformat(),
                    max_date.isoformat() if max_date else None,
                    scope["pais_codigo"],
                    scope["industria"],
                    scope["flujo"],
                ),
            )
        conn.commit()
    finally:
        conn.close()
    return run_id


def _process_scope(scope: dict[str, str], args) -> int:
    import pandas as pd

    print(f"\n{'='*70}\nSCOPE: {scope['pais_codigo']}/{scope['industria']}/{scope['flujo']}\n{'='*70}")

    # 1. Cargar trade_records desde REAM --------------------------------------
    print(f"\n[1/5] Cargando trade_records de REAM ({scope['pais_codigo']}/{scope['industria']}/{scope['flujo']})...")
    raw = load_trade_records(**scope)
    print(f"       Filas crudas: {len(raw)}")
    df = apply_powerbi_filter(raw)
    print(f"       Post-filtro Power BI: {len(df)}")
    if df.empty:
        print("       ⚠ No hay datos — saltando este scope")
        return 0

    max_date = data_through_date(df)
    print(f"       Rango fechas: {df['fecha'].min().date()} → {max_date}")
    products = get_products(df)
    print(f"       Productos únicos: {len(products)}")

    # 2. Decidir run ----------------------------------------------------------
    print("\n[2/5] Decidiendo run...")
    if not args.force and not needs_new_run(max_date, scope):
        print("       ✓ Datos sin cambios desde el último run exitoso — nada que hacer")
        return 0

    pending = fetch_pending_runs(scope=scope)
    if pending and not args.force:
        run = claim_next_run(scope)
        if run is None:
            print("       No se pudo reclamar un run — abortando scope")
            return 1
        run_id = run["id"]
        print(f"       ✓ Run 'pending' reclamado: {run_id}")
    else:
        run_id = _create_run(scope, max_date)
        print(f"       ✓ Nuevo run manual creado: {run_id}")

    if args.dry_run:
        print("\n[DRY-RUN] Modo dry-run activado — no se escribirá nada en REAM")
        print(f"          Run ID: {run_id}")
        print(f"          Productos: {len(products)}")
        print(f"          Frecuencias: D, M")
        return 0

    run_products = get_run_products({"products": products})

    # 3. External features per-country (VIE=USDVND, COL=USDCOP) -----------------
    print(f"\n[3/5] External features {scope['pais_codigo']} (yfinance → REAM)...")
    if not args.skip_external:
        n_ext = compute_and_store_external(start_date=date(2019, 1, 1), pais_codigo=scope["pais_codigo"])
        print(f"       {n_ext} filas {scope['pais_codigo']} en external_features")
    ext = _read_external_features(max_date, pais_codigo=scope["pais_codigo"])
    print(f"       Cargadas {len(ext)} filas {scope['pais_codigo']} desde REAM")

    # 4. EDA ------------------------------------------------------------------
    print("\n[4/5] Análisis Exploratorio...")
    if not args.skip_eda:
        eda_counts = compute_and_store_eda(
            run_id, df, run_products, ext,
            frequencies=("D", "M"),
            pais_codigo=scope["pais_codigo"],
            industria=scope["industria"],
            flujo=scope["flujo"],
        )
        print(f"       {eda_counts['series']} series, {eda_counts['metrics']} métricas")
    else:
        eda_counts = {"series": 0, "metrics": 0}

    # 5. Forecast -------------------------------------------------------------
    print("\n[5/5] Proyecciones (5 modelos × 4 horizontes × 2 freq × N productos)...")
    if not args.skip_forecast:
        fc_counts = compute_and_store_forecast(
            run_id, df, ext, run_products,
            frequencies=("D", "M"),
            pais_codigo=scope["pais_codigo"],
            industria=scope["industria"],
            flujo=scope["flujo"],
        )
        print(f"       {fc_counts['results']} puntos forecast, {fc_counts['metrics']} métricas")
    else:
        fc_counts = {"results": 0, "metrics": 0}

    # 6. Finalizar ------------------------------------------------------------
    duration = round(time.time() - t0, 2)
    update_run_status(
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
    print(f"  Scope: {scope} | Productos: {len(run_products)} | EDA: {eda_counts} | Forecast: {fc_counts}")
    print("=" * 70)
    return 0


def main() -> int:
    load_dotenv(ROOT / ".env")

    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="Fuerza un nuevo run aunque haya success reciente")
    parser.add_argument("--dry-run", action="store_true", help="Solo muestra qué haría, no escribe en REAM")
    parser.add_argument("--skip-external", action="store_true", help="Omite descarga de yfinance")
    parser.add_argument("--skip-eda", action="store_true", help="Omite cálculo EDA")
    parser.add_argument("--skip-forecast", action="store_true", help="Omite cálculo de forecasts")
    parser.add_argument("--countries", type=str, default="", help="Países a procesar, separados por coma (ej. VIE,BRA)")
    args = parser.parse_args()

    print("=" * 70)
    print("FORECAST BATCH — proyecciones por país/industria/flujo (REAM)")
    print("=" * 70)

    global t0
    t0 = time.time()

    # Validar conexión a REAM temprano
    conn = get_conn()
    conn.close()

    scopes = fetch_scopes(activo=True)
    if args.countries:
        allowed = {c.strip().upper() for c in args.countries.split(",") if c.strip()}
        scopes = [s for s in scopes if s["pais_codigo"].upper() in allowed]

    if not scopes:
        print("⚠ No hay scopes con datos en trade_records_enriquecido (fecha>=2022-01-01, min_rows=500) — revisa la BD")
        return 1

    print(f"Scopes a procesar: {len(scopes)}")
    for s in scopes:
        print(f"  · {s['pais_codigo']}/{s['industria']}/{s['flujo']}")

    exit_code = 0
    for scope in scopes:
        try:
            rc = _process_scope(scope, args)
            if rc != 0:
                exit_code = rc
        except Exception as e:
            print(f"\n✗ ERROR en scope {scope}: {e}")
            import traceback
            traceback.print_exc()
            exit_code = 1

    print("\n" + "=" * 70)
    print(f"Batch terminado en {round(time.time() - t0, 2)}s (exit {exit_code})")
    print("=" * 70)
    return exit_code


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise