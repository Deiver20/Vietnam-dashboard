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

export function useTradeData(filters: TradeFilters): UseTradeDataResult {
  const [overview, setOverview] = useState<TradeOverviewItem[]>([]);
  const [totals, setTotals] = useState<TradeTotalImports | null>(null);
  const [timeline, setTimeline] = useState<TradeTimelineItem[]>([]);
  const [options, setOptions] = useState<TradeFilterOptions>(EMPTY_OPTIONS);
  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const optionsRef = useRef<TradeFilterOptions>(EMPTY_OPTIONS);

  const loadData = useCallback(async (query: string) => {
    const [overviewRes, totalsRes, timelineRes] = await Promise.all([
      fetchJson<{ success: boolean; data: TradeOverviewItem[] }>(`/trade/overview${query}`),
      fetchJson<{ success: boolean; data: TradeTotalImports }>(`/trade/total-imports${query}`),
      fetchJson<{ success: boolean; data: TradeTimelineItem[] }>(`/trade/timeline${query}`),
    ]);

    setOverview(overviewRes.data || []);
    setTotals(totalsRes.data || null);
    setTimeline(timelineRes.data || []);

    return totalsRes.data;
  }, []);

  const loadFilterOptions = useCallback(async (query: string, totalsData: TradeTotalImports | null) => {
    try {
      const res = await fetchJson<{ success: boolean; data: Record<string, string[]> }>(
        `/trade/filters-all${query}`
      );

      const newOptions: TradeFilterOptions = { ...EMPTY_OPTIONS };
      if (res.data) {
        newOptions.categories = res.data.category || [];
        newOptions.products = (res.data.product || []).filter((p) => ALLOWED_PRODUCTS.includes(p));
        newOptions.originCountries = res.data.originCountry || [];
        newOptions.customs = res.data.customs || [];
        newOptions.importers = res.data.importer_clean || res.data.importer || [];
        newOptions.exporters = res.data.exporter_clean || res.data.exporter || [];
      }

      const years = totalsData
        ? Array.from(
            { length: totalsData.maxYear - totalsData.minYear + 1 },
            (_, i) => totalsData.minYear + i
          )
        : [];
      newOptions.years = years;

      optionsRef.current = newOptions;
      setOptions(newOptions);
    } catch (err) {
      console.warn("Failed to load filter options:", err);
      optionsRef.current = EMPTY_OPTIONS;
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setOptionsLoading(true);
      setError(null);

      try {
        const query = buildTradeQueryString(filters);
        const [totalsData] = await Promise.all([
          loadData(query),
          loadFilterOptions(query, null),
        ]);

        if (cancelled) return;
        if (totalsData) {
          const years = Array.from(
            { length: totalsData.maxYear - totalsData.minYear + 1 },
            (_, i) => totalsData.minYear + i
          );
          setOptions((prev) => ({ ...prev, years }));
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
  }, [filters, loadData, loadFilterOptions]);

  return { overview, totals, timeline, options, optionsLoading, loading, error };
}
