"use client";

import Link from "next/link";
import CandlestickChart from "@/components/CandlestickChart";
import { candlesFor, trailingMonthLabels } from "@/lib/functions/priceSeries";
import type { Industry } from "@/interfaces/data/interface";

interface IndustryCardProps {
  industryKey: string;
  ind: Industry;
  index: number;
}

/* Industry card for the /data "Industries" section — same anatomy as the old
   product cards (white surface, color wash, thumb + name header) but at the
   industry level: no country, no data-type badge, no locked/bought status.
   The chart is the industry's WORLD PRICE as a 12-month candlestick; the same
   seed renders the big chart on /data/[industry], so card and page match. */
export default function IndustryCard({ industryKey, ind, index }: IndustryCardProps) {
  const candles = candlesFor(`${industryKey}:world`, ind.basePrice);
  const labels = trailingMonthLabels(candles.length);

  return (
    <Link
      href={`/data/${industryKey}`}
      className="relative group rounded-xl overflow-hidden flex flex-col bg-white border shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_-10px_rgba(0,0,0,0.14)]"
      style={{
        animation: `mktCardIn 0.35s ease forwards`,
        animationDelay: `${index * 0.04}s`,
        // Soft industry wash so each card carries its industry hue.
        background: `linear-gradient(0deg, ${ind.color}12, #ffffff 62%)`,
        borderColor: `${ind.color}38`,
      }}
      role="listitem"
    >
      <div className="relative px-4 pt-4 pb-4 flex flex-col flex-1">
        {/* Industry: bare emoji + name — the same glyph the filters and
            /industries use, no container around it. */}
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-[26px] leading-none shrink-0" aria-hidden="true">
            {ind.emoji}
          </span>
          <span className="text-[18px] font-bold tracking-[-0.01em] leading-tight text-gray-900">
            {ind.label}
          </span>
        </div>

        {/* World price — 12-month candlestick, compact mode sized for the
            3-column grid. */}
        <CandlestickChart
          candles={candles}
          labels={labels}
          title="World price · USD/t · 12M"
          compact
        />

        {/* Action */}
        <div className="flex gap-2 pt-3 mt-auto">
          <span className="flex flex-1 items-center justify-center h-[36px] px-3 bg-white border border-gray-200 text-[#0066ff] text-[11px] font-semibold tracking-[0.05em] text-center rounded-lg transition-all uppercase group-hover:border-[rgba(0,102,255,0.4)] group-hover:bg-[rgba(0,102,255,0.05)]">
            View industry data →
          </span>
        </div>
      </div>
    </Link>
  );
}
