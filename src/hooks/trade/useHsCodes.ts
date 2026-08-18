"use client";

import { useCallback, useMemo } from "react";
import { useDashboard } from "@/store/useDashboard";
import { TradeFilters, HsCodeRow, TradeApiResponse } from "@/app/interfaces/trade/interface";
import { buildTradeQueryString } from "@/app/lib/trade/query";
import { translateCategory, translateProduct } from "@/app/lib/i18n/tradeData";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    const text = await response.text().catch(() => "Unknown error");
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  return response.json();
}

export function useHsCodes(): {
  filters: TradeFilters;
  fetcher: (f: TradeFilters) => Promise<HsCodeRow[]>;
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
    const res = await fetchJson<TradeApiResponse<HsCodeRow[]>>(`/trade/by-hs${q}`);
    return (res.data || []).map((row) => ({
      ...row,
      categoria: translateCategory(row.categoria, locale),
      producto: translateProduct(row.producto, locale),
      industry: translateCategory(row.industry, locale),
    }));
  }, [locale]);

  return { filters: effective, fetcher };
}
