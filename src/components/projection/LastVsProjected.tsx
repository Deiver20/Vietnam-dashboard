"use client";

import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { ForecastPoint, ForecastFrequency } from "@/app/interfaces/trade/projection";
import { formatCIFPrice } from "@/app/lib/functions/formatters";
import { KpiCard } from "@/components/ui/KpiCard";
import { ArrowDownRight, ArrowUpRight, Loader2, Minus, Target } from "lucide-react";

const MESES_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatSubDate(v: string | undefined): string | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v.slice(0, 7);
  const month = MESES_ES[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${year}`;
}

interface LastVsProjectedProps {
  points: ForecastPoint[];
  loading: boolean;
  frequency: ForecastFrequency;
  horizon: number;
}

export function LastVsProjected({ points, loading, frequency, horizon }: LastVsProjectedProps) {
  const locale = useDashboard((s) => s.locale);
  const t = getTranslation(locale);

  if (loading && points.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[140px] flex items-center justify-center text-gray-4">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[140px] flex items-center justify-center text-gray-4 text-sm">
        {t.projection.noData}
      </div>
    );
  }

  const ensemble = points.filter((p) => p.model === "Ensemble");
  const sorted = [...ensemble].sort((a, b) => a.forecast_date.localeCompare(b.forecast_date));
  const historical = sorted.filter((p) => p.is_historical && p.actual_value !== null);
  const lastHistorical = historical.length > 0 ? historical[historical.length - 1] : undefined;
  const lastProjected = sorted[sorted.length - 1];

  const lastActual = lastHistorical?.actual_value ?? null;
  const projectedEnd = lastProjected?.point_forecast ?? null;
  const p10End = lastProjected?.lower_bound ?? null;
  const p90End = lastProjected?.upper_bound ?? null;

  let change = 0;
  let changePct = 0;
  if (lastActual !== null && projectedEnd !== null && lastActual !== 0) {
    change = projectedEnd - lastActual;
    changePct = (change / lastActual) * 100;
  }

  const Icon = changePct > 0.5 ? ArrowUpRight : changePct < -0.5 ? ArrowDownRight : Minus;
  const variant = changePct > 0.5 ? "yellow" : changePct < -0.5 ? "green" : "blue";

  const projectedLabel = `${t.projection.projectedEnd}${horizon}${frequency === "M" ? "m" : "d"}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard
        label={t.projection.lastActual}
        value={lastActual !== null ? formatCIFPrice(lastActual) : "-"}
        sub={formatSubDate(lastHistorical?.forecast_date)}
        icon={<Target className="w-4 h-4" />}
        variant="blue"
      />
      <KpiCard
        label={projectedLabel}
        value={projectedEnd !== null ? formatCIFPrice(projectedEnd) : "-"}
        sub={formatSubDate(lastProjected?.forecast_date)}
        icon={<Target className="w-4 h-4" />}
        variant="blue"
      />
      <KpiCard
        label={t.projection.change}
        value={`${change >= 0 ? "+" : ""}${formatCIFPrice(change)}`}
        sub={`${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`}
        icon={<Icon className="w-4 h-4" />}
        variant={variant}
      />
      <KpiCard
        label={`${t.projection.p10} – ${t.projection.p90}`}
        value={p10End !== null && p90End !== null ? `${formatCIFPrice(p10End)} – ${formatCIFPrice(p90End)}` : "-"}
        sub={p10End !== null && p90End !== null ? `± ${formatCIFPrice((p90End - p10End) / 2)}` : undefined}
        icon={<Target className="w-4 h-4" />}
        variant="yellow"
      />
    </div>
  );
}
