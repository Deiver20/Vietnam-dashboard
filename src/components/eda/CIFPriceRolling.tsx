"use client";

import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { EDASeriesPoint } from "@/app/interfaces/trade/projection";
import { formatCIFPrice } from "@/app/lib/functions/formatters";
import { useScopeLight, chartPalette } from "@/app/lib/functions/chartPalette";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Loader2 } from "lucide-react";

interface CIFPriceRollingProps {
  data: EDASeriesPoint[];
  loading: boolean;
  frequency: "D" | "M";
}

export function CIFPriceRolling({ data, loading, frequency }: CIFPriceRollingProps) {
  const { locale } = useDashboard();
  const t = getTranslation(locale);
  const { ref: cardRef, light } = useScopeLight();
  const pal = chartPalette(light);

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

  const productFirst = data.find((p) => p.rolling_mean_s !== null);
  if (!productFirst) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[380px] flex items-center justify-center text-gray-4 text-sm">
        {t.eda.noData}
      </div>
    );
  }

  const productData = data
    .filter((p) => p.product === productFirst.product)
    .sort((a, b) => a.date.localeCompare(b.date));

  const chartData = productData.map((p) => ({
    date: p.date,
    price: p.cif_price ? Number(p.cif_price) : null,
    short: p.rolling_mean_s !== null ? Number(p.rolling_mean_s) : null,
    medium: p.rolling_mean_m !== null ? Number(p.rolling_mean_m) : null,
    long: p.rolling_mean_l !== null ? Number(p.rolling_mean_l) : null,
    shortBand: p.rolling_mean_s !== null && p.rolling_std_s !== null
      ? [Number(p.rolling_mean_s) - Number(p.rolling_std_s), Number(p.rolling_mean_s) + Number(p.rolling_std_s)]
      : null,
  }));

  return (
    <div ref={cardRef} className="bg-navy-card border border-navy-line rounded-lg p-5 h-[380px] flex flex-col">
      <h3 className="text-sm font-semibold text-white mb-1">{t.eda.cifPriceRolling}</h3>
      <p className="text-[10px] text-gray-5 mb-3">{productFirst.product}</p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              stroke={pal.axis}
              fontSize={10}
              tickFormatter={(v) => (frequency === "M" ? v.slice(0, 7) : v.slice(5))}
              minTickGap={32}
            />
            <YAxis
              stroke={pal.axis}
              fontSize={10}
              tickFormatter={(v: number) => formatCIFPrice(v)}
            />
            <Tooltip
              contentStyle={{ background: pal.tooltipBg, border: `1px solid ${pal.tooltipBorder}`, borderRadius: 6, fontSize: 12 }}
              labelStyle={{ color: pal.tooltipLabel }}
              formatter={(v) => formatCIFPrice(v as number)}
            />
            <Legend wrapperStyle={{ fontSize: 10, color: pal.legend }} />
            <Line type="monotone" dataKey="price" name="CIF" stroke="#0066FF" strokeWidth={1} dot={false} connectNulls />
            <Line type="monotone" dataKey="short" name={t.eda.rollingShort} stroke="#F5C518" strokeWidth={1.5} dot={false} connectNulls />
            <Line type="monotone" dataKey="medium" name={t.eda.rollingMedium} stroke="#00C2A8" strokeWidth={1.5} dot={false} connectNulls />
            <Line type="monotone" dataKey="long" name={t.eda.rollingLong} stroke="#FF5C5C" strokeWidth={1.5} dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
