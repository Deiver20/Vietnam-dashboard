"use client";

import { useMemo, useState } from "react";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { EDAMetric, EDASeriesPoint, EDACandle, ExternalFeature, ForecastFrequency } from "@/app/interfaces/trade/projection";
import { formatDateTime } from "@/app/lib/functions/formatters";
import { EDAFilters } from "@/components/eda/EDAFilters";
import { CIFPriceMetrics } from "@/components/eda/CIFPriceMetrics";
import { CIFPriceLineChart } from "@/components/eda/CIFPriceLineChart";
import { CIFPriceDistribution } from "@/components/eda/CIFPriceDistribution";
import { CIFPriceHeatmap } from "@/components/eda/CIFPriceHeatmap";
import { ProteinEconomics } from "@/components/eda/ProteinEconomics";
import { CIFPriceCandles } from "@/components/eda/CIFPriceCandles";
import { ExternalFeaturesChart } from "@/components/eda/ExternalFeaturesChart";
import { ChartSkeleton } from "@/components/eda/ChartSkeleton";
import { DeferredMount } from "@/components/eda/DeferredMount";
import { BarChart3, Clock, Database, LineChart } from "lucide-react";

const AVAILABLE_YEARS = [new Date().getUTCFullYear(), new Date().getUTCFullYear() - 1, new Date().getUTCFullYear() - 2];

export interface AnalysisContentProps {
  metrics: EDAMetric[];
  series: EDASeriesPoint[];
  candles: EDACandle[];
  external: ExternalFeature[];
  analysisProducts: string[];
  edaLoading: boolean;
  edaError: string | null;
  analysisProduct: string;
  setAnalysisProduct: (p: string) => void;
  analysisYear: number | null;
  setAnalysisYear: (y: number | null) => void;
  analysisMonth: number | null;
  setAnalysisMonth: (m: number | null) => void;
  analysisProductLabel: string;
}

export function AnalysisContent({
  metrics,
  series,
  candles,
  external,
  analysisProducts,
  edaLoading,
  edaError,
  analysisProduct,
  setAnalysisProduct,
  analysisYear,
  setAnalysisYear,
  analysisMonth,
  setAnalysisMonth,
  analysisProductLabel,
}: AnalysisContentProps) {
  const locale = useDashboard((s) => s.locale);
  const t = getTranslation(locale);
  const [edaFreq, setEdaFreq] = useState<ForecastFrequency>("D");

  const currentPrice = useMemo(() => {
    // Sigue el toggle de frecuencia: en "Mensual" es el promedio del último mes
    // (coincide con el "Último precio conocido" del forecast); en "Diario" es el
    // último punto CIF disponible.
    const withPrice = series
      .filter((p) => p.cif_price != null)
      .filter((p) => (edaFreq === "M" ? p.frequency === "M" : p.frequency !== "M"));
    if (withPrice.length > 0) {
      const sorted = [...withPrice].sort((a, b) => a.date.localeCompare(b.date));
      const lastDate = sorted[sorted.length - 1].date;
      if (edaFreq === "M") {
        const lastMonth = lastDate.slice(0, 7);
        const monthPrices = sorted
          .filter((p) => p.date.slice(0, 7) === lastMonth)
          .map((p) => p.cif_price as number);
        if (monthPrices.length > 0)
          return monthPrices.reduce((a, b) => a + b, 0) / monthPrices.length;
      }
      return sorted[sorted.length - 1].cif_price;
    }
    const m = metrics.find((x) => x.current_price != null);
    return m?.current_price ?? null;
  }, [edaFreq, metrics, series]);

  const soymealFut = useMemo(() => {
    const withSoy = series
      .filter((p) => p.soymeal_fut != null)
      .sort((a, b) => a.date.localeCompare(b.date));
    return withSoy.length > 0 ? withSoy[withSoy.length - 1].soymeal_fut! : null;
  }, [series]);

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
      <div className="flex items-center gap-3 text-[11px] text-gray-4 flex-wrap">
        <span className="flex items-center gap-1.5 px-2 py-1 bg-navy-card border border-navy-line rounded-sm">
          <Clock className="w-3 h-3" />
          {t.eda.lastUpdate}: {formatDateTime(metrics[0]?.refreshed_at ?? null)}
        </span>
        <span className="flex items-center gap-1.5 px-2 py-1 bg-navy-card border border-navy-line rounded-sm">
          <LineChart className="w-3 h-3" />
          {analysisProductLabel} · {edaFreq === "M" ? t.eda.monthly : t.projection.daily}
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
          <h3 className="text-base font-semibold text-white mb-1">{t.eda.noData}</h3>
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
            frequency={edaFreq}
            onFrequencyChange={setEdaFreq}
            loading={edaLoading}
          />

          <CIFPriceMetrics series={series} loading={edaLoading} frequency={edaFreq} />

          <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-3 xl:gap-6">
            <div className="min-w-0 xl:col-span-2">
              <DeferredMount fallback={<ChartSkeleton className="h-[clamp(300px,72vw,380px)]" />}>
                <CIFPriceLineChart data={series} loading={edaLoading} frequency={edaFreq} />
              </DeferredMount>
            </div>
            <DeferredMount delay={60} fallback={<ChartSkeleton className="h-[clamp(300px,72vw,380px)]" />}>
              <CIFPriceDistribution data={series} loading={edaLoading} frequency={edaFreq} />
            </DeferredMount>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-6">
            <div className="min-w-0 flex flex-col gap-4 h-[clamp(340px,72vw,440px)]">
              <DeferredMount delay={120} fallback={<ChartSkeleton className="flex-1 min-h-0" />}>
                <CIFPriceHeatmap data={series} loading={edaLoading} productsAvailable={analysisProducts} />
              </DeferredMount>
              <ProteinEconomics
                productLabel={analysisProductLabel}
                currentPrice={currentPrice}
                soymealFut={soymealFut}
                loading={edaLoading}
              />
            </div>
            <DeferredMount delay={180} fallback={<ChartSkeleton className="h-[clamp(340px,72vw,440px)]" />}>
              <ExternalFeaturesChart metrics={metrics} external={external} loading={edaLoading} frequency={edaFreq} />
            </DeferredMount>
          </div>

          <DeferredMount delay={240} fallback={<ChartSkeleton className="h-[clamp(420px,64vw,600px)]" />}>
            <CIFPriceCandles data={candles} loading={edaLoading} />
          </DeferredMount>
        </>
      )}
    </div>
  );
}
