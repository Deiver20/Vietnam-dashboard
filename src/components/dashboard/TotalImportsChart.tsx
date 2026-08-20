"use client";

import { useState, useMemo } from "react";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { TotalImportsMonthlyPoint } from "@/hooks/trade/useTotalImportsMonthly";
import { formatCIFPrice, formatVolume } from "@/app/lib/functions/formatters";
import { useScopeLight } from "@/app/lib/functions/chartPalette";
import { TradeThemeProvider, darkTheme, lightTheme } from "@/components/trade/TradeThemeContext";
import { Locale } from "@/app/interfaces";
import { CardHeader } from "@/components/trade/CardHeader";
import { LineChart as TradeLineChart, type LineSerie } from "@/components/trade/charts";
import { Loader2 } from "lucide-react";

interface TotalImportsChartProps {
  data: TotalImportsMonthlyPoint[];
  loading: boolean;
  error: string | null;
}

type MetricType = "price" | "volume";

const COLORS = [
  "#0066FF", "#00C2A8", "#F5C518", "#FF5C5C", "#A78BFA",
  "#F472B6", "#34D399", "#FBBF24", "#60A5FA", "#F87171",
];

const MONTH_LABELS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_LABELS_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const MONTH_LABELS_FR = ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
const MONTH_LABELS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const MONTH_LABELS_BY_LOCALE: Record<Locale, string[]> = {
  en: MONTH_LABELS_EN,
  es: MONTH_LABELS_ES,
  fr: MONTH_LABELS_FR,
  pt: MONTH_LABELS_PT,
};

export function TotalImportsChart({ data, loading, error }: TotalImportsChartProps) {
  const { locale } = useDashboard();
  const flow = useDashboard((s) => s.filters.flow);
  const isExports = flow === "exports";
  const t = getTranslation(locale);
  const [metric, setMetric] = useState<MetricType>("price");
  const { ref: cardRef, light } = useScopeLight();

  const monthLabels = MONTH_LABELS_BY_LOCALE[locale] ?? MONTH_LABELS_EN;

  const { chartData, years, series } = useMemo(() => {
    if (!data || data.length === 0) return { chartData: [], years: [], series: [] as LineSerie[] };

    const uniqueYears = [...new Set(data.map((d) => d.year))].sort((a, b) => a - b);

    const monthMap = new Map<string, Record<string, number | string>>();
    for (let m = 1; m <= 12; m++) {
      const key = monthLabels[m - 1];
      monthMap.set(key, { month: key });
    }

    for (const point of data) {
      const key = monthLabels[point.month - 1];
      const row = monthMap.get(key);
      if (!row) continue;
      row[String(point.year)] = metric === "price" ? point.cif_price : point.volume_mt;
    }

    const series: LineSerie[] = uniqueYears.map((year, i) => ({
      key: String(year),
      nombre: String(year),
      color: COLORS[i % COLORS.length],
    }));

    return {
      chartData: Array.from(monthMap.values()),
      years: uniqueYears,
      series,
    };
  }, [data, metric, monthLabels]);

  if (loading) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[clamp(360px,60vw,480px)] flex items-center justify-center text-gray-4">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[clamp(360px,60vw,480px)] flex items-center justify-center">
        <div className="bg-red/10 border border-red/30 rounded-md p-4 text-red text-sm">
          {t.common.error}: {error}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[clamp(360px,60vw,480px)] flex items-center justify-center text-gray-4 text-sm">
        {t.dashboard.noData}
      </div>
    );
  }

  const yFormatter = metric === "price" ? formatCIFPrice : formatVolume;

  const tradeTheme = light ? lightTheme : darkTheme;

  return (
    <TradeThemeProvider value={tradeTheme}>
      <div
        ref={cardRef}
        className="group relative bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(360px,60vw,480px)] flex flex-col overflow-hidden"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100"
          style={{ backgroundColor: "var(--trade-accent)" }}
        />
        <CardHeader
          title={isExports ? t.dashboard.totalExportsChart : t.dashboard.totalImportsChart}
          actions={
            <div
              className="flex flex-wrap gap-1 rounded-sm overflow-hidden p-0.5"
              style={{
                backgroundColor: light ? "rgba(3, 72, 141, 0.08)" : "var(--color-navy-darker)",
                border: light ? "1px solid rgba(3, 72, 141, 0.20)" : "1px solid var(--color-navy-line)",
              }}
            >
              <button
                type="button"
                onClick={() => setMetric("price")}
                aria-pressed={metric === "price"}
                className="min-w-0 truncate px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-sm transition-all"
                style={
                  metric === "price"
                    ? {
                        backgroundColor: light ? "#03488D" : "var(--color-blue)",
                        color: "#ffffff",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                      }
                    : {
                        backgroundColor: "transparent",
                        color: light ? "#06254B" : "var(--color-gray-3)",
                      }
                }
              >
                {isExports ? t.dashboard.priceFob : t.dashboard.priceCif}
              </button>
              <button
                type="button"
                onClick={() => setMetric("volume")}
                aria-pressed={metric === "volume"}
                className="min-w-0 truncate px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-sm transition-all"
                style={
                  metric === "volume"
                    ? {
                        backgroundColor: light ? "#03488D" : "var(--color-blue)",
                        color: "#ffffff",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                      }
                    : {
                        backgroundColor: "transparent",
                        color: light ? "#06254B" : "var(--color-gray-3)",
                      }
                }
              >
                {t.dashboard.volumeMt}
              </button>
            </div>
          }
        />
        <div className="flex-1 min-h-0">
          <TradeLineChart
            datos={chartData}
            xKey="month"
            series={series}
            yFormat={yFormatter}
            altura={360}
            etiquetasFinales
          />
        </div>
      </div>
    </TradeThemeProvider>
  );
}
