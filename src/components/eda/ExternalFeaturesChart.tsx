"use client";

import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { EDAMetric, ExternalFeature } from "@/app/interfaces/trade/projection";
import { formatCIFPrice, formatCorrelation, formatUSD } from "@/app/lib/functions/formatters";
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Loader2 } from "lucide-react";

interface ExternalFeaturesChartProps {
  metrics: EDAMetric[];
  external: ExternalFeature[];
  loading: boolean;
}

export function ExternalFeaturesChart({ metrics, external, loading }: ExternalFeaturesChartProps) {
  const { locale } = useDashboard();
  const t = getTranslation(locale);

  if (loading && external.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[380px] flex items-center justify-center text-gray-4">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  if (external.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[380px] flex items-center justify-center text-gray-4 text-sm">
        {t.eda.noData}
      </div>
    );
  }

  const chartData = external.map((e) => ({
    date: e.date,
    fx: e.fx_usdvnd !== null ? Number(e.fx_usdvnd) : null,
    corn: e.corn_fut !== null ? Number(e.corn_fut) : null,
    soy: e.soymeal_fut !== null ? Number(e.soymeal_fut) : null,
  }));

  return (
    <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[380px] flex flex-col">
      <h3 className="text-sm font-semibold text-white mb-1">{t.eda.externalFeatures}</h3>
      <p className="text-[10px] text-gray-5 mb-3">{t.eda.externalFeaturesExplainer}</p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#1a2b40" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#94959b" fontSize={10} minTickGap={32}               tickFormatter={(v) => v.slice(0, 7)} />
            <YAxis yAxisId="left" stroke="#94959b" fontSize={10} tickFormatter={(v: number) => formatUSD(v, 0)} />
            <YAxis yAxisId="right" orientation="right" stroke="#94959b" fontSize={10} tickFormatter={(v: number) => v.toFixed(2)} />
            <Tooltip
              contentStyle={{ background: "#061224", border: "1px solid #1a2b40", borderRadius: 6, fontSize: 12 }}
              labelStyle={{ color: "#c5c6cc" }}
              formatter={(v, name) => {
                const num = v as number;
                const label = String(name ?? "");
                if (label === "USDVND") return [formatUSD(num, 0), label];
                if (label && (label.toLowerCase().includes("corn") || label.toLowerCase().includes("soy") || label.toLowerCase().includes("maíz") || label.toLowerCase().includes("soja") || label.toLowerCase().includes("soya"))) {
                  return [num.toFixed(2), label];
                }
                return [num, label];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 10, color: "#c5c6cc" }} />
            <Bar yAxisId="right" dataKey="corn" name={t.eda.externalCorn} fill="#F5C518" fillOpacity={0.6} />
            <Bar yAxisId="right" dataKey="soy" name={t.eda.externalSoy} fill="#00C2A8" fillOpacity={0.6} />
            <Line yAxisId="left" type="monotone" dataKey="fx" name={t.eda.externalFx} stroke="#0066FF" strokeWidth={1.5} dot={false} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
