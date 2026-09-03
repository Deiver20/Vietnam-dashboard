"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { EDAMetric, ExternalFeature, ForecastFrequency } from "@/app/interfaces/trade/projection";
import { formatCorrelation, formatUSD } from "@/app/lib/functions/formatters";
import { cornCentsToUsdPerMt, soymealStToUsdPerMt } from "@/app/lib/functions/unitConversions";
import { useScopeLight, chartPalette, ChartPalette } from "@/app/lib/functions/chartPalette";
import { downsampleTo } from "@/app/lib/functions/array";
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Loader2, Maximize2, X } from "lucide-react";

interface ExternalFeaturesChartProps {
  metrics: EDAMetric[];
  external: ExternalFeature[];
  loading: boolean;
  frequency: ForecastFrequency;
  countryCode?: string;
}

interface ChartDatum {
  date: string;
  cif: number | null;
  fx: number | null;
  corn: number | null;
  soy: number | null;
}

function ExternalChart({ data, pal, t, fxLabel, expandable }: {
  data: ChartDatum[];
  pal: ChartPalette;
  t: ReturnType<typeof getTranslation>;
  fxLabel: string;
  expandable: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 16, right: 12, left: 5, bottom: 0 }}>
        <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
        <XAxis dataKey="date" stroke={pal.axis} fontSize={expandable ? 12 : 10} minTickGap={32} tickFormatter={(v) => v.slice(0, 7)} />
        <YAxis yAxisId="left" stroke={pal.axis} fontSize={expandable ? 12 : 10} tickFormatter={(v: number) => formatUSD(v, 0)} width={expandable ? 72 : 58} />
        <YAxis yAxisId="right" orientation="right" stroke={pal.axis} fontSize={expandable ? 12 : 10} tickFormatter={(v: number) => `${v.toFixed(0)} $/MT`} width={expandable ? 92 : 68} />
        <Tooltip
          contentStyle={{ background: pal.tooltipBg, border: `1px solid ${pal.tooltipBorder}`, borderRadius: 6, fontSize: 12 }}
          labelStyle={{ color: pal.tooltipLabel }}
          formatter={(v, name) => {
            const num = v as number;
            const label = String(name ?? "");
            const low = label.toLowerCase();
            if (low.includes("usd/cop") || low.includes("usd/vnd") || low.includes("usdcop") || low.includes("usdvnd") || low.includes("usd/")) return [formatUSD(num, 0), label];
            if (low.includes("cif")) return [`${num.toFixed(2)} $/MT`, label];
            if (label && (low.includes("corn") || low.includes("soy") || low.includes("maíz") || low.includes("soja") || low.includes("soya") || low.includes("maïs") || low.includes("milho") || low.includes("farelo") || low.includes("tourteau"))) {
              return [`${num.toFixed(2)} $/MT`, label];
            }
            return [num, label];
          }}
        />
        <Legend wrapperStyle={{ fontSize: expandable ? 12 : 10, color: pal.legend }} />
        <Bar yAxisId="right" dataKey="corn" name={t.eda.externalCorn} fill="#F5C518" fillOpacity={0.6} isAnimationActive={false} />
        <Bar yAxisId="right" dataKey="soy" name={t.eda.externalSoy} fill="#00C2A8" fillOpacity={0.6} isAnimationActive={false} />
        <Line yAxisId="right" type="monotone" dataKey="cif" name={t.eda.externalCif} stroke="#FF5C5C" strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
        <Line yAxisId="left" type="monotone" dataKey="fx" name={fxLabel} stroke="#0066FF" strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export const ExternalFeaturesChart = memo(function ExternalFeaturesChart({ metrics, external, loading, frequency, countryCode }: ExternalFeaturesChartProps) {
  const locale = useDashboard((s) => s.locale);
  const t = getTranslation(locale);
  const { ref: cardRef, light } = useScopeLight();
  const pal = chartPalette(light);
  const overlayPal = chartPalette(false);
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  // País explícito si viene del scope, fallback a inferencia por magnitud
  const FX_LABELS: Record<string, string> = {
    VIE: "USD/VND", COL: "USD/COP", CHI: "USD/CLP", CHILE: "USD/CLP", BRA: "USD/BRL", ARG: "USD/ARS",
    CHINA: "USD/CNY", BAN: "USD/BDT", BEL: "EUR/USD", BOL: "USD/BOB", COS: "USD/CRC", ECU: "USD/USD",
    GER: "EUR/USD", GUA: "USD/GTQ", HON: "USD/HNL", ITA: "EUR/USD", MEX: "USD/MXN", NET: "EUR/USD",
    NIG: "USD/NGN", PER: "USD/PEN", PHI: "USD/PHP", SAL: "USD/USD", SOU: "USD/ZAR", SPA: "EUR/USD",
    UK: "GBP/USD", USA: "USD/USD",
  };
  const inferredCountry = useMemo(() => {
    const code = String(countryCode || "").toUpperCase();
    if (FX_LABELS[code]) return code;
    if (code === "CO") return "COL";
    if (code === "VN" || code === "VNM") return "VIE";
    const vals = external.filter((e) => e.fx_usdvnd != null).map((e) => Number(e.fx_usdvnd)).filter((n) => Number.isFinite(n));
    if (vals.length === 0) return "VIE";
    const sorted = [...vals].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    // Heurística solo fallback: COP 3k, VND 24k, CLP ~900, BRL ~5, ARS ~1300
    if (median > 20000) return "VIE";
    if (median > 3000) return "COL";
    if (median > 1000) return "ARG";
    return "CHI";
  }, [external, countryCode]);
  const fxLabel = FX_LABELS[inferredCountry] || `USD/${inferredCountry}`;

  const chartData = useMemo(() => {
    const mapped = external.map((e) => ({
      date: e.date,
      cif: e.cif_price !== null ? Number(e.cif_price) : null,
      fx: e.fx_usdvnd !== null ? Number(e.fx_usdvnd) : null,
      corn: e.corn_fut !== null ? cornCentsToUsdPerMt(Number(e.corn_fut)) : null,
      soy: e.soymeal_fut !== null ? soymealStToUsdPerMt(Number(e.soymeal_fut)) : null,
    }));
    if (frequency === "M") {
      const map = new Map<string, { cif: number[]; fx: number[]; corn: number[]; soy: number[] }>();
      for (const d of mapped) {
        const key = d.date.slice(0, 7);
        const cur = map.get(key) || { cif: [], fx: [], corn: [], soy: [] };
        if (d.cif !== null) cur.cif.push(d.cif);
        if (d.fx !== null) cur.fx.push(d.fx);
        if (d.corn !== null) cur.corn.push(d.corn);
        if (d.soy !== null) cur.soy.push(d.soy);
        map.set(key, cur);
      }
      const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
      return Array.from(map.entries())
        .map(([key, v]) => ({
          date: key,
          cif: avg(v.cif),
          fx: avg(v.fx),
          corn: avg(v.corn),
          soy: avg(v.soy),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }
    // Reducir densidad de puntos para evitar bloqueo del hilo principal.
    return downsampleTo(mapped, 80);
  }, [external, frequency]);

  const latest = metrics.find((m) => m.product) || metrics[0];
  const fxCorr = latest?.correlation_cif_fx ?? null;
  const cornCorr = latest?.correlation_cif_corn ?? null;
  const soyCorr = latest?.correlation_cif_soy ?? null;

  if (loading && external.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(340px,72vw,440px)] flex items-center justify-center text-gray-4">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(340px,72vw,440px)] flex items-center justify-center text-gray-4 text-sm">
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

  const header = (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-white mb-1">{t.eda.externalFeatures} <span className="font-normal text-gray-5">· {fxLabel}</span></h3>
        <p className="text-[10px] text-gray-5">{t.eda.externalFeaturesExplainer} {inferredCountry === "COL" ? "(COP)" : "(VND)"}</p>
      </div>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-label="Ampliar gráfico"
        className="shrink-0 flex items-center gap-1 rounded-sm border border-navy-line bg-navy-mid px-2 py-1 text-[10px] text-gray-4 hover:text-white hover:border-gray-5 transition-colors"
      >
        <Maximize2 className="w-3 h-3" />
        <span className="hidden sm:inline">Ampliar</span>
      </button>
    </div>
  );

  const corrRow = (fxCorr !== null || cornCorr !== null || soyCorr !== null) && (
    <div className="flex flex-wrap gap-1.5">
      {fxCorr !== null && corrChip(fxLabel, fxCorr >= 0 ? "#34D399" : "#F87171", fxCorr)}
      {cornCorr !== null && corrChip(t.eda.corrCorn, cornCorr >= 0 ? "#34D399" : "#F87171", cornCorr)}
      {soyCorr !== null && corrChip(t.eda.corrSoy, soyCorr >= 0 ? "#34D399" : "#F87171", soyCorr)}
    </div>
  );

  return (
    <>
      <div ref={cardRef} className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(340px,72vw,440px)] flex flex-col">
        {header}
        {corrRow && <div className="mt-2 mb-2">{corrRow}</div>}
        <div className="flex-1 min-h-0">
          <ExternalChart data={chartData} pal={pal} t={t} fxLabel={fxLabel} expandable={false} />
        </div>
      </div>

      {expanded && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={t.eda.externalFeatures}
          onClick={(e) => {
            if (e.target === e.currentTarget) setExpanded(false);
          }}
        >
          <div className="relative w-full h-[92vh] bg-navy-card border border-navy-line rounded-lg p-4 sm:p-6 flex flex-col shadow-2xl">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-white mb-1">{t.eda.externalFeatures} <span className="font-normal text-gray-5">· {fxLabel}</span></h3>
                <p className="text-[11px] text-gray-5">{t.eda.externalFeaturesExplainer} {inferredCountry === "COL" ? "(COP)" : "(VND)"}</p>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                aria-label="Cerrar"
                className="shrink-0 flex items-center gap-1 rounded-sm border border-navy-line bg-navy-mid px-2 py-1 text-[11px] text-gray-4 hover:text-white hover:border-gray-5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar</span>
              </button>
            </div>
            {corrRow && <div className="mb-3">{corrRow}</div>}
            <div className="flex-1 min-h-0">
              <ExternalChart data={chartData} pal={overlayPal} t={t} fxLabel={fxLabel} expandable />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
});
