"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  TradeFilters,
  TradeOverviewItem,
  TradeTotalImports,
  TradeTimelineItem,
  TradeFilterOptions,
  ALLOWED_PRODUCTS,
} from "@/app/interfaces/trade/interface";
import { buildTradeQueryString, buildFilterOptionsQuery, buildFiltersAllQuery } from "@/app/lib/trade/query";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    const text = await response.text().catch(() => "Unknown error");
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  return response.json();
}

interface UseTradeDataResult {
  overview: TradeOverviewItem[];
  totals: TradeTotalImports | null;
  timeline: TradeTimelineItem[];
  options: TradeFilterOptions;
  optionsLoading: boolean;
  loading: boolean;
  error: string | null;
}

const EMPTY_OPTIONS: TradeFilterOptions = {
  categories: [],
  products: [],
  originCountries: [],
  customs: [],
  years: [],
  importers: [],
  exporters: [],
};

type TradeDataCacheEntry = {
  overview: TradeOverviewItem[];
  totals: TradeTotalImports | null;
  timeline: TradeTimelineItem[];
};

const moduleCache = new Map<string, TradeDataCacheEntry>();
const optionsCache = new Map<string, TradeFilterOptions>();

// Caché compartida entre todas las instancias de useTradeData (panel AI,
// pestañas, shell). Mismo query string → mismos datos.
export const useTradeDataCache = {
  current: {
    get: (query: string): TradeDataCacheEntry | undefined => moduleCache.get(query),
    set: (query: string, entry: TradeDataCacheEntry) => moduleCache.set(query, entry),
    getOptions: (query: string): TradeFilterOptions | undefined => optionsCache.get(query),
    setOptions: (query: string, opts: TradeFilterOptions) => optionsCache.set(query, opts),
  },
};

export function useTradeData(filters: TradeFilters, enabled = true): UseTradeDataResult {
  const [overview, setOverview] = useState<TradeOverviewItem[]>([]);
  const [totals, setTotals] = useState<TradeTotalImports | null>(null);
  const [timeline, setTimeline] = useState<TradeTimelineItem[]>([]);
  const [options, setOptions] = useState<TradeFilterOptions>(EMPTY_OPTIONS);
  const [loading, setLoading] = useState(enabled);
  const [optionsLoading, setOptionsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const optionsRef = useRef<TradeFilterOptions>(EMPTY_OPTIONS);

  // Caché a nivel de módulo: mismo conjunto de filtros → mismos datos. Evita
  // que el panel AI y cada pestaña disparen los fetches pesados de overview /
  // total-imports / timeline / filters-all varias veces seguidas.
  const cacheRef = useRef(
    useTradeDataCache.current
  );

  const loadData = useCallback(async (query: string) => {
        const cached = cacheRef.current.get(query);
        if (cached) {
          setOverview(cached.overview);
          setTotals(cached.totals);
          setTimeline(cached.timeline);
          return cached.totals;
        }
        const [overviewRes, totalsRes, timelineRes] = await Promise.all([
          fetchJson<{ success: boolean; data: TradeOverviewItem[] }>(`/trade/overview${query}`),
          fetchJson<{ success: boolean; data: TradeTotalImports }>(`/trade/total-imports${query}`),
          fetchJson<{ success: boolean; data: TradeTimelineItem[] }>(`/trade/timeline${query}`),
        ]);

        setOverview(overviewRes.data || []);
        setTotals(totalsRes.data || null);
        setTimeline(timelineRes.data || []);

        cacheRef.current.set(query, {
          overview: overviewRes.data || [],
          totals: totalsRes.data || null,
          timeline: timelineRes.data || [],
        });

    return totalsRes.data;
  }, []);

  const loadFilterOptions = useCallback(async (query: string, totalsData: TradeTotalImports | null) => {
    try {
      const cachedOptions = cacheRef.current.getOptions(query);
      if (cachedOptions) {
        optionsRef.current = cachedOptions;
        setOptions(cachedOptions);
        return;
      }
      const res = await fetchJson<{ success: boolean; data: Record<string, string[]> }>(
        `/trade/filters-all${query}`
      );

      const newOptions: TradeFilterOptions = { ...EMPTY_OPTIONS };
      if (res.data) {
        newOptions.categories = res.data.category || [];
        newOptions.products = (res.data.product || [])
          .filter((p) => ALLOWED_PRODUCTS.some(s => s.toLowerCase() === p.toLowerCase()));
        newOptions.originCountries = res.data.originCountry || [];
        newOptions.customs = res.data.customs || [];
        newOptions.importers = res.data.importer_clean || res.data.importer || [];
        newOptions.exporters = res.data.exporter_clean || res.data.exporter || [];
      }

      if (totalsData) {
        newOptions.years = Array.from(
          { length: totalsData.maxYear - totalsData.minYear + 1 },
          (_, i) => totalsData.minYear + i
        );
      }

      optionsRef.current = newOptions;
      setOptions(newOptions);
      cacheRef.current.setOptions(query, newOptions);
    } catch (err) {
      console.warn("Failed to load filter options:", err);
      optionsRef.current = EMPTY_OPTIONS;
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setOptionsLoading(true);
      setError(null);

      try {
        const dataQuery = buildTradeQueryString(filters);
        const filtersAllQuery = buildFiltersAllQuery(filters);
        console.log("[DEBUG] filters:", JSON.stringify(filters));
        console.log("[DEBUG] dataQuery:", dataQuery);
        console.log("[DEBUG] filtersAllQuery:", filtersAllQuery);
        const totalsData = await loadData(dataQuery);
        await loadFilterOptions(filtersAllQuery, totalsData);

        if (cancelled) return;
        if (totalsData) {
          console.log("[DEBUG] totalsData received:", JSON.stringify(totalsData));
          const years = Array.from(
            { length: totalsData.maxYear - totalsData.minYear + 1 },
            (_, i) => totalsData.minYear + i
          );
          console.log("[DEBUG] Setting years:", years);
          setOptions((prev) => ({ ...prev, years }));
        } else {
          console.log("[DEBUG] totalsData is null or undefined!");
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [filters, loadData, loadFilterOptions, enabled]);

  return { overview, totals, timeline, options, optionsLoading, loading, error };
}
