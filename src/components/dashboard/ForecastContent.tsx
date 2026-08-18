"use client";

import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { ForecastRun, ForecastPoint, ForecastMetric, ForecastFrequency } from "@/app/interfaces/trade/projection";
import { formatDateTime } from "@/app/lib/functions/formatters";
import { ProjectionFilters } from "@/components/projection/ProjectionFilters";
import { ProjectionChart } from "@/components/projection/ProjectionChart";
import { ModelComparisonChart } from "@/components/projection/ModelComparisonChart";
import { MetricsTable } from "@/components/projection/MetricsTable";
import { LastVsProjected } from "@/components/projection/LastVsProjected";
import { ModelConfidence } from "@/components/projection/ModelConfidence";
import { ProjectedValuesTable } from "@/components/projection/ProjectedValuesTable";
import { Clock, Database, Loader2 } from "lucide-react";

export interface ForecastContentProps {
  run: ForecastRun | null;
  runLoading: boolean;
  runError: string | null;
  points: ForecastPoint[];
  forecastMetrics: ForecastMetric[];
  forecastProducts: string[];
  forecastLoading: boolean;
  forecastError: string | null;
  forecastProduct: string;
  setForecastProduct: (p: string) => void;
  forecastFrequency: ForecastFrequency;
  setForecastFrequency: (f: ForecastFrequency) => void;
  forecastHorizon: number;
  setForecastHorizon: (h: number) => void;
  forecastProductLabel: string;
}

export function ForecastContent({
  run,
  runLoading,
  runError,
  points,
  forecastMetrics,
  forecastProducts,
  forecastLoading,
  forecastError,
  forecastProduct,
  setForecastProduct,
  forecastFrequency,
  setForecastFrequency,
  forecastHorizon,
  setForecastHorizon,
  forecastProductLabel,
}: ForecastContentProps) {
  const locale = useDashboard((s) => s.locale);
  const t = getTranslation(locale);

  if (runLoading) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 flex items-center justify-center text-gray-4">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
      {runError && (
        <div className="bg-red/10 border border-red/30 rounded-md p-4 text-red text-sm">
          {t.common.error}: {runError}
        </div>
      )}

      {!runLoading && !run && (
        <div className="bg-navy-card border border-navy-line rounded-lg p-8 text-center">
          <Database className="w-10 h-10 text-gray-5 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">{t.projection.noData}</h3>
          <p className="text-sm text-gray-4">{t.projection.noDataHint}</p>
        </div>
      )}

      {run && (
        <>
          <div className="flex items-center gap-3 text-[11px] text-gray-4 flex-wrap">
            <span className="flex items-center gap-1.5 px-2 py-1 bg-navy-card border border-navy-line rounded-sm">
              <Clock className="w-3 h-3" />
              {t.eda.lastUpdate}: {formatDateTime(run.completed_at)}
            </span>
            <span className="flex items-center gap-1.5 px-2 py-1 bg-navy-card border border-navy-line rounded-sm">
              <Database className="w-3 h-3" />
              {forecastProductLabel} · {forecastFrequency === "D" ? t.projection.daily : t.projection.monthly} · {forecastHorizon}
            </span>
          </div>

          {forecastError && (
            <div className="bg-red/10 border border-red/30 rounded-md p-4 text-red text-sm">
              {t.common.error}: {forecastError}
            </div>
          )}

          <ProjectionFilters
            productsAvailable={forecastProducts}
            selectedProduct={forecastProduct}
            onProductChange={setForecastProduct}
            frequency={forecastFrequency}
            onFrequencyChange={setForecastFrequency}
            horizon={forecastHorizon}
            onHorizonChange={setForecastHorizon}
            loading={forecastLoading}
          />

          <LastVsProjected points={points} loading={forecastLoading} frequency={forecastFrequency} horizon={forecastHorizon} />

          <ModelConfidence points={points} metrics={forecastMetrics} loading={forecastLoading} />

          <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-3 xl:gap-6">
            <div className="min-w-0 xl:col-span-2">
              <ProjectionChart points={points} loading={forecastLoading} frequency={forecastFrequency} product={forecastProductLabel} />
            </div>
            <ModelComparisonChart metrics={forecastMetrics} loading={forecastLoading} />
          </div>

          <MetricsTable metrics={forecastMetrics} loading={forecastLoading} />

          <ProjectedValuesTable points={points} loading={forecastLoading} frequency={forecastFrequency} />
        </>
      )}
    </div>
  );
}
