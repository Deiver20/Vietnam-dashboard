"use client";

import { useBookmark } from "@/hooks/useBookmark";

/* Bookmark toggle shared by cards and route-modals (events, news).
   Callers style the button box via className; the icon fills with the
   accent when saved. Safe inside card links (stops propagation). */
export default function BookmarkButton({
  id,
  storageKey,
  accent = "#0066FF",
  className = "",
  iconSize = 13,
}: {
  id: number;
  storageKey: string;
  accent?: string;
  className?: string;
  iconSize?: number;
}) {
  const { saved, toggle } = useBookmark(id, storageKey);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      aria-label={saved ? "Remove bookmark" : "Bookmark"}
      aria-pressed={saved}
      title={saved ? "Bookmarked" : "Bookmark"}
      className={className}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={saved ? accent : "none"}
        stroke={saved ? accent : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
