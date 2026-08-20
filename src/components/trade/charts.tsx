"use client";

import { useState, useEffect, useRef, useMemo, type ReactNode } from "react";
import {
  LineChart as ReLineChart, Line,
  BarChart as ReBarChart, Bar,
  AreaChart as ReAreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, LabelList,
} from "recharts";
import { useTradeTheme, lightTheme, type TradeTheme } from "./TradeThemeContext";

const FONT = "var(--font-poppins), Poppins, sans-serif";
const lightFallback: TradeTheme = lightTheme;

function niceDomain(values: number[], tickCount = 5, paddingPct = 0.05, bottomExtraPct = 0): [number, number] {
  const finite = values.filter(v => Number.isFinite(v));
  if (finite.length === 0) return [0, 1];
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  if (min === max) {
    const pad = Math.abs(min) * 0.05 || 1;
    return [min - pad, max + pad];
  }
  const range = max - min;
  const padMin = min - range * paddingPct - range * bottomExtraPct;
  const padMax = max + range * paddingPct;
  const roughStep = (padMax - padMin) / tickCount;
  const exponent = Math.floor(Math.log10(Math.abs(roughStep) || 1));
  const fraction = roughStep / Math.pow(10, exponent);
  let niceFraction: number;
  if (fraction < 1.5)      niceFraction = 1;
  else if (fraction < 3)   niceFraction = 2;
  else if (fraction < 7)   niceFraction = 5;
  else                     niceFraction = 10;
  const step = niceFraction * Math.pow(10, exponent);
  const niceMin = Math.floor(padMin / step) * step;
  const niceMax = Math.ceil(padMax / step) * step;
  return [niceMin, niceMax];
}

function niceTicks(max: number, count = 4): number[] {
  if (!(max > 0)) return [0];
  const rough = max / count;
  const exponent = Math.floor(Math.log10(rough || 1));
  const fraction = rough / Math.pow(10, exponent);
  let nice: number;
  if (fraction < 1.5)      nice = 1;
  else if (fraction < 3)   nice = 2;
  else if (fraction < 7)   nice = 5;
  else                     nice = 10;
  const step = nice * Math.pow(10, exponent);
  const out: number[] = [];
  for (let v = 0; v <= max * 1.0001; v += step) out.push(v);
  return out;
}

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setSize({ width: r.width, height: r.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, size };
}

export type LineSerie = { key: string; nombre: string; color: string; dash?: string };

function fmtUnit(v: number, unitShort: string): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M ${unitShort}`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(1)}k ${unitShort}`;
  return `${v.toFixed(0)} ${unitShort}`;
}

function fmtUsd(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000)     return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)         return `$${(v / 1_000).toFixed(1)}k`;
  return `$${v.toFixed(0)}`;
}

function fmtPrecio(v: number, per: string): string {
  return `$${v.toFixed(2)}/${per}`;
}

