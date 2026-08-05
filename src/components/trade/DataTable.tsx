"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useTradeTheme } from "./TradeThemeContext";

export type Columna<T = Record<string, unknown>> = {
  key: string;
  titulo: string;
  formato?: (valor: unknown, fila: T) => React.ReactNode;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  width?: string;
};

type DataTableProps<T = Record<string, unknown>> = {
  datos: T[];
  columnas: Columna<T>[];
  titulo?: string;
  filasPorPag?: number;
  defaultExpanded?: boolean;
  exportarCSV?: boolean;
  nombreCSV?: string;
  centerTitle?: boolean;
  /** AGM-Front table skin: rounded-[14px] glass card, tight cells, compact
      headers, no zebra. Mirrors the HS Codes table in the AGM front. */
  agm?: boolean;
};

function valor<T>(fila: T, key: string): unknown {
  return (fila as Record<string, unknown>)[key];
}

function comparar(a: unknown, b: unknown, dir: "asc" | "desc"): number {
  const m = dir === "asc" ? 1 : -1;
  if (a == null) return 1 * m;
  if (b == null) return -1 * m;
  if (typeof a === "number" && typeof b === "number") return (a - b) * m;
  return String(a).localeCompare(String(b)) * m;
}

function descargarCSV<T>(datos: T[], cols: Columna<T>[], nombre: string) {
  const headers = cols.map(c => `"${c.titulo}"`).join(",");
  const rows = datos.map(r => cols.map(c => `"${String(valor(r, c.key) ?? "").replace(/"/g, '""')}"`).join(","));
  const blob = new Blob(["\ufeff" + [headers, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${nombre || "datos"}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function DataTable<T = Record<string, unknown>>({
  datos, columnas, titulo, filasPorPag = 20, defaultExpanded = true,
  exportarCSV = true, nombreCSV, centerTitle = false, agm = false,
}: DataTableProps<T>) {
  const [pag, setPag] = useState(0);
  const [porPag, setPorPag] = useState(filasPorPag);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return datos;
    return [...datos].sort((a, b) => comparar(valor(a, sortKey), valor(b, sortKey), sortDir));
  }, [datos, sortKey, sortDir]);

  const total = sorted.length;
  const totalPag = Math.max(1, Math.ceil(total / porPag));
  const safePag = Math.min(pag, totalPag - 1);
  const slice = sorted.slice(safePag * porPag, safePag * porPag + porPag);

  const onSort = (key: string) => {
    if (sortKey !== key) { setSortKey(key); setSortDir("desc"); return; }
    if (sortDir === "desc") setSortDir("asc");
    else { setSortKey(null); setSortDir(null); }
  };

  if (!defaultExpanded) return null;

  const fontQ = "var(--font-poppins), Poppins, sans-serif";
  const T = useTradeTheme();
  const border = T.border;
  const borderSubtle = T.border;
  const hoverBg = T.surfaceHover;
  const headerBg = T.mode === "dark" ? "rgba(4, 16, 32, 0.62)" : "#F2F8FF";
  const zebraA = T.mode === "dark" ? "rgba(255,255,255,0.02)" : "#FFFFFF";
  const zebraB = T.mode === "dark" ? "rgba(255,255,255,0.05)" : "#F8FAFC";
  /* AGM-Front skin: compact cells, tight muted headers, no zebra. */
  const cellColor = agm ? (T.mode === "dark" ? T.textPrimary : T.textBody) : T.textBody;
  const thColor = agm ? T.textFaint : T.textMuted;

  return (
    <div
      className={`overflow-hidden border ${agm ? "rounded-[14px]" : "rounded-lg shadow-sm"}`}
      style={{
        borderColor: border,
        fontFamily: fontQ,
        backgroundColor: T.surface,
        ...(agm && T.mode === "dark"
          ? { backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }
          : {}),
      }}
    >
      <div
        className="flex items-center border-b px-4 py-3"
        style={{ borderColor: border, backgroundColor: agm ? "transparent" : headerBg }}
      >
        <h3
          className={centerTitle ? "flex-1 text-center text-sm font-medium" : "text-sm font-medium"}
          style={{ color: T.textPrimary, letterSpacing: "0.05em" }}
        >
          {titulo ?? "Tabla de datos"}{" "}
          <span style={{ color: T.textMuted }}>· {total.toLocaleString("es-MX")} filas</span>
        </h3>
        {exportarCSV && (
          <button
            onClick={() => descargarCSV(sorted, columnas, nombreCSV ?? "datos")}
            className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors hover:opacity-80"
            style={{ borderColor: T.accent, color: T.accentText, backgroundColor: "transparent" }}
          >
            <Download size={12} /> CSV
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className={`w-full text-left ${agm ? "text-[11px]" : "text-sm"}`} style={{ fontFamily: fontQ }}>
          <thead>
            <tr
              className="text-[10px] uppercase"
              style={{ letterSpacing: agm ? "0.1em" : "0.18em", color: thColor, backgroundColor: agm ? "transparent" : headerBg, borderBottom: `1px solid ${border}` }}
            >
              {columnas.map(c => {
                const sortable = c.sortable !== false;
                const active = sortKey === c.key;
                return (
                  <th
                    key={c.key}
                    style={{ width: c.width, padding: agm ? "6px 8px" : "10px 12px", textAlign: c.align ?? "left", cursor: sortable ? "pointer" : "default", fontWeight: agm ? 600 : 700 }}
                    onClick={() => sortable && onSort(c.key)}
                    className="select-none"
                  >
                    <span className="inline-flex items-center gap-1">
                      {c.titulo}
                      {sortable && (
                        active && sortDir === "desc" ? <ChevronDown size={12} style={{ color: T.accentNavy }} />
                        : active && sortDir === "asc" ? <ChevronUp size={12} style={{ color: T.accentNavy }} />
                        : <ChevronsUpDown size={11} style={{ color: T.textFaint }} />
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && (
              <tr>
                <td colSpan={columnas.length} className="px-3 py-10 text-center" style={{ color: T.textFaint }}>
                  Sin datos para los filtros seleccionados
                </td>
              </tr>
            )}
            {slice.map((row, i) => (
              <tr
                key={i}
                style={{
                  backgroundColor: agm ? "transparent" : i % 2 === 0 ? zebraA : zebraB,
                  borderBottom: `1px solid ${borderSubtle}`,
                  transition: "background-color 0.1s",
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = agm ? "transparent" : i % 2 === 0 ? zebraA : zebraB)}
              >
                {columnas.map(c => (
                  <td
                    key={c.key}
                    style={{ padding: agm ? "6px 8px" : "8px 12px", textAlign: c.align ?? "left", color: cellColor, fontVariantNumeric: "tabular-nums" }}
                  >
                    {c.formato ? c.formato(valor(row, c.key), row) : (valor(row, c.key) as React.ReactNode) ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > porPag && (
        <div
          className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5 text-xs"
          style={{ borderColor: border, backgroundColor: headerBg, color: T.textMuted }}
        >
          <div className="flex items-center gap-2">
            <span>Filas por página:</span>
            <select
              value={porPag}
              onChange={e => { setPorPag(Number(e.target.value)); setPag(0); }}
              className="rounded-md border px-1.5 py-0.5"
              style={{ borderColor: T.borderStrong, color: T.textBody, backgroundColor: T.surface }}
            >
              {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className="ml-3">
              {safePag * porPag + 1}–{Math.min((safePag + 1) * porPag, total)} de {total.toLocaleString("es-MX")}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={safePag === 0}
              onClick={() => setPag(p => Math.max(0, p - 1))}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-semibold transition-colors disabled:opacity-30"
              style={{ borderColor: border, color: T.textPrimary, backgroundColor: "transparent" }}
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2">{safePag + 1} / {totalPag}</span>
            <button
              disabled={safePag >= totalPag - 1}
              onClick={() => setPag(p => Math.min(totalPag - 1, p + 1))}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-semibold transition-colors disabled:opacity-30"
              style={{ borderColor: border, color: T.textPrimary, backgroundColor: "transparent" }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
