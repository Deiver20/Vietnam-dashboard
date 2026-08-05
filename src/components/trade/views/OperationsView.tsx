"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { DecompositionTree } from "@/components/trade/DecompositionTree";
import { useHierarchy } from "@/hooks/trade/useHierarchy";
import { useDebouncedFilters } from "@/hooks/trade/useDebouncedFilters";
import { getUnitLabel } from "@/app/lib/trade/constants";
import { TradeFilters, HierarchyRow, HierarchyDimension, HierarchyMetric } from "@/app/interfaces/trade/interface";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

const DEFAULT_DIMENSIONS: HierarchyDimension[] = ["categoria", "producto", "country", "empresa", "aduana"];

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    const text = await response.text().catch(() => "Unknown error");
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  return response.json();
}

export function OperationsView() {
  const [dimensions, setDimensions] = useState<HierarchyDimension[]>(DEFAULT_DIMENSIONS);
  const [metric, setMetric] = useState<HierarchyMetric>("volumenKg");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const unit = useMemo(() => getUnitLabel(), []);

  const loadYears = useCallback(async () => {
    try {
      const res = await fetchJson<{ success: boolean; data?: { minYear?: number; maxYear?: number } }>(
        `/trade/years-range`
      );
      const min = res.data?.minYear ?? 2022;
      const max = res.data?.maxYear ?? 2026;
      const arr: number[] = [];
      for (let y = max; y >= min; y--) arr.push(y);
      setAvailableYears(arr);
    } catch {
      setAvailableYears([]);
    }
  }, []);

  useEffect(() => {
    loadYears();
  }, [loadYears]);

  useEffect(() => {
    if (availableYears.length === 0) {
      if (selectedYear !== null) setSelectedYear(null);
      return;
    }
    if (selectedYear === null || !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const { filters, fetcher } = useHierarchy(dimensions, metric, selectedYear);
  const { datos, cargando } = useDebouncedFilters<TradeFilters, HierarchyRow[]>(filters, fetcher);

  return (
    <div className="space-y-4">
      <DecompositionTree
        data={datos ?? []}
        flow={filters.flow as "imports" | "exports"}
        dimensions={dimensions}
        onDimensionsChange={setDimensions}
        metric={metric}
        onMetricChange={setMetric}
        availableYears={availableYears}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        loading={cargando}
        unit={unit}
      />
    </div>
  );
}
