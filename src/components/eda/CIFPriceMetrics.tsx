"use client";

import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { EDAMetric } from "@/app/interfaces/trade/projection";
import { KpiCard } from "@/components/ui/KpiCard";
import { Loader2, TrendingUp, Activity, BarChart3, Calendar, Hash } from "lucide-react";
import { formatCIFPrice, formatNumber } from "@/app/lib/functions/formatters";

interface CIFPriceMetricsProps {
  metrics: EDAMetric[];
  loading: boolean;
}

export function CIFPriceMetrics({ metrics, loading }: CIFPriceMetricsProps) {
  const locale = useDashboard((s) => s.locale);
  const t = getTranslation(locale);

  if (loading && metrics.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[180px] flex items-center justify-center text-gray-4">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[180px] flex items-center justify-center text-gray-4 text-sm">
        {t.eda.noData}
      </div>
    );
  }

  const agg = metrics.reduce(
    (acc, m) => {
      if (m.current_price !== null) {
        acc.current += m.current_price;
        acc.currentCount += 1;
      }
      if (m.mean_price !== null) {
        acc.mean += m.mean_price;
        acc.meanCount += 1;
      }
      if (m.min_price !== null) acc.min = Math.min(acc.min, m.min_price);
      if (m.max_price !== null) acc.max = Math.max(acc.max, m.max_price);
      if (m.volatility !== null) {
        acc.vol += m.volatility;
        acc.volCount += 1;
      }
      if (m.data_points !== null) acc.dp += m.data_points;
      return acc;
    },
    { current: 0, currentCount: 0, mean: 0, meanCount: 0, min: Infinity, max: -Infinity, vol: 0, volCount: 0, dp: 0 }
  );

  const currentAvg = agg.currentCount > 0 ? agg.current / agg.currentCount : null;
  const meanAvg = agg.meanCount > 0 ? agg.mean / agg.meanCount : null;
  const volAvg = agg.volCount > 0 ? agg.vol / agg.volCount : null;
  const latestDate = metrics
    .map((m) => m.last_date)
    .filter((d): d is string => Boolean(d))
    .sort()
    .reverse()[0];

  return (
    <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[180px] flex flex-col">
      <h3 className="text-sm font-semibold text-white mb-3">{t.eda.cifPriceMetrics}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 flex-1">
        <KpiCard
          label={t.eda.currentPrice}
          value={currentAvg !== null ? formatCIFPrice(currentAvg) : "-"}
          icon={<TrendingUp className="w-4 h-4" />}
          variant="blue"
        />
        <KpiCard
          label={t.eda.meanPrice}
          value={meanAvg !== null ? formatCIFPrice(meanAvg) : "-"}
          icon={<BarChart3 className="w-4 h-4" />}
          variant="green"
        />
        <KpiCard
          label={t.eda.minPrice}
          value={agg.min === Infinity ? "-" : formatCIFPrice(agg.min)}
          icon={<Activity className="w-4 h-4" />}
          variant="yellow"
        />
        <KpiCard
          label={t.eda.maxPrice}
          value={agg.max === -Infinity ? "-" : formatCIFPrice(agg.max)}
          icon={<Activity className="w-4 h-4" />}
          variant="yellow"
        />
        <KpiCard
          label={t.eda.volatility}
          value={volAvg !== null ? `${(volAvg * 100).toFixed(1)}%` : "-"}
          icon={<TrendingUp className="w-4 h-4" />}
          variant="blue"
        />
        <KpiCard
          label={t.eda.dataPoints}
          value={formatNumber(agg.dp)}
          sub={latestDate ? `${t.eda.lastUpdate}: ${latestDate}` : undefined}
          icon={<Hash className="w-4 h-4" />}
          variant="blue"
        />
      </div>
    </div>
  );
}
