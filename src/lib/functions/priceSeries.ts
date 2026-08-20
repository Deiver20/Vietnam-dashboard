import type { Candle, PortRow, PriceStats, ProductCountryRow } from "@/interfaces/data/interface";

/* Deterministic price series shared by the /data industry cards and the
   /data/[industry] page: same seed → same candles, so the card's chart and
   the page's chart are literally the same series. No Math.random — values
   are stable across SSR/CSR and re-renders. */

function hashSeed(str: string): number {
  let s = 0;
  for (const ch of str) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  return s || 1;
}

/** LCG in [0, 1) — cheap, deterministic, good enough for mock data. */
function makeRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** N months of OHLC data as a random walk around `base` (USD/t). */
export function candlesFor(seed: string, base: number, n = 12): Candle[] {
  const rnd = makeRng(hashSeed(seed));
  const out: Candle[] = [];
  let prevClose = base * (0.92 + rnd() * 0.16);
  for (let i = 0; i < n; i++) {
    const o = prevClose;
    const drift = (rnd() - 0.48) * 0.09; // slight upward bias
    const c = Math.max(base * 0.55, o * (1 + drift));
    const wickUp = Math.max(o, c) * (1 + rnd() * 0.035);
    const wickDn = Math.min(o, c) * (1 - rnd() * 0.035);
    out.push({
      o: Math.round(o),
      h: Math.round(wickUp),
      l: Math.round(wickDn),
      c: Math.round(c),
    });
    prevClose = c;
  }
  return out;
}

/* The mock dataset's "current month" is Apr 2025 (the card dates use
   04/2025); estimates cover May and Jun 2025. */
export const CURRENT_MONTH = "Apr";
export const EST_MONTH_1 = "May";
export const EST_MONTH_2 = "Jun";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Trailing `n` month labels ending at the dataset's current month. */
export function trailingMonthLabels(n = 12): string[] {
  const end = MONTHS.indexOf(CURRENT_MONTH);
  return Array.from({ length: n }, (_, i) => MONTHS[(((end - (n - 1) + i) % 12) + 12) % 12]);
}

/** Current-month stats + estimates, derived from the seed's candle series. */
export function priceStatsFor(seed: string, base: number): PriceStats {
  const candles = candlesFor(seed, base);
  const last = candles[candles.length - 1];
  const rnd = makeRng(hashSeed(seed + ":est"));
  const est1 = Math.round(last.c * (1 + (rnd() - 0.45) * 0.08));
  const est2 = Math.round(est1 * (1 + (rnd() - 0.45) * 0.08));
  return { avg: Math.round((last.o + last.c) / 2), max: last.h, min: last.l, est1, est2 };
}

/* Real port options per country for the port-level drill-down. The dataset
   keeps one (aduana, incoterm) per product-country; extra ports are derived
   deterministically from this pool so every render agrees. */
const COUNTRY_PORTS: Record<string, string[]> = {
  us: ["New Orleans", "Houston Seaport", "Savannah", "Oakland", "Los Angeles"],
  mx: ["Veracruz", "Manzanillo", "Altamira"],
  br: ["Santos", "Paranaguá", "Itajaí", "Rio Grande"],
  ar: ["Rosario", "Buenos Aires", "Bahía Blanca"],
  cl: ["Valparaíso", "San Antonio"],
  co: ["Cartagena", "Buenaventura"],
  au: ["Melbourne", "Brisbane", "Fremantle"],
  de: ["Hamburg", "Bremerhaven"],
  nl: ["Rotterdam", "Amsterdam"],
  cn: ["Qingdao", "Shanghai", "Dalian"],
  in: ["Mundra", "Nhava Sheva"],
};

const INCOTERMS = ["FOB", "CIF", "CFR", "DAP"];

/** The ports a product ships from in a country: the dataset's own
 *  (aduana, incoterm) first, plus 0–2 seeded extras from the country's
 *  pool — stable per (industry, product, country). */
export function portsFor(
  industryKey: string,
  productKey: string,
  row: ProductCountryRow
): PortRow[] {
  const rnd = makeRng(hashSeed(`${industryKey}:${productKey}:${row.country}:ports`));
  const pool = (COUNTRY_PORTS[row.country] ?? []).filter((p) => p !== row.aduana);
  const extras = Math.min(pool.length, Math.floor(rnd() * 3)); // 0–2
  const ports: PortRow[] = [{ aduana: row.aduana, incoterm: row.incoterm }];
  let start = Math.floor(rnd() * Math.max(1, pool.length));
  for (let i = 0; i < extras; i++) {
    ports.push({
      aduana: pool[(start + i) % pool.length],
      incoterm: INCOTERMS[Math.floor(rnd() * INCOTERMS.length)],
    });
  }
  return ports;
}

/** "All countries" aggregate: mean avg/estimates, extreme max/min. */
export function aggregateStats(list: PriceStats[]): PriceStats {
  if (list.length === 0) return { avg: 0, max: 0, min: 0, est1: 0, est2: 0 };
  const mean = (pick: (s: PriceStats) => number) =>
    Math.round(list.reduce((acc, s) => acc + pick(s), 0) / list.length);
  return {
    avg: mean((s) => s.avg),
    max: Math.max(...list.map((s) => s.max)),
    min: Math.min(...list.map((s) => s.min)),
    est1: mean((s) => s.est1),
    est2: mean((s) => s.est2),
  };
}
