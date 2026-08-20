"use client";

import type { CardData } from "@/interfaces/data/interface";
import { useState } from "react";
import Link from "next/link";

interface DataCardProps {
  data: CardData;
  ind: { label: string; color: string; emoji: string; img: string; chips: string[] };
  cty: { emoji: string; name: string; region: string; flag?: string };
  typ: { label: string; cls: string; color: string };
  index: number;
  saved: boolean;
  onToggleSave: () => void;
}

/* ── Dashboard page mapping ──────────────────────────────── */
const DASHBOARD_PAGES: Record<string, { label: string; page: string }> = {
  imports: { label: "Imports", page: "imports-overview" },
  exports: { label: "Exports", page: "exports-overview" },
  pricing: { label: "Pricing", page: "pricing-overview" },
  production: { label: "Production", page: "production-overview" },
  trade_volumes: { label: "Trade Vol.", page: "trade-volumes-overview" },
  event: { label: "Events", page: "events-overview" },
  project: { label: "Projects", page: "projects-overview" },
};

/* Industry key mapping for dashboard */
function getDashboardIndustry(cat: string): string {
  if (cat === "fats_oils") return "oils";
  return cat;
}

function buildDashboardHref(data: CardData): string {
  const industry = getDashboardIndustry(data.cat);
  const params = new URLSearchParams();
  params.set("industry", industry);
  params.set("type", data.type);
  params.set("country", data.country);
  params.set("status", data.status);
  if (data.date) params.set("date", data.date);
  if (data.discount) params.set("discount", "1");
  const dash = DASHBOARD_PAGES[data.type];
  if (dash) params.set("page", dash.page);
  return `/dashboard?${params.toString()}`;
}

/* Deterministic per-card series (seeded from the id) so the sparkline is
   stable across SSR/CSR and re-renders — no Math.random at render time. */
