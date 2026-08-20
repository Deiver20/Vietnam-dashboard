"use client";

import Link from "next/link";
import Placeholder from "@/components/Placeholder";
import BookmarkButton from "@/components/BookmarkButton";
import type { EventItem } from "../eventsData";
import { fmtEventDate, pastIndChips } from "../eventsHelpers";
import { useEventProgress } from "@/hooks/events/useEventProgress";

/* ── Render: standard event card ─────────────────────────
   Card contract: event name · starting date · ending date · city+country
   · industry tags · bookmark · More info. The whole card opens the event
   modal (own URL, over the /events page). ── */
export default function EventCard({ ev }: { ev: EventItem }) {
  const { pct, color } = useEventProgress(ev);

  return (
    <article
      className="group relative overflow-hidden rounded-[var(--radius-md)] border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-10px_var(--ev-shadow)] flex flex-col"
      style={{
        ["--ev-color" as string]: ev.accent,
        ["--ev-shadow" as string]: `${ev.accent}59`,
        // The event color lives in the card surface only — buttons stay
        // the standard blue so the grid doesn't read as a rainbow.
        background: `linear-gradient(180deg, ${ev.accent}1f 0%, ${ev.accent}0a 45%, #ffffff 100%)`,
        borderColor: `${ev.accent}40`,
      }}
      role="listitem"
    >
      {/* Whole-card click → event modal. scroll={false}: keep the page's
          scroll position untouched (same pattern as /news cards). The
          footer actions sit above this overlay on z-[2]. */}
      <Link href={`/events/event/${ev.id}`} scroll={false} className="absolute inset-0 z-[1]" aria-label={ev.name} />

      {/* Progress bar — days remaining */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gray-100 overflow-hidden">
        <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="absolute top-0 left-0 right-0 h-[24px] to-transparent opacity-[0.06] group-hover:opacity-[0.10] transition-opacity pointer-events-none" style={{ backgroundImage: `linear-gradient(to bottom, ${color}, transparent)` }} />

      {/* Event image — locked to 16:9 with a center crop so every card in
          the grid shows the exact same image proportion. */}
      <div className="relative aspect-[16/9] overflow-hidden border-b mt-[3px]" style={{ borderColor: `${ev.accent}26` }}>
        <Placeholder className="w-full h-full object-cover transition-transform duration-[450ms] group-hover:scale-105" text={ev.name} originalFile={ev.image} />
      </div>

      <div className="relative p-4 flex flex-col gap-3 flex-1">
        {/* 1. Event name */}
        <h3 className="text-[15px] font-bold text-gray-900 tracking-[-0.015em] leading-[1.25] group-hover:text-[var(--ev-color)] transition-colors">
          {ev.name}
        </h3>

        {/* 2–3. Starting / ending date */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2 text-[12px]">
            <span className="text-[9px] font-bold tracking-[0.12em] uppercase text-gray-400">Starts</span>
            <span className="font-semibold tabular-nums text-gray-700">{fmtEventDate(ev.startDate)}</span>
          </div>
          <div className="h-px" style={{ background: `${ev.accent}26` }} />
          <div className="flex items-center justify-between gap-2 text-[12px]">
            <span className="text-[9px] font-bold tracking-[0.12em] uppercase text-gray-400">Ends</span>
            <span className="font-semibold tabular-nums text-gray-700">{fmtEventDate(ev.endDate)}</span>
          </div>
        </div>

        {/* 4. City + country */}
        <div className="flex items-center gap-[6px] text-[12.5px] font-medium text-gray-700">
          <span className="text-base leading-none">{ev.flag}</span>
          {ev.location}
        </div>

        {/* 5. Industry tags + bookmark + More info */}
        <div className="relative z-[2] flex items-end justify-between gap-2 mt-auto pt-1">
          <div className="flex flex-wrap gap-[4px]">{pastIndChips(ev.industries)}</div>
          <div className="flex items-center gap-1.5 shrink-0">
            <BookmarkButton
              id={ev.id}
              storageKey="agm-event-bookmarks"
              accent={ev.accent}
              className="flex items-center justify-center w-[26px] h-[26px] coarse:w-11 coarse:h-11 rounded-md border border-gray-200 bg-white/70 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-all"
            />
            <Link
              href={`/events/event/${ev.id}`}
              scroll={false}
              className="flex items-center gap-[3px] px-2.5 py-[5px] rounded-md text-[10px] font-bold tracking-[0.04em] transition-all border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100"
            >
              More info <span className="text-[9px]">→</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
