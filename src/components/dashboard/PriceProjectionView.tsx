"use client";

import { useState, useEffect, useMemo } from "react";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { useLatestRun, useEDA, useForecast } from "@/hooks/trade/useEDA";
import { EDAFilters } from "@/components/eda/EDAFilters";
import { CIFPriceLineChart } from "@/components/eda/CIFPriceLineChart";
import { CIFPriceMetrics } from "@/components/eda/CIFPriceMetrics";
import { CIFPriceDistribution } from "@/components/eda/CIFPriceDistribution";
import { CIFPriceHeatmap } from "@/components/eda/CIFPriceHeatmap";
import { CIFPriceRolling } from "@/components/eda/CIFPriceRolling";
import { ExternalFeaturesChart } from "@/components/eda/ExternalFeaturesChart";
import { ExternalFeaturesExplainer } from "@/components/eda/ExternalFeaturesExplainer";
import { ProjectionFilters } from "@/components/projection/ProjectionFilters";
import { ProjectionChart } from "@/components/projection/ProjectionChart";
import { ModelComparisonChart } from "@/components/projection/ModelComparisonChart";
import { MetricsTable } from "@/components/projection/MetricsTable";
import { LastVsProjected } from "@/components/projection/LastVsProjected";
import { ModelConfidence } from "@/components/projection/ModelConfidence";
import { ProjectedValuesTable } from "@/components/projection/ProjectedValuesTable";
import { ForecastFrequency, DAILY_HORIZONS, MONTHLY_HORIZONS } from "@/app/interfaces/trade/projection";
import { formatDateTime } from "@/app/lib/functions/formatters";
import { BarChart3, Clock, Database, LineChart, Loader2, Sparkles } from "lucide-react";
import { CardHeader } from "@/components/trade/CardHeader";

type SubTab = "analysis" | "forecast";

const AVAILABLE_YEARS = [2026, 2025, 2024, 2023, 2022];

