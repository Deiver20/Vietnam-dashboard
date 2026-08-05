"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/store/useDashboard";
import { TradeFilters, TradeApiResponse } from "@/app/interfaces/trade/interface";
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

export function useYearComparator(): {
  yearA: number;
  yearB: number;
  yearsList: number[];
  setYearA: (y: number) => void;
  setYearB: (y: number) => void;
} {
  const filters = useDashboard((s) => s.filters);
  const setFilters = useDashboard((s) => s.setFilters);
  const [yearsList, setYearsList] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const query = buildTradeQueryString({} as TradeFilters);
        const res = await fetchJson<TradeApiResponse<{ minYear: number; maxYear: number }>>(
          `/trade/years-range${query}`
        );
        if (cancelled) return;
        const min = res.data?.minYear ?? 2022;
        const max = res.data?.maxYear ?? 2026;
        const arr: number[] = [];
        for (let y = min; y <= max; y++) arr.push(y);
        setYearsList(arr);
      } catch {
        if (!cancelled) setYearsList([]);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const stored = filters.years ?? [];
  // yearA (Año A) = año actual/último; yearB (Año B) = año anterior.
  const yearA = stored[1] ?? yearsList[yearsList.length - 1] ?? 2026;
  const yearB = stored[0] ?? yearsList[Math.max(0, yearsList.length - 2)] ?? 2025;

  const setYearA = (y: number) => {
    setFilters((prev) => ({ ...prev, years: [prev.years?.[0] ?? y, y].sort((a, b) => a - b) as [number, number] | number[] }));
  };
  const setYearB = (y: number) => {
    setFilters((prev) => ({ ...prev, years: [y, prev.years?.[1] ?? y].sort((a, b) => a - b) as [number, number] | number[] }));
  };

  return { yearA, yearB, yearsList, setYearA, setYearB };
}
