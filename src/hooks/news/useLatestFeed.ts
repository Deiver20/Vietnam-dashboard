"use client";

import { useEffect, useMemo, useState } from "react";
import { POSTS } from "@/app/(marketing)/news/data";

/** View, filters and derived list for the /news feed. */
export function useLatestFeed() {
  // Horizontal (social) cards are the default. Fresh storage key: the old
  // "lt-view" carried the previous classic-first default and would keep
  // overriding the new one for returning visitors.
  const [view, setView] = useState<"social" | "classic">(() => {
    if (typeof window === "undefined") return "social";
    return (localStorage.getItem("news-view") as "social" | "classic") || "social";
  });
  const [industry, setIndustry] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => { localStorage.setItem("news-view", view); }, [view]);

  const filtered = useMemo(() => {
    return POSTS.filter((p) => {
      if (industry !== "all" && p.industry !== industry) return false;
      if (search) {
        const hay = (p.title + " " + p.summary).toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [industry, search]);

  const activeFilterCount = (industry !== "all" ? 1 : 0) + (search ? 1 : 0);
  const resetFilters = () => { setIndustry("all"); setSearch(""); };

  return {
    view, setView,
    industry, setIndustry,
    search, setSearch,
    filtered,
    activeFilterCount, resetFilters,
  };
}
