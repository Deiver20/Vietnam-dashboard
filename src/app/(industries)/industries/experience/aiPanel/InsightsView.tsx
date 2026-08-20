"use client";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Info,
  Loader2,
  Minus,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDashboard } from "@/store/useDashboard";
import { formatCurrency, formatUSD, formatVolume, formatYearRange } from "@/app/lib/functions/formatters";
import { useAiPanelEnv } from "./env";
import { useInsights } from "./useInsights";

function fmtPct(v: number | null, dec = 1) {
  if (v === null || !Number.isFinite(v)) return "-";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(dec)}%`;
}

const badgeStyles: Record<string, { bg: string; text: string; icon: typeof Info }> = {
  success: { bg: "rgba(0,183,34,0.15)", text: "#00B722", icon: CheckCircle2 },
  warning: { bg: "rgba(240,122,58,0.15)", text: "#F07A3A", icon: AlertTriangle },
  info: { bg: "rgba(34,123,255,0.15)", text: "#227BFF", icon: Info },
  danger: { bg: "rgba(220,38,38,0.15)", text: "#DC2626", icon: AlertTriangle },
  oportunidad: { bg: "rgba(16,185,129,0.15)", text: "#10B981", icon: Sparkles },
};

const DICT: Record<string, Record<string, string>> = {
  en: {
    subtitle: "AUTOMATIC ANALYSIS",
    deep: "Deep analysis",
    generate: "Generate Analysis",
    analyzing: "Analyzing...",
    regenerate: "Regenerate",
    noInsights: "No AI insights yet — generate to get 7 deep insights for this dashboard.",
    snapshot: "Market snapshot",
    cagr: "CAGR",
    yoy: "YoY",
    avgPrice: "Avg CIF",
    avgShipment: "Avg shipment",
    aiTitle: "AI Insights — whole board",
    aiHint: "7 insights covering scale, momentum, concentration, pricing, operations and outlook. Quantified, with 12-month projection.",
  },
  es: {
    subtitle: "ANÁLISIS AUTOMÁTICO",
    deep: "Análisis profundo",
    generate: "Generar Análisis",
    analyzing: "Analizando...",
    regenerate: "Regenerar",
    noInsights: "Sin insights de IA aún — genera para obtener 7 insights profundos de este tablero.",
    snapshot: "Foto del mercado",
    cagr: "CAGR",
    yoy: "Var. interanual",
    avgPrice: "CIF promedio",
    avgShipment: "Embarque prom.",
    aiTitle: "Insights IA — tablero completo",
    aiHint: "7 insights que cubren escala, impulso, concentración, precio, operaciones y perspectiva. Cuantificados y con proyección a 12 meses.",
  },
  fr: {
    subtitle: "ANALYSE AUTOMATIQUE",
    deep: "Analyse approfondie",
    generate: "Générer l'Analyse",
    analyzing: "Analyse en cours...",
    regenerate: "Régénérer",
    noInsights: "Pas encore d'insights IA — générez pour obtenir 7 insights.",
    snapshot: "Aperçu du marché",
    cagr: "TCAC",
    yoy: "Glissement annuel",
    avgPrice: "CIF moyen",
    avgShipment: "Expédition moy.",
    aiTitle: "Insights IA — tableau complet",
    aiHint: "7 insights couvrant échelle, dynamique, concentration, prix et opérations.",
  },
  pt: {
    subtitle: "ANÁLISE AUTOMÁTICA",
    deep: "Análise profunda",
    generate: "Gerar Análise",
    analyzing: "Analisando...",
    regenerate: "Regenerar",
    noInsights: "Sem insights de IA ainda — gere para obter 7 insights.",
    snapshot: "Foto do mercado",
    cagr: "CAGR",
    yoy: "Var. anual",
    avgPrice: "CIF médio",
    avgShipment: "Embarque médio",
    aiTitle: "Insights IA — painel completo",
    aiHint: "7 insights cobrindo escala, impulso, concentração, preço e operações.",
  },
};

export function InsightsView() {
  const { dark } = useAiPanelEnv();
  const locale = useDashboard((s) => s.locale);
  const filters = useDashboard((s) => s.filters);
  const { metrics } = useInsights();
  const d = DICT[locale] ?? DICT.en;

  const divider = dark ? "border-white/10" : "border-black/[0.08]";
  const cardBg = dark ? "bg-white/[0.04] border-white/10" : "bg-black/[0.03] border-black/[0.06]";
  const cardStrongBg = dark ? "bg-white/[0.06] border-white/10" : "bg-black/[0.04] border-black/[0.08]";
  const muted = dark ? "text-white/50" : "text-gray-500";
  const textMain = dark ? "text-white" : "text-gray-900";
  const textSec = dark ? "text-white/70" : "text-gray-600";
  const textTert = dark ? "text-white/50" : "text-gray-500";

  const [aiInsights, setAiInsights] = useState<Array<{ id: string; title: string; description: string; badge: string; timestamp?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFiltersRef = useRef<string>("");

  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api";

  const fetchInsights = useCallback(
    async (force = false) => {
      if (!metrics) return;
      const key = JSON.stringify({ filters, locale });
      if (!force && lastFiltersRef.current === key && aiInsights.length > 0) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${backendBase}/trade/insights`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters, locale, forceRefresh: force }),
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`HTTP ${res.status}: ${txt.slice(0, 300)}`);
        }
        const json = await res.json();
        const data = (json.data ?? json.insights ?? []) as Array<{ id: string; title: string; description: string; badge: string; timestamp?: string }>;
        setAiInsights(data);
        lastFiltersRef.current = key;
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    },
    [filters, locale, metrics, backendBase, aiInsights.length]
  );

  useEffect(() => {
    if (metrics && aiInsights.length === 0 && !loading && !error) {
      fetchInsights(false);
    }
  }, [metrics, aiInsights.length, loading, error, fetchInsights]);

  if (!metrics) {
    return (
      <div className="flex flex-col h-full">
        <div className={`shrink-0 pb-3 border-b ${divider}`}>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${muted}`}>{d.subtitle}</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-10">
          <Sparkles className={`h-8 w-8 mb-2 ${dark ? "text-white/40" : "text-gray-400"}`} />
          <p className={`text-xs ${muted}`}>{locale === "es" ? "Sin datos para analizar" : "No data to analyze"}</p>
        </div>
      </div>
    );
  }

  const m = metrics;
  const yearLabel = formatYearRange(m.yearRange[0], m.yearRange[1]);

  return (
    <div className="flex flex-col h-full">
      <div className={`shrink-0 pb-3 border-b ${divider}`}>
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${muted}`}>{d.subtitle} · {yearLabel}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#227BFF] text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
            <Sparkles className="h-3 w-3" /> {d.deep}
          </span>
        </div>
        <p className={`text-[11px] leading-snug mt-2 ${textTert}`}>
          {locale === "es"
            ? "Síntesis IA del tablero completo (filtros aplicados). 7 insights profundos, cuantificados y con proyección a 12 meses."
            : locale === "fr"
            ? "Synthèse IA du tableau complet (filtres appliqués). 7 insights quantifiés avec projection à 12 mois."
            : locale === "pt"
            ? "Síntese IA do painel completo (filtros aplicados). 7 insights quantificados com projeção de 12 meses."
            : "AI synthesis of the whole board (applied filters). 7 quantified insights with 12-month outlook."}
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto py-3 space-y-3 pr-1">
        <div className="grid grid-cols-2 gap-2">
          <div className={`rounded-lg border p-2.5 ${cardBg}`}>
            <div className={`text-[10px] uppercase tracking-wider font-bold flex items-center gap-1 ${muted}`}>{d.cagr} {m.cagrVal !== null && m.cagrVal > 1 ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> : m.cagrVal !== null && m.cagrVal < -1 ? <ArrowDownRight className="w-3 h-3 text-red-400" /> : <Minus className="w-3 h-3" />}</div>
            <div className={`text-[13px] font-bold font-mono mt-1 ${textMain}`}>{m.cagrVal !== null ? fmtPct(m.cagrVal) : "-"}</div>
            <div className={`text-[10px] ${textTert}`}>{m.tl.length} {locale === "es" ? "años" : "years"} · σ {m.volSigma.toFixed(1)}pp</div>
          </div>
          <div className={`rounded-lg border p-2.5 ${cardBg}`}>
            <div className={`text-[10px] uppercase tracking-wider font-bold flex items-center gap-1 ${muted}`}>{d.yoy} {m.last?.year ?? ""} {m.lastYoy !== null && m.lastYoy > 0 ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> : m.lastYoy !== null && m.lastYoy < 0 ? <ArrowDownRight className="w-3 h-3 text-red-400" /> : null}</div>
            <div className={`text-[13px] font-bold font-mono mt-1 ${textMain}`}>{fmtPct(m.lastYoy)}</div>
            <div className={`text-[10px] ${textTert}`}>{m.momentum !== null ? `${m.momentum > 0 ? "▲" : "▼"} ${Math.abs(m.momentum).toFixed(1)}pp vs CAGR` : ""}</div>
          </div>
          <div className={`rounded-lg border p-2.5 ${cardBg}`}>
            <div className={`text-[10px] uppercase tracking-wider font-bold ${muted}`}>{d.avgPrice}</div>
            <div className={`text-[13px] font-bold font-mono mt-1 ${textMain}`}>{formatUSD(m.avgPrice, 0)}</div>
            <div className={`text-[10px] flex items-center gap-1 ${textTert}`}>{fmtPct(m.priceTrend)} {m.priceTrend > 0 ? <ArrowUpRight className="w-3 h-3 text-red-400" /> : m.priceTrend < 0 ? <ArrowDownRight className="w-3 h-3 text-emerald-400" /> : null}</div>
          </div>
          <div className={`rounded-lg border p-2.5 ${cardBg}`}>
            <div className={`text-[10px] uppercase tracking-wider font-bold ${muted}`}>{d.avgShipment}</div>
            <div className={`text-[13px] font-bold font-mono mt-1 ${textMain}`}>{m.avgShipmentMt.toFixed(1)} mt</div>
            <div className={`text-[10px] ${textTert}`}>{formatVolume(m.totalVolume)} · {m.countries} {locale === "es" ? "orígenes" : "origins"}</div>
          </div>
        </div>

        <div className={`rounded-lg border p-2.5 ${dark ? "bg-white/[0.03] border-white/10" : "bg-black/[0.02] border-black/[0.06]"}`}>
          <div className={`text-[10px] uppercase tracking-wider font-bold ${muted}`}>{d.snapshot} · {yearLabel}</div>
          <div className={`text-[11px] mt-1 ${textSec}`}>{formatVolume(m.totalVolume)} · {formatCurrency(m.totalCif)} CIF · {m.records.toLocaleString()} ops · Top {m.topCountry?.country ?? "-"} {m.top1Share.toFixed(1)}% · HHI {m.hhi.toFixed(0)}</div>
        </div>

        <div className={`rounded-lg border overflow-hidden ${cardBg}`}>
          <div className={`flex items-center justify-between px-3 py-2.5 border-b ${divider} ${dark ? "bg-white/[0.04]" : "bg-black/[0.02]"}`}>
            <div>
              <div className={`text-[11px] font-bold ${textMain} flex items-center gap-1.5`}><Sparkles className="w-3.5 h-3.5 text-[#227BFF]" /> {d.aiTitle}</div>
              <div className={`text-[10px] leading-tight ${textTert}`}>{d.aiHint}</div>
            </div>
            <button
              onClick={() => fetchInsights(true)}
              disabled={loading}
              className="shrink-0 ml-2 inline-flex items-center gap-1.5 rounded-lg bg-[#227BFF] hover:bg-[#1B66D9] disabled:opacity-60 disabled:cursor-not-allowed text-white px-3 py-1.5 text-[11px] font-semibold transition-colors"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {loading ? d.analyzing : aiInsights.length ? d.regenerate : d.generate}
            </button>
          </div>

          <div className="p-3">
            {loading && aiInsights.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#227BFF]" />
                <span className={`text-xs ${muted}`}>{d.analyzing}</span>
              </div>
            ) : error ? (
              <div className={`rounded-lg border p-3 text-xs ${dark ? "bg-red-500/10 border-red-500/20 text-red-300" : "bg-red-50 border-red-200 text-red-700"}`}>
                <div className="font-semibold">Error IA</div>
                <div className="mt-1 break-words">{error}</div>
                <button onClick={() => fetchInsights(true)} className="mt-2 rounded bg-[#227BFF] text-white px-3 py-1 text-xs">Reintentar</button>
              </div>
            ) : aiInsights.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-6 text-center ${muted}`}>
                <Sparkles className={`w-8 h-8 mb-2 ${dark ? "text-white/40" : "text-gray-400"}`} />
                <p className="text-xs px-4">{d.noInsights}</p>
                <button onClick={() => fetchInsights(true)} className="mt-3 rounded-lg bg-[#227BFF] text-white px-4 py-2 text-xs font-semibold">{d.generate}</button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {aiInsights.map((item) => {
                  const style = badgeStyles[item.badge ?? "info"] ?? badgeStyles.info;
                  const Icon = style.icon;
                  return (
                    <div key={item.id} className={`flex items-start gap-2.5 pb-2.5 border-b last:border-0 last:pb-0 ${divider}`}>
                      <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: style.bg }}>
                        <Icon className="h-3.5 w-3.5" style={{ color: style.text }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-[11px] font-semibold leading-tight ${textMain}`}>{item.title}</p>
                        <p className={`text-[11px] mt-1 leading-relaxed ${textSec}`}>{item.description}</p>
                      </div>
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0" style={{ background: style.bg, color: style.text }}>{item.badge}</span>
                    </div>
                  );
                })}
                <div className={`text-[10px] leading-relaxed pt-2 border-t ${divider} ${textTert}`}>
                  {locale === "es"
                    ? `IA: 7 insights sobre filtros actuales · ${yearLabel} · Top ${m.topCountry?.country ?? "-"} ${m.top1Share.toFixed(1)}% · CAGR ${fmtPct(m.cagrVal)} · YoY ${fmtPct(m.lastYoy)}`
                    : `AI: 7 insights on current filters · ${yearLabel} · Top ${m.topCountry?.country ?? "-"} ${m.top1Share.toFixed(1)}% · CAGR ${fmtPct(m.cagrVal)}`}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
