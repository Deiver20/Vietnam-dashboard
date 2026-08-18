"use client";

import { useEffect, useState } from "react";
import {
  TradeFilters,
  RaceYearData,
} from "@/app/interfaces/trade/interface";
import { buildTradeQueryString } from "@/app/lib/trade/query";
import { useDashboard } from "@/store/useDashboard";
import { translateCountry } from "@/app/lib/i18n/tradeData";

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
  const locale = useDashboard((s) => s.locale);

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

        const translateName = dimension === "country"
          ? (n: string) => translateCountry(n, locale)
          : (n: string) => n;

        const mapped = (res.data || []).map((yearBlock) => {
          const merged = new Map<
            string,
            { name: string; value: number; records: number }
          >();
          for (const item of yearBlock.items) {
            const name = translateName(item.name);
            const current = merged.get(name);
            if (current) {
              current.value += item.totalMt;
              current.records += item.records ?? 0;
            } else {
              merged.set(name, {
                name,
                value: item.totalMt,
                records: item.records ?? 0,
              });
            }
          }
          return {
            year: yearBlock.year,
            items: Array.from(merged.values()),
          };
        });

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
  }, [filters, dimension, topN, locale]);

  return { data, loading, error };
}
