"use client";

import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { EDAMetric } from "@/app/interfaces/trade/projection";
import { formatCorrelation, formatCIFPrice } from "@/app/lib/functions/formatters";
import { Loader2 } from "lucide-react";

interface ExternalFeaturesExplainerProps {
  metrics: EDAMetric[];
  loading: boolean;
}

export function ExternalFeaturesExplainer({ metrics, loading }: ExternalFeaturesExplainerProps) {
  const locale = useDashboard((s) => s.locale);
  const t = getTranslation(locale);

  if (loading && metrics.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(300px,72vw,380px)] flex items-center justify-center text-gray-4">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(300px,72vw,380px)] flex items-center justify-center text-gray-4 text-sm">
        {t.eda.noData}
      </div>
    );
  }

  const corrFx = metrics
    .map((m) => m.correlation_cif_fx)
    .filter((v): v is number => v !== null);
  const corrCorn = metrics
    .map((m) => m.correlation_cif_corn)
    .filter((v): v is number => v !== null);
  const corrSoy = metrics
    .map((m) => m.correlation_cif_soy)
    .filter((v): v is number => v !== null);

  const avg = (arr: number[]) => (arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

  const fxAvg = avg(corrFx);
  const cornAvg = avg(corrCorn);
  const soyAvg = avg(corrSoy);

  const cell = (val: number | null) => {
    if (val === null) return { text: "-", color: "text-gray-5" };
    const abs = Math.abs(val);
    const color = abs < 0.2
      ? "text-gray-3"
      : val > 0
      ? "text-green"
      : "text-red";
    return { text: formatCorrelation(val), color };
  };

  const items = [
    { label: t.eda.corrFx, value: cell(fxAvg) },
    { label: t.eda.corrCorn, value: cell(cornAvg) },
    { label: t.eda.corrSoy, value: cell(soyAvg) },
  ];

  return (
    <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(300px,72vw,380px)] flex flex-col">
      <h3 className="text-sm font-semibold text-white mb-3">{t.eda.correlations}</h3>
      <p className="text-[10px] text-gray-5 mb-3">{t.eda.avgCorrelation}</p>
      <div className="grid grid-cols-3 gap-3 flex-1">
        {items.map((item) => (
          <div key={item.label} className="bg-navy-mid border border-navy-line rounded-md p-3 flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-wider text-gray-4 mb-1">{item.label}</p>
            <p className={`text-2xl font-bold font-mono ${item.value.color}`}>{item.value.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
