"use client";

import { useMemo, useState, useEffect } from "react";
import { ChevronUp, ChevronDown, X, ArrowLeft } from "lucide-react";
import type { HierarchyRow, HierarchyDimension, HierarchyMetric } from "@/app/interfaces/trade/interface";
import { PillToggle } from "@/components/trade/PillToggle";
import { useTradeTheme } from "./TradeThemeContext";
import { CardHeader } from "./CardHeader";

const fontQ = "var(--font-poppins), Poppins, sans-serif";

interface Props {
  data: HierarchyRow[];
  flow: "imports" | "exports";
  dimensions: HierarchyDimension[];
  onDimensionsChange: (dims: HierarchyDimension[]) => void;
  metric: HierarchyMetric;
  onMetricChange: (m: HierarchyMetric) => void;
  availableYears: number[];
  selectedYear: number | null;
  onYearChange: (year: number) => void;
  loading?: boolean;
  unit?: { short: string; per: string };
  /** Contenido extra a la derecha de la fila de año (p. ej. un toggle de vista). */
  headerActions?: React.ReactNode;
  /** Cuando se pasa, se renderiza en lugar de las columnas del árbol (p. ej. un mapa). */
  contentOverride?: React.ReactNode;
}

const ALL_DIMENSIONS: HierarchyDimension[] = [
  "categoria",
  "producto",
  "country",
  "empresa",
  "exportador",
  "importador",
  "aduana",
];

const TOP_N = 12;

function fmtKg(n: number, unitShort: string = "mt") {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ${unitShort}`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k ${unitShort}`;
  return `${n.toFixed(0)} ${unitShort}`;
}