function fmtMil(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(1)} mil`;
  return v.toFixed(0);
}

function readableInk(hex: string): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  if (![r, g, b].every(Number.isFinite)) return "#ffffff";
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 150 ? "#06254B" : "#ffffff";
}

export function makeFormatters(unit: { short: string; per: string } = { short: "mt", per: "mt" }) {
  return {
    unit: (v: number) => fmtUnit(v, unit.short),
    usd: fmtUsd,
    precio: (v: number) => fmtPrecio(v, unit.per),
    mil: fmtMil,
  };
}

export type UnitFormatters = ReturnType<typeof makeFormatters>;

type TooltipEntry = { dataKey?: unknown; name?: unknown; value?: unknown; color?: string };
type ChartTooltipProps = {
  active?: boolean;
  payload?: readonly TooltipEntry[];
  label?: string | number;
  yFormat?: (v: number) => string;
  theme?: TradeTheme;
};

function ChartTooltip({ active, payload, label, yFormat, theme }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const fmt: (v: number) => string = yFormat ?? ((v: number) => String(v));
  const T = theme ?? lightFallback;
  return (
    <div
      className="rounded-xs border p-2.5"
      style={{
        backgroundColor: T.tooltipBg,
        borderColor: T.tooltipBorder,
        boxShadow: T.tooltipShadow,
        minWidth: 160,
        position: "relative",
        zIndex: 50,
      }}
    >
      <p
        className="mb-1.5 text-[10px] font-semibold uppercase"
        style={{ color: T.textMuted, letterSpacing: "0.1em", fontFamily: FONT }}
      >
        {label}
      </p>
      {payload.map((entry, i) => (
        <div
          key={String(entry.dataKey ?? i)}
          className="mb-0.5 flex items-center gap-2 text-xs"
          style={{ fontFamily: FONT }}
        >
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span style={{ color: T.textMuted }}>{String(entry.name ?? "")}:</span>
          <span className="font-semibold" style={{ color: T.textPrimary }}>{fmt(Number(entry.value))}</span>
        </div>
      ))}
    </div>
  );
}

export function LineChart<T extends object = Record<string, unknown>>({
  datos, xKey, series, yFormat, yLabel, altura = 320, mostrarEtiquetas = false,
  etiquetasFinales = false,
}: {
  datos: readonly T[];
  xKey: string;
  series: LineSerie[];
  yFormat?: (v: number) => string;
  yLabel?: string;
  altura?: number;
  mostrarEtiquetas?: boolean;
  etiquetasFinales?: boolean;
}) {
  const T = useTradeTheme();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [ends, setEnds] = useState<Array<{ key: string; x: number; y: number }>>([]);

  useEffect(() => {
    if (!etiquetasFinales) {
      setEnds([]);
      return;
    }
    const measure = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const curves = wrap.querySelectorAll(".recharts-line-curve");
      if (curves.length !== series.length) return;
      const measured: Array<{ key: string; x: number; y: number }> = [];
      for (let i = 0; i < curves.length; i++) {
        const p = curves[i] as SVGPathElement;
        const len = p.getTotalLength();
        if (!Number.isFinite(len) || len <= 0) continue;
        const pt = p.getPointAtLength(len);
        measured.push({ key: series[i].key, x: pt.x, y: pt.y });
      }
      setEnds(prev => {
        const same = prev.length === measured.length && prev.every((e, i) =>
          Math.abs(e.x - measured[i].x) < 0.5 && Math.abs(e.y - measured[i].y) < 0.5 && e.key === measured[i].key);
        return same ? prev : measured;
      });
    };
    measure();
    const t = setTimeout(measure, 100);
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => { ro.disconnect(); clearTimeout(t); };
  }, [datos, series, etiquetasFinales, altura]);

  const tickStyle = { fontSize: 11, fill: T.axisText, fontFamily: FONT };

  const allValues: number[] = [];
  for (const d of datos as Record<string, unknown>[]) {
    for (const s of series) {
      const v = Number(d[s.key]);
      if (Number.isFinite(v) && v > 0) allValues.push(v);
    }
  }
  const [domainMin, domainMax] = niceDomain(allValues, 5, 0.05, etiquetasFinales ? 0.16 : 0);

  const rightPad = etiquetasFinales ? 120 : 24;
  const bottomPad = 0;

  const pills = useMemo(() => {
    if (!etiquetasFinales || ends.length === 0) return [] as Array<{
      key: string; nombre: string; color: string;
      x: number; y: number; top: number; h: number; w: number; leader: boolean;
    }>;
    const H = 18;
    const GAP = 3;
    const items = ends
      .map(e => {
        const s = series.find(se => se.key === e.key);
        if (!s) return null;
        return { key: e.key, nombre: s.nombre, color: s.color, x: e.x, y: e.y };
      })
      .filter((x): x is { key: string; nombre: string; color: string; x: number; y: number } => x !== null);
    const sorted = [...items].sort((a, b) => a.y - b.y);
    const N = sorted.length;

    type Pill = { key: string; nombre: string; color: string; x: number; y: number; top: number; h: number; w: number; leader: boolean };
    const make = (it: typeof sorted[number]): Pill => ({
      ...it, top: it.y - H / 2, h: H, w: Math.max(44, it.nombre.length * 6.6 + 16), leader: false,
    });

    const TOP_LIMIT = 4;
    const BOTTOM_LIMIT = altura - H - GAP;

    function layout(gap: number): Pill[] {
      const out = sorted.map(make);
      if (out[0].top < TOP_LIMIT) out[0].top = TOP_LIMIT;
      for (let i = 1; i < N; i++) {
        const desired = sorted[i].y - H / 2;
        const minRequired = out[i - 1].top + H + gap;
        out[i].top = Math.max(desired, minRequired);
      }
      return out;
    }

    function fits(arr: Pill[]): boolean {
      return arr.length === 0 || arr[arr.length - 1].top <= BOTTOM_LIMIT;
    }

    let resolved: Pill[];
    const natural = layout(GAP);
    if (fits(natural)) {
      resolved = natural;
    } else {
      let lo = 0;
      let hi = GAP;
      for (let iter = 0; iter < 40; iter++) {
        const mid = (lo + hi) / 2;
        const trial = layout(mid);
        if (fits(trial)) lo = mid;
        else hi = mid;
        if (hi - lo < 0.05) break;
      }
      resolved = layout(lo);
      if (!fits(resolved) && resolved.length > 0) {
        resolved[resolved.length - 1].top = BOTTOM_LIMIT;
      }
    }

    for (const p of resolved) {
      p.leader = Math.abs(p.top - (p.y - H / 2)) > 0.5;
    }
    return resolved;
  }, [etiquetasFinales, ends, series, altura]);

  if (!datos.length) return <EmptyChart altura={altura} />;

  return (
    <div ref={wrapRef} className="relative" style={{ width: "100%", height: altura }}>
      <ResponsiveContainer width="100%" height={altura} minWidth={1} minHeight={1}>
        <ReLineChart data={datos} margin={{ top: 10, right: rightPad, left: 8, bottom: bottomPad }}>
          <CartesianGrid strokeDasharray="3 3" stroke={T.axisLine} vertical={false} />
          <XAxis dataKey={xKey} tick={tickStyle} axisLine={{ stroke: T.border }} tickLine={false} />
          <YAxis
            domain={[domainMin, domainMax]}
            allowDataOverflow={false}
            ticks={etiquetasFinales ? niceTicks(domainMax, 4) : undefined}
            tick={tickStyle}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => yFormat ? yFormat(Number(v)) : String(v)}
            label={yLabel ? {
              value: yLabel, angle: -90, position: "insideLeft",
              style: { fontSize: 11, fill: T.axisText, fontFamily: FONT },
            } : undefined}
          />
          <Tooltip
            content={(p: ChartTooltipProps) => <ChartTooltip {...p} yFormat={yFormat} theme={T} />}
            cursor={{ stroke: T.borderStrong, strokeWidth: 1 }}
            wrapperStyle={{ zIndex: 50, pointerEvents: "none" } as React.CSSProperties}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 11, paddingTop: 8, fontFamily: FONT }}
            formatter={(value) => {
              return <span style={{ color: T.textPrimary, fontWeight: 600 }}>{value}</span>;
            }}
          />
          {series.map(s => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.nombre}
              stroke={s.color}
              strokeWidth={2.25}
              strokeDasharray={s.dash}
              dot={{ r: 3, fill: s.color, stroke: T.textPrimary, strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: s.color, stroke: T.textPrimary, strokeWidth: 2 }}
              connectNulls
              isAnimationActive={false}
              label={mostrarEtiquetas && yFormat ? {
                position: "top",
                fontSize: 10,
                fontWeight: 600,
                fill: s.color,
                formatter: (v: unknown) => yFormat(Number(v)),
              } : undefined}
            />
          ))}
        </ReLineChart>
      </ResponsiveContainer>
      {etiquetasFinales && pills.length > 0 && (
        <div className="pointer-events-none absolute inset-0" style={{ fontFamily: FONT, zIndex: 1 }}>
          <svg width="100%" height={altura} style={{ position: "absolute", inset: 0 }}>
            {pills.filter(p => p.leader).map(p => {
              const x0 = p.x + 3;
              const y0 = p.y;
              const x1 = p.x + 6;
              const y1 = p.top + p.h / 2;
              const dx = x1 - x0;
              const dy = y1 - y0;
              const len = Math.hypot(dx, dy) || 1;
              const ux = dx / len;
              const uy = dy / len;
              const size = 5;
              const bx = x1 - ux * size;
              const by = y1 - uy * size;
              const px = -uy;
              const py = ux;
              return (
                <g key={p.key}>
                  <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={p.color} strokeWidth={1.2} opacity={0.85} />
                  <polygon
                    points={`${x1},${y1} ${bx + px * size * 0.45},${by + py * size * 0.45} ${bx - px * size * 0.45},${by - py * size * 0.45}`}
                    fill={p.color}
                    opacity={0.9}
                  />
                </g>
              );
            })}
          </svg>
          {pills.map(p => (
            <div
              key={p.key}
              className="absolute flex items-center justify-center whitespace-nowrap font-bold"
              style={{
                left: p.x + 6,
                top: p.top,
                height: p.h,
                width: p.w,
                borderRadius: p.h / 2,
                backgroundColor: p.color,
                color: readableInk(p.color),
                fontSize: 10,
                padding: "0 8px",
                boxSizing: "border-box",
              }}
            >
              {p.nombre}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export type BarSerie = { key: string; nombre: string; color: string; opacidad?: number };

export function BarChart<T extends object = Record<string, unknown>>({
  datos, xKey, series, orientacion = "vertical", altura = 320,
  yFormat, yLabel, xLabel, linea0 = false, mostrarEtiquetas = false,
  stack = false, yWidth,
}: {
  datos: readonly T[];
  xKey: string;
  series: BarSerie[];
  orientacion?: "vertical" | "horizontal";
  altura?: number;
  yFormat?: (v: number) => string;
  yLabel?: string;
  xLabel?: string;
  linea0?: boolean;
  mostrarEtiquetas?: boolean;
  stack?: boolean;
  yWidth?: number;
}) {
  const T = useTradeTheme();
  if (!datos.length) return <EmptyChart altura={altura} />;
  const isHorizontal = orientacion === "horizontal";

  const tickStyle = { fontSize: 11, fill: T.axisText, fontFamily: FONT };
  const labelStyle = { fill: T.axisText, fontSize: 11, fontFamily: FONT };

  return (
    <ResponsiveContainer width="100%" height={altura} minWidth={1} minHeight={1}>
      <ReBarChart
        data={datos}
        layout={isHorizontal ? "vertical" : "horizontal"}
        margin={{ top: 10, right: mostrarEtiquetas ? 50 : 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={T.axisLine} vertical={!isHorizontal} horizontal={isHorizontal} />
        {isHorizontal ? (
          <>
            <XAxis
              type="number"
              tick={tickStyle}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => yFormat ? yFormat(Number(v)) : String(v)}
              label={xLabel ? { value: xLabel, position: "insideBottom", style: labelStyle } : undefined}
            />
            <YAxis
              type="category"
              dataKey={xKey}
              tick={{ fontSize: 11, fill: T.textPrimary, fontWeight: 500, fontFamily: FONT }}
              axisLine={false}
              tickLine={false}
              width={isHorizontal ? (yWidth ?? 130) : undefined}
              tickFormatter={(v) => {
                if (!isHorizontal) return v;
                const max = yWidth ? Math.max(8, Math.floor((yWidth - 16) / 6.5)) : 22;
                const s = String(v);
                return s.length > max ? `${s.slice(0, max - 1)}…` : s;
              }}
            />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={tickStyle} axisLine={{ stroke: T.border }} tickLine={false} />
            <YAxis
              tick={tickStyle}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => yFormat ? yFormat(Number(v)) : String(v)}
              label={yLabel ? { value: yLabel, angle: -90, position: "insideLeft", style: labelStyle } : undefined}
            />
          </>
        )}
        <Tooltip
          content={(p: ChartTooltipProps) => <ChartTooltip {...p} yFormat={yFormat} theme={T} />}
          cursor={{ fill: T.surfaceHover }}
        />
        <Legend
          content={({ payload }) => (
            <div style={{ display: "flex", gap: 16, justifyContent: "center", paddingTop: 8, fontSize: 11, flexWrap: "wrap" }}>
              {payload?.map((entry, i) => {
                const serie = series.find(s => s.key === String(entry.dataKey));
                const opacity = serie?.opacidad ?? 1;
                return (
                  <div key={String(entry.dataKey ?? i)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: entry.color, opacity, display: "inline-block" }} />
                    <span style={{ color: T.textPrimary, fontWeight: 500, opacity, fontFamily: FONT }}>{String(entry.value ?? "")}</span>
                  </div>
                );
              })}
            </div>
          )}
        />
        {linea0 && (
          <ReferenceLine
            {...(isHorizontal ? { x: 0 } : { y: 0 })}
            stroke={T.axisText}
            strokeDasharray="4 4"
            strokeWidth={1.2}
          />
        )}
        {series.map(s => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.nombre}
            fill={s.color}
            fillOpacity={s.opacidad ?? 1}
            radius={isHorizontal ? [0, 3, 3, 0] : [3, 3, 0, 0]}
            maxBarSize={isHorizontal ? 22 : 36}
            stackId={stack ? "1" : undefined}
          >
            {mostrarEtiquetas && yFormat && (
              <LabelList
                dataKey={s.key}
                position={isHorizontal ? "right" : "top"}
                style={{ fontSize: 10, fontWeight: 700, fill: s.color }}
                formatter={(v: unknown) => yFormat(Number(v))}
              />
            )}
          </Bar>
        ))}
      </ReBarChart>
    </ResponsiveContainer>
  );
}

type RibbonRanked = { serie: BarSerie; value: number };
type RibbonBand = { top: number; bottom: number };

function RibbonInner({
  width, height, years, perYear, totals, maxTotal, ticks, series, yFormat, hover, setHover, theme: T,
}: {
  width: number;
  height: number;
  years: string[];
  perYear: RibbonRanked[][];
  totals: number[];
  maxTotal: number;
  ticks: number[];
  series: BarSerie[];
  yFormat?: (v: number) => string;
  hover: { year: string; key: string } | null;
  setHover: (h: { year: string; key: string } | null) => void;
  theme: TradeTheme;
}) {
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) return null;

  const M = { top: 28, right: 20, bottom: 30, left: 58 };
  const plotW = Math.max(10, width - M.left - M.right);
  const plotH = Math.max(10, height - M.top - M.bottom);
  const n = years.length;
  const band = plotW / n;
  const barW = Math.max(6, band * 0.62);
  const xAt = (i: number) => M.left + band * i + band / 2;
  const yAt = (v: number) => M.top + plotH * (1 - v / maxTotal);

  const bands: Array<Record<string, RibbonBand>> = perYear.map((rank, i) => {
    const out: Record<string, RibbonBand> = {};
    let cum = totals[i];
    for (const { serie, value } of rank) {
      const top = yAt(cum);
      cum -= value;
      out[serie.key] = { top, bottom: yAt(cum) };
    }
    return out;
  });

  const rankIndex: Array<Record<string, number>> = perYear.map(rank => {
    const m: Record<string, number> = {};
    rank.forEach((r, i) => { m[r.serie.key] = i; });
    return m;
  });

  const ribbons: ReactNode[] = [];
  for (let i = 0; i < n - 1; i++) {
    const xL = xAt(i) + barW / 2;
    const xR = xAt(i + 1) - barW / 2;
    const keys = Array.from(new Set([...Object.keys(bands[i]), ...Object.keys(bands[i + 1])]));
    keys.sort((a, b) => (rankIndex[i + 1][a] ?? 999) - (rankIndex[i + 1][b] ?? 999));
    for (const key of keys) {
      const serie = series.find(s => s.key === key);
      if (!serie) continue;
      const bL = bands[i][key];
      const bR = bands[i + 1][key];
      let topL: number, botL: number, topR: number, botR: number;
      if (!bL) {
        topR = bR.top; botR = bR.bottom;
        topL = (topR + botR) / 2; botL = topL;
      } else if (!bR) {
        topL = bL.top; botL = bL.bottom;
        topR = (topL + botL) / 2; botR = topR;
      } else {
        topL = bL.top; botL = bL.bottom; topR = bR.top; botR = bR.bottom;
      }
      const dx = (xR - xL) * 0.4;
      const d = `M ${xL} ${topL} C ${xL + dx} ${topL}, ${xR - dx} ${topR}, ${xR} ${topR} L ${xR} ${botR} C ${xR - dx} ${botR}, ${xL + dx} ${botL}, ${xL} ${botL} Z`;
      ribbons.push(<path key={`rib-${i}-${key}`} d={d} fill={serie.color} opacity={0.85} />);
    }
  }

  const segments: ReactNode[] = [];
  perYear.forEach((rank, i) => {
    let cum = totals[i];
    rank.forEach(({ serie, value }, j) => {
      const top = yAt(cum);
      cum -= value;
      const bottom = yAt(cum);
      const h = bottom - top;
      const isHover = hover?.year === years[i] && hover?.key === serie.key;
      segments.push(
        <g
          key={`seg-${i}-${serie.key}`}
          onMouseEnter={() => setHover({ year: years[i], key: serie.key })}
          onMouseLeave={() => setHover(null)}
          style={{ cursor: "pointer" }}
        >
          <rect
            x={xAt(i) - barW / 2}
            y={top}
            width={barW}
            height={Math.max(0, h - (j === rank.length - 1 ? 0 : 2))}
            rx={j === 0 ? 3 : 0}
            fill={serie.color}
            stroke={isHover ? T.textPrimary : "none"}
            strokeWidth={1.2}
          />
          {rank.length > 1 && h > 16 && (
            <text
              x={xAt(i) - barW / 2 - 6}
              y={top + 11}
              textAnchor="end"
              fontSize={10}
              fontWeight={700}
              fill={T.textPrimary}
              fontFamily={FONT}
            >
              {j + 1}
            </text>
          )}
        </g>
      );
    });
    segments.push(
      <text
        key={`total-${i}`}
        x={xAt(i)}
        y={yAt(totals[i]) - 7}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill={T.textPrimary}
        fontFamily={FONT}
      >
        {yFormat ? yFormat(totals[i]) : String(totals[i])}
      </text>
    );
  });

  const hoverBand = hover
    ? bands[years.findIndex(y => y === hover.year)]?.[hover.key]
    : undefined;
  const hoverIdx = hover ? years.findIndex(y => y === hover.year) : -1;
  const hoverRank = hoverIdx >= 0 ? rankIndex[hoverIdx]?.[hover?.key ?? ""] : undefined;
  const hoverEntry = hoverRank !== undefined && hoverIdx >= 0 ? perYear[hoverIdx][hoverRank] : undefined;
  const hoverSerie = hover ? series.find(s => s.key === hover.key) : undefined;
  const hoverValue = hoverEntry?.value ?? 0;
  const hoverShare = hoverIdx >= 0 && totals[hoverIdx] > 0 ? (hoverValue / totals[hoverIdx]) * 100 : 0;

  return (
    <>
      <svg width={width} height={height} role="img" aria-label="Ribbon chart">
        {ticks.map(tick => (
          <g key={`t-${tick}`}>
            <line x1={M.left} x2={M.left + plotW} y1={yAt(tick)} y2={yAt(tick)} stroke={T.axisLine} strokeDasharray="3 3" />
            <text x={M.left - 8} y={yAt(tick) + 3.5} textAnchor="end" fontSize={10} fill={T.axisText} fontFamily={FONT}>
              {yFormat ? yFormat(tick) : String(tick)}
            </text>
          </g>
        ))}
        <line x1={M.left} x2={M.left + plotW} y1={M.top + plotH} y2={M.top + plotH} stroke={T.border} />
        {ribbons}
        {segments}
        {years.map((y, i) => (
          <text
            key={`y-${i}`}
            x={xAt(i)}
            y={M.top + plotH + 19}
            textAnchor="middle"
            fontSize={11}
            fill={T.axisText}
            fontFamily={FONT}
          >
            {y}
          </text>
        ))}
        {hoverBand && (
          <line
            x1={xAt(hoverIdx) - barW / 2}
            x2={xAt(hoverIdx) + barW / 2}
            y1={hoverBand.top}
            y2={hoverBand.top}
            stroke={T.textPrimary}
            strokeWidth={1.5}
          />
        )}
      </svg>
      {hover && hoverBand && hoverSerie && hoverSerie.key !== "Otros" && (() => {
        const tooltipH = 200;
        const tooltipW = 280;
        let ttTop = hoverBand.top - 12;
        if (ttTop + tooltipH > height - 6) ttTop = Math.max(4, hoverBand.top - tooltipH);
        let ttLeft = xAt(hoverIdx) + 12;
        if (ttLeft + tooltipW > width - 6) ttLeft = Math.max(4, xAt(hoverIdx) - tooltipW);
        return (
        <div
          className="pointer-events-none absolute z-20 min-w-[170px] rounded-md border p-2.5"
          style={{
            left: ttLeft,
            top: ttTop,
            backgroundColor: T.tooltipBg,
            borderColor: T.tooltipBorder,
            boxShadow: T.tooltipShadow,
            fontFamily: FONT,
          }}
        >
          <p className="mb-1 text-[10px] font-semibold uppercase" style={{ color: T.textMuted, letterSpacing: "0.1em" }}>
            {hover.year}
          </p>
          <div className="mb-0.5 flex items-center gap-2 text-xs">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: hoverSerie.color }} />
            <span style={{ color: T.textMuted }}>{hoverSerie.nombre}</span>
          </div>
          <div className="text-xs">
            <span className="font-semibold" style={{ color: T.textPrimary }}>
              {yFormat ? yFormat(hoverValue) : String(hoverValue)}
            </span>
            <span style={{ color: T.textMuted }}> · #{hoverRank !== undefined ? hoverRank + 1 : "–"} · {hoverShare.toFixed(0)}%</span>
          </div>
        </div>
        );
      })()}
    </>
  );
}

export function RibbonChart<T extends object = Record<string, unknown>>({
  datos, xKey, series, altura = 320, yFormat,
}: {
  datos: readonly T[];
  xKey: string;
  series: BarSerie[];
  altura?: number;
  yFormat?: (v: number) => string;
}) {
  const T = useTradeTheme();
  const [hover, setHover] = useState<{ year: string; key: string } | null>(null);
  const { ref, size } = useElementSize<HTMLDivElement>();

  if (!datos.length) return <EmptyChart altura={altura} />;
  const rows = datos as Record<string, unknown>[];
  const years = rows.map(r => String(r[xKey]));

  const perYear: RibbonRanked[][] = rows.map(r =>
    series
      .map(s => ({ serie: s, value: Math.max(0, Number(r[s.key]) || 0) }))
      .filter(x => x.value > 0)
      .sort((a, b) => b.value - a.value)
  );
  const totals = perYear.map(rank => rank.reduce((s, x) => s + x.value, 0));
  const maxTotal = Math.max(...totals, 1);
  const ticks = niceTicks(maxTotal, 4);

  return (
    <div ref={ref} className="relative" style={{ width: "100%", height: altura }}>
      <RibbonInner
        width={size.width}
        height={size.height}
        years={years}
        perYear={perYear}
        totals={totals}
        maxTotal={maxTotal}
        ticks={ticks}
        series={series}
        yFormat={yFormat}
        hover={hover}
        setHover={setHover}
        theme={T}
      />
    </div>
  );
}

export type AreaSerie = { key: string; nombre: string; color: string };

export function AreaChart<T extends object = Record<string, unknown>>({
  datos, xKey, series, altura = 320, yFormat, stack = false, yLabel,
  totalLabels = false,
  ribbon = false,
  hideLegend = false,
  curva = "monotone",
}: {
  datos: readonly T[];
  xKey: string;
  series: AreaSerie[];
  altura?: number;
  yFormat?: (v: number) => string;
  stack?: boolean;
  yLabel?: string;
  totalLabels?: boolean;
  ribbon?: boolean;
  hideLegend?: boolean;
  curva?: "monotone" | "basis" | "linear" | "natural";
}) {
  const T = useTradeTheme();
  if (!datos.length) return <EmptyChart altura={altura} />;
  const tickStyle = { fontSize: 11, fill: T.axisText, fontFamily: FONT };
  const labelStyle = { fill: T.axisText, fontSize: 11, fontFamily: FONT };

  const allValues: number[] = [];
  const totalsByX: Record<string, number> = {};
  for (const d of datos as Record<string, unknown>[]) {
    let total = 0;
    for (const s of series) {
      const v = Number(d[s.key]);
      if (Number.isFinite(v)) {
        if (v > 0) allValues.push(v);
        if (stack) total += v;
      }
    }
    if (stack) totalsByX[String(d[xKey])] = total;
  }
  const [domainMin, domainMax] = stack
    ? niceDomain(Object.values(totalsByX))
    : niceDomain(allValues);

  const lastSerie = series[series.length - 1];

  return (
    <ResponsiveContainer width="100%" height={altura} minWidth={1} minHeight={1}>
      <ReAreaChart data={datos} margin={{ top: 28, right: 16, left: 0, bottom: 0 }}>
        {!ribbon && (
          <defs>
            {series.map(s => (
              <linearGradient key={s.key} id={`g-${s.key.replace(/[^a-z0-9]/gi, "_")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={s.color} stopOpacity={stack ? 0.92 : 0.55} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.05} />
              </linearGradient>
            ))}
          </defs>
        )}
        <CartesianGrid strokeDasharray="3 3" stroke={T.axisLine} vertical={false} />
        <XAxis dataKey={xKey} tick={tickStyle} axisLine={{ stroke: T.border }} tickLine={false} />
        <YAxis
          domain={[domainMin, domainMax]}
          allowDataOverflow={false}
          tick={tickStyle}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => yFormat ? yFormat(Number(v)) : String(v)}
          label={yLabel ? { value: yLabel, angle: -90, position: "insideLeft", style: labelStyle } : undefined}
        />
        <Tooltip content={(p: ChartTooltipProps) => <ChartTooltip {...p} yFormat={yFormat} theme={T} />} />
        {!hideLegend && (
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 11, paddingTop: 8, fontFamily: FONT }}
            formatter={(value) => {
              const serie = series.find(s => s.nombre === value || s.key === value);
              const color = serie?.color ?? T.textPrimary;
              return <span style={{ color, fontWeight: 600 }}>{value}</span>;
            }}
          />
        )}
        {series.map(s => (
          <Area
            key={s.key}
            type={curva}
            dataKey={s.key}
            name={s.nombre}
            stroke={ribbon ? "none" : s.color}
            strokeWidth={ribbon ? 0 : 2}
            fill={ribbon ? s.color : `url(#g-${s.key.replace(/[^a-z0-9]/gi, "_")})`}
            fillOpacity={1}
            stackId={stack ? "1" : undefined}
            isAnimationActive={false}
          />
        ))}
        {totalLabels && stack && lastSerie && yFormat && (
          <Area
            type="monotone"
            dataKey={lastSerie.key}
            stroke="transparent"
            fill="transparent"
            stackId="1"
            legendType="none"
            isAnimationActive={false}
            label={(props: { x?: string | number; y?: string | number; index?: number; value?: unknown }) => {
              const { x, index } = props;
              const entry = (datos as Record<string, unknown>[])[index ?? -1];
              if (!entry) return null;
              const total = totalsByX[String(entry[xKey])] ?? 0;
              if (!total) return null;
              return (
                <text
                  x={Number(x)}
                  y={6}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={700}
                  fill={T.textPrimary}
                  fontFamily={FONT}
                >
                  {yFormat(total)}
                </text>
              );
            }}
          />
        )}
      </ReAreaChart>
    </ResponsiveContainer>
  );
}

function EmptyChart({ altura }: { altura: number }) {
  const T = useTradeTheme();
  return (
    <div
      className="flex items-center justify-center rounded-xs border text-sm"
      style={{
        height: altura,
        borderColor: T.border,
        color: T.textMuted,
        backgroundColor: T.surfaceAlt,
        fontFamily: FONT,
      }}
    >
      Sin datos para los filtros seleccionados
    </div>
  );
}
