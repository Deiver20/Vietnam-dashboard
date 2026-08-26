"use client";

import { useMemo } from "react";
import { useAiPanelEnv } from "./env";

function cagr(first: number, last: number, years: number) {
  if (first <= 0 || last <= 0 || years <= 0) return null;
  return (Math.pow(last / first, 1 / years) - 1) * 100;
}
function stddev(arr: number[]) {
  if (arr.length < 2) return 0;
  const m = arr.reduce((a, b) => a + b, 0) / arr.length;
  const v = arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length;
  return Math.sqrt(v);
}

export interface DeepMetrics {
  sorted: Array<{ country: string; totalMt: number; records: number; totalCif: number; totalFob: number; share: number }>;
  topCountry: { country: string; totalMt: number; records: number; totalCif: number; totalFob: number } | null;
  top1Share: number;
  top3Share: number;
  top5Share: number;
  hhi: number;
  totalVolume: number;
  totalCif: number;
  totalFob: number;
  records: number;
  countries: number;
  products: number;
  importers: number;
  exporters: number;
  yearRange: [number, number];
  tl: Array<{ year: number; totalMt: number; records: number; totalFob: number; totalCif: number }>;
  yoy: Array<{ year: number; pct: number; vol: number }>;
  avgYoy: number;
  volSigma: number;
  bestYoy: { year: number; pct: number; vol: number } | null;
  worstYoy: { year: number; pct: number; vol: number } | null;
  peak: { year: number; totalMt: number } | null;
  trough: { year: number; totalMt: number } | null;
  first: { year: number; totalMt: number } | null;
  last: { year: number; totalMt: number } | null;
  cagrVal: number | null;
  lastYoy: number | null;
  momentum: number | null;
  avgPrice: number;
  avgFobPrice: number;
  spread: number;
  spreadPct: number;
  priceByYear: Array<{ year: number; price: number }>;
  priceTrend: number;
  priceVolPct: number;
  avgShipmentMt: number;
  avgShipmentKg: number;
  recordsPerCountry: number;
  volPerImporter: number;
  mostValuable: { country: string; totalMt: number; totalCif: number } | null;
  cheapest: { country: string; totalMt: number; totalCif: number } | null;
}

