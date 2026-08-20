"use client";

import type { Post } from "../data";
import PostCard from "./PostCard";
import ClassicCard from "./ClassicCard";

/* ── Feed rendering ─────────────────────────────────── */
export default function LatestFeed({
  view,
  filtered,
}: {
  view: "social" | "classic";
  filtered: Post[];
}) {
  if (!filtered.length) {
    return (
      <div className="text-center py-[60px] text-gray-500 col-span-full">
        <div className="text-4xl mb-3.5 opacity-30">📭</div>
        <p className="text-sm">No articles match your filters.</p>
      </div>
    );
  }

  if (view === "social") {
    return (
      <div className="flex flex-col gap-4">
        {filtered.map((p) => <PostCard key={p.id} p={p} />)}
      </div>
    );
  }

  /* classic view */
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
      {filtered.map((p) => <ClassicCard key={p.id} p={p} />)}
    </div>
  );
}
