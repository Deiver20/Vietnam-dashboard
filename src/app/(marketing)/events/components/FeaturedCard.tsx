import Link from "next/link";
import Placeholder from "@/components/Placeholder";
import type { EventItem } from "../eventsData";
import { indChips } from "../eventsHelpers";

/* ── Render: featured REAM card ─────────────────────── */
export default function FeaturedCard({ ev }: { ev: EventItem }) {
  return (
    <article
      className="relative overflow-hidden rounded-[var(--radius-lg)] border border-gray-200 flex flex-col lg:flex-row min-h-[230px] bg-white"
      style={{ ["--ev-color" as string]: ev.accent }}
    >
      <div className="relative z-[2] flex flex-col lg:flex-col items-center justify-center shrink-0 min-w-[130px] p-7 gap-[14px] lg:border-r lg:border-b-0 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col items-center px-[14px] py-3 min-w-[70px] rounded-lg relative overflow-hidden bg-white border border-[var(--ev-color)]/30 shadow-[0_0_20px_-6px_rgba(0,0,0,0.1)]">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--ev-color)]/8 to-transparent pointer-events-none" />
          <span className="relative text-[9px] font-extrabold tracking-[0.12em] uppercase leading-none" style={{ color: "var(--ev-color)" }}>{ev.month}</span>
          <span className="relative text-[30px] font-bold text-gray-700 leading-[1.1] tracking-[-0.03em] tabular-nums">{ev.day}</span>
          <span className="relative text-[9px] font-medium text-gray-500 mt-0.5">{ev.year}</span>
        </div>
        <div className="flex flex-col gap-1 mt-2.5">
          <span className="inline-flex items-center gap-[3px] px-[7px] py-[2px] rounded-[3px] text-[8px] font-extrabold tracking-[0.09em] uppercase bg-yellow-50 text-yellow-600 border border-yellow-200">⭐ Flagship</span>
          <span className="inline-flex items-center gap-[3px] px-[7px] py-[2px] rounded-[3px] text-[8px] font-extrabold tracking-[0.09em] uppercase bg-blue-50 text-blue-600 border border-blue-200 mt-1">AGM Event</span>
        </div>
      </div>
      <div className="relative z-[2] flex-1 flex flex-col lg:flex-row items-start gap-9 px-6 lg:px-9 py-7">
        <div className="flex-1 min-w-0">
          <Placeholder className="h-16 w-auto mb-4" text="REAM 2026" originalFile="assets/ream2026_logo.png" />
          <div className="text-[34px] font-bold text-gray-900 tracking-[-0.02em] leading-[1.2]">{ev.name}</div>
          <div className="text-sm text-gray-700 mt-2 line-clamp-2">{ev.description}</div>
          <div className="flex items-center gap-[7px] text-[13px] font-medium text-gray-700 mt-2.5">
            <span className="text-lg leading-none">{ev.flag}</span>
            {ev.location}
          </div>
        </div>
        <div className="flex flex-wrap gap-[5px] self-start">{indChips(ev.industries)}</div>
      </div>
      <div className="relative z-[2] flex flex-col gap-2.5 p-7 lg:border-l lg:border-t-0 border-t border-gray-200 min-w-[170px] justify-center bg-gray-50">
        <Link href={`/events/event/${ev.id}`} scroll={false} className="w-full text-center px-4 py-[7px] rounded-md text-[11px] font-bold tracking-[0.04em] transition-all border border-[var(--ev-color)]/25 text-[var(--ev-color)] bg-[var(--ev-color)]/[0.08] hover:bg-[var(--ev-color)]/[0.14]" >
          View Event →
        </Link>
        <a href={ev.website} target="_blank" rel="noopener" className="w-full text-center px-4 py-[7px] rounded-md text-[11px] font-bold tracking-[0.04em] border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-100 transition-all">
          renderingamerica.com
        </a>
      </div>
    </article>
  );
}
