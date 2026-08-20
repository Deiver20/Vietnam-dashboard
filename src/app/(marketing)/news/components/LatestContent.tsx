"use client";

import { useLatestFeed } from "@/hooks/news/useLatestFeed";
import LatestHero from "./LatestHero";
import LatestFilterBar from "./LatestFilterBar";
import LatestFeed from "./LatestFeed";
import LatestSidebar from "./LatestSidebar";

/* ── Page ─────────────────────────────────────────────── */
export default function LatestContent() {
  const {
    view, setView,
    industry, setIndustry,
    search, setSearch,
    filtered,
    activeFilterCount, resetFilters,
  } = useLatestFeed();

  return (
    <>
      <LatestHero />

      <LatestFilterBar
        industry={industry}
        setIndustry={setIndustry}
        search={search}
        setSearch={setSearch}
        view={view}
        setView={setView}
        filtered={filtered}
        activeFilterCount={activeFilterCount}
        resetFilters={resetFilters}
      />

      {/* ════════ BODY ════════ */}
      <section className="bg-[#f4f6f8]">
        <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4 py-8 pb-20 flex gap-7 items-start max-[1200px]:flex-col">
          <main className="flex-1 min-w-0" role="list" aria-label="News feed">
            <LatestFeed view={view} filtered={filtered} />
            <div className="flex justify-center pt-[22px]">
              <button className="px-7 py-[11px] border border-gray-200 rounded-[var(--radius-sm)] text-[13px] font-medium text-gray-600 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                Load more articles
              </button>
            </div>
          </main>

          <LatestSidebar />
        </div>
      </section>
    </>
  );
}
