from dotenv import load_dotenv
load_dotenv()
from pipeline.ream_client import get_conn
import psycopg2.extras

c = get_conn()
cur = c.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

cur.execute(
    """SELECT id, pais_codigo, industria, flujo, status, data_through,
              created_at, started_at
       FROM public.forecast_runs
       WHERE pais_codigo = 'COL'
       ORDER BY created_at DESC
       LIMIT 10"""
)
print("=== forecast_runs COL ===")
for r in cur.fetchall():
    print(dict(r))

cur.execute(
    """SELECT count(*) AS n FROM public.forecast_results
       WHERE pais_codigo='COL' AND flujo='Imp' AND is_historical=false"""
)
print("=== forecast_results COL/Imp (futuros) ===", dict(cur.fetchone()))

cur.execute(
    """SELECT count(*) AS n FROM public.forecast_results
       WHERE pais_codigo='COL' AND flujo='Exp' AND is_historical=false"""
)
print("=== forecast_results COL/Exp (futuros) ===", dict(cur.fetchone()))

c.close()
