"use client";

import DataCard from "@/components/DataCard";
import IndustryCard from "./IndustryCard";
import { COUNTRIES, IND, TYPES } from "../datasets";
import type { DataResultsGridProps } from "@/interfaces/data/interface";

/* ════════════════════════ MARKETPLACE ════════════════════════
   Two sections: "Industries" — one card per industry with its world-price
   candlestick, linking to /data/[industry] — and "Others" — the event and
   project data products, which have no industry page of their own. */
export default function DataResultsGrid({ filters }: DataResultsGridProps) {
  const { visibleIndustries, otherCards, savedCards, toggleSave } = filters;

  return (
    <section className="relative bg-[#F4F6FA] border-b border-gray-200" id="marketplace">
      <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4 pt-7 pb-20">

        {/* ── Industries ── */}
        <div className="flex items-baseline gap-3 mb-[18px]">
          <h2 className="text-[15px] font-bold tracking-[0.02em] uppercase text-gray-800">Industries</h2>
          <span className="text-[11px] text-gray-500 font-[var(--font-jetbrains)] tracking-[0.05em]">
            {visibleIndustries.length} industr{visibleIndustries.length !== 1 ? "ies" : "y"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 max-[1100px]:grid-cols-2 max-[720px]:grid-cols-1" role="list">
          {visibleIndustries.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-400">
              <div className="text-4xl mb-3.5 opacity-50">📊</div>
              <p className="text-sm text-gray-500">No industries match these filters.</p>
            </div>
          ) : (
            visibleIndustries.map((key, i) => (
              <IndustryCard key={key} industryKey={key} ind={IND[key]} index={i} />
            ))
          )}
        </div>

        {/* ── Others: events & projects ── */}
        <div className="flex items-baseline gap-3 mt-12 mb-[18px]">
          <h2 className="text-[15px] font-bold tracking-[0.02em] uppercase text-gray-800">Others</h2>
          <span className="text-[11px] text-gray-500 font-[var(--font-jetbrains)] tracking-[0.05em]">
            Events &amp; projects · {otherCards.length} item{otherCards.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 max-[1100px]:grid-cols-2 max-[720px]:grid-cols-1" role="list">
          {otherCards.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-400">
              <div className="text-4xl mb-3.5 opacity-50">🗓️</div>
              <p className="text-sm text-gray-500">No events or projects match these filters.</p>
            </div>
          ) : (
            otherCards.map((d, i) => {
              const ind = IND[d.cat];
              const cty = COUNTRIES[d.country];
              const typ = TYPES[d.type];
              if (!ind || !cty || !typ) return null;
              return (
                <DataCard
                  key={d.id}
                  data={d}
                  ind={ind}
                  cty={cty}
                  typ={typ}
                  index={i}
                  saved={savedCards.has(d.id)}
                  onToggleSave={() => toggleSave(d.id)}
                />
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
