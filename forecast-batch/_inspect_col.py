from dotenv import load_dotenv
load_dotenv()
from pipeline.ream_client import get_conn
import psycopg2.extras

c = get_conn()
cur = c.cursor()
cur.execute(
    """SELECT column_name, data_type
       FROM information_schema.columns
       WHERE table_schema='public' AND table_name='trade_records_enriquecido'
       ORDER BY ordinal_position"""
)
print("=== COLUMNS ===")
for r in cur.fetchall():
    print(r)

cur.execute(
    """SELECT flujo,
              COUNT(*) AS n,
              COUNT(cif_total) AS n_cif,
              COUNT(fob_total) AS n_fob,
              MIN(cif_total) AS min_cif,
              MIN(fob_total) AS min_fob,
              MAX(cif_total) AS max_cif,
              MAX(fob_total) AS max_fob
       FROM public.trade_records_enriquecido
       WHERE pais_codigo='COL'
       GROUP BY flujo"""
)
print("=== COL by flujo ===")
for r in cur.fetchall():
    print(r)

c.close()
