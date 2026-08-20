"use client";

import { useMemo, useState } from "react";
import { EVENTS, PAST_EVENTS, REGION_LABELS } from "../eventsData";
import { parseEventDate } from "../eventsHelpers";
import EventCard from "./EventCard";
import NextEventCard from "./NextEventCard";
import FeaturedCard from "./FeaturedCard";
import PastCard from "./PastCard";
import EventsHero from "./EventsHero";
import EventsControls from "./EventsControls";
import EventServicesCta from "./EventServicesCta";

/* ── Page ─────────────────────────────────────────────── */
export default function EventsContent() {
  const [status, setStatus] = useState<"upcoming" | "past">("upcoming");
  const [region, setRegion] = useState("all");

  const upcomingCount = EVENTS.filter((e) => e.status === "upcoming").length;
  const pastCount = PAST_EVENTS.length;

  const filteredUpcoming = useMemo(() => {
    return EVENTS.filter((ev) =>
      ev.status === "upcoming" && (region === "all" || ev.region === region) && ev.id !== 100
    );
  }, [region]);

  const nearestEvent = useMemo(() => {
    if (filteredUpcoming.length === 0) return null;
    return [...filteredUpcoming].sort((a, b) => parseEventDate(a).getTime() - parseEventDate(b).getTime())[0];
  }, [filteredUpcoming]);

  const groups = useMemo(() => {
    const g: Record<string, typeof filteredUpcoming> = {};
    filteredUpcoming.forEach((ev) => {
      const key = `${ev.monthKey}_${ev.month} ${ev.year}`;
      if (!g[key]) g[key] = [];
      g[key].push(ev);
    });
    return Object.entries(g).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
  }, [filteredUpcoming]);

  return (
    <>
      <EventsHero />

      <EventsControls
        status={status}
        setStatus={setStatus}
        region={region}
        setRegion={setRegion}
        upcomingCount={upcomingCount}
        pastCount={pastCount}
      />

      {/* ════════ UPCOMING ════════ */}
      {status === "upcoming" && (
        <section className="bg-[#f4f6f8] py-16 pb-10">
          <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4">
            <div className="flex items-end justify-between mb-9 flex-wrap gap-4">
              <div>
                <span className="kicker text-gray-500">Industry Calendar</span>
                <h2 className="text-[clamp(26px,2.8vw,38px)] font-semibold tracking-[-0.02em] leading-[1.1] mt-1.5 text-gray-900">Upcoming events & conferences</h2>
              </div>
              <div className="inline-flex items-center gap-1.5 px-[14px] py-[6px] bg-blue-50 border border-blue-200 rounded-full text-xs font-semibold text-blue-600">
                <span className="w-[6px] h-[6px] rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] inline-block shrink-0 animate-pulse" />
                {filteredUpcoming.length} event{filteredUpcoming.length !== 1 ? "s" : ""} · 2026
              </div>
            </div>

            {filteredUpcoming.length === 0 ? (
              <div className="text-center py-[60px] text-gray-500">
                <div className="text-4xl mb-3.5 opacity-30">🌍</div>
                <p className="text-sm">No upcoming events in <strong className="text-gray-900">{REGION_LABELS[region]}</strong> this year.</p>
                <p className="text-xs mt-1.5 text-gray-400">Most events are scheduled in the Americas and Europe.</p>
                <button onClick={() => setRegion("all")} className="btn btn--ghost mt-4 text-xs py-2 px-[18px]">View all regions →</button>
              </div>
            ) : (
              <>
                {/* Next upcoming event — full width */}
                {nearestEvent && (
                  <div className="mb-4" role="list" aria-label="Upcoming events">
                    <div className="flex items-center gap-3.5 py-2.5 pb-1 mb-1">
                      <span className="flex items-center gap-2 text-xs font-bold tracking-[0.12em] uppercase text-yellow-600 whitespace-nowrap">
                        <span className="w-[6px] h-[6px] rounded-full bg-yellow-500 shrink-0 animate-pulse" />
                        Next Event
                      </span>
                      <span className="flex-1 h-px bg-gray-200" />
                    </div>
                    <NextEventCard ev={nearestEvent} />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" role="list" aria-label="Upcoming events">
                  {groups.map(([key, evs]) => {
                    const monthLabel = key.split("_")[1];
                    const filteredEvs = evs.filter((ev) => !nearestEvent || ev.id !== nearestEvent.id);
                    if (filteredEvs.length === 0) return null;
                    return (
                      <div key={key} className="contents">
                        <div className="col-span-full flex items-center gap-3.5 py-2.5 pb-1">
                          <span className="flex items-center gap-2 text-xs font-bold tracking-[0.12em] uppercase text-blue-600 whitespace-nowrap">
                            <span className="w-[6px] h-[6px] rounded-full bg-blue-500 shrink-0" />
                            {monthLabel}
                          </span>
                          <span className="flex-1 h-px bg-gray-200" />
                          <span className="text-[10px] text-gray-400 font-[var(--font-jetbrains)] whitespace-nowrap">{filteredEvs.length} event{filteredEvs.length !== 1 ? "s" : ""}</span>
                        </div>
                        {filteredEvs.map((ev) => ev.featured ? <FeaturedCard key={ev.id} ev={ev} /> : <EventCard key={ev.id} ev={ev} />)}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* ════════ PAST ════════ */}
      {status === "past" && (
        <section className="bg-[#f4f6f8] py-16 pb-10">
          <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4">
            <div className="flex items-end justify-between mb-9 flex-wrap gap-4">
              <div>
                <span className="kicker text-gray-500">Event Archive</span>
                <h2 className="text-[clamp(26px,2.8vw,38px)] font-semibold tracking-[-0.02em] leading-[1.1] mt-1.5 text-gray-900">Past events & conferences</h2>
              </div>
              <div className="inline-flex items-center gap-1.5 px-[14px] py-[6px] rounded-full text-xs font-semibold text-gray-500 border border-gray-200 bg-gray-50">
                {pastCount} completed events
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" role="list" aria-label="Past events">
              {PAST_EVENTS.map((ev, i) => <PastCard key={i} ev={ev} />)}
            </div>
          </div>
        </section>
      )}

      <EventServicesCta />
    </>
  );
}
