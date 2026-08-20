"use client";

import Link from "next/link";
import Placeholder from "@/components/Placeholder";
import BookmarkButton from "@/components/BookmarkButton";
import type { EventItem } from "../eventsData";
import { fmtEventDate, indChips, parseEventDate } from "../eventsHelpers";
import { useEventProgress } from "@/hooks/events/useEventProgress";
import { useCountdown } from "@/hooks/events/useCountdown";

/* ── Render: next upcoming event card (full width) ──── */
export default function NextEventCard({ ev }: { ev: EventItem }) {
  const { daysLeft, color } = useEventProgress(ev);
  const nextCd = useCountdown(parseEventDate(ev).toISOString());

  const badge = ev.agmFlagship
    ? <span className="text-[10px] font-extrabold tracking-[0.09em] uppercase px-[8px] py-[3px] rounded-[4px] bg-yellow-50 text-yellow-600 border border-yellow-200 shrink-0">⭐ Flagship</span>
    : ev.agmOrganized
      ? <span className="text-[10px] font-extrabold tracking-[0.09em] uppercase px-[8px] py-[3px] rounded-[4px] bg-blue-50 text-blue-600 border border-blue-200 shrink-0">AGM</span>
      : ev.agmPartner
        ? <span className="text-[10px] font-extrabold tracking-[0.09em] uppercase px-[8px] py-[3px] rounded-[4px] bg-green-50 text-green-600 border border-green-200 shrink-0">Partner</span>
        : null;

  return (
    <article
      className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-gray-200 col-span-full bg-white"
      style={{ ["--ev-color" as string]: ev.accent }}
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gray-100 z-[3] overflow-hidden">
        <div className="h-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(5, (daysLeft / 90) * 100))}%`, backgroundColor: color }} />
      </div>

      <div className="relative z-[2] flex flex-col lg:flex-row min-h-[200px]">
        {/* Event image — full-bleed left strip, no padding (same
            treatment as the /news horizontal cards). Absolutely-filled
            img so its intrinsic size never drives the card height. */}
        <div className="relative shrink-0 w-full lg:w-[320px] lg:self-stretch h-[180px] lg:h-auto overflow-hidden border-b lg:border-b-0 lg:border-r border-gray-200">
          <Placeholder className="absolute inset-0 w-full h-full object-cover" text={ev.name} originalFile={ev.image} />
        </div>

        {/* Center: info */}
        <div className="flex-1 flex flex-col lg:flex-row items-start gap-6 px-6 lg:px-9 py-7">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-[7px] text-[13px] font-medium text-gray-700 mb-2">
              <span className="text-lg leading-none">{ev.flag}</span>
              {ev.location}
              {badge}
            </div>
            <h3 className="text-[28px] lg:text-[32px] font-bold text-gray-900 tracking-[-0.02em] leading-[1.15] group-hover:text-[var(--ev-color)] transition-colors">
              {ev.name}
            </h3>
            {/* Starts / ends — replaces the old month/day tile + days-left box */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-[13px] font-semibold text-gray-700">
              <span className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold tracking-[0.12em] uppercase text-gray-400">Starts</span>
                <span className="tabular-nums">{fmtEventDate(ev.startDate)}</span>
              </span>
              <span className="text-gray-300">→</span>
              <span className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold tracking-[0.12em] uppercase text-gray-400">Ends</span>
                <span className="tabular-nums">{fmtEventDate(ev.endDate)}</span>
              </span>
            </div>
            <p className="text-[13px] text-gray-500 mt-2 leading-[1.5] max-w-[600px]">{ev.sub}</p>
            <p className="text-[14px] text-gray-700 mt-3 leading-[1.6] max-w-[600px]">{ev.description}</p>
          </div>
          <div className="flex flex-wrap gap-[5px] self-start">{indChips(ev.industries)}</div>
        </div>

        {/* Right: countdown + actions */}
        <div className="flex flex-col gap-4 p-7 lg:border-l lg:border-t-0 border-t border-gray-200 min-w-[220px] justify-center bg-gray-50">
          <div className="flex gap-2 justify-center" aria-label="Countdown">
            {[
              { num: nextCd.d, lbl: "Días" },
              { num: nextCd.h, lbl: "Horas" },
              { num: nextCd.m, lbl: "Min" },
              { num: nextCd.s, lbl: "Seg" },
            ].map((unit, i, arr) => (
              <div key={unit.lbl} className="flex flex-col items-center gap-1 min-w-[56px]">
                <div className="flex items-center justify-center w-[56px] h-[56px] rounded-lg bg-white border border-gray-200 text-[22px] font-bold text-gray-900 tracking-[-0.02em] font-[var(--font-jetbrains)] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                  {unit.num}
                </div>
                <span className="text-[9px] font-semibold tracking-[0.1em] uppercase text-gray-500">{unit.lbl}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/events/event/${ev.id}`} scroll={false} className="flex-1 text-center px-4 py-[9px] rounded-md text-[12px] font-bold tracking-[0.04em] transition-all border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100">
              More info →
            </Link>
            <BookmarkButton
              id={ev.id}
              storageKey="agm-event-bookmarks"
              accent={ev.accent}
              iconSize={15}
              className="flex items-center justify-center w-[38px] h-[38px] rounded-md border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-all shrink-0"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
