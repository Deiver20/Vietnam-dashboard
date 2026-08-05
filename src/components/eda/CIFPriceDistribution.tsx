"use client";

import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { EDASeriesPoint } from "@/app/interfaces/trade/projection";
import { formatCIFPrice } from "@/app/lib/functions/formatters";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Loader2 } from "lucide-react";

interface CIFPriceDistributionProps {
  data: EDASeriesPoint[];
  loading: boolean;
}

export function CIFPriceDistribution({ data, loading }: CIFPriceDistributionProps) {
  const { locale } = useDashboard();
  const t = getTranslation(locale);

  if (loading && data.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[380px] flex items-center justify-center text-gray-4">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[380px] flex items-center justify-center text-gray-4 text-sm">
        {t.eda.noData}
      </div>
    );
  }

  const values = data.map((p) => p.cif_price).filter((v): v is number => v !== null);
  if (values.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[380px] flex items-center justify-center text-gray-4 text-sm">
        {t.eda.noData}
      </div>
    );
  }

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

  return (
    <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[380px] flex flex-col">
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
            <CartesianGrid stroke="#1a2b40" strokeDasharray="3 3" />
            <XAxis
              dataKey="range"
              stroke="#94959b"
              fontSize={10}
              tickFormatter={(v: number) => formatCIFPrice(v)}
              minTickGap={20}
            />
            <YAxis stroke="#94959b" fontSize={10} />
            <Tooltip
              contentStyle={{ background: "#061224", border: "1px solid #1a2b40", borderRadius: 6, fontSize: 12 }}
              labelFormatter={(_label, payload) => {
                const p = payload?.[0]?.payload as { range?: number; rangeEnd?: number } | undefined;
                return p?.range !== undefined && p?.rangeEnd !== undefined
                  ? `${formatCIFPrice(p.range)} – ${formatCIFPrice(p.rangeEnd)}`
                  : "";
              }}
              formatter={(v) => [v as number, "Freq."]}
            />
            <Area type="monotone" dataKey="count" stroke="#0066FF" strokeWidth={1.5} fill="url(#cif-dist)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
