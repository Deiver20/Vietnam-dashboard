"use client";

import { useMemo, useState } from "react";
import { CARDS, CATS, COUNTRIES, IND } from "@/app/(marketing)/data/datasets";
import type { ActiveChip, DataFilters } from "@/interfaces/data/interface";

/** Owns the /data filter state: Industry + search only (the deeper filters —
    region, country, data type, product — moved to /data/[industry]). */
export function useDataFilters(): DataFilters {
  const [fCat, setFCat] = useState("all");
  const [fSearch, setFSearch] = useState("");
  const [savedCards, setSavedCards] = useState<Set<string>>(new Set());

  /* Industries section: every industry, narrowed by the two filters. */
  const visibleIndustries = useMemo(() => {
    return Object.keys(IND).filter((key) => {
      if (fCat !== "all" && key !== fCat) return false;
      if (fSearch && !IND[key].label.toLowerCase().includes(fSearch.toLowerCase())) return false;
      return true;
    });
  }, [fCat, fSearch]);

  /* Others section: the event/project data products. */
  const otherCards = useMemo(() => {
    return CARDS.filter((d) => {
      if (d.type !== "event" && d.type !== "project") return false;
      if (fCat !== "all" && d.cat !== fCat) return false;
      if (fSearch) {
        const q = fSearch.toLowerCase();
        const cty = COUNTRIES[d.country];
        if (
          !(IND[d.cat]?.label.toLowerCase().includes(q) ||
            (cty?.name || "").toLowerCase().includes(q) ||
            d.type.includes(q) ||
            (d.title || "").toLowerCase().includes(q))
        )
          return false;
      }
      return true;
    });
  }, [fCat, fSearch]);

  const activeChips = useMemo(() => {
    const chips: ActiveChip[] = [];
    if (fCat !== "all") {
      const ind = IND[fCat];
      const cat = CATS.find((c) => c.key === fCat);
      chips.push({ label: `${cat?.emoji || ""} ${ind?.label || fCat}`, key: "cat", color: ind?.color || "#67A6FF" });
    }
    if (fSearch) {
      chips.push({ label: `"${fSearch}"`, key: "search", color: "#67A6FF" });
    }
    return chips;
  }, [fCat, fSearch]);

  const toggleSave = (id: string) => {
    setSavedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const removeChip = (key: string) => {
    if (key === "cat") setFCat("all");
    else if (key === "search") setFSearch("");
  };

  const resetAll = () => {
    setFCat("all");
    setFSearch("");
  };

  return {
    fCat, setFCat,
    fSearch, setFSearch,
    visibleIndustries,
    otherCards,
    activeChips,
    savedCards,
    toggleSave,
    removeChip,
    resetAll,
  };
}
