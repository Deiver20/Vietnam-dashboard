"use client";

import { memo, useMemo } from "react";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { EDASeriesPoint, ForecastFrequency } from "@/app/interfaces/trade/projection";
import { KpiCard } from "@/components/ui/KpiCard";
import { Loader2, TrendingUp, Activity, BarChart3, Hash } from "lucide-react";
import { formatCIFPrice, formatNumber } from "@/app/lib/functions/formatters";

interface CIFPriceMetricsProps {
  series: EDASeriesPoint[];
  loading: boolean;
  frequency: ForecastFrequency;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stddev(values: number[]): number {
  const m = mean(values);
  if (values.length < 2) return 0;
  const variance = values.reduce((acc, v) => acc + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function useMetrics(series: EDASeriesPoint[], frequency: ForecastFrequency) {
  return useMemo(() => {
    // Filtrar por frecuencia: en "Mensual" solo las filas mensuales (cuyo
    // último valor ya es el promedio del último mes), en "Diario" el resto.
    const byFreq = series.filter((p) =>
      frequency === "M" ? p.frequency === "M" : p.frequency !== "M"
    );
    const minYear = new Date().getUTCFullYear() - 2;
    const visible = byFreq.filter((p) => parseInt(p.date.slice(0, 4), 10) >= minYear);
    const source = visible.length > 0 ? visible : byFreq;

    const prices = source
      .map((p) => p.cif_price)
      .filter((v): v is number => v !== null && !Number.isNaN(v));

    if (prices.length === 0) return null;

    // "Precio Actual": último valor de la serie filtrada por frecuencia. En
    // mensual coincide con el "Último precio conocido" del forecast.
    const current = prices[prices.length - 1];

    const avg = mean(prices);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const cv = avg > 0 ? stddev(prices) / avg : 0;
    const dataPoints = source.reduce((acc, p) => acc + (p.transactions ?? 0), 0);
    const latestDate = source
      .map((p) => p.date)
      .filter(Boolean)
      .sort()
      .reverse()[0];

    return { current, avg, min, max, cv, dataPoints, latestDate };
  }, [series, frequency]);
}

export const CIFPriceMetrics = memo(function CIFPriceMetrics({ series, loading, frequency }: CIFPriceMetricsProps) {
  const locale = useDashboard((s) => s.locale);
  const t = getTranslation(locale);
  const metrics = useMetrics(series, frequency);

  if (loading && series.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[180px] flex items-center justify-center text-gray-4">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[180px] flex items-center justify-center text-gray-4 text-sm">
        {t.eda.noData}
      </div>
    );
  }

  const { current, avg, min, max, cv, dataPoints, latestDate } = metrics;

  return (
    <div className="bg-navy-card border border-navy-line rounded-lg p-5 flex flex-col">
      <h3 className="text-sm font-semibold text-white mb-3">{t.eda.cifPriceMetrics}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-6">
        <KpiCard
          label={t.eda.currentPrice}
          value={formatCIFPrice(current)}
          icon={<TrendingUp className="w-4 h-4" />}
          variant="blue"
        />
        <KpiCard
          label={t.eda.meanPrice}
          value={formatCIFPrice(avg)}
          icon={<BarChart3 className="w-4 h-4" />}
          variant="green"
        />
        <KpiCard
          label={t.eda.minPrice}
          value={formatCIFPrice(min)}
          icon={<Activity className="w-4 h-4" />}
          variant="yellow"
        />
        <KpiCard
          label={t.eda.maxPrice}
          value={formatCIFPrice(max)}
          icon={<Activity className="w-4 h-4" />}
          variant="yellow"
        />
        <KpiCard
          label={t.eda.volatility}
          value={`${(cv * 100).toFixed(1)}%`}
          icon={<TrendingUp className="w-4 h-4" />}
          variant="blue"
        />
        <KpiCard
          label={t.eda.dataPoints}
          value={formatNumber(dataPoints)}
          sub={latestDate ? `${t.eda.lastUpdate}: ${latestDate}` : undefined}
          icon={<Hash className="w-4 h-4" />}
          variant="blue"
        />
      </div>
    </div>
  );
});
