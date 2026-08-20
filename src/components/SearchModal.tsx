"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORY_COLORS, CATEGORY_LABELS, countByCategory, searchItems } from "@/lib/functions/searchData";
import type { SearchCategory, SearchItem } from "@/interfaces/search/interface";

const CATEGORIES: SearchCategory[] = ["all", "data", "products", "news", "events", "dashboards"];

function ResultRow({ item, onClose }: { item: SearchItem; onClose: () => void }) {
  const color = CATEGORY_COLORS[item.category];
  return (
    <Link
      href={item.url}
      onClick={onClose}
      className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-white/[0.04] transition-colors group"
    >
      <div className="w-1 h-10 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-white leading-snug group-hover:text-[#67A6FF] transition-colors truncate">
          {item.title}
        </div>
        {item.subtitle && (
          <div className="text-[11px] text-[#94959b] leading-relaxed truncate mt-0.5">{item.subtitle}</div>
        )}
        {item.meta && (
          <div className="text-[10px] text-[#686970] mt-1">{item.meta}</div>
        )}
      </div>
      <span className="text-[9px] font-bold tracking-[0.08em] uppercase px-2 py-[3px] rounded-full shrink-0 self-center" style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}>
        {CATEGORY_LABELS[item.category].split(" ")[0]}
      </span>
    </Link>
  );
}

export default function SearchModal({ open, onClose, initialQuery = "" }: { open: boolean; onClose: () => void; initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<SearchCategory>("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery(initialQuery);
      setActiveCategory("all");
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open, initialQuery]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => searchItems(query, activeCategory, 10), [query, activeCategory]);
  const counts = useMemo(() => countByCategory(query), [query]);

  const handleViewAll = () => {
    onClose();
    router.push(`/search?q=${encodeURIComponent(query)}&cat=${activeCategory}`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[100px] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[rgba(0,12,26,0.85)] backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-[720px] bg-[rgba(0,23,48,0.98)] border border-white/[0.08] rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[calc(100dvh-140px)]"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
          <svg className="text-[#67a6ff] shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none text-white text-base font-[var(--font-poppins)] caret-[#67a6ff] placeholder:text-white/30"
            placeholder="Search data, news, events, products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && query.trim()) handleViewAll(); }}
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[#686970] hover:text-white transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
          <button onClick={onClose} className="text-[#686970] hover:text-white transition-colors ml-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06] overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => {
            const count = counts[cat];
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-[5px] rounded-full text-[11px] font-semibold tracking-[0.06em] uppercase whitespace-nowrap transition-all ${
                  active
                    ? "bg-[rgba(0,102,255,0.2)] text-white border border-[rgba(0,102,255,0.4)]"
                    : "bg-white/[0.04] text-[#94959b] border border-white/[0.08] hover:bg-white/[0.07] hover:text-[#d8d8d8]"
                }`}
              >
                {CATEGORY_LABELS[cat].split(" ")[0]}
                {count > 0 && <span className={`text-[10px] ${active ? "text-[#67A6FF]" : "text-[#686970]"}`}>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {!query.trim() ? (
            <div className="text-center py-12 text-[#686970] text-sm">
              Type to search across data, news, events, products and more.
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-[#686970] text-sm">
              No results found for "{query}". Try a different keyword.
            </div>
          ) : (
            <div className="flex flex-col">
              {results.map((item) => (
                <ResultRow key={item.id} item={item} onClose={onClose} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {query.trim() && results.length > 0 && (
          <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between bg-[rgba(0,12,26,0.5)]">
            <span className="text-[11px] text-[#686970]">
              Showing {results.length} of {counts[activeCategory]} results
            </span>
            <button
              onClick={handleViewAll}
              className="inline-flex items-center gap-2 px-4 py-[7px] bg-gradient-to-br from-[#0066FF] to-[#0052d4] rounded-lg text-white text-[12px] font-semibold tracking-wide shadow-[0_4px_14px_rgba(0,102,255,0.4)] transition-all hover:shadow-[0_6px_20px_rgba(0,102,255,0.55)] hover:-translate-y-px"
            >
              <span>View All Results</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
