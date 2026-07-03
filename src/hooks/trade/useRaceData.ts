"use client";

import { useEffect, useState } from "react";
import {
  TradeFilters,
  RaceYearData,
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

interface UseRaceDataResult {
  data: RaceYearData[];
  loading: boolean;
  error: string | null;
}

interface RaceApiItem {
  name: string;
  totalMt: number;
  records?: number;
}

interface RaceApiYear {
  year: number;
  items: RaceApiItem[];
}

export function useRaceData(
  filters: TradeFilters,
  dimension: "country" | "importer",
  topN = 10
): UseRaceDataResult {
  const [data, setData] = useState<RaceYearData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setData([]);

      try {
        const query = buildTradeQueryString(filters);
        const separator = query ? "&" : "?";
        const res = await fetchJson<{
          success: boolean;
          data: RaceApiYear[];
        }>(
          `/trade/race${query}${separator}dimension=${dimension}&topN=${topN}`
        );

        const mapped = (res.data || []).map((yearBlock) => ({
          year: yearBlock.year,
          items: yearBlock.items.map((item) => ({
            name: item.name,
            value: item.totalMt,
            records: item.records,
          })),
        }));

        if (!cancelled) setData(mapped);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [filters, dimension, topN]);

  return { data, loading, error };
}