export function useInsights(): { metrics: DeepMetrics | null } {
  const { overview, totals, timeline } = useAiPanelEnv();

  const metrics = useMemo<DeepMetrics | null>(() => {
    if (!overview.length && !totals && !timeline.length) return null;
    const sortedRaw = [...overview].sort((a, b) => b.totalMt - a.totalMt);
    const totalVolume = totals?.totalMt ?? sortedRaw.reduce((s, x) => s + x.totalMt, 0);
    if (totalVolume <= 0) return null;
    const totalCif = totals?.totalCif ?? sortedRaw.reduce((s, x) => s + (x.totalCif ?? 0), 0);
    const totalFob = totals?.totalFob ?? sortedRaw.reduce((s, x) => s + (x.totalFob ?? 0), 0);
    const records = totals?.records ?? sortedRaw.reduce((s, x) => s + x.records, 0);
    const countries = totals?.countries ?? sortedRaw.length;
    const products = totals?.products ?? 0;
    const importers = totals?.importers ?? 0;
    const exporters = totals?.exporters ?? 0;
    const sorted = sortedRaw.map((o) => ({ ...o, share: (o.totalMt / totalVolume) * 100 }));
    const topCountry = sortedRaw[0] ?? null;
    const top1Share = sorted[0]?.share ?? 0;
    const top3Share = sorted.slice(0, 3).reduce((s, x) => s + x.share, 0);
    const top5Share = sorted.slice(0, 5).reduce((s, x) => s + x.share, 0);
    const hhi = sorted.reduce((s, x) => s + x.share * x.share, 0);
    const tl = [...timeline].sort((a, b) => a.year - b.year);
    const yoy: Array<{ year: number; pct: number; vol: number }> = [];
    for (let i = 1; i < tl.length; i++) {
      const prev = tl[i - 1].totalMt;
      yoy.push({ year: tl[i].year, pct: prev > 0 ? ((tl[i].totalMt - prev) / prev) * 100 : 0, vol: tl[i].totalMt });
    }
    const yoyPcts = yoy.map((y) => y.pct);
    const avgYoy = yoyPcts.length ? yoyPcts.reduce((a, b) => a + b, 0) / yoyPcts.length : 0;
    const volSigma = stddev(yoyPcts);
    const bestYoy = yoy.length ? yoy.reduce((m, v) => (v.pct > m.pct ? v : m), yoy[0]) : null;
    const worstYoy = yoy.length ? yoy.reduce((m, v) => (v.pct < m.pct ? v : m), yoy[0]) : null;
    const peak = tl.length ? tl.reduce((m, v) => (v.totalMt > m.totalMt ? v : m), tl[0]) : null;
    const trough = tl.length ? tl.reduce((m, v) => (v.totalMt < m.totalMt ? v : m), tl[0]) : null;
    const first = tl[0] ?? null;
    const last = tl[tl.length - 1] ?? null;
    const cagrVal = first && last && first.totalMt > 0 && last.year !== first.year ? cagr(first.totalMt, last.totalMt, last.year - first.year) : null;
    const lastYoy = yoy[yoy.length - 1]?.pct ?? null;
    const momentum = lastYoy !== null && cagrVal !== null ? lastYoy - cagrVal : null;
    const avgPrice = totalVolume > 0 ? totalCif / totalVolume : 0;
    const avgFobPrice = totalVolume > 0 ? totalFob / totalVolume : 0;
    const spread = avgPrice - avgFobPrice;
    const spreadPct = avgFobPrice > 0 ? (spread / avgFobPrice) * 100 : 0;
    const priceByYear = tl.map((r) => ({ year: r.year, price: r.totalMt > 0 ? r.totalCif / r.totalMt : 0 }));
    const priceFirst = priceByYear[0]?.price ?? 0;
    const priceLast = priceByYear[priceByYear.length - 1]?.price ?? 0;
    const priceTrend = priceFirst > 0 ? ((priceLast - priceFirst) / priceFirst) * 100 : 0;
    const priceVol = stddev(priceByYear.map((p) => p.price));
    const avgP = priceByYear.length ? priceByYear.reduce((a, b) => a + b.price, 0) / priceByYear.length : 0;
    const priceVolPct = avgP > 0 ? (priceVol / avgP) * 100 : 0;
    const avgShipmentMt = records > 0 ? totalVolume / records : 0;
    const avgShipmentKg = avgShipmentMt * 1000;
    const recordsPerCountry = countries > 0 ? records / countries : 0;
    const volPerImporter = importers > 0 ? totalVolume / importers : 0;
    const byPrice = [...sortedRaw].sort((a, b) => b.totalCif / Math.max(1, b.totalMt) - a.totalCif / Math.max(1, a.totalMt));
    const mostValuable = byPrice[0] ?? null;
    const cheapest = byPrice.length ? byPrice[byPrice.length - 1] : null;
    const minYear = tl[0]?.year ?? totals?.minYear ?? 0;
    const maxYear = tl[tl.length - 1]?.year ?? totals?.maxYear ?? 0;
    return {
      sorted,
      topCountry,
      top1Share,
      top3Share,
      top5Share,
      hhi,
      totalVolume,
      totalCif,
      totalFob,
      records,
      countries,
      products,
      importers,
      exporters,
      yearRange: [minYear, maxYear] as [number, number],
      tl,
      yoy,
      avgYoy,
      volSigma,
      bestYoy,
      worstYoy,
      peak: peak ? { year: peak.year, totalMt: peak.totalMt } : null,
      trough: trough ? { year: trough.year, totalMt: trough.totalMt } : null,
      first: first ? { year: first.year, totalMt: first.totalMt } : null,
      last: last ? { year: last.year, totalMt: last.totalMt } : null,
      cagrVal,
      lastYoy,
      momentum,
      avgPrice,
      avgFobPrice,
      spread,
      spreadPct,
      priceByYear,
      priceTrend,
      priceVolPct,
      avgShipmentMt,
      avgShipmentKg,
      recordsPerCountry,
      volPerImporter,
      mostValuable: mostValuable ? { country: mostValuable.country, totalMt: mostValuable.totalMt, totalCif: mostValuable.totalCif } : null,
      cheapest: cheapest ? { country: cheapest.country, totalMt: cheapest.totalMt, totalCif: cheapest.totalCif } : null,
    };
  }, [overview, totals, timeline]);

  return { metrics };
}
