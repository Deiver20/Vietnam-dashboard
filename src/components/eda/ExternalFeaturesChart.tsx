"use client";

import { memo, useMemo } from "react";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { EDAMetric, ExternalFeature } from "@/app/interfaces/trade/projection";
import { formatCorrelation, formatUSD } from "@/app/lib/functions/formatters";
import { cornCentsToUsdPerMt, soymealStToUsdPerMt } from "@/app/lib/functions/unitConversions";
import { useScopeLight, chartPalette } from "@/app/lib/functions/chartPalette";
import { downsampleTo } from "@/app/lib/functions/array";
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Loader2 } from "lucide-react";

interface ExternalFeaturesChartProps {
  metrics: EDAMetric[];
  external: ExternalFeature[];
  loading: boolean;
}

export const ExternalFeaturesChart = memo(function ExternalFeaturesChart({ metrics, external, loading }: ExternalFeaturesChartProps) {
  const locale = useDashboard((s) => s.locale);
  const t = getTranslation(locale);
  const { ref: cardRef, light } = useScopeLight();
  const pal = chartPalette(light);

  const chartData = useMemo(() => {
    const mapped = external.map((e) => ({
      date: e.date,
      cif: e.cif_price !== null ? Number(e.cif_price) : null,
      fx: e.fx_usdvnd !== null ? Number(e.fx_usdvnd) : null,
      corn: e.corn_fut !== null ? cornCentsToUsdPerMt(Number(e.corn_fut)) : null,
      soy: e.soymeal_fut !== null ? soymealStToUsdPerMt(Number(e.soymeal_fut)) : null,
    }));
    // Reducir densidad de puntos para evitar bloqueo del hilo principal.
    return downsampleTo(mapped, 80);
  }, [external]);

  const latest = metrics.find((m) => m.product) || metrics[0];
  const fxCorr = latest?.correlation_cif_fx ?? null;
  const cornCorr = latest?.correlation_cif_corn ?? null;
  const soyCorr = latest?.correlation_cif_soy ?? null;

  if (loading && external.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(300px,72vw,380px)] flex items-center justify-center text-gray-4">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(300px,72vw,380px)] flex items-center justify-center text-gray-4 text-sm">
        {t.eda.noData}
      </div>
    );
  }

  const corrChip = (label: string, color: string, value: number | null) => (
    <span
      className="inline-flex items-center gap-1 rounded-sm border border-navy-line bg-navy-mid px-2 py-0.5 text-[10px]"
      style={{ color }}
    >
      {label} <span className="font-mono font-semibold">{formatCorrelation(value ?? 0)}</span>
    </span>
  );

  return (
    <div ref={cardRef} className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(300px,72vw,380px)] flex flex-col">
      <h3 className="text-sm font-semibold text-white mb-1">{t.eda.externalFeatures}</h3>
      <p className="text-[10px] text-gray-5 mb-2">{t.eda.externalFeaturesExplainer}</p>
      {(fxCorr !== null || cornCorr !== null || soyCorr !== null) && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {fxCorr !== null && corrChip(t.eda.corrFx, fxCorr >= 0 ? "#34D399" : "#F87171", fxCorr)}
          {cornCorr !== null && corrChip(t.eda.corrCorn, cornCorr >= 0 ? "#34D399" : "#F87171", cornCorr)}
          {soyCorr !== null && corrChip(t.eda.corrSoy, soyCorr >= 0 ? "#34D399" : "#F87171", soyCorr)}
        </div>
      )}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 16, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke={pal.axis} fontSize={10} minTickGap={32} tickFormatter={(v) => v.slice(0, 7)} />
            <YAxis yAxisId="left" stroke={pal.axis} fontSize={10} tickFormatter={(v: number) => formatUSD(v, 0)} />
            <YAxis yAxisId="right" orientation="right" stroke={pal.axis} fontSize={10} tickFormatter={(v: number) => `${v.toFixed(0)} $/MT`} />
            <Tooltip
              contentStyle={{ background: pal.tooltipBg, border: `1px solid ${pal.tooltipBorder}`, borderRadius: 6, fontSize: 12 }}
              labelStyle={{ color: pal.tooltipLabel }}
              formatter={(v, name) => {
                const num = v as number;
                const label = String(name ?? "");
                if (label.toLowerCase().includes("usd/vnd") || label.toLowerCase().includes("usdvnd")) return [formatUSD(num, 0), label];
                if (label.toLowerCase().includes("cif")) return [`${num.toFixed(2)} $/MT`, label];
                if (label && (label.toLowerCase().includes("corn") || label.toLowerCase().includes("soy") || label.toLowerCase().includes("maíz") || label.toLowerCase().includes("soja") || label.toLowerCase().includes("soya") || label.toLowerCase().includes("maïs") || label.toLowerCase().includes("milho") || label.toLowerCase().includes("farelo") || label.toLowerCase().includes("tourteau"))) {
                  return [`${num.toFixed(2)} $/MT`, label];
                }
                return [num, label];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 10, color: pal.legend }} />
            <Bar yAxisId="right" dataKey="corn" name={t.eda.externalCorn} fill="#F5C518" fillOpacity={0.6} isAnimationActive={false} />
            <Bar yAxisId="right" dataKey="soy" name={t.eda.externalSoy} fill="#00C2A8" fillOpacity={0.6} isAnimationActive={false} />
            <Line yAxisId="right" type="monotone" dataKey="cif" name={t.eda.externalCif} stroke="#FF5C5C" strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
            <Line yAxisId="left" type="monotone" dataKey="fx" name={t.eda.externalFx} stroke="#0066FF" strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
