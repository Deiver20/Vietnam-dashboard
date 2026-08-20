import Link from "next/link";
import Placeholder from "@/components/Placeholder";
import BookmarkButton from "@/components/BookmarkButton";
import type { Post } from "../data";
import { tagClass } from "../latestHelpers";

/* ── Render: feed (horizontal) card ──────────────────────
   Same contract as ClassicCard: title · summary · categories (max 2) ·
   one image · reading time · bookmark · More info. The image sits
   full-bleed on the LEFT edge (no padding — it owns the card's left
   side, top to bottom). ── */
export default function PostCard({ p }: { p: Post }) {
  return (
    <article className="group relative flex overflow-hidden rounded-[var(--radius-lg)] border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_16px_40px_-14px_rgba(0,0,0,0.12)] bg-white max-[640px]:flex-col">
      {/* Whole-card click → article modal. scroll={false}: opening the
          article only shows the modal — without it, Next tries to scroll
          the newly-rendered (fixed) modal segment into view, yanking the
          feed to the bottom and back on close. Footer actions sit above
          this overlay on z-[2]. */}
      <Link href={`/news/article/${p.id}`} scroll={false} className="absolute inset-0 z-[1]" aria-label={p.title} />

      {/* Full-bleed image — flush with the card's left, top and bottom.
          The img is absolutely positioned so its intrinsic size can never
          drive the card height (tall photos were stretching some cards);
          the text column alone sets the height and the photo just fills. */}
      <div className="relative w-[280px] shrink-0 self-stretch overflow-hidden max-[900px]:w-[220px] max-[640px]:w-full max-[640px]:h-[180px]">
        <Placeholder className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" text="Thumb" originalFile={p.image} />
      </div>
      <div className="min-w-0 flex-1 p-5 flex flex-col justify-center">
        <div className="flex items-center gap-1.5 mb-2.5">
          {p.categories.slice(0, 2).map((c) => (
            <span key={c} className={`px-[9px] py-[3px] rounded text-[10px] font-semibold tracking-[0.05em] uppercase border ${tagClass(c)}`}>{c}</span>
          ))}
          <span className="flex items-center gap-1 text-[11px] text-gray-400 font-[var(--font-jetbrains)] ml-1 whitespace-nowrap">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            {p.readingTime} min read
          </span>
        </div>
        <h2 className="text-gray-900 leading-[1.3] tracking-[-0.01em] mb-2.5 text-wrap balance text-[19px] font-semibold group-hover:text-blue-700 transition-colors">{p.title}</h2>
        <p className="text-[13.5px] text-gray-600 leading-[1.6] line-clamp-3">{p.summary}</p>

        {/* Bookmark + More info */}
        <div className="relative z-[2] flex items-center justify-end gap-1.5 mt-3.5">
          <BookmarkButton
            id={p.id}
            storageKey="agm-news-bookmarks"
            className="flex items-center justify-center w-[28px] h-[28px] coarse:w-11 coarse:h-11 rounded-md border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-all"
          />
          <Link
            href={`/news/article/${p.id}`}
            scroll={false}
            className="flex items-center gap-[3px] px-3 py-[6px] rounded-md text-[11px] font-bold tracking-[0.04em] transition-all border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100"
          >
            More info <span className="text-[10px]">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
