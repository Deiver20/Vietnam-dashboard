"use client";

import { useEffect, useState } from "react";
import {
  ForecastRun,
  EDASeriesPoint,
  EDACandle,
  EDAMetric,
  ExternalFeature,
  ForecastPoint,
  ForecastMetric,
} from "@/app/interfaces/trade/projection";
import { ALLOWED_PRODUCTS } from "@/app/interfaces/trade/interface";

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

export interface TradeScope {
  countryCode?: string;
  industry?: string;
  flow?: string;
}

function scopeParams(scope?: TradeScope): URLSearchParams {
  const params = new URLSearchParams();
  if (scope?.countryCode) params.set("countryCode", scope.countryCode);
  if (scope?.industry) params.set("industry", scope.industry);
  if (scope?.flow) params.set("flow", scope.flow);
  return params;
}

export function useLatestRun(scope?: TradeScope, enabled = true): LatestRunResult {
  const [run, setRun] = useState<ForecastRun | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!enabled) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const scopeQuery = scopeParams(scope).toString();
        const qs = scopeQuery ? `&${scopeQuery}` : "";
        const data = await fetchJson<{
          success: boolean;
          data: { run: ForecastRun | null; points: unknown[]; metrics: unknown[]; products: string[] };
        }>(`/trade/forecast/data?frequency=M&horizon=6&runOnly=true${qs}`);

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
  }, [enabled, scope?.countryCode, scope?.industry, scope?.flow]);

  return { run, loading, error };
}

export interface EDAData {
  metrics: EDAMetric[];
  series: EDASeriesPoint[];
  candles: EDACandle[];
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
        cif_price: s.cif_price,
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
  month?: number | null,
  scope?: TradeScope
): UseEDAResult {
  const [metrics, setMetrics] = useState<EDAMetric[]>([]);
  const [series, setSeries] = useState<EDASeriesPoint[]>([]);
  const [candles, setCandles] = useState<EDACandle[]>([]);
  const [external, setExternal] = useState<ExternalFeature[]>([]);
  const [productsAvailable, setProductsAvailable] = useState<string[]>([]);
  const [resolvedProduct, setResolvedProduct] = useState<string | null>(
    product && product !== "all" ? product : null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setResolvedProduct(product && product !== "all" ? product : null);
  }, [product]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const filtersRes = fetchJson<{
          success: boolean;
          data: { products: string[]; years: number[]; months: number[] };
        }>(`/trade/eda/filters${scopeParams(scope).toString() ? `?${scopeParams(scope).toString()}` : ""}`);

        const filtersDone = await filtersRes;
        const available = (filtersDone.data?.products || []).filter((p) =>
          ALLOWED_PRODUCTS.includes(p)
        );
        if (cancelled) return;
        setProductsAvailable(available);

        const target = resolvedProduct ?? available[0] ?? null;
        if (!target) {
          setSeries([]);
          setMetrics([]);
          setCandles([]);
          setExternal([]);
          setLoading(false);
          return;
        }

        const params = new URLSearchParams();
        params.set("product", target);
        // Los gráficos históricos solo muestran los últimos 3 años: se filtra
        // en el backend para no bajar la serie completa (hasta 50k filas).
        const currentYear = new Date().getUTCFullYear();
        const yearStart = year ?? currentYear - 2;
        const yearEnd = year ?? currentYear;
        params.set("yearStart", String(yearStart));
        params.set("yearEnd", String(yearEnd));
        if (month) params.set("month", String(month));
        if (scope?.countryCode) params.set("countryCode", scope.countryCode);
        if (scope?.industry) params.set("industry", scope.industry);
        if (scope?.flow) params.set("flow", scope.flow);

        const [seriesRes, metricsRes, candlesRes] = await Promise.all([
          fetchJson<{ success: boolean; data: EDASeriesPoint[] }>(
            `/trade/eda/series?${params}`
          ),
          fetchJson<{ success: boolean; data: EDAMetric[] }>(
            `/trade/eda/metrics?${params}`
          ),
          fetchJson<{ success: boolean; data: EDACandle[] }>(
            `/trade/eda/candles?${params}`
          ),
        ]);

        if (cancelled) return;

        const seriesData = seriesRes.data || [];
        setSeries(seriesData);
        setMetrics(metricsRes.data || []);
        setCandles(candlesRes.data || []);
        setExternal(extractExternalFeatures(seriesData));
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
  }, [resolvedProduct, year, month, scope?.countryCode, scope?.industry, scope?.flow]);

  return { metrics, series, candles, external, productsAvailable, loading, error };
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
  horizon: number,
  enabled = true,
  scope?: TradeScope
): UseForecastResult {
  const [points, setPoints] = useState<ForecastPoint[]>([]);
  const [metrics, setMetrics] = useState<ForecastMetric[]>([]);
  const [productsAvailable, setProductsAvailable] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!enabled || !_run || !product) {
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
        if (scope?.countryCode) params.set("countryCode", scope.countryCode);
        if (scope?.industry) params.set("industry", scope.industry);
        if (scope?.flow) params.set("flow", scope.flow);

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
  }, [enabled, _run?.id, product, frequency, horizon, scope?.countryCode, scope?.industry, scope?.flow]);

  return { points, metrics, productsAvailable, loading, error };
}
