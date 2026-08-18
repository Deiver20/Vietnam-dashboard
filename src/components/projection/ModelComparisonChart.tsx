"use client";

import { memo, useMemo } from "react";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { ForecastMetric, ForecastModel } from "@/app/interfaces/trade/projection";
import { formatNumber } from "@/app/lib/functions/formatters";
import { useScopeLight, chartPalette } from "@/app/lib/functions/chartPalette";
import { HintIcon } from "@/components/ui/HintIcon";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { Loader2 } from "lucide-react";

interface ModelComparisonChartProps {
  metrics: ForecastMetric[];
  loading: boolean;
}

const MODEL_COLORS: Record<ForecastModel, string> = {
  ARIMA: "#0066FF",
  Prophet: "#00C2A8",
  XGBoost: "#F5C518",
  CatBoost: "#A78BFA",
  Ensemble: "#FF5C5C",
};

export const ModelComparisonChart = memo(function ModelComparisonChart({ metrics, loading }: ModelComparisonChartProps) {
  const locale = useDashboard((s) => s.locale);
  const t = getTranslation(locale);
  const { ref: cardRef, light } = useScopeLight();
  const pal = chartPalette(light);

  const chartData = useMemo(
    () =>
      metrics.map((m) => ({
        model: m.model,
        rmse: m.rmse !== null ? Number(m.rmse) : 0,
        mae: m.mae !== null ? Number(m.mae) : 0,
        mape: m.mape !== null ? Number(m.mape) : 0,
        color: MODEL_COLORS[m.model],
      })),
    [metrics]
  );

  if (loading && metrics.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(340px,72vw,460px)] flex items-center justify-center text-gray-4">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(340px,72vw,460px)] flex items-center justify-center text-gray-4 text-sm">
        {t.projection.noData}
      </div>
    );
  }

  return (
    <div ref={cardRef} className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(340px,72vw,460px)] flex flex-col">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-1.5">
        {t.projection.modelComparison}
        <HintIcon text={t.projection.modelComparisonHint} />
      </h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
            <XAxis dataKey="model" stroke={pal.axis} fontSize={10} />
            <YAxis stroke={pal.axis} fontSize={10} tickFormatter={(v: number) => v.toFixed(2)} />
            <Tooltip
              content={({ active, payload, label }: { active?: boolean; payload?: readonly any[]; label?: string | number }) => {
                if (!active || !payload || payload.length === 0) return null;
                const entry = payload[0];
                const name = String(entry.name ?? label ?? "");
                const value = entry.value != null ? formatNumber(Number(entry.value), 2) : "-";
                const color = entry.payload?.color ?? pal.axis;
                return (
                  <div style={{ background: pal.tooltipBg, border: `1px solid ${pal.tooltipBorder}`, borderRadius: 6, fontSize: 12, padding: "6px 10px", boxShadow: "0 4px 14px rgba(0,0,0,0.18)" }}>
                    <div style={{ color: pal.tooltipLabel, fontWeight: 600, marginBottom: 4 }}>{name}</div>
                    <div style={{ color: pal.tooltipLabel }}>
                      <span style={{ fontWeight: 700, color }}>{value}</span>
                      <span style={{ marginLeft: 6, opacity: 0.85 }}>{t.projection.mape}</span>
                    </div>
                  </div>
                );
              }}
              cursor={{ fill: light ? "rgba(6, 37, 75, 0.06)" : "rgba(255,255,255,0.06)" }}
            />
            <Bar dataKey="mape" name={t.projection.mape} legendType="none" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {chartData.map((entry, i) => (
                <Cell key={`c-${i}`} fill={entry.color} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
