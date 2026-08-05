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
import { HsCodesView } from "@/components/trade/views/HsCodesView";
import { ByProductView } from "@/components/trade/views/ByProductView";
import { TimelineView } from "@/components/trade/views/TimelineView";
import { ByCountryView } from "@/components/trade/views/ByCountryView";
import { TradersView } from "@/components/trade/views/TradersView";
import { TradersDetailedView } from "@/components/trade/views/TradersDetailedView";
import { CountriesDetailedView } from "@/components/trade/views/CountriesDetailedView";
import { OperationsView } from "@/components/trade/views/OperationsView";
import { TradeThemeProvider, lightTheme, darkTheme } from "@/components/trade/TradeThemeContext";
import { useIndustriesStore } from "../stores";

interface IndustriesTabContentProps {
  tabId: string;
}

/* The 11 Vietnam dashboard tabs, rendered inside the immersive shell. The
   shell brings its own slicers and AI panel, so this reuses only the views
   from DashboardContent — no GlobalFilters, no RightPanel. Data and logic
   stay exactly the Vietnam dashboard's. The tab views are wrapped in the
   dark trade theme so every bento card reads as one product with the shell. */
export function IndustriesTabContent({ tabId }: IndustriesTabContentProps) {
  const { locale, filters } = useDashboard();
  const t = getTranslation(locale);
  const { options } = useTradeData(filters);
  const monthly = useTotalImportsMonthly(filters);
  const dark = useIndustriesStore((s) => s.dashboardDark);

  const content = (() => {
    switch (tabId) {
      case "imports-overview":
        return (
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
        );
      case "total-imports":
        return (
          <TotalImportsChart
            data={monthly.data}
            loading={monthly.loading}
            error={monthly.error}
          />
        );
      case "hs-codes":
        return <HsCodesView />;
      case "imports-by-product":
        return <ByProductView />;
      case "imports-timeline":
        return <TimelineView />;
      case "imports-by-country":
        return <ByCountryView />;
      case "traders-and-customs":
        return <TradersView />;
      case "traders-and-customs-detailed":
        return <TradersDetailedView />;
      case "countries-detailed":
        return <CountriesDetailedView />;
      case "imports-operations":
        return <OperationsView />;
      case "price-projection":
        return <PriceProjectionView />;
      default:
        return <ComingSoon />;
    }
  })();

  return (
    <TradeThemeProvider value={dark ? darkTheme : lightTheme}>
      <div className="mb-6">
        <GlobalFilters options={options} />
      </div>
      {content}
    </TradeThemeProvider>
  );
}
