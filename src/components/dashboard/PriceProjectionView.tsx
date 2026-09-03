"use client";

import { useState, useEffect, useMemo, startTransition } from "react";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { useLatestRun, useEDA, useForecast, TradeScope } from "@/hooks/trade/useEDA";
import { AnalysisContent } from "@/components/dashboard/AnalysisContent";
import { ForecastContent } from "@/components/dashboard/ForecastContent";
import { ForecastFrequency, DAILY_HORIZONS, MONTHLY_HORIZONS } from "@/app/interfaces/trade/projection";
import { BarChart3, Sparkles } from "lucide-react";
import { CardHeader } from "@/components/trade/CardHeader";
import { useScopeLight } from "@/app/lib/functions/chartPalette";

type SubTab = "analysis" | "forecast";

function normalizeScope(filters: { countryCode?: string; industry?: string; flow?: string }): TradeScope {
  return {
    countryCode: filters.countryCode,
    industry: filters.industry,
    flow: filters.flow === "imports" ? "Imp" : filters.flow === "exports" ? "Exp" : filters.flow,
  };
}

export function PriceProjectionView() {
  const locale = useDashboard((s) => s.locale);
  const t = getTranslation(locale);
  const { ref: rootRef, light } = useScopeLight();
  const filters = useDashboard((s) => s.filters);
  const scope = useMemo(() => normalizeScope(filters), [filters]);
  const { run, loading: runLoading, error: runError } = useLatestRun(scope);

  const [subTab, setSubTab] = useState<SubTab>("analysis");
  const [visitedTabs, setVisitedTabs] = useState<{ analysis: boolean; forecast: boolean }>({
    analysis: true,
    forecast: false,
  });
  const [analysisProduct, setAnalysisProduct] = useState<string>("all");
  const [analysisYear, setAnalysisYear] = useState<number | null>(null);
  const [analysisMonth, setAnalysisMonth] = useState<number | null>(null);
  const [forecastFrequency, setForecastFrequency] = useState<ForecastFrequency>("M");
  const [forecastHorizon, setForecastHorizon] = useState<number>(6);
  const [forecastProduct, setForecastProduct] = useState<string>("");

  const {
    metrics,
    series,
    candles,
    external,
    productsAvailable: analysisProducts,
    loading: edaLoading,
    error: edaError,
  } = useEDA(analysisProduct, analysisYear, analysisMonth, scope);

  const {
    points,
    metrics: forecastMetrics,
    productsAvailable: forecastProducts,
    loading: forecastLoading,
    error: forecastError,
  } = useForecast(run, forecastProduct, forecastFrequency, forecastHorizon, subTab === "forecast", scope);

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
    const valid = (forecastFrequency === "D" ? DAILY_HORIZONS : MONTHLY_HORIZONS) as readonly number[];
    if (!valid.includes(forecastHorizon)) {
      setForecastHorizon(valid[0]);
    }
  }, [forecastFrequency, forecastHorizon]);

  const analysisProductLabel = useMemo(() => {
    if (analysisProduct === "all") return t.filters.all;
    return analysisProduct;
  }, [analysisProduct, t]);

  const forecastProductLabel = useMemo(() => forecastProduct || "-", [forecastProduct]);

  return (
    <div ref={rootRef} className="flex min-w-0 flex-col gap-4 sm:gap-6">
      <CardHeader
        title={t.projection.title}
        subtitle={t.projection.subtitle}
        subtitleColor={light ? "#06254B" : "#c5c6cc"}
      />

      <div className="flex flex-wrap items-center gap-1 border-b border-navy-line">
        <button
          type="button"
          onClick={() =>
            startTransition(() => {
              setSubTab("analysis");
              setVisitedTabs((v) => ({ ...v, analysis: true }));
            })
          }
          className={`flex min-h-11 items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors sm:px-4 ${
            subTab === "analysis"
              ? light
                ? "border-blue-soft text-[#06254B]"
                : "border-blue-soft text-white"
              : light
                ? "border-transparent text-[#06254B] hover:text-[#03488D]"
                : "border-transparent text-[#9aa7bd] hover:text-[#c5c6cc]"
          }`}
          role="tab"
          aria-selected={subTab === "analysis"}
        >
          <BarChart3 className="w-4 h-4" />
          {t.projection.subTabAnalysis}
        </button>
        <button
          type="button"
          onClick={() =>
            startTransition(() => {
              setSubTab("forecast");
              setVisitedTabs((v) => ({ ...v, forecast: true }));
            })
          }
          className={`flex min-h-11 items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors sm:px-4 ${
            subTab === "forecast"
              ? light
                ? "border-blue-soft text-[#06254B]"
                : "border-blue-soft text-white"
              : light
                ? "border-transparent text-[#06254B] hover:text-[#03488D]"
                : "border-transparent text-[#9aa7bd] hover:text-[#c5c6cc]"
          }`}
          role="tab"
          aria-selected={subTab === "forecast"}
        >
          <Sparkles className="w-4 h-4" />
          {t.projection.subTabForecast}
        </button>
      </div>

      <div>
        {visitedTabs.analysis && (
          <div className={subTab === "analysis" ? "block" : "hidden"}>
            <AnalysisContent
              metrics={metrics}
              series={series}
              candles={candles}
              external={external}
              analysisProducts={analysisProducts}
              edaLoading={edaLoading}
              edaError={edaError}
              analysisProduct={analysisProduct}
              setAnalysisProduct={setAnalysisProduct}
              analysisYear={analysisYear}
              setAnalysisYear={setAnalysisYear}
              analysisMonth={analysisMonth}
              setAnalysisMonth={setAnalysisMonth}
              analysisProductLabel={analysisProductLabel}
              countryCode={scope.countryCode}
            />
          </div>
        )}

        {visitedTabs.forecast && (
          <div className={subTab === "forecast" ? "block" : "hidden"}>
            <ForecastContent
              run={run}
              runLoading={runLoading}
              runError={runError}
              points={points}
              forecastMetrics={forecastMetrics}
              forecastProducts={forecastProducts}
              forecastLoading={forecastLoading}
              forecastError={forecastError}
              forecastProduct={forecastProduct}
              setForecastProduct={setForecastProduct}
              forecastFrequency={forecastFrequency}
              setForecastFrequency={setForecastFrequency}
              forecastHorizon={forecastHorizon}
              setForecastHorizon={setForecastHorizon}
              forecastProductLabel={forecastProductLabel}
            />
          </div>
        )}
      </div>
    </div>
  );
}