function fmtUsd(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function getDimensionLabels(flow: "imports" | "exports") {
  return {
    categoria: "Categoría",
    producto: "Producto",
    country: flow === "imports" ? "País origen" : "País destino",
    empresa: "Empresa",
    exportador: "Exportador",
    importador: "Importador",
    aduana: "Aduana",
  };
}

function getMetricConfig(metric: HierarchyMetric, unit: { short: string; per: string }, accentColor: string) {
  switch (metric) {
    case "precioUsd":
      return {
        label: `USD/${unit.per}`,
        format: (n: number) => `$${n.toFixed(2)}/${unit.per}`,
        color: accentColor,
      };
    default:
      return {
        label: `Volumen (${unit.short})`,
        format: (n: number) => fmtKg(n, unit.short),
        color: accentColor,
      };
  }
}

function getRowValue(row: HierarchyRow, dimension: HierarchyDimension): string {
  const record = row as unknown as Record<string, string | number | null | undefined>;
  return String(record[dimension] ?? "Sin valor");
}

function aggregate(
  rows: HierarchyRow[],
  dimension: HierarchyDimension,
): Array<{ key: string; volumenKg: number; valorUsd: number; cifFiltrado: number; volFiltrado: number; registros: number }> {
  const map = new Map<string, { volumenKg: number; valorUsd: number; cifFiltrado: number; volFiltrado: number; registros: number }>();
  for (const r of rows) {
    const key = getRowValue(r, dimension);
    const prev = map.get(key);
    if (prev) {
      prev.volumenKg += r.volumenKg;
      prev.valorUsd += r.valorUsd;
      prev.cifFiltrado += r.cifFiltrado ?? 0;
      prev.volFiltrado += r.volFiltrado ?? 0;
      prev.registros += r.registros;
    } else {
      map.set(key, {
        volumenKg: r.volumenKg,
        valorUsd: r.valorUsd,
        cifFiltrado: r.cifFiltrado ?? 0,
        volFiltrado: r.volFiltrado ?? 0,
        registros: r.registros,
      });
    }
  }
  return Array.from(map.entries()).map(([key, v]) => ({ key, ...v }));
}

function computeMetricValue(
  metric: HierarchyMetric,
  r: { volumenKg: number; valorUsd: number; cifFiltrado?: number; volFiltrado?: number },
): number {
  if (metric === "precioUsd") {
    if ((r.cifFiltrado ?? 0) > 0 && (r.volFiltrado ?? 0) > 0) return (r.cifFiltrado ?? 0) / (r.volFiltrado ?? 0);
    return r.volumenKg > 0 ? r.valorUsd / r.volumenKg : 0;
  }
  return r.volumenKg;
}

export function DecompositionTree({
  data,
  flow,
  dimensions,
  onDimensionsChange,
  metric,
  onMetricChange,
  availableYears,
  selectedYear,
  onYearChange,
  loading,
  unit = { short: "mt", per: "mt" },
  headerActions,
  contentOverride,
}: Props) {
  const [path, setPath] = useState<string[]>([]);
  const labels = useMemo(() => getDimensionLabels(flow), [flow]);
  const T = useTradeTheme();
  const cfg = useMemo(() => getMetricConfig(metric, unit, T.accentNavy), [metric, unit, T.accentNavy]);

  useEffect(() => {
    setPath([]);
  }, [dimensions.join("|"), metric]);

  const filteredRows = useMemo(() => {
    let rows = data;
    for (let i = 0; i < path.length; i++) {
      const dim = dimensions[i];
      const val = path[i];
      rows = rows.filter(r => getRowValue(r, dim) === val);
    }
    return rows;
  }, [data, dimensions, path]);

  const root = useMemo(() => {
    const volumenKg = data.reduce((acc, r) => acc + r.volumenKg, 0);
    const valorUsd = data.reduce((acc, r) => acc + r.valorUsd, 0);
    const cifFiltrado = data.reduce((acc, r) => acc + (r.cifFiltrado ?? 0), 0);
    const volFiltrado = data.reduce((acc, r) => acc + (r.volFiltrado ?? 0), 0);
    const registros = data.reduce((acc, r) => acc + r.registros, 0);
    const value = computeMetricValue(metric, { volumenKg, valorUsd, cifFiltrado, volFiltrado });
    return { volumenKg, valorUsd, cifFiltrado, volFiltrado, registros, value };
  }, [data, metric]);

  const columns = useMemo(() => {
    const cols: Array<{
      dimension: HierarchyDimension;
      label: string;
      selected: string | null;
      rows: Array<{ key: string; value: number; volumenKg: number; registros: number; isOthers: boolean }>;
    }> = [];

    for (let level = 0; level < dimensions.length; level++) {
      const dim = dimensions[level];
      if (level > path.length) {
        cols.push({ dimension: dim, label: labels[dim], selected: null, rows: [] });
        continue;
      }

      const aggregated = aggregate(filteredRows, dim);
      const computed = aggregated.map(r => ({
        ...r,
        value: computeMetricValue(metric, r),
      }));

      computed.sort((a, b) => b.value - a.value);

      const top = computed.slice(0, TOP_N);
      const others = computed.slice(TOP_N);
      const rowsOut = top.map(r => ({ ...r, isOthers: false }));
      if (others.length) {
        const othersVol = others.reduce((acc, o) => acc + o.volumenKg, 0);
        const othersValorUsd = others.reduce((acc, o) => acc + o.valorUsd, 0);
        const othersCifFiltrado = others.reduce((acc, o) => acc + o.cifFiltrado, 0);
        const othersVolFiltrado = others.reduce((acc, o) => acc + o.volFiltrado, 0);
        rowsOut.push({
          key: "Otros",
          value: computeMetricValue(metric, { volumenKg: othersVol, valorUsd: othersValorUsd, cifFiltrado: othersCifFiltrado, volFiltrado: othersVolFiltrado }),
          volumenKg: othersVol,
          valorUsd: othersValorUsd,
          cifFiltrado: othersCifFiltrado,
          volFiltrado: othersVolFiltrado,
          registros: others.reduce((acc, o) => acc + o.registros, 0),
          isOthers: true,
        });
      }

      cols.push({
        dimension: dim,
        label: labels[dim],
        selected: path[level] ?? null,
        rows: rowsOut,
      });
    }
    return cols;
  }, [filteredRows, dimensions, labels, metric, path]);

  const moveDimension = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= dimensions.length) return;
    const next = [...dimensions];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    onDimensionsChange(next);
  };

  const removeDimension = (idx: number) => {
    const next = dimensions.filter((_, i) => i !== idx);
    onDimensionsChange(next);
  };

  const addDimension = (dim: HierarchyDimension) => {
    if (dimensions.includes(dim)) return;
    onDimensionsChange([...dimensions, dim]);
  };

  const selectRow = (level: number, key: string) => {
    if (path[level] === key) {
      setPath(path.slice(0, level));
      return;
    }
    const next = path.slice(0, level);
    next.push(key);
    setPath(next);
  };

  const clearPath = () => setPath([]);

  const formatValue = (v: number) => cfg.format(v);

  return (
    <div className="space-y-4">
      <div
        className="rounded-lg border p-4"
        style={{ borderColor: T.border, fontFamily: fontQ, backgroundColor: T.surface }}
      >
        <CardHeader
          theme={T}
          title="Desglose de operaciones"
          subtitle="Navega por jerarquías: categoría, producto, país, empresa y aduana."
          actions={
            <div className="flex flex-wrap items-center justify-end gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.15em]"
                  style={{ color: T.accentNavy }}
                >
                  Año
                </span>
                {availableYears.length === 0 ? (
                  <div
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: T.textMuted }}
                  >
                    <div
                      className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
                      style={{ color: T.accentNavy }}
                    />
                    Cargando años…
                  </div>
                ) : (
                  <select
                    aria-label="Año de análisis"
                    value={selectedYear ?? availableYears[0]}
                    onChange={e => onYearChange(Number(e.target.value))}
                    className="rounded border px-2 py-1 text-xs font-semibold outline-none"
                    style={{
                      borderColor: T.borderStrong,
                      color: T.textPrimary,
                      backgroundColor: T.surfaceAlt,
                      fontFamily: fontQ,
                    }}
                  >
                    {availableYears.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                )}
              </div>
              {headerActions}
            </div>
          }
        />

        {!contentOverride && (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {dimensions.map((dim, idx) => (
                <div
                  key={dim}
                  className="flex items-center gap-1 rounded border px-2 py-1 text-xs"
                  style={{ borderColor: T.borderStrong, backgroundColor: T.surfaceAlt }}
                >
                  <span className="font-semibold" style={{ color: T.textPrimary }}>
                    {labels[dim]}
                  </span>
                  <div className="ml-1 flex items-center">
                    <button
                      type="button"
                      aria-label={`Subir ${labels[dim]}`}
                      onClick={() => moveDimension(idx, -1)}
                      disabled={idx === 0}
                      className="rounded p-0.5 hover:bg-[var(--trade-surface-hover)] disabled:opacity-30"
                      style={{ color: T.accentNavy }}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Bajar ${labels[dim]}`}
                      onClick={() => moveDimension(idx, 1)}
                      disabled={idx === dimensions.length - 1}
                      className="rounded p-0.5 hover:bg-[var(--trade-surface-hover)] disabled:opacity-30"
                      style={{ color: T.accentNavy }}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Quitar ${labels[dim]}`}
                      onClick={() => removeDimension(idx)}
                      className="rounded p-0.5 hover:bg-[var(--trade-surface-hover)]"
                      style={{ color: "#ef4444" }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}

              <select
                aria-label="Agregar dimensión"
                value=""
                onChange={e => addDimension(e.target.value as HierarchyDimension)}
                className="rounded border px-2 py-1 text-xs font-semibold outline-none"
                style={{ borderColor: T.borderStrong, color: T.accentNavy, backgroundColor: T.surfaceAlt, fontFamily: fontQ }}
              >
                <option value="" disabled>Agregar dimensión</option>
                {ALL_DIMENSIONS.filter(d => !dimensions.includes(d)).map(d => (
                  <option key={d} value={d}>{labels[d]}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs" style={{ color: T.textMuted }}>
                <span>Métrica:</span>
                <PillToggle<HierarchyMetric>
                  options={[
                    { id: "volumenKg", label: `Volumen (${unit.short})` },
                    { id: "precioUsd", label: `USD/${unit.per}` },
                  ]}
                  value={metric}
                  onChange={onMetricChange}
                  ariaLabel="Cambiar métrica"
                />
              </div>

              {path.length > 0 && (
                <button
                  type="button"
                  onClick={clearPath}
                  className="flex items-center gap-1 rounded border px-2 py-1 text-xs font-semibold hover:bg-[var(--trade-surface-hover)]"
                  style={{ borderColor: T.borderStrong, color: T.accentNavy, backgroundColor: T.surfaceAlt, fontFamily: fontQ }}
                >
                  <ArrowLeft className="h-3 w-3" /> Reiniciar jerarquía
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {!contentOverride && path.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs" style={{ fontFamily: fontQ, color: T.textMuted }}>
          <span className="font-semibold uppercase tracking-wider">Filtro activo:</span>
          {path.map((val, i) => (
            <span key={i} className="rounded border px-2 py-0.5" style={{ borderColor: T.border, backgroundColor: T.surfaceAlt }}>
              <span className="font-semibold" style={{ color: T.accentNavy }}>{labels[dimensions[i]]}:</span>{" "}
              <span style={{ color: T.textPrimary }}>{val}</span>
            </span>
          ))}
        </div>
      )}

      {!contentOverride && loading && (
        <div className="flex items-center gap-2 text-sm" style={{ color: T.textMuted, fontFamily: fontQ }}>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" style={{ color: T.accentNavy }} />
          Cargando operaciones…
        </div>
      )}

      {contentOverride ? contentOverride : (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:overflow-x-auto">
        <TreeColumn
          title="Total"
          rows={[
            {
              key: "total",
              label: cfg.label,
              value: root.value,
              displayValue: formatValue(root.value),
              registros: root.registros,
              isSelected: false,
              isOthers: false,
              color: cfg.color,
              max: root.value,
            },
          ]}
        />

        {columns.map((col, level) => (
          <TreeColumn
            key={col.dimension}
            title={col.label}
            rows={col.rows.map(r => ({
              key: r.key,
              label: r.key,
              value: r.value,
              displayValue: formatValue(r.value),
              registros: r.registros,
              isSelected: col.selected === r.key,
              isOthers: r.isOthers,
              color: cfg.color,
              max: col.rows[0]?.value ?? 0,
            }))}
            onRowClick={rowKey => selectRow(level, rowKey)}
            disabledKeys={new Set(col.rows.filter(r => r.isOthers).map(r => r.key))}
          />
        ))}
        </div>
      )}
    </div>
  );
}

function TreeColumn({
  title,
  rows,
  onRowClick,
  disabledKeys = new Set<string>(),
}: {
  title: string;
  rows: Array<{
    key: string;
    label: string;
    value: number;
    displayValue: string;
    registros: number;
    isSelected: boolean;
    isOthers: boolean;
    color: string;
    max: number;
  }>;
  onRowClick?: (key: string) => void;
  disabledKeys?: Set<string>;
}) {
  const T = useTradeTheme();
  return (
    <div
      className="min-w-[260px] flex-1 rounded-lg border p-3"
      style={{ borderColor: T.border, backgroundColor: T.surface }}
    >
      <div
        className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em]"
        style={{ fontFamily: fontQ, color: T.accentNavy }}
      >
        {title}
      </div>
      <div className="space-y-2">
        {rows.map(row => {
          const width = row.max > 0 ? (row.value / row.max) * 100 : 0;
          const disabled = row.isOthers || !onRowClick || disabledKeys.has(row.key);
          return (
            <button
              key={row.key}
              type="button"
              onClick={() => !disabled && onRowClick?.(row.key)}
              disabled={disabled}
              className={`w-full text-left rounded p-2 transition-colors ${disabled ? "cursor-default" : "cursor-pointer"}`}
              style={{ backgroundColor: row.isSelected ? T.surfaceAlt : "transparent" }}
            >
              <div className="flex items-center justify-between text-xs" style={{ fontFamily: fontQ }}>
                <span
                  className="max-w-[70%] truncate font-semibold"
                  style={{ color: row.isOthers ? T.textMuted : T.textPrimary }}
                  title={row.label}
                >
                  {row.label}
                </span>
                <span className="font-mono-numbers font-semibold" style={{ color: T.textPrimary }}>
                  {row.displayValue}
                </span>
              </div>
              <div
                className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full"
                style={{ backgroundColor: T.surfaceHover }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(0, width)}%`, backgroundColor: row.color }}
                />
              </div>
              <div className="mt-1 text-[10px]" style={{ color: T.textMuted, fontFamily: fontQ }}>
                {row.registros.toLocaleString("es-MX")} registros
              </div>
            </button>
          );
        })}
        {rows.length === 0 && (
          <div className="py-4 text-center text-xs italic" style={{ color: T.textMuted, fontFamily: fontQ }}>
            Selecciona un valor en el nivel anterior
          </div>
        )}
      </div>
    </div>
  );
}
