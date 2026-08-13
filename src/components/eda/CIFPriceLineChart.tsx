"use client";

import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { EDASeriesPoint } from "@/app/interfaces/trade/projection";
import { formatCIFPrice } from "@/app/lib/functions/formatters";
import { useScopeLight, chartPalette } from "@/app/lib/functions/chartPalette";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Loader2 } from "lucide-react";

interface CIFPriceLineChartProps {
  data: EDASeriesPoint[];
  loading: boolean;
  frequency: "D" | "M";
}

export function CIFPriceLineChart({ data, loading, frequency }: CIFPriceLineChartProps) {
  const locale = useDashboard((s) => s.locale);
  const t = getTranslation(locale);
  const { ref: cardRef, light } = useScopeLight();
  const pal = chartPalette(light);

  if (loading && data.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(300px,72vw,380px)] flex items-center justify-center text-gray-4">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(300px,72vw,380px)] flex items-center justify-center text-gray-4 text-sm">
        {t.eda.noData}
      </div>
    );
  }

  const seriesByProduct = new Map<string, { date: string; value: number }[]>();
  for (const p of data) {
    if (p.cif_price === null) continue;
    if (!seriesByProduct.has(p.product)) seriesByProduct.set(p.product, []);
    seriesByProduct.get(p.product)!.push({ date: p.date, value: Number(p.cif_price) });
  }

  const allDates = Array.from(new Set(data.map((p) => p.date))).sort();
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

  const COLORS = [
    "#0066FF", "#00C2A8", "#F5C518", "#FF5C5C", "#A78BFA",
    "#F472B6", "#34D399", "#FBBF24", "#60A5FA", "#F87171",
    "#A3E635", "#22D3EE", "#FB923C",
  ];

  return (
    <div ref={cardRef} className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(300px,72vw,380px)] flex flex-col">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-white">{t.eda.cifPriceLine}</h3>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={merged} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              stroke={pal.axis}
              fontSize={10}
              tickFormatter={(v: string) => {
                if (frequency === "M") return v.slice(0, 7);
                return v.slice(5);
              }}
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
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={1.5}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
