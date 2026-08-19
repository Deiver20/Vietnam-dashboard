"use client";

import { useState, useMemo } from "react";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { TradeFilterOptions } from "@/app/interfaces/trade/interface";
import { DASHBOARD_YEAR_RANGE } from "@/app/constants";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { YearRangeFilter } from "@/components/filters/YearRangeFilter";
import { MonthFilter } from "@/components/filters/MonthFilter";
import { ChevronDown, Filter, RotateCcw } from "lucide-react";
import { translateCountry, translateProduct, translateCategory } from "@/app/lib/i18n/tradeData";

interface GlobalFiltersProps {
  options: TradeFilterOptions;
  showMonthFilter?: boolean;
  minYear?: number;
}

/* Mapea una lista de valores crudos (de la BD) a opciones { label, value }
   para que el dropdown muestre el nombre traducido pero guarde el valor crudo
   que entiende el backend. Ordena alfabéticamente por el label visible. */
function toSelectOptions(raw: string[], translate: (v: string) => string) {
  return raw
    .map((v) => ({ label: translate(v), value: v }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}

/* Ordena las opciones (string o {label,value}) alfabéticamente por su label. */
function sortOptionsByLabel(options: Array<string | { label: string; value: string }>) {
  const labelOf = (o: string | { label: string; value: string }) =>
    typeof o === "string" ? o : o.label;
  return [...options].sort((a, b) =>
    labelOf(a).localeCompare(labelOf(b), undefined, { sensitivity: "base" })
  );
}

export function GlobalFilters({ options, showMonthFilter = true, minYear: minYearProp }: GlobalFiltersProps) {
  const { locale, filters, setFilters, resetFilters } = useDashboard();
  const t = getTranslation(locale);
  const [mobileOpen, setMobileOpen] = useState(false);

  const categoryOptions = useMemo(() => toSelectOptions(options.categories, (v) => translateCategory(v, locale)), [options.categories, locale]);
  const productOptions = useMemo(() => toSelectOptions(options.products, (v) => translateProduct(v, locale)), [options.products, locale]);
  const originCountryOptions = useMemo(() => toSelectOptions(options.originCountries, (v) => translateCountry(v, locale)), [options.originCountries, locale]);
  const customsOptions = useMemo(() => sortOptionsByLabel(options.customs), [options.customs]);
  const importerOptions = useMemo(() => sortOptionsByLabel(options.importers), [options.importers]);
  const exporterOptions = useMemo(() => sortOptionsByLabel(options.exporters), [options.exporters]);

  const minYear = minYearProp ?? DASHBOARD_YEAR_RANGE.min;
  const maxYear = DASHBOARD_YEAR_RANGE.max;
  const countryLabel =
    filters.flow === "exports" ? t.filters.countryOfDestination : t.filters.countryOfOrigin;
  const activeCount = [
    filters.category?.length,
    filters.product?.length,
    filters.originCountry?.length,
    filters.customs?.length,
    filters.importer ? 1 : 0,
    filters.exporter ? 1 : 0,
    filters.meses?.length,
    filters.yearStart !== minYear || filters.yearEnd !== maxYear ? 1 : 0,
  ].filter(Boolean).length;

  return (
    <div className="bg-navy-card/80 backdrop-blur-sm border border-navy-line rounded-lg p-3 sm:p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-sm bg-blue/10">
            <Filter className="w-4 h-4 text-blue-soft" />
          </div>
          <h3 className="text-sm font-semibold text-white">{t.filters.title}</h3>
          <span className="rounded-full bg-blue/15 px-2 py-0.5 text-[10px] font-semibold text-blue-soft">
            {activeCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetFilters}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-sm border border-navy-line bg-navy-darker px-2.5 py-1.5 text-xs font-medium text-gray-3 transition-colors hover:bg-navy-line hover:text-white"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">{t.filters.reset}</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-expanded={mobileOpen}
            aria-controls="global-filters-panel"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-sm border border-blue/30 bg-blue/10 px-2.5 py-1.5 text-xs font-semibold text-blue-soft transition-colors hover:bg-blue/20 md:hidden"
          >
            <span>{mobileOpen ? "Ocultar" : "Filtros"}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      <div id="global-filters-panel" className={`${mobileOpen ? "block" : "hidden"} mt-4 md:mt-4 md:block`}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4">
        <SearchableSelect
          label={t.filters.category}
          placeholder={t.filters.all}
          searchPlaceholder={t.filters.search}
          options={categoryOptions}
          value={filters.category?.[0] || ""}
          onChange={(value) =>
            setFilters({ ...filters, category: value ? [value as string] : [] })
          }
        />

        <SearchableSelect
          label={t.filters.product}
          placeholder={t.filters.all}
          searchPlaceholder={t.filters.search}
          options={productOptions}
          value={filters.product || []}
          onChange={(value) => setFilters({ ...filters, product: value as string[] })}
          multiple
        />

        <SearchableSelect
          label={countryLabel}
          placeholder={t.filters.all}
          searchPlaceholder={t.filters.search}
          options={originCountryOptions}
          value={filters.originCountry || []}
          onChange={(value) =>
            setFilters({ ...filters, originCountry: value as string[] })
          }
          multiple
        />

        <SearchableSelect
          label={t.filters.custom}
          placeholder={t.filters.all}
          searchPlaceholder={t.filters.search}
          options={customsOptions}
          value={filters.customs || []}
          onChange={(value) =>
            setFilters({ ...filters, customs: value as string[] })
          }
          multiple
        />

        <SearchableSelect
          label={t.filters.importer}
          placeholder={t.filters.search}
          searchPlaceholder={t.filters.search}
          options={importerOptions}
          value={filters.importer || ""}
          onChange={(value) =>
            setFilters({ ...filters, importer: value as string })
          }
        />

        <SearchableSelect
          label={t.filters.exporter}
          placeholder={t.filters.search}
          searchPlaceholder={t.filters.search}
          options={exporterOptions}
          value={filters.exporter || ""}
          onChange={(value) =>
            setFilters({ ...filters, exporter: value as string })
          }
        />

        {showMonthFilter && (
          <MonthFilter
            value={filters.meses}
            onChange={(months) => setFilters({ ...filters, meses: months })}
            locale={locale}
            label={t.filters.month}
            placeholder={t.filters.allMonths}
            searchPlaceholder={t.filters.search}
          />
        )}

        <YearRangeFilter
          startYear={filters.yearStart}
          endYear={filters.yearEnd}
          minYear={minYear}
          maxYear={maxYear}
          startLabel={t.filters.yearStart}
          endLabel={t.filters.yearEnd}
          onStartChange={(year) => setFilters({ ...filters, yearStart: year })}
          onEndChange={(year) => setFilters({ ...filters, yearEnd: year })}
        />
      </div>
      </div>
    </div>
  );
}