export function PriceProjectionView() {
  const locale = useDashboard((s) => s.locale);
  const t = getTranslation(locale);
  const { run, loading: runLoading, error: runError } = useLatestRun();

  const [subTab, setSubTab] = useState<SubTab>("analysis");
  const [analysisProduct, setAnalysisProduct] = useState<string>("all");
  const [analysisYear, setAnalysisYear] = useState<number | null>(null);
  const [analysisMonth, setAnalysisMonth] = useState<number | null>(null);
  const [analysisFrequency, setAnalysisFrequency] = useState<ForecastFrequency>("M");
  const [forecastFrequency, setForecastFrequency] = useState<ForecastFrequency>("M");
  const [forecastHorizon, setForecastHorizon] = useState<number>(6);
  const [forecastProduct, setForecastProduct] = useState<string>("");

  const {
    metrics,
    series,
    external,
    productsAvailable: analysisProducts,
    loading: edaLoading,
    error: edaError,
  } = useEDA(analysisProduct, analysisYear, analysisMonth);

  const {
    points,
    metrics: forecastMetrics,
    productsAvailable: forecastProducts,
    loading: forecastLoading,
    error: forecastError,
  } = useForecast(run, forecastProduct, forecastFrequency, forecastHorizon);

  useEffect(() => {
    if (!forecastProduct && (forecastProducts.length > 0 || run?.products?.length)) {
      setForecastProduct((forecastProducts[0] ?? run?.products?.[0]) || "");
    }
  }, [forecastProducts, forecastProduct, run]);

  useEffect(() => {
    if (analysisProduct === "all" && analysisProducts.length > 0) {
      setAnalysisProduct(analysisProducts[0]);
    }
  }, [analysisProducts, analysisProduct]);

  useEffect(() => {
    const valid = (forecastFrequency === "D"
      ? DAILY_HORIZONS
      : MONTHLY_HORIZONS) as readonly number[];
    if (!valid.includes(forecastHorizon)) {
      setForecastHorizon(valid[0]);
    }
  }, [forecastFrequency, forecastHorizon]);

  const analysisProductLabel = useMemo(() => {
    if (analysisProduct === "all") return t.filters.all;
    return analysisProduct;
  }, [analysisProduct, t]);

  const forecastProductLabel = useMemo(
    () => forecastProduct || "-",
    [forecastProduct]
  );

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
      <CardHeader title={t.projection.title} subtitle={t.projection.subtitle} />

      <div className="flex flex-wrap items-center gap-1 border-b border-navy-line">
        <button
          type="button"
          onClick={() => setSubTab("analysis")}
            className={`flex min-h-11 items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors sm:px-4 ${
            subTab === "analysis"
              ? "border-blue-soft text-white"
              : "border-transparent text-gray-4 hover:text-gray-3"
          }`}
          role="tab"
          aria-selected={subTab === "analysis"}
        >
          <BarChart3 className="w-4 h-4" />
          {t.projection.subTabAnalysis}
        </button>
        <button
          type="button"
          onClick={() => setSubTab("forecast")}
            className={`flex min-h-11 items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors sm:px-4 ${
            subTab === "forecast"
              ? "border-blue-soft text-white"
              : "border-transparent text-gray-4 hover:text-gray-3"
          }`}
          role="tab"
          aria-selected={subTab === "forecast"}
        >
          <Sparkles className="w-4 h-4" />
          {t.projection.subTabForecast}
        </button>
      </div>

      {runLoading && (
        <div className="bg-navy-card border border-navy-line rounded-lg p-5 flex items-center justify-center text-gray-4">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          {t.common.loading}
        </div>
      )}

      {runError && (
        <div className="bg-red/10 border border-red/30 rounded-md p-4 text-red text-sm">
          {t.common.error}: {runError}
        </div>
      )}

      {subTab === "analysis" && (
        <>
          <div className="flex items-center gap-3 text-[11px] text-gray-4 flex-wrap">
            <span className="flex items-center gap-1.5 px-2 py-1 bg-navy-card border border-navy-line rounded-sm">
              <Clock className="w-3 h-3" />
              {t.eda.lastUpdate}:{" "}
              {formatDateTime(metrics[0]?.refreshed_at ?? null)}
            </span>
            <span className="flex items-center gap-1.5 px-2 py-1 bg-navy-card border border-navy-line rounded-sm">
              <LineChart className="w-3 h-3" />
              {analysisProductLabel} ·{" "}
              {analysisFrequency === "D" ? t.eda.daily : t.eda.monthly}
            </span>
            <span className="flex items-center gap-1.5 px-2 py-1 bg-navy-card border border-navy-line rounded-sm">
              <Database className="w-3 h-3" />
              {analysisProducts.length} products
            </span>
          </div>

          {edaError && (
            <div className="bg-red/10 border border-red/30 rounded-md p-4 text-red text-sm">
              {t.common.error}: {edaError}
            </div>
          )}

          {!edaLoading && analysisProducts.length === 0 && (
            <div className="bg-navy-card border border-navy-line rounded-lg p-8 text-center">
              <Database className="w-10 h-10 text-gray-5 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white mb-1">
                {t.eda.noData}
              </h3>
              <p className="text-sm text-gray-4">{t.eda.noDataHint}</p>
            </div>
          )}

          {analysisProducts.length > 0 && (
            <>
              <EDAFilters
                productsAvailable={analysisProducts}
                selectedProduct={analysisProduct}
                onProductChange={setAnalysisProduct}
                selectedYear={analysisYear}
                onYearChange={setAnalysisYear}
                selectedMonth={analysisMonth}
                onMonthChange={setAnalysisMonth}
                availableYears={AVAILABLE_YEARS}
                frequency={analysisFrequency}
                onFrequencyChange={setAnalysisFrequency}
                loading={edaLoading}
              />

              <CIFPriceMetrics metrics={metrics} loading={edaLoading} />

              <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-3 xl:gap-6">
                <div className="min-w-0 xl:col-span-2">
                  <CIFPriceLineChart
                    data={series}
                    loading={edaLoading}
                    frequency={analysisFrequency}
                  />
                </div>
                <CIFPriceDistribution data={series} loading={edaLoading} />
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-6">
                <CIFPriceHeatmap
                  data={series}
                  loading={edaLoading}
                  productsAvailable={analysisProducts}
                />
                <CIFPriceRolling
                  data={series}
                  loading={edaLoading}
                  frequency={analysisFrequency}
                />
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-6">
                <ExternalFeaturesChart
                  metrics={metrics}
                  external={external}
                  loading={edaLoading}
                />
                <ExternalFeaturesExplainer
                  metrics={metrics}
                  loading={edaLoading}
                />
              </div>
            </>
          )}
        </>
      )}

      {subTab === "forecast" && (
        <>
          {!runLoading && !run && (
            <div className="bg-navy-card border border-navy-line rounded-lg p-8 text-center">
              <Database className="w-10 h-10 text-gray-5 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white mb-1">
                {t.projection.noData}
              </h3>
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
                  {forecastProductLabel} ·{" "}
                  {forecastFrequency === "D"
                    ? t.projection.daily
                    : t.projection.monthly}{" "}
                  · {forecastHorizon}
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

              <LastVsProjected
                points={points}
                loading={forecastLoading}
                frequency={forecastFrequency}
                horizon={forecastHorizon}
              />

              <ModelConfidence
                points={points}
                metrics={forecastMetrics}
                loading={forecastLoading}
              />

              <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-3 xl:gap-6">
                <div className="min-w-0 xl:col-span-2">
                  <ProjectionChart
                    points={points}
                    loading={forecastLoading}
                    frequency={forecastFrequency}
                    product={forecastProductLabel}
                  />
                </div>
                <ModelComparisonChart
                  metrics={forecastMetrics}
                  loading={forecastLoading}
                />
              </div>

              <MetricsTable
                metrics={forecastMetrics}
                loading={forecastLoading}
              />

              <ProjectedValuesTable
                points={points}
                loading={forecastLoading}
                frequency={forecastFrequency}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
