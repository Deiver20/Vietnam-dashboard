"use client";

import { useState } from "react";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { ChevronDown, Loader2 } from "lucide-react";

interface EDAFiltersProps {
  productsAvailable: string[];
  selectedProduct: string;
  onProductChange: (product: string) => void;
  selectedYear: number | null;
  onYearChange: (year: number | null) => void;
  selectedMonth: number | null;
  onMonthChange: (month: number | null) => void;
  availableYears: number[];
  loading?: boolean;
}

const MONTHS = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" },
];

export function EDAFilters({
  productsAvailable,
  selectedProduct,
  onProductChange,
  selectedYear,
  onYearChange,
  selectedMonth,
  onMonthChange,
  availableYears,
  loading,
}: EDAFiltersProps) {
  const locale = useDashboard((s) => s.locale);
  const t = getTranslation(locale);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-navy-card border border-navy-line rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-4">
          {t.filters.title}
        </h3>
        {loading && <Loader2 className="w-3 h-3 animate-spin text-gray-4" />}
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
          aria-controls="eda-filters-panel"
          className="inline-flex min-h-10 items-center gap-1.5 rounded-sm border border-blue/30 bg-blue/10 px-2.5 py-1.5 text-xs font-semibold text-blue-soft transition-colors hover:bg-blue/20 md:hidden"
        >
          <span>{mobileOpen ? "Ocultar" : "Filtros"}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
        </button>
      </div>
      <div id="eda-filters-panel" className={`${mobileOpen ? "block" : "hidden"} mt-4 md:block`}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
        <div>
          <label className="block text-[11px] text-gray-4 uppercase tracking-wider font-semibold mb-1.5">
            {t.eda.product}
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => onProductChange(e.target.value)}
            disabled={loading}
            className="w-full bg-navy-darker border border-navy-line rounded-sm px-3 py-2 text-sm text-white hover:border-blue/50 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue/30 transition-all disabled:opacity-60"
          >
            <option value="all">{t.filters.all}</option>
            {productsAvailable.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] text-gray-4 uppercase tracking-wider font-semibold mb-1.5">
            {t.filters.year}
          </label>
          <select
            value={selectedYear ?? "all"}
            onChange={(e) =>
              onYearChange(e.target.value === "all" ? null : parseInt(e.target.value))
            }
            disabled={loading}
            className="w-full bg-navy-darker border border-navy-line rounded-sm px-3 py-2 text-sm text-white hover:border-blue/50 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue/30 transition-all disabled:opacity-60"
          >
            <option value="all">{t.filters.all}</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] text-gray-4 uppercase tracking-wider font-semibold mb-1.5">
            {t.filters.month}
          </label>
          <select
            value={selectedMonth ?? "all"}
            onChange={(e) =>
              onMonthChange(e.target.value === "all" ? null : parseInt(e.target.value))
            }
            disabled={loading}
            className="w-full bg-navy-darker border border-navy-line rounded-sm px-3 py-2 text-sm text-white hover:border-blue/50 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue/30 transition-all disabled:opacity-60"
          >
            <option value="all">{t.filters.allMonths}</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      </div>
    </div>
  );
}
