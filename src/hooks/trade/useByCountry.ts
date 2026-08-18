"use client";

import { useCallback, useMemo } from "react";
import { useDashboard } from "@/store/useDashboard";
import { TradeFilters, ByCountryResponse, ByCountryRanking, TradeApiResponse } from "@/app/interfaces/trade/interface";
import { buildTradeQueryString } from "@/app/lib/trade/query";
import { translateCountry } from "@/app/lib/i18n/tradeData";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    const text = await response.text().catch(() => "Unknown error");
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  return response.json();
}

export function useByCountry(): {
  filters: TradeFilters;
  fetcher: (f: TradeFilters) => Promise<ByCountryResponse>;
} {
  const filters = useDashboard((s) => s.filters);
  const locale = useDashboard((s) => s.locale);
  const f = filters;
  const effective = useMemo<TradeFilters>(() => ({
    flow: f.flow, category: f.category, product: f.product, originCountry: f.originCountry,
    customs: f.customs, importer: f.importer, exporter: f.exporter,
    countryCode: f.countryCode, industry: f.industry,
    yearStart: f.yearStart, yearEnd: f.yearEnd, fraccion: f.fraccion, meses: f.meses,
  }), [f.flow, f.category, f.product, f.originCountry, f.customs, f.importer, f.exporter, f.countryCode, f.industry, f.yearStart, f.yearEnd, f.fraccion, f.meses]);

  const fetcher = useCallback(async (ff: TradeFilters) => {
    const q = buildTradeQueryString(ff);
    const res = await fetchJson<TradeApiResponse<ByCountryResponse>>(`/trade/by-country${q}`);
    const data = res.data || { ranking: [], timeline: [] };

    // Agrupa por país traducido: la BD puede tener variantes con espacios al
    // final ("ESTADOS UNIDOS " vs "ESTADOS UNIDOS") que colisionan tras la
    // traducción y generarían keys de React duplicadas.
    const rankingMap = new Map<string, ByCountryRanking>();
    for (const r of data.ranking) {
      const country = translateCountry(r.country, locale);
      const current = rankingMap.get(country);
      if (current) {
        current.registros += r.registros;
        current.volumenKg += r.volumenKg;
        current.valorUsd += r.valorUsd;
      } else {
        rankingMap.set(country, { ...r, country });
      }
    }
    const ranking = Array.from(rankingMap.values());

    const timelineMap = new Map<
      string,
      { country: string; year: number; month: number; volumenKg: number }
    >();
    for (const t of data.timeline) {
      const country = translateCountry(t.country, locale);
      const key = `${t.year}-${country}`;
      const current = timelineMap.get(key);
      if (current) {
        current.volumenKg += t.volumenKg;
      } else {
        timelineMap.set(key, { ...t, country });
      }
    }
    const timeline = Array.from(timelineMap.values());

    return { ranking, timeline };
  }, [locale]);

  return { filters: effective, fetcher };
}
