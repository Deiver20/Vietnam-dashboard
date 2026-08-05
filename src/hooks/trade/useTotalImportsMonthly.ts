"use client";

import { useEffect, useState } from "react";
import { TradeFilters } from "@/app/interfaces/trade/interface";
import { buildTradeQueryString } from "@/app/lib/trade/query";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

export interface TotalImportsMonthlyPoint {
  year: number;
  month: number;
  date: string;
  cif_price: number;
  volume_mt: number;
  transactions: number;
}

interface UseTotalImportsMonthlyResult {
  data: TotalImportsMonthlyPoint[];
  loading: boolean;
  error: string | null;
}

export function useTotalImportsMonthly(filters: TradeFilters): UseTotalImportsMonthlyResult {
  const [data, setData] = useState<TotalImportsMonthlyPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const query = buildTradeQueryString(filters);
        const response = await fetch(`${API_BASE}/trade/total-imports/monthly${query}`);

        if (!response.ok) {
          const text = await response.text().catch(() => "Unknown error");
          throw new Error(`HTTP ${response.status}: ${text}`);
        }

        const result = await response.json();

        if (cancelled) return;

        setData(result.data || []);
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
  }, [filters]);

  return { data, loading, error };
}
