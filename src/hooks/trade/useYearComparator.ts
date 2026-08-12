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
        const query = buildTradeQueryString({
          countryCode: filters.countryCode,
          industry: filters.industry,
        } as TradeFilters);
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
  }, [filters.countryCode, filters.industry]);

  const stored = filters.years ?? [];
  // Cada casilla guarda el año que eligió el usuario, sin reordenar:
  // yearA (Año A, primero) y yearB (Año B, segundo) son independientes.
  let yearA = stored[0] ?? yearsList[Math.max(0, yearsList.length - 2)] ?? 2025;
  const yearB = stored[1] ?? yearsList[yearsList.length - 1] ?? 2026;
  // Recuperación por si quedó persistido un estado 2026 vs 2026.
  if (yearA === yearB) {
    const idx = yearsList.indexOf(yearA);
    yearA = yearsList[Math.max(0, idx - 1)] ?? yearB - 1;
  }

  const setYearA = (y: number) => {
    setFilters((prev) => {
      const b = prev.years?.[1] ?? yearB;
      if (y === b) return prev;
      return { ...prev, years: [y, b] };
    });
  };
  const setYearB = (y: number) => {
    setFilters((prev) => {
      const a = prev.years?.[0] ?? yearA;
      if (y === a) return prev;
      return { ...prev, years: [a, y] };
    });
  };

  return { yearA, yearB, yearsList, setYearA, setYearB };
}
