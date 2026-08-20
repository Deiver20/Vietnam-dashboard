"use client";

import { useMemo, useState } from "react";
import { CARDS, COUNTRIES, PRODUCTS } from "@/app/(marketing)/data/datasets";
import type { IndustryFilters } from "@/interfaces/data/interface";

/** Filter state for one /data/[industry] page: country, data type and
    product. Industry itself is the route segment. */
export function useIndustryFilters(industryKey: string): IndustryFilters {
  const [fCountry, setFCountry] = useState("all");
  const [fType, setFType] = useState("all");
  const [fProduct, setFProduct] = useState("all");

  /* Data-product cards of this industry, narrowed by the filters. */
  const visibleCards = useMemo(() => {
    return CARDS.filter((d) => {
      if (d.cat !== industryKey) return false;
      if (!COUNTRIES[d.country]) return false;
      if (fCountry !== "all" && d.country !== fCountry) return false;
      if (fType !== "all" && d.type !== fType) return false;
      return true;
    });
  }, [industryKey, fCountry, fType]);

  /* Countries offered by the Country strip: everywhere this industry has a
     data product or a priced product row. */
  const usedCountries = useMemo(() => {
    const codes = new Set<string>();
    CARDS.forEach((d) => {
      if (d.cat === industryKey) codes.add(d.country);
    });
    (PRODUCTS[industryKey] ?? []).forEach((p) => p.rows.forEach((r) => codes.add(r.country)));
    return Object.keys(COUNTRIES).filter((code) => codes.has(code));
  }, [industryKey]);

  const activeCount =
    (fCountry !== "all" ? 1 : 0) +
    (fType !== "all" ? 1 : 0) +
    (fProduct !== "all" ? 1 : 0);

  const resetAll = () => {
    setFCountry("all");
    setFType("all");
    setFProduct("all");
  };

  return {
    fCountry, setFCountry,
    fType, setFType,
    fProduct, setFProduct,
    visibleCards,
    usedCountries,
    activeCount,
    resetAll,
  };
}
