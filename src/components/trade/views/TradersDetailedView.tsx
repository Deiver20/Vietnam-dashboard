"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { Loader2, RefreshCcw } from "lucide-react";
import { ChartCard } from "@/components/trade/ChartCard";
import { DataTable, type Columna } from "@/components/trade/DataTable";
import { useDetailedData } from "@/hooks/trade/useDetailedData";
import { getUnitLabel } from "@/app/lib/trade/constants";
import { useTradeTheme } from "@/components/trade/TradeThemeContext";
import { DetailedTradeResponse, DetailedTradeRow } from "@/app/interfaces/trade/interface";

const PAGE_SIZE = 500;

export function TradersDetailedView() {
  const { filters, fetcher } = useDetailedData();
  const [data, setData] = useState<DetailedTradeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const T = useTradeTheme();
  const dark = T.mode === "dark";

  const unit = useMemo(() => getUnitLabel(), []);

  const load = useCallback(async (off: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher(filters, { limit: PAGE_SIZE, offset: off });
      setData(res);
      setOffset(off);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fetcher, filters]);

  useEffect(() => {
    load(0);
  }, [filters, load]);

  const columnas: Columna<DetailedTradeRow>[] = useMemo(() => [
    { key: "año", titulo: "Año", sortable: true, width: "70px",
      formato: v => <span className="font-mono-numbers text-[12px]" style={{ color: T.textPrimary }}>{String(v)}</span> },
    { key: "mes", titulo: "Mes", width: "70px",
      formato: v => <span style={{ color: T.textPrimary }}>{String(v)}</span> },
    { key: "fecha", titulo: "Fecha", width: "110px",
      formato: v => <span className="font-mono-numbers text-[11px]" style={{ color: T.textMuted }}>{String(v ?? "—")}</span> },
    { key: "fraccion", titulo: "Fracción", sortable: true, width: "100px",
      formato: v => <span className="font-mono-numbers text-[12px]" style={{ color: T.textPrimary }}>{String(v ?? "—")}</span> },
    { key: "producto", titulo: "Producto", sortable: true, width: "180px",
      formato: v => <span style={{ color: T.textPrimary }}>{String(v) || "—"}</span> },
    { key: "categoria", titulo: "Categoría", width: "110px",
      formato: v => <span style={{ color: T.accentNavy }}>{String(v) || "—"}</span> },
    { key: "paisOrigen", titulo: "País origen", sortable: true, width: "160px",
      formato: v => <span style={{ color: T.textPrimary }}>{String(v) || "—"}</span> },
    { key: "exportador", titulo: "Exportador", width: "180px",
      formato: v => <span style={{ color: T.textPrimary }}>{String(v) || "—"}</span> },
    { key: "importador", titulo: "Importador", width: "180px",
      formato: v => <span style={{ color: T.textPrimary }}>{String(v) || "—"}</span> },
    { key: "aduana", titulo: "Aduana", width: "160px",
      formato: v => <span style={{ color: T.textPrimary }}>{String(v) || "—"}</span> },
    { key: "cantidadKg", titulo: `Volumen (${unit.short})`, sortable: true, align: "right", width: "120px",
      formato: v => <span className="font-mono-numbers text-[12px]" style={{ color: T.textPrimary }}>{(Number(v) || 0).toLocaleString("es-MX", { maximumFractionDigits: 0 })}</span> },
    { key: "valorUsd", titulo: "Valor USD", sortable: true, align: "right", width: "130px",
      formato: v => <span className="font-mono-numbers text-[12px]" style={{ color: T.textPrimary }}>{(Number(v) || 0).toLocaleString("es-MX", { maximumFractionDigits: 0 })}</span> },
    { key: "precioUsdKg", titulo: `USD/${unit.per}`, align: "right", width: "100px",
      formato: v => <span className="font-mono-numbers text-[12px]" style={{ color: T.accentNavy }}>{(Number(v) || 0).toFixed(2)}</span> },
  ], [unit.short, unit.per, T]);

  const hasMore = data ? offset + data.rows.length < data.total : false;

  return (
    <div className="space-y-4">
      <ChartCard
        title={filters.flow === "imports" ? "Detalle de importaciones" : "Detalle de exportaciones"}
        subtitle={`Desglose crudo de operaciones para los filtros aplicados (${filters.yearStart}–${filters.yearEnd}).`}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 pl-1">
        <div
          className="text-xs"
          style={{ color: T.textMuted, fontFamily: "var(--font-poppins), Poppins, sans-serif" }}
        >
          {loading ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" /> Cargando datos…
            </span>
          ) : data ? (
            <>
              <span className="font-semibold">{data.rows.length.toLocaleString("es-MX")}</span> registros
              {data.truncated && (
                <span className="ml-1.5" style={{ color: T.accent }}>
                  (truncado, mostrando los primeros {data.rows.length.toLocaleString("es-MX")} de {data.total.toLocaleString("es-MX")})
                </span>
              )}
            </>
          ) : error ? (
            <span style={{ color: "#f87171" }}>Error: {error}</span>
          ) : (
            <span>Selecciona filtros y consulta</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {data && (
            <button
              type="button"
              disabled={offset === 0 || loading}
              onClick={() => load(Math.max(0, offset - PAGE_SIZE))}
              className="inline-flex h-8 items-center rounded-md border px-3 text-[11px] font-semibold uppercase transition-colors disabled:opacity-40"
              style={{
                fontFamily: "var(--font-poppins), Poppins, sans-serif",
                letterSpacing: "0.12em",
                borderColor: T.borderStrong,
                color: T.textPrimary,
                backgroundColor: "transparent",
              }}
            >
              ← Anterior
            </button>
          )}
          {data && hasMore && (
            <button
              type="button"
              disabled={loading}
              onClick={() => load(offset + PAGE_SIZE)}
              className="inline-flex h-8 items-center rounded-md border px-3 text-[11px] font-semibold uppercase transition-colors disabled:opacity-40"
              style={{
                fontFamily: "var(--font-poppins), Poppins, sans-serif",
                letterSpacing: "0.12em",
                borderColor: T.borderStrong,
                color: T.textPrimary,
                backgroundColor: "transparent",
              }}
            >
              Siguiente →
            </button>
          )}
          <button
            type="button"
            onClick={() => load(0)}
            disabled={loading}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-[11px] font-semibold uppercase transition-colors disabled:opacity-50"
            style={{
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
              letterSpacing: "0.12em",
              borderColor: T.borderStrong,
              color: T.textPrimary,
              backgroundColor: T.surface,
            }}
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
            Recargar
          </button>
        </div>
      </div>

      {error && (
        <div
          className="rounded-md border p-4 text-sm"
          style={{ borderColor: "rgba(239, 68, 68, 0.30)", backgroundColor: dark ? "rgba(239, 68, 68, 0.12)" : "rgba(239, 68, 68, 0.08)", color: dark ? "#f87171" : "#b91c1c" }}
        >
          {error}
        </div>
      )}

      {data && data.rows.length > 0 && (
        <DataTable
          datos={data.rows}
          columnas={columnas}
          titulo={`Detalle · ${filters.flow === "imports" ? "Importaciones" : "Exportaciones"}`}
          nombreCSV={`detalle_${filters.flow}_${filters.yearStart}-${filters.yearEnd}`}
          centerTitle
        />
      )}

      {data && data.rows.length === 0 && !loading && (
        <div
          className="rounded-md border p-8 text-center text-sm"
          style={{ borderColor: T.border, backgroundColor: T.surface, color: T.textMuted }}
        >
          No hay datos para los filtros seleccionados.
        </div>
      )}
    </div>
  );
}
