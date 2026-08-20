"use client";

import type { Dispatch, SetStateAction } from "react";
import FilterChipSelect from "@/components/FilterChipSelect";
import FilterReset from "@/components/FilterReset";
import { REGION_LABELS } from "../eventsData";

interface EventsControlsProps {
  status: "upcoming" | "past";
  setStatus: Dispatch<SetStateAction<"upcoming" | "past">>;
  region: string;
  setRegion: Dispatch<SetStateAction<string>>;
  upcomingCount: number;
  pastCount: number;
}

/* ════════ CONTROLS ════════ */
export default function EventsControls({
  status,
  setStatus,
  region,
  setRegion,
  upcomingCount,
  pastCount,
}: EventsControlsProps) {
  return (
    <div id="controls" className="sticky top-[68px] z-20 bg-[#000C1A] backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4 flex items-stretch gap-0 overflow-x-auto scrollbar-none">
        <div className="flex items-stretch shrink-0 border-r border-white/[0.06] mr-5 pr-1" role="tablist" aria-label="Event status">
          {[
            { key: "upcoming" as const, label: "Upcoming", count: upcomingCount },
            { key: "past" as const, label: "Past Events", count: pastCount },
          ].map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={status === t.key}
              onClick={() => setStatus(t.key)}
              className={`flex items-center gap-[7px] px-5 py-[15px] text-xs font-bold tracking-[0.08em] uppercase whitespace-nowrap border-b-2 transition-colors ${
                status === t.key ? "text-white border-b-[#0066ff]" : "text-[#686970] border-b-transparent hover:text-[#d8d8d8]"
              }`}
            >
              {t.label}
              <span className={`min-w-[20px] h-[18px] px-[5px] rounded-full text-[10px] font-semibold inline-flex items-center justify-center ${
                status === t.key ? "bg-[rgba(0,102,255,0.2)] text-[#67A6FF]" : "bg-white/[0.07] text-[#bfbfbf]"
              }`}>{t.count}</span>
            </button>
          ))}
        </div>
        {/* Region slicer — /dashboard structure: <name> <selected> <chevron> */}
        <div className="flex items-center flex-1 py-2" role="group" aria-label="Filter by region">
          <FilterChipSelect
            label="Region"
            value={region}
            options={["all", "americas", "europe", "asia", "africa", "oceania"].map((r) => ({
              value: r,
              label: REGION_LABELS[r],
            }))}
            onChange={setRegion}
            active={region !== "all"}
          />
        </div>
        <div className="flex items-center pl-3 ml-2 border-l border-white/[0.06] self-center shrink-0">
          <FilterReset count={region !== "all" ? 1 : 0} onReset={() => setRegion("all")} label="Reset" />
        </div>
      </div>
    </div>
  );
}
