"use client";

import { memo, useMemo } from "react";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { ForecastMetric, ForecastModel } from "@/app/interfaces/trade/projection";
import { formatNumber } from "@/app/lib/functions/formatters";
import { HintIcon } from "@/components/ui/HintIcon";
import { Loader2 } from "lucide-react";

interface MetricsTableProps {
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

export const MetricsTable = memo(function MetricsTable({ metrics, loading }: MetricsTableProps) {
  const locale = useDashboard((s) => s.locale);
  const t = getTranslation(locale);

  const sorted = useMemo(
    () =>
      [...metrics].sort((a, b) => {
        const aR = a.rmse ?? Infinity;
        const bR = b.rmse ?? Infinity;
        return aR - bR;
      }),
    [metrics]
  );

  if (loading && metrics.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[300px] flex items-center justify-center text-gray-4">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[300px] flex items-center justify-center text-gray-4 text-sm">
        {t.projection.noData}
      </div>
    );
  }

  return (
    <div className="bg-navy-card border border-navy-line rounded-lg p-5 flex flex-col">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-1.5">
        {t.projection.metricsTable}
        <HintIcon text={t.projection.metricsTableHint} />
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-gray-4 border-b border-navy-line">
              <th className="text-left py-2 px-2 font-semibold">{t.projection.model}</th>
              <th className="text-right py-2 px-2 font-semibold">{t.projection.rmse}</th>
              <th className="text-right py-2 px-2 font-semibold">{t.projection.mae}</th>
              <th className="text-right py-2 px-2 font-semibold">{t.projection.mape}</th>
              <th className="text-right py-2 px-2 font-semibold">{t.projection.weight}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m, i) => (
              <tr key={m.model} className="border-b border-navy-line/50 hover:bg-navy-mid/40">
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: MODEL_COLORS[m.model] }} />
                    <span className="text-white font-medium">{m.model}</span>
                    {i === 0 && (
                      <span className="text-[9px] uppercase tracking-wider text-green bg-green/10 border border-green/30 px-1.5 py-0.5 rounded-sm">
                        best
                      </span>
                    )}
                  </div>
                </td>
                <td className="text-right py-2 px-2 font-mono text-gray-3">{m.rmse !== null ? formatNumber(m.rmse, 2) : "-"}</td>
                <td className="text-right py-2 px-2 font-mono text-gray-3">{m.mae !== null ? formatNumber(m.mae, 2) : "-"}</td>
                <td className="text-right py-2 px-2 font-mono text-gray-3">{m.mape !== null ? formatNumber(m.mape, 2) : "-"}</td>
                <td className="text-right py-2 px-2 font-mono text-gray-3">
                  {m.weight !== null ? `${(Number(m.weight) * 100).toFixed(1)}%` : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
