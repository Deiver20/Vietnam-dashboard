"use client";

import FilterChipSelect from "@/components/FilterChipSelect";
import FilterReset from "@/components/FilterReset";
import { CATS } from "../datasets";
import type { DataFilterBarProps } from "@/interfaces/data/interface";

/* Filter slicers follow the /dashboard structure: <name> <selected> <chevron>.
   /data keeps only Industry + search — region, country, data type and product
   now live on each /data/[industry] page. */
export default function DataFilterBar({ filters }: DataFilterBarProps) {
  const {
    fCat, setFCat,
    fSearch, setFSearch,
    activeChips,
    removeChip,
    resetAll,
  } = filters;

  const catValue = CATS.find((c) => c.key === fCat);

  return (
    /* Sticky filter bar — sticks just below the navbar */
    <div className="sticky top-[68px] z-[90] border-b border-white/[0.08]" style={{ background: "rgb(0, 12, 26)" }}>

      <div className="border-b border-white/[0.06] py-2.5">
        <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4 flex items-center gap-2 max-[900px]:flex-wrap">

          <FilterChipSelect
            label="Industry"
            value={fCat}
            options={CATS.map((c) => ({ value: c.key, label: c.label }))}
            onChange={setFCat}
            active={fCat !== "all"}
            valuePrefix={<span className="text-sm leading-none">{catValue?.emoji}</span>}
          />

          <div className="w-px h-6 bg-white/[0.06] mx-1 max-[720px]:hidden" />

          {/* Search */}
          <div className={`flex items-center gap-2.5 border rounded-lg px-3.5 flex-1 min-w-[180px] max-w-[360px] transition-colors ${
            fSearch
              ? "bg-[rgba(0,102,255,0.10)] border-[rgba(0,102,255,0.55)] shadow-[0_0_10px_rgba(0,102,255,0.12)]"
              : "bg-white/[0.05] border-white/[0.10] focus-within:border-[rgba(102,166,255,0.35)]"
          }`}>
            <svg className={`shrink-0 ${fSearch ? "text-[#67A6FF]" : "text-[#686970]"}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" className="bg-transparent border-none outline-none text-white/90 text-[13px] w-full py-[7px] placeholder:text-[#686970]" placeholder="Search data..." autoComplete="off" value={fSearch} onChange={(e) => setFSearch(e.target.value)} />
          </div>

          <div className="flex items-center gap-2 ml-auto max-[900px]:ml-0">
            <FilterReset count={activeChips.length} onReset={resetAll} />
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="border-b border-white/[0.06] py-2">
          <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#686970]">Active:</span>
            {activeChips.map((ch) => (
              <button
                key={ch.key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-[0.02em] transition-all hover:opacity-80 cursor-pointer"
                style={{
                  background: `${ch.color}20`,
                  border: `1px solid ${ch.color}60`,
                  color: "#ffffff",
                  textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                  boxShadow: `0 0 8px ${ch.color}15`,
                }}
                onClick={() => removeChip(ch.key)}
              >
                {ch.label}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            ))}
            <button className="text-[10px] text-[#686970] hover:text-[#d8d8d8] underline ml-2" onClick={resetAll}>Clear all</button>
          </div>
        </div>
      )}
    </div>
  );
}
