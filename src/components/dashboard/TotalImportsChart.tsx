"use client";

import { useState, useMemo } from "react";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { TotalImportsMonthlyPoint } from "@/hooks/trade/useTotalImportsMonthly";
import { formatCIFPrice, formatVolume } from "@/app/lib/functions/formatters";
import { useScopeLight, chartPalette } from "@/app/lib/functions/chartPalette";
import { CardHeader } from "@/components/trade/CardHeader";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
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

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* The shell wraps the dashboard in a .trade-scope that flips between
   .trade-scope-dark and .trade-scope-light. Chart inks (grid, axes, legend,
   tooltip) can't take the scope's CSS variables, so read the live mode from
   the nearest scope and pick the matching palette. Outside the shell (the
   standalone navy /dashboard) there's no scope → defaults to dark, the
   original look. */

export function TotalImportsChart({ data, loading, error }: TotalImportsChartProps) {
  const { locale } = useDashboard();
  const t = getTranslation(locale);
  const [metric, setMetric] = useState<MetricType>("price");
  const { ref: cardRef, light } = useScopeLight();

  const pal = chartPalette(light);
  const gridColor = light ? "rgba(6, 37, 75, 0.08)" : "#1a2b40";
  const axisColor = pal.axis;
  const tooltipContentStyle = {
    background: pal.tooltipBg,
    border: `1px solid ${pal.tooltipBorder}`,
    borderRadius: 6,
    fontSize: 12,
  };
  const tooltipLabelColor = pal.tooltipLabel;
  const legendColor = pal.legend;

  const { chartData, years } = useMemo(() => {
    if (!data || data.length === 0) return { chartData: [], years: [] };

    const uniqueYears = [...new Set(data.map((d) => d.year))].sort((a, b) => a - b);

    const filtered = data.filter((d) => uniqueYears.includes(d.year));

    const monthMap = new Map<string, Record<string, number | string>>();
    for (let m = 1; m <= 12; m++) {
      const key = MONTH_LABELS[m - 1];
      monthMap.set(key, { month: key });
    }

    for (const point of filtered) {
      const key = MONTH_LABELS[point.month - 1];
      const row = monthMap.get(key)!;
      row[String(point.year)] = metric === "price" ? point.cif_price : point.volume_mt;
    }

    return {
      chartData: Array.from(monthMap.values()),
      years: uniqueYears,
    };
  }, [data, metric]);

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

  return (
    <div ref={cardRef} className="group relative bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(360px,60vw,480px)] flex flex-col overflow-hidden">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100"
        style={{ backgroundColor: "var(--trade-accent)" }}
      />
      <CardHeader
        title={t.dashboard.totalImportsChart}
        actions={
          <div className="flex flex-wrap gap-1 bg-navy-darker rounded-sm border border-navy-line overflow-hidden p-0.5">
            <button
              type="button"
              onClick={() => setMetric("price")}
              aria-pressed={metric === "price"}
              className={`min-w-0 truncate px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-sm transition-all ${
                metric === "price"
                  ? "bg-blue text-white shadow-sm ring-1 ring-blue"
                  : "text-gray-3 hover:text-white"
              }`}
            >
              {t.dashboard.priceCif}
            </button>
            <button
              type="button"
              onClick={() => setMetric("volume")}
              aria-pressed={metric === "volume"}
              className={`min-w-0 truncate px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-sm transition-all ${
                metric === "volume"
                  ? "bg-blue text-white shadow-sm ring-1 ring-blue"
                  : "text-gray-3 hover:text-white"
              }`}
            >
              {t.dashboard.volume}
            </button>
          </div>
        }
      />
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              stroke={axisColor}
              fontSize={10}
              tickMargin={8}
            />
            <YAxis
              stroke={axisColor}
              fontSize={10}
              tickFormatter={(v: number) => yFormatter(v)}
              width={80}
            />
            <Tooltip
              contentStyle={tooltipContentStyle}
              labelStyle={{ color: tooltipLabelColor }}
              formatter={(v) => yFormatter(Number(v))}
            />
            <Legend wrapperStyle={{ fontSize: 10, color: legendColor }} />
            {years.map((year, i) => (
              <Line
                key={year}
                type="monotone"
                dataKey={String(year)}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3, fill: COLORS[i % COLORS.length] }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
