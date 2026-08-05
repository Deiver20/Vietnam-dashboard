"use client";

import { useMemo } from "react";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { TradeOverviewItem, TradeTotalImports, TradeTimelineItem } from "@/app/interfaces/trade/interface";
import { formatVolume, formatYearRange } from "@/app/lib/functions/formatters";
import { TrendingUp, Globe, Package, Calendar } from "lucide-react";
import type { ReactNode } from "react";

interface InsightsViewProps {
  overview: TradeOverviewItem[];
  totals: TradeTotalImports | null;
  timeline: TradeTimelineItem[];
}

interface InsightCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  variant?: "blue" | "green" | "yellow";
}

function InsightCard({ icon, label, value, sub, variant = "blue" }: InsightCardProps) {
  const variantClasses = {
    blue: "from-blue/20 to-blue-2/10 text-blue-soft",
    green: "from-green/20 to-green-2/10 text-green",
    yellow: "from-yellow/20 to-yellow/10 text-yellow",
  };

  return (
    <div className="p-3 rounded-md bg-navy-card/60 border border-navy-line hover:border-blue/30 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-sm bg-gradient-to-br ${variantClasses[variant]} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-[11px] uppercase tracking-wider text-gray-4 font-semibold">{label}</span>
      </div>
      <p className="text-base font-bold text-white font-mono">{value}</p>
      {sub && <p className="text-xs text-gray-3 mt-1">{sub}</p>}
    </div>
  );
}

export function InsightsView({ overview, totals, timeline }: InsightsViewProps) {
  const { locale, filters } = useDashboard();
  const t = getTranslation(locale);

  const insights = useMemo(() => {
    const sorted = [...overview].sort((a, b) => b.totalMt - a.totalMt);
    const topCountry = sorted[0];
    const totalVolume = totals?.totalMt ?? sorted.reduce((sum, item) => sum + item.totalMt, 0);
    const topCountryShare = topCountry && totalVolume > 0
      ? (topCountry.totalMt / totalVolume) * 100
      : 0;

    const latestYear = timeline[timeline.length - 1];
    const previousYear = timeline[timeline.length - 2];
    const yearGrowth = latestYear && previousYear && previousYear.totalMt > 0
      ? ((latestYear.totalMt - previousYear.totalMt) / previousYear.totalMt) * 100
      : 0;

    return {
      topCountry,
      topCountryShare,
      totalVolume,
      yearRange: [filters.yearStart, filters.yearEnd] as [number, number],
      latestYear: latestYear?.year,
      yearGrowth,
    };
  }, [overview, totals, timeline, filters.yearStart, filters.yearEnd]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-3">{t.panel.askAboutData}</p>

      <InsightCard
        icon={<TrendingUp className="w-3.5 h-3.5" />}
        label={t.panel.totalVolume}
        value={formatVolume(insights.totalVolume)}
        sub={insights.topCountry ? `${insights.topCountry.country} leads with ${insights.topCountryShare.toFixed(1)}%` : undefined}
        variant="blue"
      />

      <InsightCard
        icon={<Globe className="w-3.5 h-3.5" />}
        label={t.panel.topCountry}
        value={insights.topCountry?.country ?? "-"}
        sub={insights.topCountry ? formatVolume(insights.topCountry.totalMt) : undefined}
        variant="green"
      />

      <InsightCard
        icon={<Package className="w-3.5 h-3.5" />}
        label={t.panel.topProduct}
        value={totals ? `${totals.products}` : "-"}
        sub={totals ? `${totals.countries} countries` : undefined}
        variant="yellow"
      />

      <InsightCard
        icon={<Calendar className="w-3.5 h-3.5" />}
        label={t.panel.yearRange}
        value={formatYearRange(insights.yearRange[0], insights.yearRange[1])}
        sub={insights.latestYear ? `${insights.yearGrowth >= 0 ? "+" : ""}${insights.yearGrowth.toFixed(1)}% vs previous year` : undefined}
      />
    </div>
  );
}
