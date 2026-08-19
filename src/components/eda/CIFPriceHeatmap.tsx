"use client";

import { memo, useMemo } from "react";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { EDASeriesPoint } from "@/app/interfaces/trade/projection";
import { formatCIFPrice } from "@/app/lib/functions/formatters";
import { Loader2 } from "lucide-react";

interface CIFPriceHeatmapProps {
  data: EDASeriesPoint[];
  loading: boolean;
  productsAvailable: string[];
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function colorScale(value: number, min: number, max: number): string {
  if (min === max) return "rgba(0, 102, 255, 0.5)";
  const t = (value - min) / (max - min);
  const r = Math.round(0 + t * 245);
  const g = Math.round(102 + t * (197 - 102));
  const b = Math.round(255 + t * (24 - 255));
  return `rgba(${r}, ${g}, ${b}, 0.85)`;
}

function useHeatmap(data: EDASeriesPoint[]) {
  return useMemo(() => {
    const allKeys = new Set<string>();
    for (const p of data) {
      if (p.cif_price === null) continue;
      const year = p.date.slice(0, 4);
      const month = p.date.slice(5, 7);
      const key = `${year}-${month}`;
      allKeys.add(key);
    }

    const yearMonthMap = new Map<string, { sum: number; count: number }>();
    for (const p of data) {
      if (p.cif_price === null) continue;
      const year = p.date.slice(0, 4);
      const month = p.date.slice(5, 7);
      const key = `${year}-${month}`;
      const cur = yearMonthMap.get(key) || { sum: 0, count: 0 };
      cur.sum += Number(p.cif_price);
      cur.count += 1;
      yearMonthMap.set(key, cur);
    }

    const sortedKeys = Array.from(allKeys).sort();
    const yearsSet = new Set(sortedKeys.map((k) => k.slice(0, 4)));
    const years = Array.from(yearsSet).filter((y) => parseInt(y) >= 2022).sort();
    const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

    const matrix: (number | null)[][] = years.map(() => months.map(() => null));
    const allValues: number[] = [];
    sortedKeys.forEach((k) => {
      const year = k.slice(0, 4);
      const month = k.slice(5, 7);
      const yi = years.indexOf(year);
      const mi = months.indexOf(month);
      if (yi < 0 || mi < 0) return;
      const v = yearMonthMap.get(k);
      if (v) {
        matrix[yi][mi] = v.sum / v.count;
        allValues.push(matrix[yi][mi]!);
      }
    });
    const minVal = allValues.length > 0 ? Math.min(...allValues) : 0;
    const maxVal = allValues.length > 0 ? Math.max(...allValues) : 1;

    return { years, months, matrix, minVal, maxVal };
  }, [data]);
}

export const CIFPriceHeatmap = memo(function CIFPriceHeatmap({ data, loading, productsAvailable }: CIFPriceHeatmapProps) {
  const locale = useDashboard((s) => s.locale);
  const t = getTranslation(locale);

  const { years, months, matrix, minVal, maxVal } = useHeatmap(data);

  if (loading && data.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 flex-1 min-h-0 flex items-center justify-center text-gray-4">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  if (data.length === 0 || productsAvailable.length === 0 || years.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 flex-1 min-h-0 flex items-center justify-center text-gray-4 text-sm">
        {t.eda.noData}
      </div>
    );
  }

  return (
    <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 flex-1 min-h-0 flex flex-col">
      <h3 className="text-sm font-semibold text-white mb-3">{t.eda.cifPriceHeatmap}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr>
              <th className="text-left text-gray-4 font-medium p-1">{t.eda.heatmapYear} \\ {t.eda.heatmapMonth}</th>
              {MONTH_LABELS.map((m) => (
                <th key={m} className="text-gray-4 font-medium p-1 text-center">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {years.map((year, yi) => (
              <tr key={year}>
                <td className="text-gray-3 font-medium p-1">{year}</td>
                {months.map((_, mi) => {
                  const v = matrix[yi][mi];
                  return (
                    <td
                      key={mi}
                      className="p-0.5"
                      title={v !== null ? formatCIFPrice(v) : "n/a"}
                    >
                      <div
                        className="rounded-sm h-7 flex items-center justify-center text-[9px] font-mono"
                        style={{
                          background: v !== null ? colorScale(v, minVal, maxVal) : "transparent",
                          color: v !== null ? "#fff" : "transparent",
                          border: v === null ? "1px dashed #1a2b40" : "none",
                        }}
                      >
                        {v !== null ? Math.round(v) : ""}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] text-gray-5">
        <span>Low: {formatCIFPrice(minVal)}</span>
        <div className="flex-1 mx-3 h-1.5 rounded-full" style={{
          background: `linear-gradient(to right, ${colorScale(minVal, minVal, maxVal)}, ${colorScale((minVal + maxVal) / 2, minVal, maxVal)}, ${colorScale(maxVal, minVal, maxVal)})`,
        }} />
        <span>High: {formatCIFPrice(maxVal)}</span>
      </div>
    </div>
  );
});