function sparkFor(id: string): number[] {
  let s = 0;
  for (const ch of id) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  const out: number[] = [];
  let v = 40 + (s % 30);
  for (let i = 0; i < 12; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    v += (s % 21) - 9; // mild upward drift
    out.push(v);
  }
  return out;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* Trailing 12 month labels ending at the card's MM/YYYY date (falls back to
   Dec when the date doesn't parse). */
function monthLabelsFor(date: string, n: number): string[] {
  const m = /(\d{1,2})\/(\d{4})/.exec(date);
  const end = m ? parseInt(m[1], 10) - 1 : 11;
  return Array.from({ length: n }, (_, i) => MONTHS[(((end - (n - 1) + i) % 12) + 12) % 12]);
}

/* Mini area chart — smooth monotone curve, gradient fill, dashed gridlines,
   min/max ink labels, month ticks, end-point dot + delta chip, and a hover
   crosshair with a value tooltip. One series per card, in the industry hue. */
function MiniChart({ data, color, date, id, title }: { data: number[]; color: string; date: string; id: string; title: string }) {
  const [hover, setHover] = useState<number | null>(null);

  const W = 260;
  const H = 96;
  const TOP = 12;
  const BOTTOM = 16; // room for month ticks
  const plotH = H - TOP - BOTTOM;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const x = (i: number) => (i / (data.length - 1)) * W;
  const y = (v: number) => TOP + (1 - (v - min) / range) * plotH;

  // Catmull-Rom → cubic bezier for a smooth professional curve.
  let path = `M ${x(0).toFixed(1)} ${y(data[0]).toFixed(1)}`;
  for (let i = 0; i < data.length - 1; i++) {
    const p0 = data[Math.max(0, i - 1)];
    const p1 = data[i];
    const p2 = data[i + 1];
    const p3 = data[Math.min(data.length - 1, i + 2)];
    const c1x = x(i) + (x(i + 1) - x(i)) / 3;
    const c1y = y(p1) + (y(p2) - y(p0)) / 6;
    const c2x = x(i + 1) - (x(i + 1) - x(i)) / 3;
    const c2y = y(p2) - (y(p3) - y(p1)) / 6;
    path += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${x(i + 1).toFixed(1)} ${y(p2).toFixed(1)}`;
  }
  const area = `${path} L ${W} ${TOP + plotH} L 0 ${TOP + plotH} Z`;

  const months = monthLabelsFor(date, data.length);
  const ticks = [0, 4, 8, 11];
  const delta = ((data[data.length - 1] - data[0]) / data[0]) * 100;
  const up = delta >= 0;
  const gradId = `dc-grad-${id}`;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    setHover(Math.max(0, Math.min(data.length - 1, Math.round((px / W) * (data.length - 1)))));
  };

  return (
    <div className="relative mt-3">
      {/* Chart header: what the series IS + the 12-month delta. */}
      <div className="flex items-center justify-between gap-2 mb-0.5">
        <span className="text-[9px] font-bold tracking-[0.1em] uppercase text-gray-400">
          {title} · 12-month trend
        </span>
        <span
          className={`text-[10px] font-bold tabular-nums px-1.5 py-[2px] rounded ${
            up ? "text-[#279b00] bg-[rgba(51,204,0,0.10)]" : "text-[#d92d20] bg-[rgba(217,45,32,0.08)]"
          }`}
        >
          {up ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
        </span>
      </div>
      <svg
        className="w-full h-auto block cursor-crosshair"
        viewBox={`0 0 ${W} ${H}`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Recessive dashed grid + min/max ink labels */}
        {[0, 0.5, 1].map((t) => (
          <line
            key={t}
            x1="0"
            x2={W}
            y1={TOP + plotH * t}
            y2={TOP + plotH * t}
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray={t === 1 ? undefined : "3 4"}
          />
        ))}
        {/* Area + line */}
        <path d={area} fill={`url(#${gradId})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* Min/max ink labels — drawn after the paths (with a surface halo)
            so the curve can never cover them. */}
        <text x="2" y={TOP - 3} fontSize="8" fill="#9ca3af" stroke="#ffffff" strokeWidth="2.5" paintOrder="stroke" fontFamily="var(--font-jetbrains), monospace">
          {Math.round(max)}
        </text>
        <text x="2" y={TOP + plotH - 3} fontSize="8" fill="#9ca3af" stroke="#ffffff" strokeWidth="2.5" paintOrder="stroke" fontFamily="var(--font-jetbrains), monospace">
          {Math.round(min)}
        </text>

        {/* End-point dot, ringed so it reads over the fill */}
        <circle cx={x(data.length - 1)} cy={y(data[data.length - 1])} r="3.5" fill={color} stroke="#ffffff" strokeWidth="2" />

        {/* Month ticks */}
        {ticks.map((i) => (
          <text
            key={i}
            x={x(i)}
            y={H - 4}
            fontSize="8"
            fill="#9ca3af"
            textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
            fontFamily="var(--font-jetbrains), monospace"
          >
            {months[i]}
          </text>
        ))}

        {/* Hover crosshair + tooltip */}
        {hover !== null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={TOP} y2={TOP + plotH} stroke="#9ca3af" strokeWidth="1" strokeDasharray="2 3" />
            <circle cx={x(hover)} cy={y(data[hover])} r="3.5" fill={color} stroke="#ffffff" strokeWidth="2" />
            {(() => {
              const bw = 52;
              const bx = Math.max(2, Math.min(W - bw - 2, x(hover) - bw / 2));
              const by = y(data[hover]) - 26 < 2 ? y(data[hover]) + 10 : y(data[hover]) - 26;
              return (
                <g>
                  <rect x={bx} y={by} width={bw} height="18" rx="4" fill="#111827" opacity="0.92" />
                  <text x={bx + bw / 2} y={by + 12} fontSize="8.5" fill="#ffffff" textAnchor="middle" fontFamily="var(--font-jetbrains), monospace">
                    {months[hover]} · {Math.round(data[hover])}
                  </text>
                </g>
              );
            })()}
          </g>
        )}
      </svg>
    </div>
  );
}

/* ── Icons ───────────────────────────────────────────────── */
function LockIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 11h-1V7A5 5 0 0 0 7 7v4H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-6 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm3-7H9V7a3 3 0 0 1 6 0v4z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/* ── Light-mode card, modeled on the /industries country industry cards:
     no image background, industry emoji + name header, price watermark,
     sparkline — while keeping all the /data info (country, type, chips,
     date, status, price, actions). ── */
