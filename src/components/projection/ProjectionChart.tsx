"use client";

import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { ForecastPoint, ForecastModel } from "@/app/interfaces/trade/projection";
import { formatCIFPrice } from "@/app/lib/functions/formatters";
import { useScopeLight, chartPalette } from "@/app/lib/functions/chartPalette";
import { ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Loader2 } from "lucide-react";

interface ProjectionChartProps {
  points: ForecastPoint[];
  loading: boolean;
  frequency: "D" | "M";
  product: string;
}

const MODEL_COLORS: Record<ForecastModel, string> = {
  ARIMA: "#0066FF",
  Prophet: "#00C2A8",
  XGBoost: "#F5C518",
  CatBoost: "#A78BFA",
  Ensemble: "#FF5C5C",
};

const MODEL_LABELS: Record<ForecastModel, string> = {
  ARIMA: "ARIMA",
  Prophet: "Prophet",
  XGBoost: "XGBoost",
  CatBoost: "CatBoost",
  Ensemble: "Ensemble",
};

const MESES_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatXAxis(v: string, frequency: "D" | "M"): string {
  if (frequency === "M") {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v.slice(0, 7);
    const month = d.getUTCMonth();
    const year = d.getUTCFullYear();
    return `${MESES_ES[month]} ${year}`;
  }
  return v.slice(5);
}

export function ProjectionChart({ points, loading, frequency, product }: ProjectionChartProps) {
  const { locale } = useDashboard();
  const t = getTranslation(locale);
  const { ref: cardRef, light } = useScopeLight();
  const pal = chartPalette(light);

  if (loading && points.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[460px] flex items-center justify-center text-gray-4">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[460px] flex items-center justify-center text-gray-4 text-sm">
        {t.projection.noData}
      </div>
    );
  }

  const allDates = Array.from(new Set(points.map((p) => p.forecast_date))).sort();

  const byDateModel: Map<string, Map<string, ForecastPoint>> = new Map();
  for (const p of points) {
    if (!byDateModel.has(p.forecast_date)) byDateModel.set(p.forecast_date, new Map());
    byDateModel.get(p.forecast_date)!.set(p.model, p);
  }

  const ensembleByDate = new Map<string, ForecastPoint>();
  for (const p of points) {
    if (p.model === "Ensemble") ensembleByDate.set(p.forecast_date, p);
  }

  const modelOrder: ForecastModel[] = ["ARIMA", "Prophet", "XGBoost", "CatBoost", "Ensemble"];

  const chartData = allDates.map((date) => {
    const row: Record<string, string | number | [number, number] | null> = { date };
    const ens = ensembleByDate.get(date);
    if (ens) {
      row.Ensemble = ens.point_forecast;
      if (ens.lower_bound !== null && ens.upper_bound !== null) {
        row.EnsembleBand = [Number(ens.lower_bound), Number(ens.upper_bound)];
      }
      if (ens.actual_value !== null && ens.actual_value !== undefined) {
        row.actual = ens.actual_value;
      }
    }
    const modelsForDate = byDateModel.get(date);
    if (modelsForDate) {
      for (const model of modelOrder) {
        const mp = modelsForDate.get(model);
        if (mp) row[model] = mp.point_forecast;
      }
    }
    return row;
  });

  return (
    <div ref={cardRef} className="bg-navy-card border border-navy-line rounded-lg p-5 h-[460px] flex flex-col">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-white">{t.projection.forecastChart}</h3>
        <p className="text-[10px] text-gray-5 mt-1">
          {product} · {frequency === "D" ? t.projection.daily : t.projection.monthly}
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="ensemble-band" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF5C5C" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#FF5C5C" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              stroke={pal.axis}
              fontSize={10}
              tickFormatter={(v: string) => formatXAxis(v, frequency)}
              minTickGap={32}
            />
            <YAxis stroke={pal.axis} fontSize={10} tickFormatter={(v: number) => formatCIFPrice(v)} />
            <Tooltip
              contentStyle={{ background: pal.tooltipBg, border: `1px solid ${pal.tooltipBorder}`, borderRadius: 6, fontSize: 12 }}
              labelStyle={{ color: pal.tooltipLabel }}
              labelFormatter={(label) => formatXAxis(label as string, frequency)}
              formatter={(v, name) => {
                const label = String(name ?? "");
                if (Array.isArray(v)) {
                  return [`${formatCIFPrice(v[0] as number)} – ${formatCIFPrice(v[1] as number)}`, label];
                }
                return [formatCIFPrice(v as number), label];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 10, color: pal.legend }} />
            <Area type="monotone" dataKey="EnsembleBand" name={`Ensemble ${t.projection.p10}-${t.projection.p90}`} stroke="none" fill="url(#ensemble-band)" />
            {modelOrder.map((m) => (
              <Line
                key={m}
                type="monotone"
                dataKey={m}
                name={MODEL_LABELS[m]}
                stroke={MODEL_COLORS[m]}
                strokeWidth={m === "Ensemble" ? 2.5 : 1.2}
                dot={false}
                connectNulls
                strokeDasharray={m === "Ensemble" ? undefined : "4 3"}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
