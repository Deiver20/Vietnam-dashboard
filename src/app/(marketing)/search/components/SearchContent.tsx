"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CATEGORY_COLORS, CATEGORY_LABELS, countByCategory, searchItems } from "@/lib/functions/searchData";
import type { SearchCategory, SearchItem } from "@/interfaces/search/interface";

const CATEGORIES: SearchCategory[] = ["all", "data", "products", "news", "events", "dashboards"];

function ResultCard({ item }: { item: SearchItem }) {
  const color = CATEGORY_COLORS[item.category];
  return (
    <Link
      href={item.url}
      className="flex items-start gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all group"
    >
      <div className="w-1.5 h-12 rounded-full shrink-0 mt-1" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-[3px] rounded-full"
            style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}
          >
            {CATEGORY_LABELS[item.category].split(" ")[0]}
          </span>
          {item.date && <span className="text-[10px] text-[#686970]">{item.date}</span>}
        </div>
        <h3 className="text-[15px] font-semibold text-white leading-snug group-hover:text-[#67A6FF] transition-colors">
          {item.title}
        </h3>
        {item.subtitle && <p className="text-[13px] text-[#94959b] leading-relaxed mt-1">{item.subtitle}</p>}
        {item.meta && <p className="text-[11px] text-[#686970] mt-2">{item.meta}</p>}
      </div>
    </Link>
  );
}

export default function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const catParam = (searchParams.get("cat") as SearchCategory) || "all";
  const [activeCategory, setActiveCategory] = useState<SearchCategory>(catParam);

  const results = useMemo(() => searchItems(q, activeCategory, 100), [q, activeCategory]);
  const counts = useMemo(() => countByCategory(q), [q]);

  return (
    <>
      <main className="flex-1 pt-[100px] pb-20">
        <div className="max-w-[1000px] mx-auto px-8 max-[720px]:px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[clamp(28px,3.5vw,42px)] font-semibold text-white tracking-[-0.02em] leading-tight mb-2">
              Search Results
            </h1>
            {q ? (
              <p className="text-[15px] text-[#94959b]">
                {counts.all} results for <span className="text-white font-medium">"{q}"</span>
              </p>
            ) : (
              <p className="text-[15px] text-[#94959b]">Enter a search term to find data, news, events and more.</p>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
            {CATEGORIES.map((cat) => {
              const count = counts[cat];
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-1.5 px-3.5 py-[7px] rounded-full text-[12px] font-semibold tracking-[0.06em] uppercase whitespace-nowrap transition-all ${
                    active
                      ? "bg-[rgba(0,102,255,0.2)] text-white border border-[rgba(0,102,255,0.4)]"
                      : "bg-white/[0.04] text-[#94959b] border border-white/[0.08] hover:bg-white/[0.07] hover:text-[#d8d8d8]"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                  <span className={`text-[11px] ${active ? "text-[#67A6FF]" : "text-[#686970]"}`}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Results grid */}
          {results.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-[48px] mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-white mb-2">No results found</h3>
              <p className="text-[#94959b] text-sm max-w-[400px] mx-auto">
                {q
                  ? `We couldn't find anything matching "${q}". Try different keywords or browse by category.`
                  : "Enter a search term to start exploring."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {results.map((item) => (
                <ResultCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