export default function DataCard({ data, ind, cty, typ, index, saved, onToggleSave }: DataCardProps) {
  const locked = data.status === "locked";
  const priceStr = `USD $${data.price}`;

  return (
    <article
      className="relative group rounded-xl overflow-hidden flex flex-col bg-white border shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_-10px_rgba(0,0,0,0.14)]"
      style={{
        animation: `mktCardIn 0.35s ease forwards`,
        animationDelay: `${index * 0.04}s`,
        // Soft data-type wash so the type reads at a glance across the grid
        // (inverted: white on top, the type color glowing from the bottom).
        background: `linear-gradient(0deg, ${typ.color}12, #ffffff 62%)`,
        borderColor: `${typ.color}38`,
      }}
      role="listitem"
    >
      {/* Price watermark — same trick as the industries KPI tiles. Only on
          LOCKED (for sale) cards: on bought ones the big price is redundant,
          the price row above the button is enough. */}
      {locked && (
        <div
          className="absolute right-1 top-9 text-[52px] font-extrabold tracking-[-0.04em] opacity-[0.06] leading-none pointer-events-none whitespace-nowrap select-none"
          style={{ color: ind.color }}
          aria-hidden="true"
        >
          ${data.price}
        </div>
      )}

      <div className="relative px-4 pt-4 pb-4 flex flex-col flex-1">
        {/* 1. Industry: bare emoji + name (+ save) — the same glyph the
            filters and /industries use, no container around it. */}
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="text-[26px] leading-none shrink-0" aria-hidden="true">
            {ind.emoji}
          </span>
          <span className="text-[18px] font-bold tracking-[-0.01em] leading-tight text-gray-900">
            {ind.label}
          </span>
          <button
            className={`ml-auto shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${
              saved
                ? "bg-[rgba(0,102,255,0.10)] border-[rgba(0,102,255,0.4)] text-[#0066ff]"
                : "bg-white border-gray-200 text-gray-400 hover:border-[rgba(0,102,255,0.4)] hover:text-[#0066ff] hover:bg-[rgba(0,102,255,0.06)]"
            }`}
            aria-label="Save"
            onClick={(e) => {
              e.preventDefault();
              onToggleSave();
            }}
          >
            <BookmarkIcon />
          </button>
        </div>

        {/* 2. Country */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="text-lg leading-none">{cty.emoji}</span>
          <span className="text-[15px] font-semibold tracking-[0.01em] text-gray-600">{cty.name}</span>
        </div>

        {/* 3. Data type badge + status */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-[10px] font-bold tracking-[0.09em] uppercase px-2.5 py-[4px] rounded shrink-0"
            style={{
              background: `${typ.color}12`,
              border: `1px solid ${typ.color}50`,
              color: typ.color,
            }}
          >
            {typ.label}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-[7px] py-[3px] rounded text-[8px] font-bold tracking-[0.08em] uppercase shrink-0 whitespace-nowrap border ${
              locked
                ? "bg-gray-100 text-gray-500 border-gray-200"
                : "bg-[rgba(51,204,0,0.12)] text-[#279b00] border-[rgba(51,204,0,0.35)]"
            }`}
          >
            {locked ? <LockIcon /> : <CheckIcon />}
            {locked ? " LOCKED" : " BOUGHT"}
          </span>
        </div>

        {/* Chart — detailed mini area chart in the data-type color, matching
            the type badge and the card's background wash. */}
        <MiniChart data={sparkFor(data.id)} color={typ.color} date={data.date} id={data.id} title={typ.label} />

        {/* Date + Price */}
        <div className="flex items-baseline justify-between gap-2 pt-2 mt-auto border-t border-gray-100">
          <span className="text-[10px] font-[var(--font-jetbrains)] text-gray-400">{data.date}</span>
          <span className="flex items-center gap-2">
            {data.discount && data.originalPrice && (
              <span className="text-[12px] line-through font-medium text-gray-400">USD ${data.originalPrice}</span>
            )}
            <span className={`text-[15px] font-bold tracking-[-0.02em] tabular-nums ${locked ? "text-[#0066ff]" : "text-[#279b00]"}`}>
              {priceStr}
            </span>
            {data.discount && (
              <span className="text-[9px] font-bold tracking-[0.06em] uppercase px-1.5 py-[2px] rounded bg-[rgba(252,181,20,0.15)] text-[#b57e00] border border-[rgba(252,181,20,0.4)]">
                SALE
              </span>
            )}
          </span>
        </div>

        {/* Action */}
        <div className="flex gap-2 pt-3">
          {/* Quiet outlined action — the chart is the hero, not the button. */}
          {locked ? (
            <Link
              href={buildDashboardHref(data)}
              className="flex flex-1 items-center justify-center h-[36px] px-3 bg-white border border-gray-200 text-[#0066ff] text-[11px] font-semibold tracking-[0.05em] text-center rounded-lg transition-all uppercase hover:border-[rgba(0,102,255,0.4)] hover:bg-[rgba(0,102,255,0.05)]"
            >
              View data
            </Link>
          ) : (
            <Link
              href={buildDashboardHref(data)}
              className="flex flex-1 items-center justify-center h-[36px] px-3 bg-white border border-gray-200 text-[#279b00] text-[11px] font-semibold tracking-[0.05em] text-center rounded-lg transition-all uppercase hover:border-[rgba(51,204,0,0.45)] hover:bg-[rgba(51,204,0,0.06)]"
            >
              Open dashboard →
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
