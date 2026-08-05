"use client";

import { useEffect, useState } from "react";
import {
  ForecastRun,
  EDASeriesPoint,
  EDAMetric,
  ExternalFeature,
  ForecastPoint,
  ForecastMetric,
} from "@/app/interfaces/trade/projection";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    const text = await response.text().catch(() => "Unknown error");
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  return response.json();
}

export interface LatestRunResult {
  run: ForecastRun | null;
  loading: boolean;
  error: string | null;
}

export function useLatestRun(): LatestRunResult {
  const [run, setRun] = useState<ForecastRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchJson<{
          success: boolean;
          data: { run: ForecastRun | null; points: unknown[]; metrics: unknown[]; products: string[] };
        }>("/trade/forecast/data?frequency=M&horizon=6");

        if (cancelled) return;
        setRun(data.data?.run || null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { run, loading, error };
}

export interface EDAData {
  metrics: EDAMetric[];
  series: EDASeriesPoint[];
  external: ExternalFeature[];
  productsAvailable: string[];
}

export interface UseEDAResult extends EDAData {
  loading: boolean;
  error: string | null;
}

function extractExternalFeatures(series: EDASeriesPoint[]): ExternalFeature[] {
  const seen = new Set<string>();
  const result: ExternalFeature[] = [];
  for (const s of series) {
    if (!seen.has(s.date) && (s.fx_usdvnd != null || s.corn_fut != null || s.soymeal_fut != null)) {
      seen.add(s.date);
      result.push({
        id: result.length + 1,
        date: s.date,
        fx_usdvnd: s.fx_usdvnd,
        corn_fut: s.corn_fut,
        soymeal_fut: s.soymeal_fut,
      });
    }
  }
  return result;
}

export function useEDA(
  product: string,
  year?: number | null,
  month?: number | null
): UseEDAResult {
  const [metrics, setMetrics] = useState<EDAMetric[]>([]);
  const [series, setSeries] = useState<EDASeriesPoint[]>([]);
  const [external, setExternal] = useState<ExternalFeature[]>([]);
  const [productsAvailable, setProductsAvailable] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (product && product !== "all") params.set("product", product);
        if (year) params.set("year", String(year));
        if (month) params.set("month", String(month));

        const [seriesRes, metricsRes, filtersRes] = await Promise.all([
          fetchJson<{ success: boolean; data: EDASeriesPoint[] }>(
            `/trade/eda/series?${params}`
          ),
          fetchJson<{ success: boolean; data: EDAMetric[] }>(
            year ? `/trade/eda/metrics?${params}` : `/trade/eda/metrics?product=${product || "all"}`
          ),
          fetchJson<{
            success: boolean;
            data: { products: string[]; years: number[]; months: number[] };
          }>("/trade/eda/filters"),
        ]);

        if (cancelled) return;

        const seriesData = seriesRes.data || [];
        setSeries(seriesData);
        setMetrics(metricsRes.data || []);
        setExternal(extractExternalFeatures(seriesData));
        setProductsAvailable(filtersRes.data?.products || []);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [product, year, month]);

  return { metrics, series, external, productsAvailable, loading, error };
}

export interface ForecastData {
  points: ForecastPoint[];
  metrics: ForecastMetric[];
  productsAvailable: string[];
}

export interface UseForecastResult extends ForecastData {
  loading: boolean;
  error: string | null;
}

export function useForecast(
  _run: ForecastRun | null,
  product: string,
  frequency: "D" | "M",
  horizon: number
): UseForecastResult {
  const [points, setPoints] = useState<ForecastPoint[]>([]);
  const [metrics, setMetrics] = useState<ForecastMetric[]>([]);
  const [productsAvailable, setProductsAvailable] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!_run) {
        setPoints([]);
        setMetrics([]);
        setProductsAvailable([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (product && product !== "all") params.set("product", product);
        params.set("frequency", frequency);
        params.set("horizon", String(horizon));

        const { data } = await fetchJson<{
          success: boolean;
          data: {
            points: ForecastPoint[];
            metrics: ForecastMetric[];
            products: string[];
            run: ForecastRun;
          };
        }>(`/trade/forecast/data?${params}`);

        if (cancelled) return;
        setPoints(data?.points || []);
        setMetrics(data?.metrics || []);
        setProductsAvailable(data?.products || []);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [_run?.id, product, frequency, horizon]);

  return { points, metrics, productsAvailable, loading, error };
}
