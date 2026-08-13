"use client";

import { useState } from "react";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { TradeFilterOptions } from "@/app/interfaces/trade/interface";
import { DASHBOARD_YEAR_RANGE } from "@/app/constants";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { YearRangeFilter } from "@/components/filters/YearRangeFilter";
import { MonthFilter } from "@/components/filters/MonthFilter";
import { ChevronDown, Filter, RotateCcw } from "lucide-react";

interface GlobalFiltersProps {
  options: TradeFilterOptions;
  showMonthFilter?: boolean;
}

export function GlobalFilters({ options, showMonthFilter = true }: GlobalFiltersProps) {
  const { locale, filters, setFilters, resetFilters } = useDashboard();
  const t = getTranslation(locale);
  const [mobileOpen, setMobileOpen] = useState(false);

  const minYear = DASHBOARD_YEAR_RANGE.min;
  const maxYear = DASHBOARD_YEAR_RANGE.max;
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
          options={options.categories}
          value={filters.category?.[0] || ""}
          onChange={(value) =>
            setFilters({ ...filters, category: value ? [value as string] : [] })
          }
        />

        <SearchableSelect
          label={t.filters.product}
          placeholder={t.filters.all}
          searchPlaceholder={t.filters.search}
          options={options.products}
          value={filters.product || []}
          onChange={(value) => setFilters({ ...filters, product: value as string[] })}
          multiple
        />

        <SearchableSelect
          label={t.filters.countryOfOrigin}
          placeholder={t.filters.all}
          searchPlaceholder={t.filters.search}
          options={options.originCountries}
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
          options={options.customs}
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
          options={options.importers}
          value={filters.importer || ""}
          onChange={(value) =>
            setFilters({ ...filters, importer: value as string })
          }
        />

        <SearchableSelect
          label={t.filters.exporter}
          placeholder={t.filters.search}
          searchPlaceholder={t.filters.search}
          options={options.exporters}
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
