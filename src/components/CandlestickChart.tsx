"use client";

import { useRef, useState } from "react";
import useSize from "@/hooks/useSize";
import type { Candle } from "@/interfaces/data/interface";

interface CandlestickChartProps {
  candles: Candle[];
  /** Month labels, one per candle. */
  labels: string[];
  /** Header label; omit to render the plot alone. */
  title?: string;
  /** Card mode: shorter canvas with the same rendering density. */
  compact?: boolean;
  /** Dark surface variant (the /industries experience cards). */
  dark?: boolean;
  /** Optional viewBox override for odd card sizes (e.g. carousel tiles). */
  vb?: { w: number; h: number };
  /** Width-responsive mode: the viewBox width tracks the measured
   *  container width (1 SVG unit = 1 CSS px), so candles, fonts and the
   *  tooltip render at their designed size at ANY width instead of the
   *  whole chart scaling up with the card. Height stays the designed
   *  pixel height (vb.h still overrides it). */
  fluid?: boolean;
}

/* Polarity colors — the site's green/red pair (colorblind-safe as an up/down
   pair since position also encodes direction: close above/below open). The
   dark surface needs the brighter steps of each hue to keep contrast. */
const LIGHT_UP = "#279b00";
const LIGHT_DOWN = "#d92d20";
const DARK_UP = "#33cc00";
const DARK_DOWN = "#f35959";

/* Monthly OHLC candlestick on a white card surface, hand-rolled SVG in the
   same visual family as the old MiniChart: dashed recessive grid, min/max ink
   labels with a surface halo, month ticks, hover crosshair + tooltip. Used
   compact inside the /data industry cards and large on /data/[industry] —
   same component, same series, so both charts read identically. */
