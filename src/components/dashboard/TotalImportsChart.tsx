"use client";

import { useState, useMemo } from "react";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { TotalImportsMonthlyPoint } from "@/hooks/trade/useTotalImportsMonthly";
import { formatCIFPrice, formatVolume } from "@/app/lib/functions/formatters";
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

export function TotalImportsChart({ data, loading, error }: TotalImportsChartProps) {
  const { locale, filters } = useDashboard();
  const t = getTranslation(locale);
  const [metric, setMetric] = useState<MetricType>("price");

  const { chartData, years } = useMemo(() => {
    if (!data || data.length === 0) return { chartData: [], years: [] };

    const uniqueYears = [...new Set(data.map((d) => d.year))].sort((a, b) => a - b);

    const isDefaultRange =
      filters.yearStart === 2022 && filters.yearEnd === new Date().getFullYear();
    const displayYears =
      isDefaultRange && uniqueYears.length > 3
        ? uniqueYears.slice(-3)
        : uniqueYears;

    const filtered = data.filter((d) => displayYears.includes(d.year));

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
      years: displayYears,
    };
  }, [data, metric, filters.yearStart, filters.yearEnd]);

  if (loading) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[480px] flex items-center justify-center text-gray-4">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[480px] flex items-center justify-center">
        <div className="bg-red/10 border border-red/30 rounded-md p-4 text-red text-sm">
          {t.common.error}: {error}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[480px] flex items-center justify-center text-gray-4 text-sm">
        {t.dashboard.noData}
      </div>
    );
  }

  const yFormatter = metric === "price" ? formatCIFPrice : formatVolume;

  return (
    <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[480px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">{t.dashboard.totalImportsChart}</h3>
        <div className="flex bg-navy-darker rounded-sm border border-navy-line overflow-hidden">
          <button
            type="button"
            onClick={() => setMetric("price")}
            className={`px-3 py-1.5 text-xs font-medium transition-all ${
              metric === "price"
                ? "bg-blue/20 text-white border-blue"
                : "text-gray-3 hover:text-white"
            }`}
          >
            {t.dashboard.priceCif}
          </button>
          <button
            type="button"
            onClick={() => setMetric("volume")}
            className={`px-3 py-1.5 text-xs font-medium transition-all ${
              metric === "volume"
                ? "bg-blue/20 text-white border-blue"
                : "text-gray-3 hover:text-white"
            }`}
          >
            {t.dashboard.volume}
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#1a2b40" strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              stroke="#94959b"
              fontSize={10}
              tickMargin={8}
            />
            <YAxis
              stroke="#94959b"
              fontSize={10}
              tickFormatter={(v: number) => yFormatter(v)}
              width={80}
            />
            <Tooltip
              contentStyle={{
                background: "#061224",
                border: "1px solid #1a2b40",
                borderRadius: 6,
                fontSize: 12,
              }}
              labelStyle={{ color: "#c5c6cc" }}
              formatter={(v) => yFormatter(Number(v))}
            />
            <Legend wrapperStyle={{ fontSize: 10, color: "#c5c6cc" }} />
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
