"use client";

import { useCallback, useMemo } from "react";
import { useDashboard } from "@/store/useDashboard";
import { TradeFilters, ByProductResponse, TradeApiResponse, ByProductRow, ByProductComparative } from "@/app/interfaces/trade/interface";
import { buildFilterOptionsQuery } from "@/app/lib/trade/query";
import { translateProduct, translateCategory } from "@/app/lib/i18n/tradeData";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    const text = await response.text().catch(() => "Unknown error");
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  return response.json();
}

function translateByProduct(data: ByProductResponse, locale: Parameters<typeof translateProduct>[1]): ByProductResponse {
  if (!data || data.length === 0) return data;
  if ("years" in data[0]) {
    return (data as ByProductComparative[]).map((c) => ({
      ...c,
      categoria: translateCategory(c.categoria, locale),
      producto: translateProduct(c.producto, locale),
    }));
  }
  return (data as ByProductRow[]).map((r) => ({
    ...r,
    categoria: translateCategory(r.categoria, locale),
    producto: translateProduct(r.producto, locale),
  }));
}

export function useByProduct(years: [number, number]): {
  filters: TradeFilters;
  fetcher: (f: TradeFilters) => Promise<ByProductResponse>;
} {
  const filters = useDashboard((s) => s.filters);
  const locale = useDashboard((s) => s.locale);
  const f = filters;
  const effective = useMemo<TradeFilters>(() => ({
    flow: f.flow, category: f.category, product: f.product, originCountry: f.originCountry,
    customs: f.customs, importer: f.importer, exporter: f.exporter,
    countryCode: f.countryCode, industry: f.industry,
    yearStart: undefined, yearEnd: undefined,
    fraccion: f.fraccion, meses: f.meses, years,
  }), [f.flow, f.category, f.product, f.originCountry, f.customs, f.importer, f.exporter, f.countryCode, f.industry, f.fraccion, f.meses, years[0], years[1]]);

  const fetcher = useCallback(async (ff: TradeFilters) => {
    // Sin forzar ALLOWED_PRODUCTS: se devuelven los productos reales del
    // scope (país/industria/flujo), que pueden no coincidir con la lista fija
    // pensada para Vietnam.
    const q = buildFilterOptionsQuery(ff);
    const res = await fetchJson<TradeApiResponse<ByProductResponse>>(`/trade/by-product${q}`);
    return translateByProduct(res.data || [], locale);
  }, [locale]);

  return { filters: effective, fetcher };
}
