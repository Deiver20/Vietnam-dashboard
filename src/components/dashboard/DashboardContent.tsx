"use client";

import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { useTradeData } from "@/hooks/trade/useTradeData";
import { GlobalFilters } from "@/components/filters/GlobalFilters";
import { ImportsByCountryChart } from "@/components/dashboard/ImportsByCountryChart";
import { ImportsByImporterChart } from "@/components/dashboard/ImportsByImporterChart";
import { KpiCard } from "@/components/ui/KpiCard";
import { RightPanel } from "@/components/layout/RightPanel";
import { formatNumber, formatVolume, formatCurrency } from "@/app/lib/functions/formatters";
import { Loader2, Scale, FileText, Globe2, Package } from "lucide-react";

interface DashboardContentProps {
  tabId: string;
}

export function DashboardContent({ tabId }: DashboardContentProps) {
  const { locale, filters } = useDashboard();
  const t = getTranslation(locale);
  const { overview, totals, timeline, options, optionsLoading, loading, error } = useTradeData(filters);

  return (
    <div className="flex flex-1 overflow-hidden">
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="kicker mb-2">Vietnam Trade Intelligence</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{t.dashboard.title}</h1>
            <p className="text-sm text-gray-4">{t.dashboard.subtitle}</p>
          </div>

          <GlobalFilters options={options} />

          {(loading) && (
            <div className="flex items-center justify-center h-64 text-gray-4">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              {t.common.loading}
            </div>
          )}

          {error && (
            <div className="bg-red/10 border border-red/30 rounded-md p-4 text-red mb-6">
              {t.common.error}: {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <KpiCard
                  label={t.dashboard.kpiTotalVolume}
                  value={formatVolume(totals?.totalMt ?? 0)}
                  sub={totals ? `${formatNumber(totals.records)} ${t.dashboard.kpiTotalRecords}` : undefined}
                  icon={<Scale className="w-5 h-5" />}
                  variant="blue"
                />
                <KpiCard
                  label={t.dashboard.kpiCountries}
                  value={formatNumber(totals?.countries ?? 0)}
                  icon={<Globe2 className="w-5 h-5" />}
                  variant="green"
                />
                <KpiCard
                  label={t.dashboard.kpiProducts}
                  value={formatNumber(totals?.products ?? 0)}
                  icon={<Package className="w-5 h-5" />}
                  variant="yellow"
                />
                <KpiCard
                  label={t.dashboard.kpiTotalCif}
                  value={formatCurrency(totals?.totalCif ?? 0)}
                  icon={<FileText className="w-5 h-5" />}
                  variant="blue"
                />
              </div>

              {tabId === "imports-overview" && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <ImportsByCountryChart
                    filters={filters}
                    title={t.dashboard.chartImportsByCountryRace}
                    subtitle={t.dashboard.chartVolumeMtRace}
                    locale={locale}
                  />
                  <ImportsByImporterChart
                    filters={filters}
                    title={t.dashboard.chartImportsByImporterRace}
                    subtitle={t.dashboard.chartVolumeMtRace}
                    locale={locale}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <RightPanel overview={overview} totals={totals} timeline={timeline} />
    </div>
  );
}
