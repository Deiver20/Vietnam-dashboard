"use client";

import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { TradeFilterOptions } from "@/app/interfaces/trade/interface";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { YearRangeFilter } from "@/components/filters/YearRangeFilter";
import { Filter, RotateCcw } from "lucide-react";

interface GlobalFiltersProps {
  options: TradeFilterOptions;
}

export function GlobalFilters({ options }: GlobalFiltersProps) {
  const { locale, filters, setFilters, resetFilters } = useDashboard();
  const t = getTranslation(locale);

  const minYear = options.years.length > 0 ? Math.min(...options.years) : 2020;
  const maxYear = options.years.length > 0 ? Math.max(...options.years) : 2026;

  return (
    <div className="bg-navy-card/80 backdrop-blur-sm border border-navy-line rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-sm bg-blue/10">
            <Filter className="w-4 h-4 text-blue-soft" />
          </div>
          <h3 className="text-sm font-semibold text-white">{t.filters.title}</h3>
        </div>
        <button
          onClick={resetFilters}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-3 hover:text-white bg-navy-darker hover:bg-navy-line border border-navy-line rounded-sm transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          {t.filters.reset}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
          value={filters.product?.[0] || ""}
          onChange={(value) =>
            setFilters({ ...filters, product: value ? [value as string] : [] })
          }
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
  );
}
