"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Placeholder from "@/components/Placeholder";
import BookmarkButton from "@/components/BookmarkButton";
import { POSTS } from "../data";
import { tagClass } from "../latestHelpers";

/* ── Article modal ───────────────────────────────────────
   The article opens as a dialog OVER the /news feed (own URL via the
   intercepted /news/article/:id route). Contract mirrors the cards —
   title · summary · categories (max 2) · one image · reading time —
   plus the subtitled body sections. ── */
export default function ArticleModal({
  id,
  intercepted = false,
}: {
  id: string;
  intercepted?: boolean;
}) {
  const router = useRouter();
  const post = POSTS.find((p) => String(p.id) === id);
  // Mount-transition flag so the dialog eases in instead of popping.
  const [shown, setShown] = useState(false);

  const close = () => {
    // Soft-navigated (intercepted) modals go back to the feed the user was
    // on, filters and scroll intact; hard loads push to /news.
    if (intercepted) router.back();
    else router.push("/news");
  };

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    // Lock the feed's scroll while the dialog is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // The OVERLAY scrolls, not the card: the card hugs its content at full
    // height and the whole thing moves as you scroll, so nothing is ever
    // clipped inside an inner scroll box.
    <div
      className="modal-scroll fixed inset-0 z-[200] overflow-y-auto overscroll-contain p-6 max-[560px]:p-3"
      role="dialog"
      aria-modal="true"
      aria-label={post ? post.title : "Article not found"}
    >
      {/* Backdrop — the /news page stays visible (blurred) behind it.
          Fixed so it covers the viewport however far the card scrolls. */}
      <div
        className={`fixed inset-0 bg-[#001730]/70 backdrop-blur-sm transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"}`}
        onClick={close}
        aria-hidden="true"
      />

      <div
        className={`relative w-full max-w-[760px] mx-auto rounded-2xl overflow-hidden bg-white shadow-[0_32px_80px_-20px_rgba(0,0,0,0.5)] transition-all duration-300 ${
          shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {!post ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4 opacity-40">📭</div>
            <h1 className="text-lg font-semibold text-gray-900 mb-2">Article not found</h1>
            <p className="text-sm text-gray-500 mb-6">This publication doesn&apos;t exist or was removed.</p>
            <Link href="/news" className="btn btn--primary text-sm py-2.5 px-5">← Back to News</Link>
          </div>
        ) : (
          <>
            {/* 1 image — banner */}
            <div className="relative h-[260px] max-[560px]:h-[180px] overflow-hidden">
              <Placeholder className="w-full h-full object-cover" text="Article image" originalFile={post.image} />
              <BookmarkButton
                id={post.id}
                storageKey="agm-news-bookmarks"
                iconSize={15}
                className="absolute top-3.5 right-[60px] w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.08] shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-all"
              />
              <button
                onClick={close}
                aria-label="Close article"
                className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.08] shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className="px-9 py-7 max-[560px]:px-5 max-[560px]:py-5">
              {/* Categories (max 2) + reading time */}
              <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                {post.categories.slice(0, 2).map((c) => (
                  <span key={c} className={`px-[9px] py-[3px] rounded text-[10px] font-semibold tracking-[0.05em] uppercase border ${tagClass(c)}`}>{c}</span>
                ))}
                <span className="flex items-center gap-1 text-[11px] text-gray-400 font-[var(--font-jetbrains)] ml-1.5 whitespace-nowrap">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  {post.readingTime} min read
                </span>
              </div>

              {/* Title */}
              <h1 className="text-[26px] max-[560px]:text-[21px] font-bold text-gray-900 leading-[1.25] tracking-[-0.01em] mb-4 text-wrap balance">
                {post.title}
              </h1>

              {/* Summary — the lead */}
              <p className="text-[15.5px] text-gray-600 leading-[1.65] border-l-[3px] border-blue-600 pl-4 mb-2">
                {post.summary}
              </p>

              {/* Body — one or more subtitled sections */}
              {post.sections.map((s) => (
                <section key={s.subtitle}>
                  <h2 className="text-[19px] font-semibold text-gray-900 leading-[1.3] mt-7 mb-3">{s.subtitle}</h2>
                  {s.paragraphs.map((para, i) => (
                    <p key={i} className="text-[14.5px] text-gray-700 leading-[1.75] mb-3.5">{para}</p>
                  ))}
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
