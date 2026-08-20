import Link from "next/link";
import Placeholder from "@/components/Placeholder";
import BookmarkButton from "@/components/BookmarkButton";
import type { Post } from "../data";
import { tagClass } from "../latestHelpers";

/* ── Render: classic (grid) card ─────────────────────────
   Card contract: title · summary · categories (max 2) · one image ·
   reading time · bookmark · More info. The whole card links to the
   article modal. ── */
export default function ClassicCard({ p }: { p: Post }) {
  return (
    <article className="group relative h-full flex flex-col overflow-hidden rounded-[var(--radius-md)] border border-gray-200 transition-all duration-300 hover:-translate-y-[3px] hover:border-blue-300 hover:shadow-[0_14px_34px_-10px_rgba(0,0,0,0.12)] bg-white">
      {/* Whole-card click → article modal. scroll={false}: keep the feed's
          scroll position untouched (see PostCard for the failure mode).
          Footer actions sit above this overlay on z-[2]. */}
      <Link href={`/news/article/${p.id}`} scroll={false} className="absolute inset-0 z-[1]" aria-label={p.title} />

      <div className="overflow-hidden aspect-video">
        <Placeholder className="w-full h-full object-cover transition-transform duration-[450ms] group-hover:scale-105" text="Thumb" originalFile={p.image} />
      </div>
      <div className="p-4 flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-1.5 mb-2.5">
          {p.categories.slice(0, 2).map((c) => (
            <span key={c} className={`text-[9px] font-bold tracking-[0.1em] uppercase px-[7px] py-[2px] rounded-[3px] border ${tagClass(c)}`}>{c}</span>
          ))}
          <span className="flex items-center gap-1 text-[10px] text-gray-400 font-[var(--font-jetbrains)] ml-auto whitespace-nowrap">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            {p.readingTime} min read
          </span>
        </div>
        <h2 className="text-[15px] font-semibold text-gray-900 leading-[1.4] tracking-[-0.01em] mb-2 line-clamp-2">{p.title}</h2>
        <p className="text-[12.5px] text-gray-500 leading-[1.55] line-clamp-3">{p.summary}</p>

        {/* Bookmark + More info */}
        <div className="relative z-[2] flex items-center justify-end gap-1.5 mt-auto pt-3">
          <BookmarkButton
            id={p.id}
            storageKey="agm-news-bookmarks"
            className="flex items-center justify-center w-[26px] h-[26px] coarse:w-11 coarse:h-11 rounded-md border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-all"
          />
          <Link
            href={`/news/article/${p.id}`}
            scroll={false}
            className="flex items-center gap-[3px] px-2.5 py-[5px] rounded-md text-[10px] font-bold tracking-[0.04em] transition-all border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100"
          >
            More info <span className="text-[9px]">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
