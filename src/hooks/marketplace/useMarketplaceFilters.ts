"use client";

import { useMemo, useState } from "react";
import type { MapItem } from "@/interfaces/marketplace/interface";
import { MAP_ITEMS, PRODUCTS } from "@/app/(marketplace)/marketplace/marketplaceData";

/** Filter state + derived lists shared by the list, globe and flat map views. */
export function useMarketplaceFilters() {
  const [fKind, setFKind] = useState<"all" | "product" | "offer">("all");
  const [fCategory, setFCategory] = useState("all");
  const [fDestCountry, setFDestCountry] = useState("all");
  const [fPort, setFPort] = useState("all");
  const [fSearch, setFSearch] = useState("");
  const [fSort, setFSort] = useState("name");

  // ── Filter option lists (derived once) ──
  const CATEGORIES = useMemo(
    () => ["all", ...new Set(PRODUCTS.map((p) => p.subcategory))],
    []
  );
  const DEST_COUNTRIES = useMemo(
    () => ["all", ...new Set(PRODUCTS.flatMap((p) => p.destinations.map((d) => d.country)))].sort(),
    []
  );
  const PORTS = useMemo(
    () => ["all", ...new Set(PRODUCTS.flatMap((p) => p.destinations.map((d) => d.name)))].sort(),
    []
  );

  const priceOf = (it: MapItem) =>
    it.offer ? parseFloat(it.offer.price.replace(/[^0-9.]/g, "")) : Number.POSITIVE_INFINITY;

  const filteredItems = useMemo(() => {
    const q = fSearch.trim().toLowerCase();
    let list = MAP_ITEMS.filter((it) => {
      if (fKind !== "all" && it.kind !== fKind) return false;
      const cat = it.product.subcategory;
      if (fCategory !== "all" && cat !== fCategory) return false;
      if (fDestCountry !== "all" && !it.product.destinations.some((d) => d.country === fDestCountry)) return false;
      if (fPort !== "all" && !it.product.destinations.some((d) => d.name === fPort)) return false;
      if (q) {
        const loc = it.kind === "offer" ? it.offer!.country : it.product.origin.country;
        if (!`${it.product.name} ${loc} ${cat}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    if (fSort === "price_asc") list = [...list].sort((a, b) => priceOf(a) - priceOf(b));
    else if (fSort === "price_desc") list = [...list].sort((a, b) => priceOf(b) - priceOf(a));
    else if (fSort === "offers_first")
      list = [...list].sort((a, b) => (a.kind === "offer" ? 0 : 1) - (b.kind === "offer" ? 0 : 1));
    else list = [...list].sort((a, b) => a.product.name.localeCompare(b.product.name));
    return list;
  }, [fKind, fCategory, fDestCountry, fPort, fSearch, fSort]);

  function resetFilters() {
    setFKind("all");
    setFCategory("all");
    setFDestCountry("all");
    setFPort("all");
    setFSearch("");
    setFSort("name");
  }

  // How many filters are currently applied (sort excluded — it isn't a filter).
  const activeFilterCount =
    (fKind !== "all" ? 1 : 0) +
    (fCategory !== "all" ? 1 : 0) +
    (fDestCountry !== "all" ? 1 : 0) +
    (fPort !== "all" ? 1 : 0) +
    (fSearch.trim() ? 1 : 0);

  return {
    fKind, setFKind,
    fCategory, setFCategory,
    fDestCountry, setFDestCountry,
    fPort, setFPort,
    fSearch, setFSearch,
    CATEGORIES, DEST_COUNTRIES, PORTS,
    filteredItems, activeFilterCount, resetFilters,
  };
}
