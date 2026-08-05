"use client";

import { useMemo } from "react";
import { useAiPanelEnv } from "./env";
import { formatVolume } from "@/app/lib/functions/formatters";

export interface InsightItem {
  id: string;
  title: string;
  description: string;
  badge: "success" | "warning" | "info";
}

/* Local analytics over the real Vietnam trade data on screen — no LLM
   involved, same contract as the AGM InsightsView (badge cards). */
export function useInsights(): { insights: InsightItem[] } {
  const { overview, totals, timeline } = useAiPanelEnv();

  const insights = useMemo<InsightItem[]>(() => {
    const items: InsightItem[] = [];

    const sorted = [...overview].sort((a, b) => b.totalMt - a.totalMt);
    const topCountry = sorted[0];
    const totalVolume =
      totals?.totalMt ?? sorted.reduce((sum, item) => sum + item.totalMt, 0);
    const topCountryShare =
      topCountry && totalVolume > 0
        ? (topCountry.totalMt / totalVolume) * 100
        : 0;

    if (topCountry) {
      items.push({
        id: "top-partner",
        title: "Top Partner Country",
        description: `${topCountry.country} leads with ${topCountryShare.toFixed(
          1
        )}% of import volume (${formatVolume(topCountry.totalMt)}).`,
        badge: "success",
      });
    }

    const latestYear = timeline[timeline.length - 1];
    const previousYear = timeline[timeline.length - 2];
    const yearGrowth =
      latestYear && previousYear && previousYear.totalMt > 0
        ? ((latestYear.totalMt - previousYear.totalMt) / previousYear.totalMt) *
          100
        : 0;

    if (latestYear) {
      items.push({
        id: "year-growth",
        title: "Year-over-Year Growth",
        description: `${yearGrowth >= 0 ? "+" : ""}${yearGrowth.toFixed(
          1
        )}% vs the previous year (${latestYear.year}).`,
        badge: yearGrowth >= 0 ? "success" : "warning",
      });
    }

    if (totals) {
      items.push({
        id: "trade-volume",
        title: "Trade Volume",
        description: `${formatVolume(totals.totalMt)} imported across ${
          totals.records
        } records (${totals.products} products, ${totals.countries} countries).`,
        badge: "info",
      });
    }

    if (totals?.importers) {
      items.push({
        id: "active-markets",
        title: "Active Markets",
        description: `${totals.importers} importers and ${totals.exporters} exporters active in the selected period.`,
        badge: "info",
      });
    }

    return items.slice(0, 6);
  }, [overview, totals, timeline]);

  return { insights };
}
