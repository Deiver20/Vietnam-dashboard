"use client";

import React, { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import type { CountryMonthlyBreakdown } from "@/app/interfaces/trade/interface";
import { MESES } from "@/app/lib/trade/constants";
import { useTradeTheme } from "./TradeThemeContext";

const fontQ = "var(--font-poppins), Poppins, sans-serif";

function monthLabel(month: number): string {
  return MESES[month - 1] ?? String(month);
}

function fmtInt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function fmtKg(volumenKg: number): string {
  return fmtInt(volumenKg);
}

function fmtValorMil(valor: number): string {
  const mil = valor / 1_000_000;
  return `$${fmtInt(mil)} mil`;
}

function fmtPriceKg(volumenKg: number, valor: number, precioUsd?: number): string {
  if (typeof precioUsd === "number") {
    if (precioUsd > 0) return `$${precioUsd.toFixed(2)}`;
    return "—";
  }
  if (!volumenKg) return "—";
  const price = valor / volumenKg;
  return `$${price.toFixed(2)}`;
}

function heatmapBg(value: number, min: number, max: number, dark: boolean): string {
  if (!Number.isFinite(value) || value <= 0 || max <= min) return "transparent";
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const alpha = 0.06 + t * 0.6;
  const c = dark ? "96, 165, 250" : "3, 72, 141";
  return `rgba(${c}, ${alpha.toFixed(3)})`;
}

const headerStyle = (T: ReturnType<typeof useTradeTheme>): React.CSSProperties => ({
  fontFamily: fontQ,
  letterSpacing: "0.04em",
  backgroundColor: T.mode === "dark" ? "#0a2748" : "#06254B",
  color: "#FFFFFF",
  fontWeight: 600,
  textAlign: "center",
  padding: "8px 10px",
  borderRight: "1px solid rgba(255,255,255,0.18)",
  verticalAlign: "middle",
  whiteSpace: "nowrap",
  fontSize: 11,
});

const yearHeaderStyle = (T: ReturnType<typeof useTradeTheme>): React.CSSProperties => ({
  ...headerStyle(T),
  fontSize: 12,
  fontWeight: 700,
  padding: "10px 10px",
  letterSpacing: "0.08em",
});

const monthHeaderStyle = (T: ReturnType<typeof useTradeTheme>): React.CSSProperties => ({
  ...headerStyle(T),
  fontSize: 10,
  fontWeight: 600,
  backgroundColor: T.mode === "dark" ? "#0f3160" : "#03488D",
  padding: "7px 10px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
});

const variableHeaderStyle = (T: ReturnType<typeof useTradeTheme>): React.CSSProperties => ({
  ...headerStyle(T),
  fontSize: 10,
  fontWeight: 500,
  backgroundColor: T.mode === "dark" ? "#17477a" : "#0a5396",
  padding: "6px 10px",
  letterSpacing: "0.04em",
});

const rowLabelStyle = (T: ReturnType<typeof useTradeTheme>): React.CSSProperties => ({
  fontFamily: fontQ,
  fontSize: 12,
  color: "#FFFFFF",
  backgroundColor: T.mode === "dark" ? "#0f3160" : "#03488D",
  fontWeight: 500,
  padding: "6px 10px",
  whiteSpace: "nowrap",
  position: "sticky",
  left: 0,
  zIndex: 1,
  borderRight: T.mode === "dark" ? "2px solid #0a2748" : "2px solid #06254B",
});

const cellStyle = (T: ReturnType<typeof useTradeTheme>, align: "left" | "right" | "center" = "right", alt: boolean, bg?: string): React.CSSProperties => ({
  fontFamily: fontQ,
  fontSize: 12,
  color: T.mode === "dark" ? "#c5c6cc" : "#1C1C1C",
  backgroundColor: bg ?? (alt ? (T.mode === "dark" ? "rgba(255,255,255,0.05)" : "#F2F8FF") : (T.mode === "dark" ? "rgba(255,255,255,0.02)" : "#FFFFFF")),
  fontVariantNumeric: "tabular-nums",
  padding: "6px 10px",
  textAlign: align,
  whiteSpace: "nowrap",
  borderRight: `1px solid ${T.border}`,
});

const productLabelStyle = (T: ReturnType<typeof useTradeTheme>): React.CSSProperties => ({
  ...rowLabelStyle(T),
  backgroundColor: T.mode === "dark" ? "rgba(255,255,255,0.03)" : "#FFFFFF",
  color: T.mode === "dark" ? "#9aa7bd" : "#3a4256",
  fontSize: 11,
  paddingLeft: 24,
  fontWeight: 400,
  borderRight: `1px solid ${T.border}`,
});

const productCellStyle = (T: ReturnType<typeof useTradeTheme>, alt: boolean, bg?: string): React.CSSProperties => ({
  fontFamily: fontQ,
  fontSize: 11,
  color: T.mode === "dark" ? "#9aa7bd" : "#3a4256",
  backgroundColor: bg ?? (alt ? (T.mode === "dark" ? "rgba(255,255,255,0.04)" : "#FAFCFF") : (T.mode === "dark" ? "rgba(255,255,255,0.02)" : "#FFFFFF")),
  fontVariantNumeric: "tabular-nums",
  padding: "5px 10px",
  textAlign: "right",
  whiteSpace: "nowrap",
  borderRight: `1px solid ${T.border}`,
  fontWeight: 400,
});

const totalLabelStyle = (T: ReturnType<typeof useTradeTheme>): React.CSSProperties => ({
  ...rowLabelStyle(T),
  backgroundColor: T.mode === "dark" ? "#0a2748" : "#06254B",
  color: "#FFFFFF",
  fontWeight: 700,
});

const totalCellStyle = (T: ReturnType<typeof useTradeTheme>, align: "left" | "right" | "center" = "right"): React.CSSProperties => ({
  fontFamily: fontQ,
  fontSize: 12,
  color: T.mode === "dark" ? "#ffffff" : "#06254B",
  backgroundColor: T.mode === "dark" ? "rgba(248, 210, 39, 0.18)" : "rgba(248, 210, 39, 0.32)",
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
  padding: "6px 10px",
  textAlign: align,
  whiteSpace: "nowrap",
  borderRight: `1px solid ${T.border}`,
});

export function CountryPivotTable({ data, unit = { short: "mt", per: "mt" } }: { data: CountryMonthlyBreakdown; unit?: { short: string; per: string } }) {
  const { monthKeys, rows, totals, years } = data;
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const T = useTradeTheme();
  const dark = T.mode === "dark";

  // Filtro por fila estilo Power BI (sin control visible): solo se muestran
  // filas con volumen total > 1.
  const visibleRows = useMemo(
    () => rows.filter(r => r.totalVolumenKg > 1),
    [rows]
  );

  const filteredTotals = useMemo(() => {
    const monthly: Record<string, { volumenKg: number; valorUsd: number; precioUsd?: number }> = {};
    let registros = 0;
    let volumenKg = 0;
    let valorUsd = 0;
    for (const r of visibleRows) {
      registros += r.registros;
      volumenKg += r.totalVolumenKg;
      valorUsd += r.totalValorUsd;
      for (const k of Object.keys(r.monthly)) {
        const c = r.monthly[k];
        const acc = (monthly[k] ??= { volumenKg: 0, valorUsd: 0 });
        acc.volumenKg += c.volumenKg;
        acc.valorUsd += c.valorUsd;
      }
    }
    for (const k of Object.keys(monthly)) {
      const acc = monthly[k];
      if (acc.volumenKg > 0) acc.precioUsd = acc.valorUsd / acc.volumenKg;
    }
    return { registros, volumenKg, valorUsd, monthly };
  }, [visibleRows]);

  const minMax = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    const collect = (monthly: Record<string, { volumenKg: number }>) => {
      for (const k of Object.keys(monthly)) {
        const v = monthly[k]?.volumenKg;
        if (Number.isFinite(v) && v > 0) {
          if (v < min) min = v;
          if (v > max) max = v;
        }
      }
    };
    for (const r of visibleRows) collect(r.monthly);
    for (const r of visibleRows) for (const p of r.products) collect(p.monthly);
    if (!Number.isFinite(min)) min = 0;
    if (!Number.isFinite(max)) max = 0;
    return { min, max };
  }, [visibleRows]);

  if (monthKeys.length === 0 || rows.length === 0) {
    return null;
  }

  const yearGroups = years.map(y => ({
    year: y,
    keys: monthKeys.filter(k => k.startsWith(`${y}-`)),
  }));

  const toggleExpand = (country: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(country)) next.delete(country);
      else next.add(country);
      return next;
    });
  };

  const valLabel = "Val USD";
  const priceLabel = `USD/${unit.per}`;

  return (
    <div className="space-y-3">
      <div
        className="overflow-auto"
        style={{ maxHeight: "70vh", border: `1px solid ${T.border}`, borderRadius: 8, backgroundColor: T.surface }}
      >
        <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "max-content", minWidth: "100%" }}>
          <thead>
            <tr>
              <th rowSpan={3} style={{ ...yearHeaderStyle(T), position: "sticky", left: 0, top: 0, zIndex: 4, minWidth: 220, textAlign: "left", backgroundColor: dark ? "#0a2748" : "#06254B" }}>
                País · Producto
              </th>
              {yearGroups.map((yg, i) => (
                <th
                  key={yg.year}
                  colSpan={yg.keys.length * 3}
                  style={{
                    ...yearHeaderStyle(T),
                    position: "sticky",
                    top: 0,
                    zIndex: 3,
                    textAlign: "left",
                    paddingLeft: 16,
                    borderLeft: i === 0 ? "none" : "2px solid rgba(255,255,255,0.30)",
                  }}
                >
                  <span style={{ marginLeft: 0 }}>{yg.year}</span>
                </th>
              ))}
            </tr>
            <tr>
              {monthKeys.map((k, i) => {
                const month = Number(k.split("-")[1]);
                const isNewYear = i === 0 || monthKeys[i - 1].split("-")[0] !== k.split("-")[0];
                return (
                  <th
                    key={k}
                    colSpan={3}
                    style={{
                      ...monthHeaderStyle(T),
                      position: "sticky",
                      top: 36,
                      zIndex: 2,
                      borderLeft: isNewYear && i !== 0 ? "2px solid rgba(255,255,255,0.30)" : "none",
                    }}
                  >
                    {monthLabel(month)}
                  </th>
                );
              })}
            </tr>
            <tr>
              {monthKeys.map((k, i) => {
                const isNewYear = i === 0 || monthKeys[i - 1].split("-")[0] !== k.split("-")[0];
                return (
                  <React.Fragment key={k}>
                    <th style={{ ...variableHeaderStyle(T), position: "sticky", top: 62, zIndex: 2, minWidth: 92, borderLeft: isNewYear && i !== 0 ? "2px solid rgba(255,255,255,0.30)" : "none" }}>
                      Vol ({unit.short})
                    </th>
                    <th style={{ ...variableHeaderStyle(T), position: "sticky", top: 62, zIndex: 2, minWidth: 92 }}>
                      {valLabel}
                    </th>
                    <th style={{ ...variableHeaderStyle(T), position: "sticky", top: 62, zIndex: 2, minWidth: 82 }}>
                      {priceLabel}
                    </th>
                  </React.Fragment>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((r, rowIdx) => {
              const isOpen = expanded.has(r.country);
              const hasProducts = r.products.length > 0;
              return (
                <React.Fragment key={r.country}>
                  <tr>
                    <td
                      style={{ ...rowLabelStyle(T), position: "sticky", left: 0, zIndex: 1, cursor: hasProducts ? "pointer" : "default" }}
                      onClick={() => hasProducts && toggleExpand(r.country)}
                    >
                      {hasProducts ? (
                        <ChevronRight
                          size={12}
                          style={{
                            display: "inline-block",
                            marginRight: 6,
                            color: "#F8D227",
                            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                            transition: "transform 0.15s",
                            verticalAlign: "middle",
                          }}
                        />
                      ) : (
                        <span style={{ display: "inline-block", width: 18 }} />
                      )}
                      {r.country}
                    </td>
                    {monthKeys.map((k, i) => {
                      const cell = r.monthly[k];
                      const isNewYear = i === 0 || monthKeys[i - 1].split("-")[0] !== k.split("-")[0];
                      const volBg = cell ? heatmapBg(cell.volumenKg, minMax.min, minMax.max, dark) : undefined;
                      return (
                        <React.Fragment key={k}>
                          <td style={{ ...cellStyle(T, "right", rowIdx % 2 === 1, volBg), borderLeft: isNewYear && i !== 0 ? "2px solid rgba(6, 37, 75, 0.15)" : "none" }}>
                            {cell ? fmtKg(cell.volumenKg) : "—"}
                          </td>
                          <td style={cellStyle(T, "right", rowIdx % 2 === 1)}>
                            {cell ? fmtValorMil(cell.valorUsd) : "—"}
                          </td>
                          <td style={cellStyle(T, "right", rowIdx % 2 === 1)}>
                            {cell ? fmtPriceKg(cell.volumenKg, cell.valorUsd, cell.precioUsd) : "—"}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                  {isOpen && r.products.map((p, pIdx) => (
                    <tr key={`${r.country}-${p.producto}`}>
                      <td style={{ ...productLabelStyle(T), position: "sticky", left: 0, zIndex: 1 }}>
                        <span style={{ color: T.textFaint, marginRight: 6 }}>└</span>
                        {p.producto}
                        <span style={{ marginLeft: 8, fontSize: 10, color: T.accentNavy, backgroundColor: dark ? "rgba(102, 166, 255, 0.12)" : "rgba(3, 72, 141, 0.08)", padding: "1px 6px", borderRadius: 3, fontWeight: 500 }}>
                          {p.categoria}
                        </span>
                      </td>
                      {monthKeys.map((k, i) => {
                        const cell = p.monthly[k];
                        const isNewYear = i === 0 || monthKeys[i - 1].split("-")[0] !== k.split("-")[0];
                        const volBg = cell ? heatmapBg(cell.volumenKg, minMax.min, minMax.max, dark) : undefined;
                        return (
                          <React.Fragment key={k}>
                            <td style={{ ...productCellStyle(T, pIdx % 2 === 1, volBg), borderLeft: isNewYear && i !== 0 ? "2px solid rgba(6, 37, 75, 0.10)" : "none" }}>
                              {cell ? fmtKg(cell.volumenKg) : "—"}
                            </td>
                            <td style={productCellStyle(T, pIdx % 2 === 1)}>
                              {cell ? fmtValorMil(cell.valorUsd) : "—"}
                            </td>
                            <td style={productCellStyle(T, pIdx % 2 === 1)}>
                              {cell ? fmtPriceKg(cell.volumenKg, cell.valorUsd, cell.precioUsd) : "—"}
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td style={{ ...totalLabelStyle(T), position: "sticky", left: 0, zIndex: 1 }}>Total</td>
              {monthKeys.map((k, i) => {
                const cell = filteredTotals.monthly[k];
                const isNewYear = i === 0 || monthKeys[i - 1].split("-")[0] !== k.split("-")[0];
                const volBg = cell ? heatmapBg(cell.volumenKg, minMax.min, minMax.max, dark) : undefined;
                return (
                  <React.Fragment key={k}>
                    <td style={{ ...totalCellStyle(T, "right"), backgroundColor: volBg !== "transparent" ? volBg : (dark ? "rgba(248, 210, 39, 0.18)" : "rgba(248, 210, 39, 0.32)"), borderLeft: isNewYear && i !== 0 ? "2px solid rgba(6, 37, 75, 0.20)" : "none" }}>
                      {cell ? fmtKg(cell.volumenKg) : "—"}
                    </td>
                    <td style={totalCellStyle(T, "right")}>
                      {cell ? fmtValorMil(cell.valorUsd) : "—"}
                    </td>
                    <td style={totalCellStyle(T, "right")}>
                      {cell ? fmtPriceKg(cell.volumenKg, cell.valorUsd, cell.precioUsd) : "—"}
                    </td>
                  </React.Fragment>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      <div
        className="flex flex-wrap items-center gap-3 px-1 text-[10px] uppercase"
        style={{ fontFamily: fontQ, letterSpacing: "0.12em", color: T.textMuted }}
      >
        <span>Heatmap volumen ({unit.short}):</span>
        <div
          style={{
            display: "inline-flex",
            height: 10,
            width: 140,
            borderRadius: 2,
            background: dark ? "linear-gradient(90deg, rgba(96,165,250,0.08), rgba(96,165,250,0.66))" : "linear-gradient(90deg, rgba(3,72,141,0.06), rgba(3,72,141,0.66))",
            border: `1px solid ${T.border}`,
          }}
        />
        <span>bajo · alto</span>
      </div>
    </div>
  );
}
