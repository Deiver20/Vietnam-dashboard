"use client";

import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { ForecastPoint, ForecastMetric } from "@/app/interfaces/trade/projection";
import { formatCIFPrice, formatNumber } from "@/app/lib/functions/formatters";
import { KpiCard } from "@/components/ui/KpiCard";
import { Loader2, ShieldCheck, TrendingUp, Gauge } from "lucide-react";

interface ModelConfidenceProps {
  points: ForecastPoint[];
  metrics: ForecastMetric[];
  loading: boolean;
}

export function ModelConfidence({ points, metrics, loading }: ModelConfidenceProps) {
  const { locale } = useDashboard();
  const t = getTranslation(locale);

  if (loading && metrics.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[140px] flex items-center justify-center text-gray-4">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[140px] flex items-center justify-center text-gray-4 text-sm">
        {t.projection.noData}
      </div>
    );
  }

  const ensembleMetric = metrics.find((m) => m.model === "Ensemble");
  const ensembleMape = ensembleMetric?.mape ?? null;

  const ensemblePoints = points
    .filter((p) => p.model === "Ensemble" && !p.is_historical)
    .sort((a, b) => a.forecast_date.localeCompare(b.forecast_date));

  let variation = 0;
  let variationPct = 0;
  if (ensemblePoints.length >= 2) {
    const first = ensemblePoints[0].point_forecast;
    const last = ensemblePoints[ensemblePoints.length - 1].point_forecast;
    variation = last - first;
    variationPct = first !== 0 ? (variation / first) * 100 : 0;
  }

  let avgBandPct = 0;
  let avgBandUsd = 0;
  const bands = ensemblePoints.filter((p) => p.lower_bound !== null && p.upper_bound !== null);
  if (bands.length > 0) {
    let totalUsd = 0;
    let totalPct = 0;
    for (const p of bands) {
      const half = (Number(p.upper_bound!) - Number(p.lower_bound!)) / 2;
      totalUsd += half;
      totalPct += p.point_forecast !== 0 ? (half / p.point_forecast) * 100 : 0;
    }
    avgBandUsd = totalUsd / bands.length;
    avgBandPct = totalPct / bands.length;
  }

  const precisionMape = ensembleMape !== null ? ensembleMape : 0;
  const precision = 100 - precisionMape;

  let confidenceLevel: string;
  let confidenceIcon: string;
  let confidenceVariant: "green" | "yellow" | "blue";
  if (ensembleMape !== null && ensembleMape < 15) {
    confidenceLevel = t.projection.confidenceHigh;
    confidenceIcon = "\uD83D\uDFE2";
    confidenceVariant = "green";
  } else if (ensembleMape !== null && ensembleMape < 30) {
    confidenceLevel = t.projection.confidenceMedium;
    confidenceIcon = "\uD83D\uDFE1";
    confidenceVariant = "yellow";
  } else {
    confidenceLevel = t.projection.confidenceLow;
    confidenceIcon = "\uD83D\uDD34";
    confidenceVariant = "blue";
  }

  const variationIcon = variationPct > 0.5 ? TrendingUp : variationPct < -0.5 ? TrendingUp : TrendingUp;
  const variationRotation = variationPct < -0.5 ? "rotate-180" : "";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <KpiCard
        label={t.projection.ensemblePrecision}
        value={ensembleMape !== null ? `${precision.toFixed(1)}%` : "-"}
        sub={`${t.projection.mape}: ${precisionMape.toFixed(1)}%`}
        icon={<ShieldCheck className="w-4 h-4" />}
        variant="blue"
      />
      <KpiCard
        label={t.projection.modelConfidence}
        value={`${confidenceIcon} ${confidenceLevel}`}
        sub={ensembleMape !== null ? `${t.projection.mape}: ${precisionMape.toFixed(1)}%` : undefined}
        icon={<Gauge className="w-4 h-4" />}
        variant={confidenceVariant}
      />
      <KpiCard
        label={t.projection.uncertainty}
        value={avgBandUsd > 0 ? `\u00B1 ${formatCIFPrice(avgBandUsd)}` : "-"}
        sub={avgBandPct > 0 ? `\u00B1 ${avgBandPct.toFixed(1)}%` : undefined}
        icon={<TrendingUp className={`w-4 h-4 ${variationRotation}`} />}
        variant="yellow"
      />
    </div>
  );
}