export default function CandlestickChart({ candles, labels, title, compact = false, dark = false, vb, fluid = false }: CandlestickChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { width: measuredW } = useSize(wrapRef);

  /* Large mode is 640×430 — the aspect that fills the fixed-height chart
     card on /data/[industry] edge to edge, no dead space above or below.
     Compact mode (the /data cards, ~400px wide) uses 500×210: the same
     viewBox→pixel density as large mode (~0.8×), so candles, fonts and the
     tooltip render at the SAME visual scale on both pages — only the
     aspect differs.
     Fluid mode pins the viewBox width to the measured px width (density
     1:1) until the first measure lands, when it uses the design width. */
  const designW = vb?.w ?? (compact ? 500 : 640);
  const W = fluid && measuredW > 0 ? Math.round(measuredW) : designW;
  const H = vb?.h ?? (compact ? 210 : 430);

  /* Surface-dependent inks: candle up/down, recessive grid, muted labels and
     the halo color that keeps text readable over the marks. */
  const UP = dark ? DARK_UP : LIGHT_UP;
  const DOWN = dark ? DARK_DOWN : LIGHT_DOWN;
  const GRID = dark ? "rgba(255,255,255,0.10)" : "#e5e7eb";
  const MUTED = dark ? "#94959b" : "#9ca3af";
  const HALO = dark ? "rgba(2,13,28,0.9)" : "#ffffff";
  const TOP = 12;
  const BOTTOM = 16; // room for month ticks
  const plotH = H - TOP - BOTTOM;
  const n = candles.length;

  const min = Math.min(...candles.map((c) => c.l));
  const max = Math.max(...candles.map((c) => c.h));
  const range = max - min || 1;
  const slot = W / n;
  const bodyW = Math.min(slot * 0.55, 24);
  const cx = (i: number) => slot * (i + 0.5);
  const y = (v: number) => TOP + (1 - (v - min) / range) * plotH;

  const first = candles[0];
  const last = candles[n - 1];
  const delta = ((last.c - first.o) / first.o) * 100;
  const up = delta >= 0;

  const gridTs = compact ? [0, 0.5, 1] : [0, 0.25, 0.5, 0.75, 1];
  const tickIdx = candles.map((_, i) => i);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    setHover(Math.max(0, Math.min(n - 1, Math.floor(px / slot))));
  };

  return (
    <div className="relative" ref={wrapRef}>
      {title && (
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className={`text-[9px] font-bold tracking-[0.1em] uppercase ${dark ? "text-[#94959b]" : "text-gray-400"}`}>
            {title}
          </span>
          <span
            className={`text-[10px] font-bold tabular-nums px-1.5 py-[2px] rounded ${
              up
                ? dark
                  ? "text-[#33cc00] bg-[rgba(51,204,0,0.14)]"
                  : "text-[#279b00] bg-[rgba(51,204,0,0.10)]"
                : dark
                  ? "text-[#f35959] bg-[rgba(243,89,89,0.14)]"
                  : "text-[#d92d20] bg-[rgba(217,45,32,0.08)]"
            }`}
          >
            {up ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
          </span>
        </div>
      )}
      <svg
        className="w-full h-auto block cursor-crosshair"
        viewBox={`0 0 ${W} ${H}`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        aria-hidden="true"
      >
        {/* Recessive dashed grid */}
        {gridTs.map((t) => (
          <line
            key={t}
            x1="0"
            x2={W}
            y1={TOP + plotH * t}
            y2={TOP + plotH * t}
            stroke={GRID}
            strokeWidth="1"
            strokeDasharray={t === 1 ? undefined : "3 4"}
          />
        ))}

        {/* Candles: wick + body. The body keeps a minimum 1.5px height so
            doji months (open ≈ close) still show a mark. */}
        {candles.map((c, i) => {
          const gain = c.c >= c.o;
          const color = gain ? UP : DOWN;
          const top = y(Math.max(c.o, c.c));
          const h = Math.max(1.5, Math.abs(y(c.o) - y(c.c)));
          return (
            <g key={i}>
              <line x1={cx(i)} x2={cx(i)} y1={y(c.h)} y2={y(c.l)} stroke={color} strokeWidth="1.5" />
              <rect
                x={cx(i) - bodyW / 2}
                y={top}
                width={bodyW}
                height={h}
                rx="1"
                fill={color}
                stroke={HALO}
                strokeWidth="1"
              />
            </g>
          );
        })}

        {/* Min/max ink labels — after the marks (with a surface halo) so the
            candles can never cover them. */}
        <text x="2" y={TOP - 3} fontSize="10" fill={MUTED} stroke={HALO} strokeWidth="2.5" paintOrder="stroke" fontFamily="var(--font-jetbrains), monospace">
          {Math.round(max)}
        </text>
        <text x="2" y={TOP + plotH - 3} fontSize="10" fill={MUTED} stroke={HALO} strokeWidth="2.5" paintOrder="stroke" fontFamily="var(--font-jetbrains), monospace">
          {Math.round(min)}
        </text>

        {/* Month ticks */}
        {tickIdx.map((i) => (
          <text
            key={i}
            x={cx(i)}
            y={H - 4}
            fontSize="10"
            fill={MUTED}
            textAnchor="middle"
            fontFamily="var(--font-jetbrains), monospace"
          >
            {labels[i]}
          </text>
        ))}

        {/* Hover: highlight ring + detail panel with the full OHLC */}
        {hover !== null && candles[hover] && (
          <g pointerEvents="none">
            <rect
              x={cx(hover) - slot / 2 + 1}
              y={TOP}
              width={slot - 2}
              height={plotH}
              fill={dark ? "rgba(255,255,255,0.05)" : "rgba(17,24,39,0.04)"}
              stroke={MUTED}
              strokeWidth="1"
              strokeDasharray="2 3"
              rx="2"
            />
            {(() => {
              const c = candles[hover];
              const gain = c.c >= c.o;
              const accent = gain ? "#4ade80" : "#f87171";
              const fmt = (v: number) => `$${v.toLocaleString("en-US")}`;
              const rows: [string, number, string][] = [
                ["Open", c.o, "#e5e7eb"],
                ["High", c.h, "#4ade80"],
                ["Low", c.l, "#f87171"],
                ["Close", c.c, "#ffffff"],
              ];

              /* Panel geometry (viewBox units): header + 4 labeled rows.
                 Both modes share the same viewBox→pixel density, so one set
                 of numbers renders identically on /data and /data/[industry]. */
              const bw = 178;
              const pad = 11;
              const headH = 25;
              const rowH = 19;
              const bh = pad * 2 + headH + rowH * 4;
              const fs = 13.5;
              const gap = 11;

              /* SVG clips at its viewBox, so the panel must fit INSIDE the
                 chart. Short viewBoxes (the /industries carousel tiles are
                 280×120 — shorter than the panel itself) shrink the whole
                 panel uniformly; on /data-sized charts k stays 1. */
              const k = Math.min(1, (H - BOTTOM - 4) / bh);
              const kw = bw * k;
              const kh = bh * k;

              /* Beside the candle, flipping sides near the edges; clamped on
                 both axes so no chart size can push it out of the viewBox. */
              let bx = cx(hover) + slot / 2 + kw + gap > W
                ? cx(hover) - slot / 2 - kw - gap
                : cx(hover) + slot / 2 + gap;
              bx = Math.max(2, Math.min(W - kw - 2, bx));
              const by = Math.max(2, Math.min(H - BOTTOM - kh - 2, y(c.h) - kh / 3));

              return (
                <g fontFamily="var(--font-jetbrains), monospace" transform={`translate(${bx} ${by}) scale(${k})`}>
                  <rect x="0" y="0" width={bw} height={bh} rx="9" fill="#111827" opacity="0.95" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
                  {/* Up/down accent stripe */}
                  <rect x="0" y="0" width="3.5" height={bh} rx="1.75" fill={accent} />

                  {/* Header: month + change% */}
                  <text x={pad + 1} y={pad + fs} fontSize={fs} fontWeight="bold" fill="#ffffff">
                    {labels[hover]}
                  </text>
                  <text x={bw - pad} y={pad + fs} fontSize={fs} fontWeight="bold" fill={accent} textAnchor="end">
                    {gain ? "▲" : "▼"} {Math.abs(((c.c - c.o) / c.o) * 100).toFixed(1)}%
                  </text>
                  <line x1={pad} x2={bw - pad} y1={pad + headH - 4} y2={pad + headH - 4} stroke="rgba(255,255,255,0.14)" strokeWidth={compact ? 0.5 : 1} />

                  {/* O / H / L / C rows: label left, value right */}
                  {rows.map(([label, v, color], i) => {
                    const ry = pad + headH + rowH * i + fs;
                    return (
                      <g key={label}>
                        <text x={pad + 1} y={ry} fontSize={fs} fill="#9ca3af">{label}</text>
                        <text x={bw - pad} y={ry} fontSize={fs} fill={color} textAnchor="end">{fmt(v)}</text>
                      </g>
                    );
                  })}
                </g>
              );
            })()}
          </g>
        )}
      </svg>
    </div>
  );
}
