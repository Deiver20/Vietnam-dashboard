"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { useTradeData } from "@/hooks/trade/useTradeData";
import { useTotalImportsMonthly } from "@/hooks/trade/useTotalImportsMonthly";
import { useTabYearDefaults } from "@/hooks/trade/useTabYearDefaults";
import { getPaisCode, getIndustryCode } from "@/app/lib/trade/countryMapping";
import type { Flow } from "@/app/interfaces/trade/interface";
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
import { VARIABLES } from "./dataCarousel";
import { getMinYearForCountry } from "@/app/constants";

interface IndustriesTabContentProps {
  tabId: string;
}

/* The 11 Vietnam dashboard tabs, rendered inside the immersive shell. The
   shell brings its own slicers and AI panel, so this reuses only the views
   from DashboardContent — no GlobalFilters, no RightPanel. Data and logic
   stay exactly the Vietnam dashboard's. The tab views are wrapped in the
   dark trade theme so every bento card reads as one product with the shell. */
export function IndustriesTabContent({ tabId }: IndustriesTabContentProps) {
  const locale = useDashboard((s) => s.locale);
  const filters = useDashboard((s) => s.filters);
  const setFilters = useDashboard((s) => s.setFilters);
  const t = getTranslation(locale);

  // La pestaña de Proyección de Precios tiene su propio origen de datos
  // (EDA/forecast) y no usa los filtros globales del comercio exterior, así
  // que se evita disparar los fetches pesados de useTradeData/useTotalImportsMonthly.
  const isPriceProjection = tabId === "price-projection";
  const { options } = useTradeData(filters, !isPriceProjection);
  const monthly = useTotalImportsMonthly(filters, !isPriceProjection);
  const dark = useIndustriesStore((s) => s.dashboardDark);

  // El acento del flujo (imports/exports/pricing) colorea la navegación
  // seleccionada; el amarillo de hover de las tarjetas usa el mismo color.
  const dataType = useIndustriesStore((s) => s.dataType);
  const flowAccent =
    VARIABLES.find((v) => v.key === (dataType ?? "imports"))?.color ?? "#F35959";

  // Este dashboard cubre las variables IMPORTS y EXPORTS (flujos de comercio).
  // Otras variables (production, pricing, trade_volumes, event, project) no tienen
  // data que mostrar aquí.
  const supportedFlow =
    (dataType ?? "imports") === "imports" || (dataType ?? "imports") === "exports";

  // Sincroniza el país/industria/flujo del shell hacia los filtros del
  // dashboard. Al cambiar de país se limpian los filtros de alcance para que
  // la data de un país no se aplique a otro.
  const selectedCountryId = useIndustriesStore((s) => s.selectedCountryId);
  const selectedIndustryId = useIndustriesStore((s) => s.selectedIndustryId);
  useEffect(() => {
    const countryCode = getPaisCode(selectedCountryId);
    const industry = getIndustryCode(selectedIndustryId);
    const flow: Flow = dataType === "exports" ? "exports" : "imports";
    setFilters((prev) => {
      const countryChanged = prev.countryCode !== countryCode || prev.flow !== flow;
      const base = { ...prev, countryCode, industry, flow };
      if (!countryChanged) return base;
      return {
        ...base,
        category: [],
        product: [],
        originCountry: [],
        customs: [],
        importer: "",
        exporter: "",
        years: [],
      };
    });
  }, [selectedCountryId, selectedIndustryId, dataType, setFilters]);

  // Default del rango de años por pestaña (últimos 3 / últimos 5 / completo del
  // país) y subida del año inicial al mínimo del país al cambiar de país. Ver
  // `useTabYearDefaults` — la regla aplica a todos los tableros.
  useTabYearDefaults(tabId);

  // Cada vez que se entra a una pestaña se incrementa su contador; los bar
  // race usan el contador como runKey para arrancar desde el año inicial.
  const [tabRunKeys, setTabRunKeys] = useState<Record<string, number>>({});
  const [prevTabId, setPrevTabId] = useState(tabId);
  if (prevTabId !== tabId) {
    setPrevTabId(tabId);
    setTabRunKeys((prev) => ({ ...prev, [tabId]: (prev[tabId] ?? 0) + 1 }));
  }
  const raceRunKey = tabRunKeys["imports-overview"] ?? 0;

  const theme = dark
    ? { ...darkTheme, accent: flowAccent }
    : { ...lightTheme, accent: flowAccent };

  const content = (() => {
    if (!supportedFlow) {
      return (
        <div
          className="flex h-[360px] items-center justify-center rounded-xl border px-6 text-center"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
              No data available for {dataType ?? "imports"}
            </p>
            <p className="mt-1 text-xs" style={{ color: theme.textMuted }}>
              This dashboard only covers IMPORTS and EXPORTS for this country.
            </p>
          </div>
        </div>
      );
    }
    switch (tabId) {
      case "imports-overview":
        return (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ImportsByCountryChart
              filters={filters}
              title={dataType === "exports" ? t.dashboard.chartExportsByCountryRace : t.dashboard.chartImportsByCountryRace}
              subtitle={t.dashboard.chartVolumeMtRace}
              locale={locale}
              interval={filters.animationSpeed ?? 1500}
              runKey={raceRunKey}
            />
            <ImportsByImporterChart
              filters={filters}
              title={dataType === "exports" ? t.dashboard.chartExportsByImporterRace : t.dashboard.chartImportsByImporterRace}
              subtitle={t.dashboard.chartVolumeMtRace}
              locale={locale}
              interval={filters.animationSpeed ?? 1500}
              runKey={raceRunKey}
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
    <TradeThemeProvider value={theme}>
      <div
        className={`trade-scope ${dark ? "trade-scope-dark" : "trade-scope-light"}`}
        style={
          {
            "--trade-accent": flowAccent,
            "--trade-surface-hover": dark ? "rgba(255,255,255,0.08)" : "rgba(6,37,75,0.05)",
          } as React.CSSProperties
        }
      >
        <div className="mb-4 min-w-0 sm:mb-6">
          {!isPriceProjection && (
            <GlobalFilters
              options={options}
              showMonthFilter={tabId !== "imports-overview"}
              minYear={getMinYearForCountry(filters.countryCode)}
            />
          )}
        </div>
        {content}
      </div>
    </TradeThemeProvider>
  );
}
