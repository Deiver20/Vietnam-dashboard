"use client";

import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { ForecastPoint, ForecastFrequency } from "@/app/interfaces/trade/projection";
import { formatNumber } from "@/app/lib/functions/formatters";
import { Loader2 } from "lucide-react";

interface ProjectedValuesTableProps {
  points: ForecastPoint[];
  loading: boolean;
  frequency: ForecastFrequency;
}

const MESES_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatDate(dateStr: string, frequency: "D" | "M"): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  if (frequency === "M") {
    const month = d.getUTCMonth();
    const year = d.getUTCFullYear();
    return `${MESES_ES[month]} ${year}`;
  }
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function ProjectedValuesTable({ points, loading, frequency }: ProjectedValuesTableProps) {
  const locale = useDashboard((s) => s.locale);
  const t = getTranslation(locale);

  if (loading && points.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[300px] flex items-center justify-center text-gray-4">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  const projected = points
    .filter((p) => p.model === "Ensemble" && !p.is_historical)
    .sort((a, b) => a.forecast_date.localeCompare(b.forecast_date));

  if (projected.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[300px] flex items-center justify-center text-gray-4 text-sm">
        {t.projection.noData}
      </div>
    );
  }

  return (
    <div className="bg-navy-card border border-navy-line rounded-lg p-5 flex flex-col">
      <h3 className="text-sm font-semibold text-white mb-3">{t.projection.projectedValues}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-gray-4 border-b border-navy-line">
              <th className="text-left py-2 px-2 font-semibold">{t.projection.date}</th>
              <th className="text-right py-2 px-2 font-semibold">{t.projection.price}</th>
              <th className="text-right py-2 px-2 font-semibold">{t.projection.lowerRange}</th>
              <th className="text-right py-2 px-2 font-semibold">{t.projection.upperRange}</th>
            </tr>
          </thead>
          <tbody>
            {projected.map((p) => (
              <tr key={p.id || p.forecast_date} className="border-b border-navy-line/50 hover:bg-navy-mid/40">
                <td className="py-2 px-2 text-white font-medium">
                  {formatDate(p.forecast_date, frequency)}
                </td>
                <td className="text-right py-2 px-2 font-mono text-white">
                  ${formatNumber(Math.round(p.point_forecast), 0)}
                </td>
                <td className="text-right py-2 px-2 font-mono text-gray-3">
                  {p.lower_bound !== null ? `$${formatNumber(Math.round(p.lower_bound), 0)}` : "-"}
                </td>
                <td className="text-right py-2 px-2 font-mono text-gray-3">
                  {p.upper_bound !== null ? `$${formatNumber(Math.round(p.upper_bound), 0)}` : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
