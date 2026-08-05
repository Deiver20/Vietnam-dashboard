"use client";

import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { useTradeData } from "@/hooks/trade/useTradeData";
import { useTotalImportsMonthly } from "@/hooks/trade/useTotalImportsMonthly";
import { GlobalFilters } from "@/components/filters/GlobalFilters";
import { ImportsByCountryChart } from "@/components/dashboard/ImportsByCountryChart";
import { ImportsByImporterChart } from "@/components/dashboard/ImportsByImporterChart";
import { TotalImportsChart } from "@/components/dashboard/TotalImportsChart";
import { ComingSoon } from "@/components/dashboard/ComingSoon";
import { PriceProjectionView } from "@/components/dashboard/PriceProjectionView";
import { RightPanel } from "@/components/layout/RightPanel";
import { HsCodesView } from "@/components/trade/views/HsCodesView";
import { ByProductView } from "@/components/trade/views/ByProductView";
import { TimelineView } from "@/components/trade/views/TimelineView";
import { ByCountryView } from "@/components/trade/views/ByCountryView";
import { TradersView } from "@/components/trade/views/TradersView";
import { TradersDetailedView } from "@/components/trade/views/TradersDetailedView";
import { CountriesDetailedView } from "@/components/trade/views/CountriesDetailedView";
import { OperationsView } from "@/components/trade/views/OperationsView";
import { Loader2 } from "lucide-react";

interface DashboardContentProps {
  tabId: string;
}

const TABS_WITH_GLOBAL_FILTERS = new Set([
  "imports-overview",
  "total-imports",
  "hs-codes",
  "imports-by-product",
  "imports-timeline",
  "traders-and-customs",
  "traders-and-customs-detailed",
  "countries-detailed",
  "imports-by-country",
  "imports-operations",
]);

const TABS_WITH_DATA_PANEL = new Set([
  "imports-overview",
  "total-imports",
  "hs-codes",
  "imports-by-product",
  "imports-timeline",
  "traders-and-customs",
  "traders-and-customs-detailed",
  "countries-detailed",
  "imports-by-country",
  "imports-operations",
]);

export function DashboardContent({ tabId }: DashboardContentProps) {
  const { locale, filters } = useDashboard();
  const t = getTranslation(locale);
  const { overview, totals, timeline, options, optionsLoading, loading, error } = useTradeData(filters);
  const { data: monthlyData, loading: monthlyLoading, error: monthlyError } = useTotalImportsMonthly(filters);

  const useGlobalFilters = TABS_WITH_GLOBAL_FILTERS.has(tabId);
  const useDataPanel = TABS_WITH_DATA_PANEL.has(tabId);
  const isProjectionTab = tabId === "price-projection";

  return (
    <div className="flex flex-1 overflow-hidden relative">
      <main className="flex-1 overflow-y-auto p-6">
        <div className="w-full">
          {useGlobalFilters && <GlobalFilters options={options} />}

          {useGlobalFilters && loading && (
            <div className="flex items-center justify-center h-64 text-gray-4">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              {t.common.loading}
            </div>
          )}

          {useGlobalFilters && error && (
            <div className="bg-red/10 border border-red/30 rounded-md p-4 text-red mb-6">
              {t.common.error}: {error}
            </div>
          )}

          {(!useGlobalFilters || (!loading && !error)) && (
            <>
              {tabId === "imports-overview" ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <ImportsByCountryChart
                    filters={filters}
                    title={t.dashboard.chartImportsByCountryRace}
                    subtitle={t.dashboard.chartVolumeMtRace}
                    locale={locale}
                    interval={filters.animationSpeed ?? 1500}
                  />
                  <ImportsByImporterChart
                    filters={filters}
                    title={t.dashboard.chartImportsByImporterRace}
                    subtitle={t.dashboard.chartVolumeMtRace}
                    locale={locale}
                    interval={filters.animationSpeed ?? 1500}
                  />
                </div>
              ) : tabId === "total-imports" ? (
                <TotalImportsChart
                  data={monthlyData}
                  loading={monthlyLoading}
                  error={monthlyError}
                />
              ) : tabId === "hs-codes" ? (
                <HsCodesView />
              ) : tabId === "imports-by-product" ? (
                <ByProductView />
              ) : tabId === "imports-timeline" ? (
                <TimelineView />
              ) : tabId === "imports-by-country" ? (
                <ByCountryView />
              ) : tabId === "traders-and-customs" ? (
                <TradersView />
              ) : tabId === "traders-and-customs-detailed" ? (
                <TradersDetailedView />
              ) : tabId === "countries-detailed" ? (
                <CountriesDetailedView />
              ) : tabId === "imports-operations" ? (
                <OperationsView />
              ) : isProjectionTab ? (
                <PriceProjectionView />
              ) : (
                <ComingSoon />
              )}
            </>
          )}
        </div>
      </main>

      {useDataPanel && <RightPanel overview={overview} totals={totals} timeline={timeline} />}
    </div>
  );
}
