"use client";

import { memo, useMemo } from "react";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { EDASeriesPoint, ForecastFrequency } from "@/app/interfaces/trade/projection";
import { formatCIFPrice } from "@/app/lib/functions/formatters";
import { useScopeLight, chartPalette } from "@/app/lib/functions/chartPalette";
import { downsampleTo } from "@/app/lib/functions/array";
import { translateProduct } from "@/app/lib/i18n/tradeData";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Loader2 } from "lucide-react";

interface CIFPriceLineChartProps {
  data: EDASeriesPoint[];
  loading: boolean;
  frequency: ForecastFrequency;
}

const COLORS = [
  "#0066FF", "#00C2A8", "#F5C518", "#FF5C5C", "#A78BFA",
  "#F472B6", "#34D399", "#FBBF24", "#60A5FA", "#F87171",
  "#A3E635", "#22D3EE", "#FB923C",
];

function useLineChartData(data: EDASeriesPoint[], frequency: ForecastFrequency) {
  return useMemo(() => {
    const minYear = new Date().getUTCFullYear() - 2;
    const byFreq = data.filter((p) =>
      frequency === "M" ? p.frequency === "M" : p.frequency !== "M"
    );
    const visible = byFreq.filter((p) => parseInt(p.date.slice(0, 4), 10) >= minYear);
    const source = visible.length > 0 ? visible : byFreq;

    const seriesByProduct = new Map<string, { date: string; value: number }[]>();
    for (const p of source) {
      if (p.cif_price === null) continue;
      if (!seriesByProduct.has(p.product)) seriesByProduct.set(p.product, []);
      seriesByProduct.get(p.product)!.push({ date: p.date, value: Number(p.cif_price) });
    }

    const allDates = Array.from(new Set(source.map((p) => p.date))).sort();
    const merged: Record<string, number | string>[] = allDates.map((d) => ({ date: d }));
    seriesByProduct.forEach((arr, product) => {
      const map = new Map(arr.map((p) => [p.date, p.value]));
      merged.forEach((row) => {
        if (map.has(row.date as string)) {
          row[product] = map.get(row.date as string)!;
        }
      });
    });

    const productNames = Array.from(seriesByProduct.keys());
    // Muestrear el eje X para no renderizar miles de puntos SVG.
    const display = downsampleTo(merged, 80);
    return { merged: display, productNames };
  }, [data, frequency]);
}

export const CIFPriceLineChart = memo(function CIFPriceLineChart({ data, loading, frequency }: CIFPriceLineChartProps) {
  const locale = useDashboard((s) => s.locale);
  const t = getTranslation(locale);
  const { ref: cardRef, light } = useScopeLight();
  const pal = chartPalette(light);

  const { merged, productNames } = useLineChartData(data, frequency);

  if (loading && data.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(300px,72vw,380px)] flex items-center justify-center text-gray-4">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  if (productNames.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(300px,72vw,380px)] flex items-center justify-center text-gray-4 text-sm">
        {t.eda.noData}
      </div>
    );
  }

  return (
    <div ref={cardRef} className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(300px,72vw,380px)] flex flex-col">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-white">{t.eda.cifPriceLine}</h3>
      </div>
      <div className="flex-1 min-h-0 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={merged} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              stroke={pal.axis}
              fontSize={10}
              tickFormatter={(v: string) => v.slice(0, 7)}
              minTickGap={32}
            />
            <YAxis
              stroke={pal.axis}
              fontSize={10}
              tickFormatter={(v: number) => formatCIFPrice(v)}
            />
            <Tooltip
              contentStyle={{
                background: pal.tooltipBg,
                border: `1px solid ${pal.tooltipBorder}`,
                borderRadius: 6,
                fontSize: 12,
              }}
              labelStyle={{ color: pal.tooltipLabel }}
              formatter={(v) => formatCIFPrice(v as number)}
            />
            <Legend wrapperStyle={{ fontSize: 10, color: pal.legend }} />
            {productNames.map((product, i) => (
              <Line
                key={product}
                type="monotone"
                dataKey={product}
                name={translateProduct(product, locale)}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={1.5}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
