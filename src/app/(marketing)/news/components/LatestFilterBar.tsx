"use client";

import FilterChipSelect from "@/components/FilterChipSelect";
import FilterReset from "@/components/FilterReset";

const INDUSTRY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "rendering", label: "Rendering" },
  { value: "petfood", label: "Petfood" },
  { value: "biofuels", label: "Biofuels" },
  { value: "feed", label: "Feed" },
  { value: "chicken_meat", label: "Meat" },
  { value: "grains", label: "Grains" },
  { value: "fertilizers", label: "Fertilizers" },
  { value: "veg_oils", label: "Veg. Oils" },
];

/* ════════ FILTER BAR + SEARCH ════════
   The single sticky filter line: industry slicer + search + count/reset +
   layout toggle. (The old ALL / NEWS / SCIENTIFIC PUBLICATIONS tabs are gone —
   everything here is news now.) */
export default function LatestFilterBar({
  industry,
  setIndustry,
  search,
  setSearch,
  view,
  setView,
  filtered,
  activeFilterCount,
  resetFilters,
}: {
  industry: string;
  setIndustry: (i: string) => void;
  search: string;
  setSearch: (s: string) => void;
  view: "social" | "classic";
  setView: (v: "social" | "classic") => void;
  filtered: unknown[];
  activeFilterCount: number;
  resetFilters: () => void;
}) {
  return (
    <div className="sticky top-[68px] z-20 bg-[#000C1A] border-b border-white/[0.05] py-2">
      <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4 flex items-center gap-3 max-[720px]:flex-wrap">
        <FilterChipSelect
          label="Industry"
          value={industry}
          options={INDUSTRY_OPTIONS}
          onChange={setIndustry}
          active={industry !== "all"}
        />

        <div className={`flex items-center gap-2.5 border rounded-lg px-3.5 max-w-[380px] flex-1 min-w-[200px] transition-all ${
          search
            ? "bg-[rgba(0,102,255,0.08)] border-[rgba(0,102,255,0.55)] shadow-[0_0_10px_rgba(0,102,255,0.12)]"
            : "bg-white/[0.04] border-white/[0.08] focus-within:border-[rgba(0,102,255,0.4)] focus-within:bg-[rgba(0,102,255,0.04)]"
        }`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${search ? "text-[#67A6FF]" : "text-[#94959b]"}`}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value.trim().toLowerCase())}
            placeholder="Search news, topics…"
            autoComplete="off"
            className="bg-transparent border-none outline-none text-white text-[13px] w-full py-[7px] placeholder:text-[#94959b]"
          />
        </div>

        <div className="ml-auto flex items-center gap-3 max-[720px]:ml-0">
          <span className="text-[11px] text-[#686970] font-[var(--font-jetbrains)] whitespace-nowrap">{filtered.length} article{filtered.length !== 1 ? "s" : ""}</span>
          <FilterReset count={activeFilterCount} onReset={resetFilters} label="Reset" />
          <div className="flex gap-0.5 bg-black/30 p-[3px] rounded-lg">
            <button
              onClick={() => setView("social")}
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${view === "social" ? "bg-[rgba(0,102,255,0.22)] text-white" : "text-[#686970] hover:text-white"}`}
              title="Feed view" aria-label="Feed view"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <button
              onClick={() => setView("classic")}
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${view === "classic" ? "bg-[rgba(0,102,255,0.22)] text-white" : "text-[#686970] hover:text-white"}`}
              title="Grid view" aria-label="Grid view"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
