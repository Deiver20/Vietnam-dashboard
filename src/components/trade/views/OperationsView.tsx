"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { DecompositionTree } from "@/components/trade/DecompositionTree";
import { PillToggle } from "@/components/trade/PillToggle";
import { TradeConnectionsMap, ConnectionRow } from "@/components/trade/TradeConnectionsMap";
import { useHierarchy } from "@/hooks/trade/useHierarchy";
import { useDebouncedFilters } from "@/hooks/trade/useDebouncedFilters";
import { getUnitLabel } from "@/app/lib/trade/constants";
import { makeFormatters } from "@/components/trade/charts";
import { useTradeTheme } from "@/components/trade/TradeThemeContext";
import { TradeFilters, HierarchyRow, HierarchyDimension, HierarchyMetric } from "@/app/interfaces/trade/interface";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

const DEFAULT_DIMENSIONS: HierarchyDimension[] = ["categoria", "producto", "country", "empresa", "aduana"];
const MAP_DIMENSIONS: HierarchyDimension[] = ["exportador", "importador", "country"];

type Vista = "jerarquia" | "mapa";

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
  const [vista, setVista] = useState<Vista>("jerarquia");
  const T = useTradeTheme();

  const unit = useMemo(() => getUnitLabel(), []);
  const formatters = useMemo(() => makeFormatters(unit), [unit]);

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

  // Conexiones exportador → importador para el mapa (misma API de jerarquía).
  const { filters: mapFilters, fetcher: mapFetcher } = useHierarchy(MAP_DIMENSIONS, "volumenKg", selectedYear);
  const { datos: mapDatos, cargando: mapCargando } = useDebouncedFilters<TradeFilters, HierarchyRow[]>(mapFilters, mapFetcher);

  const connections: ConnectionRow[] = useMemo(() => {
    if (!mapDatos) return [];
    return mapDatos.map((r) => ({
      exportador: r.exportador ?? "",
      importador: r.importador ?? "",
      country: r.country,
      volumenKg: r.volumenKg,
      valorUsd: r.valorUsd,
    }));
  }, [mapDatos]);

  const mapaContent = (
    <div className="space-y-4">
      {!mapDatos || mapCargando ? (
        <div
          className="flex h-[480px] items-center justify-center rounded-lg border text-sm"
          style={{ borderColor: T.border, color: T.textMuted, backgroundColor: T.surface }}
        >
          <Loader2 className="h-4 w-4 animate-spin mr-2" style={{ color: T.accentNavy }} /> Cargando conexiones…
        </div>
      ) : connections.length === 0 ? (
        <div
          className="flex h-[480px] items-center justify-center rounded-lg border text-sm"
          style={{ borderColor: T.border, color: T.textMuted, backgroundColor: T.surface }}
        >
          Sin conexiones con coordenadas para los filtros seleccionados.
        </div>
      ) : (
        <TradeConnectionsMap
          connections={connections}
          unit={unit.short}
          valueFormatter={formatters.unit}
        />
      )}
    </div>
  );

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
        headerActions={
          <PillToggle<Vista>
            options={[
              { id: "jerarquia", label: "Jerarquía" },
              { id: "mapa", label: "Mapa" },
            ]}
            value={vista}
            onChange={setVista}
            ariaLabel="Cambiar vista"
          />
        }
        contentOverride={vista === "mapa" ? mapaContent : undefined}
      />
    </div>
  );
}
