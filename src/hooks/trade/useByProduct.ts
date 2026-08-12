"use client";

import { useCallback, useMemo } from "react";
import { useDashboard } from "@/store/useDashboard";
import { TradeFilters, ByProductResponse, TradeApiResponse } from "@/app/interfaces/trade/interface";
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

export function useByProduct(years: [number, number]): {
  filters: TradeFilters;
  fetcher: (f: TradeFilters) => Promise<ByProductResponse>;
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
    const res = await fetchJson<TradeApiResponse<ByProductResponse>>(`/trade/by-product${q}`);
    return res.data || [];
  }, []);

  return { filters: effective, fetcher };
}
