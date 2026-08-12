"use client";

import { useCallback, useMemo } from "react";
import { useDashboard } from "@/store/useDashboard";
import { TradeFilters, HierarchyRow, HierarchyMetric, HierarchyDimension, TradeApiResponse } from "@/app/interfaces/trade/interface";
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

export function useHierarchy(dimensions: HierarchyDimension[], metric: HierarchyMetric, selectedYear: number | null): {
  filters: TradeFilters;
  fetcher: (f: TradeFilters) => Promise<HierarchyRow[]>;
} {
  const filters = useDashboard((s) => s.filters);
  const f = filters;
  const effective = useMemo<TradeFilters>(() => {
    const base: TradeFilters = {
      flow: f.flow, category: f.category, product: f.product, originCountry: f.originCountry,
      customs: f.customs, importer: f.importer, exporter: f.exporter,
      countryCode: f.countryCode, industry: f.industry,
      fraccion: f.fraccion, meses: f.meses,
    };
    if (selectedYear != null) {
      base.years = [selectedYear];
    } else {
      base.yearStart = f.yearStart;
      base.yearEnd = f.yearEnd;
    }
    return base;
  }, [f.flow, f.category, f.product, f.originCountry, f.customs, f.importer, f.exporter, f.countryCode, f.industry, f.yearStart, f.yearEnd, f.fraccion, f.meses, selectedYear]);

  const fetcher = useCallback(async (ff: TradeFilters) => {
    const q = buildTradeQueryString(ff);
    const dims = dimensions.join(",");
    const res = await fetchJson<TradeApiResponse<HierarchyRow[]>>(`/trade/hierarchy${q}${q ? "&" : "?"}dimensions=${encodeURIComponent(dims)}&metric=${metric}&limit=500`);
    return res.data || [];
  }, [dimensions, metric]);

  return { filters: effective, fetcher };
}
