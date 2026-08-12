"use client";

import { useCallback, useMemo } from "react";
import { useDashboard } from "@/store/useDashboard";
import { TradeFilters, DetailedTradeResponse, TradeApiResponse } from "@/app/interfaces/trade/interface";
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

export function useDetailedData(): {
  filters: TradeFilters;
  fetcher: (f: TradeFilters, extra?: { limit?: number; offset?: number }) => Promise<DetailedTradeResponse>;
} {
  const filters = useDashboard((s) => s.filters);
  const f = filters;
  const effective = useMemo<TradeFilters>(() => ({
    flow: f.flow, category: f.category, product: f.product, originCountry: f.originCountry,
    customs: f.customs, importer: f.importer, exporter: f.exporter,
    countryCode: f.countryCode, industry: f.industry,
    yearStart: f.yearStart, yearEnd: f.yearEnd, fraccion: f.fraccion, meses: f.meses,
  }), [f.flow, f.category, f.product, f.originCountry, f.customs, f.importer, f.exporter, f.countryCode, f.industry, f.yearStart, f.yearEnd, f.fraccion, f.meses]);

  const fetcher = useCallback(async (ff: TradeFilters, extra?: { limit?: number; offset?: number }) => {
    const q = buildTradeQueryString(ff);
    const parts = [q ? q.slice(1) : ""];
    if (extra?.limit != null) parts.push(`limit=${extra.limit}`);
    if (extra?.offset != null) parts.push(`offset=${extra.offset}`);
    const query = parts.filter(Boolean).join("&");
    const res = await fetchJson<TradeApiResponse<DetailedTradeResponse>>(`/trade/detailed${query ? `?${query}` : ""}`);
    return res.data || { rows: [], total: 0, truncated: false, appliedRange: { yearStart: ff.yearStart ?? 0, yearEnd: ff.yearEnd ?? 0 } };
  }, []);

  return { filters: effective, fetcher };
}
