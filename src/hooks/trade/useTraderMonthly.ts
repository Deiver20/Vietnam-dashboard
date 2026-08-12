"use client";

import { useCallback, useMemo } from "react";
import { useDashboard } from "@/store/useDashboard";
import { TradeFilters, TraderMonthlyBreakdown, TraderType, TradeApiResponse } from "@/app/interfaces/trade/interface";
import { buildTradeQueryString } from "@/app/lib/trade/query";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    const text = await response.text().catch(() => "Unknown error");
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  return response.json();
}

export function useTraderMonthly(type: TraderType, years: [number, number]): {
  filters: TradeFilters;
  fetcher: (f: TradeFilters) => Promise<TraderMonthlyBreakdown>;
} {
  const filters = useDashboard((s) => s.filters);
  const f = filters;
  const effective = useMemo<TradeFilters>(() => ({
    flow: f.flow, category: f.category, product: f.product, originCountry: f.originCountry,
    customs: f.customs, importer: f.importer, exporter: f.exporter,
    countryCode: f.countryCode, industry: f.industry,
    yearStart: undefined, yearEnd: undefined,
    fraccion: f.fraccion, meses: f.meses, years,
  }), [f.flow, f.category, f.product, f.originCountry, f.customs, f.importer, f.exporter, f.countryCode, f.industry, f.fraccion, f.meses, years[0], years[1]]);

  const fetcher = useCallback(async (ff: TradeFilters) => {
    const q = buildTradeQueryString(ff);
    const res = await fetchJson<TradeApiResponse<TraderMonthlyBreakdown>>(`/trade/trader-monthly${q}${q ? "&" : "?"}type=${type}`);
    return res.data || { years: [], months: [], monthKeys: [], rows: [], totals: { registros: 0, volumenKg: 0, valorUsd: 0, monthly: {} } };
  }, [type]);

  return { filters: effective, fetcher };
}
