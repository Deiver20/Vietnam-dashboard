"use client";

import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { ForecastFrequency, DAILY_HORIZONS, MONTHLY_HORIZONS } from "@/app/interfaces/trade/projection";
import { Loader2 } from "lucide-react";

interface ProjectionFiltersProps {
  productsAvailable: string[];
  selectedProduct: string;
  onProductChange: (product: string) => void;
  selectedYear?: number | null;
  onYearChange?: (year: number | null) => void;
  selectedMonth?: number | null;
  onMonthChange?: (month: number | null) => void;
  availableYears?: number[];
  frequency: ForecastFrequency;
  onFrequencyChange: (freq: ForecastFrequency) => void;
  horizon: number;
  onHorizonChange: (horizon: number) => void;
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

export function ProjectionFilters({
  productsAvailable,
  selectedProduct,
  onProductChange,
  selectedYear,
  onYearChange,
  selectedMonth,
  onMonthChange,
  availableYears,
  frequency,
  onFrequencyChange,
  horizon,
  onHorizonChange,
  loading,
}: ProjectionFiltersProps) {
  const { locale } = useDashboard();
  const t = getTranslation(locale);

  const horizons = frequency === "D" ? DAILY_HORIZONS : MONTHLY_HORIZONS;
  const horizonUnit = frequency === "D" ? t.projection.horizonDays : t.projection.horizonMonths;

  return (
    <div className="bg-navy-card border border-navy-line rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-4">
          {t.filters.title}
        </h3>
        {loading && <Loader2 className="w-3 h-3 animate-spin text-gray-4" />}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <div>
          <label className="block text-[11px] text-gray-4 uppercase tracking-wider font-semibold mb-1.5">
            {t.projection.product}
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => onProductChange(e.target.value)}
            disabled={loading || productsAvailable.length === 0}
            className="w-full bg-navy-darker border border-navy-line rounded-sm px-3 py-2 text-sm text-white hover:border-blue/50 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue/30 transition-all disabled:opacity-60"
          >
            {productsAvailable.length === 0 ? (
              <option value="">-</option>
            ) : (
              productsAvailable.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))
            )}
          </select>
        </div>

        {selectedYear !== undefined && onYearChange && availableYears && (
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
        )}

        {selectedMonth !== undefined && onMonthChange && (
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
        )}

        <div>
          <label className="block text-[11px] text-gray-4 uppercase tracking-wider font-semibold mb-1.5">
            {t.projection.frequency}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onFrequencyChange("D");
                onHorizonChange(30);
              }}
              disabled={loading}
              className={`flex-1 px-3 py-2 text-sm rounded-sm border transition-all ${
                frequency === "D"
                  ? "bg-blue/20 border-blue text-white"
                  : "bg-navy-darker border-navy-line text-gray-3 hover:border-blue/50"
              }`}
            >
              {t.projection.daily}
            </button>
            <button
              type="button"
              onClick={() => {
                onFrequencyChange("M");
                onHorizonChange(3);
              }}
              disabled={loading}
              className={`flex-1 px-3 py-2 text-sm rounded-sm border transition-all ${
                frequency === "M"
                  ? "bg-blue/20 border-blue text-white"
                  : "bg-navy-darker border-navy-line text-gray-3 hover:border-blue/50"
              }`}
            >
              {t.projection.monthly}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[11px] text-gray-4 uppercase tracking-wider font-semibold mb-1.5">
            {t.projection.horizon} ({horizonUnit})
          </label>
          <div className="flex gap-2">
            {horizons.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => onHorizonChange(h)}
                disabled={loading}
                className={`flex-1 px-3 py-2 text-sm rounded-sm border transition-all ${
                  horizon === h
                    ? "bg-blue/20 border-blue text-white"
                    : "bg-navy-darker border-navy-line text-gray-3 hover:border-blue/50"
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
