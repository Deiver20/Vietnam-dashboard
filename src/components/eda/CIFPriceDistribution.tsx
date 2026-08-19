"use client";

import { memo, useMemo } from "react";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { EDASeriesPoint, ForecastFrequency } from "@/app/interfaces/trade/projection";
import { formatCIFPrice } from "@/app/lib/functions/formatters";
import { useScopeLight, chartPalette } from "@/app/lib/functions/chartPalette";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Loader2 } from "lucide-react";

interface CIFPriceDistributionProps {
  data: EDASeriesPoint[];
  loading: boolean;
  frequency: ForecastFrequency;
}

function useDistributionBuckets(data: EDASeriesPoint[], frequency: ForecastFrequency) {
  return useMemo(() => {
    const byFreq = data.filter((p) =>
      frequency === "M" ? p.frequency === "M" : p.frequency !== "M"
    );
    const values = byFreq.map((p) => p.cif_price).filter((v): v is number => v !== null);
    if (values.length === 0) return null;

    const min = Math.min(...values);
    const max = Math.max(...values);
    const bucketCount = 25;
    const range = (max - min) / bucketCount || 1;
    const buckets = Array.from({ length: bucketCount }, (_, i) => ({
      range: min + i * range,
      rangeEnd: min + (i + 1) * range,
      count: 0,
    }));
    for (const v of values) {
      let idx = Math.floor((v - min) / range);
      if (idx >= bucketCount) idx = bucketCount - 1;
      if (idx < 0) idx = 0;
      buckets[idx].count += 1;
    }
    return buckets;
  }, [data, frequency]);
}

export const CIFPriceDistribution = memo(function CIFPriceDistribution({ data, loading, frequency }: CIFPriceDistributionProps) {
  const locale = useDashboard((s) => s.locale);
  const t = getTranslation(locale);
  const { ref: cardRef, light } = useScopeLight();
  const pal = chartPalette(light);

  const buckets = useDistributionBuckets(data, frequency);

  if (loading && data.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(300px,72vw,380px)] flex items-center justify-center text-gray-4">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  if (!buckets) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(300px,72vw,380px)] flex items-center justify-center text-gray-4 text-sm">
        {t.eda.noData}
      </div>
    );
  }

  return (
    <div ref={cardRef} className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(300px,72vw,380px)] flex flex-col">
      <h3 className="text-sm font-semibold text-white mb-3">{t.eda.cifPriceDistribution}</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={buckets} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="cif-dist" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0066FF" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#0066FF" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="range"
              stroke={pal.axis}
              fontSize={10}
              tickFormatter={(v: number) => formatCIFPrice(v)}
              minTickGap={20}
            />
            <YAxis stroke={pal.axis} fontSize={10} />
            <Tooltip
              contentStyle={{ background: pal.tooltipBg, border: `1px solid ${pal.tooltipBorder}`, borderRadius: 6, fontSize: 12 }}
              labelFormatter={(_label, payload) => {
                const p = payload?.[0]?.payload as { range?: number; rangeEnd?: number } | undefined;
                return p?.range !== undefined && p?.rangeEnd !== undefined
                  ? `${formatCIFPrice(p.range)} – ${formatCIFPrice(p.rangeEnd)}`
                  : "";
              }}
              formatter={(v) => [v as number, "Freq."]}
            />
            <Area type="monotone" dataKey="count" stroke="#0066FF" strokeWidth={1.5} fill="url(#cif-dist)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
