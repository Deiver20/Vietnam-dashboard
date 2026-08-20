"use client";

import { useMemo } from "react";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { TradeOverviewItem, TradeTotalImports, TradeTimelineItem } from "@/app/interfaces/trade/interface";
import { formatVolume, formatCurrency, formatUSD, formatYearRange } from "@/app/lib/functions/formatters";
import {
  TrendingUp,
  TrendingDown,
  Globe,
  Package,
  Calendar,
  Activity,
  ShieldAlert,
  DollarSign,
  BarChart3,
  Layers,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Target,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";

interface InsightsViewProps {
  overview: TradeOverviewItem[];
  totals: TradeTotalImports | null;
  timeline: TradeTimelineItem[];
}

function fmtPct(v: number, dec = 1) {
  if (!Number.isFinite(v)) return "-";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(dec)}%`;
}

function fmtPricePerMt(cif: number, mt: number) {
  if (!mt || !cif) return "-";
  return formatUSD(cif / mt, 0) + "/mt";
}

function cagr(first: number, last: number, years: number) {
  if (first <= 0 || last <= 0 || years <= 0) return null;
  return (Math.pow(last / first, 1 / years) - 1) * 100;
}

function stddev(arr: number[]) {
  if (arr.length < 2) return 0;
  const m = arr.reduce((a, b) => a + b, 0) / arr.length;
  const v = arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length;
  return Math.sqrt(v);
}

function badgeColorForShare(share: number) {
  if (share >= 50) return "red";
  if (share >= 30) return "yellow";
  return "green";
}

function riskLabel(share: number, locale: string) {
  if (locale === "es") {
    if (share >= 50) return "Riesgo alto";
    if (share >= 30) return "Riesgo medio";
    return "Diversificado";
  }
  if (locale === "fr") {
    if (share >= 50) return "Risque élevé";
    if (share >= 30) return "Risque moyen";
    return "Diversifié";
  }
  if (locale === "pt") {
    if (share >= 50) return "Risco alto";
    if (share >= 30) return "Risco médio";
    return "Diversificado";
  }
  if (share >= 50) return "High risk";
  if (share >= 30) return "Medium risk";
  return "Diversified";
}

const DICT: Record<string, Record<string, string>> = {
  en: {
    executive: "Executive Pulse",
    growth: "Trajectory & Momentum",
    concentration: "Concentration & Dependency",
    value: "Value & Pricing",
    ops: "Operations & Fragmentation",
    outlook: "Signals to Watch",
    snapshot: "Market snapshot",
    cagr: "CAGR",
    yoy: "YoY",
    avgPrice: "Avg CIF",
    avgShipment: "Avg shipment",
    top1: "Top 1 share",
    top3: "Top 3 share",
    hhi: "HHI (est.)",
    peak: "Peak year",
    trough: "Trough year",
    volatility: "Volatility (YoY σ)",
    records: "Operations",
    importers: "Importers",
    diversification: "Origins active",
  },
  es: {
    executive: "Pulso Ejecutivo",
    growth: "Trayectoria e Impulso",
    concentration: "Concentración y Dependencia",
    value: "Valor y Precios",
    ops: "Operaciones y Fragmentación",
    outlook: "Señales a Vigilar",
    snapshot: "Foto del mercado",
    cagr: "CAGR",
    yoy: "Var. interanual",
    avgPrice: "CIF promedio",
    avgShipment: "Embarque prom.",
    top1: "Cuota Top 1",
    top3: "Cuota Top 3",
    hhi: "HHI (est.)",
    peak: "Año pico",
    trough: "Año valle",
    volatility: "Volatilidad (σ YoY)",
    records: "Operaciones",
    importers: "Importadores",
    diversification: "Orígenes activos",
  },
  fr: {
    executive: "Pouls Exécutif",
    growth: "Trajectoire et Dynamique",
    concentration: "Concentration et Dépendance",
    value: "Valeur et Prix",
    ops: "Opérations et Fragmentation",
    outlook: "Signaux à Surveiller",
    snapshot: "Aperçu du marché",
    cagr: "TCAC",
    yoy: "Glissement annuel",
    avgPrice: "CIF moyen",
    avgShipment: "Expédition moy.",
    top1: "Part Top 1",
    top3: "Part Top 3",
    hhi: "HHI (est.)",
    peak: "Année pic",
    trough: "Année creuse",
    volatility: "Volatilité (σ YoY)",
    records: "Opérations",
    importers: "Importateurs",
    diversification: "Origines actives",
  },
  pt: {
    executive: "Pulso Executivo",
    growth: "Trajetória e Impulso",
    concentration: "Concentração e Dependência",
    value: "Valor e Preços",
    ops: "Operações e Fragmentação",
    outlook: "Sinais para Observar",
    snapshot: "Foto do mercado",
    cagr: "CAGR",
    yoy: "Var. anual",
    avgPrice: "CIF médio",
    avgShipment: "Embarque médio",
    top1: "Fatia Top 1",
    top3: "Fatia Top 3",
    hhi: "HHI (est.)",
    peak: "Ano pico",
    trough: "Ano vale",
    volatility: "Volatilidade (σ YoY)",
    records: "Operações",
    importers: "Importadores",
    diversification: "Origens ativas",
  },
};

function Section({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-md border border-navy-line bg-navy-card/50 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-navy-card/80 border-b border-navy-line">
        <div className="w-6 h-6 rounded-sm bg-blue/15 border border-blue/20 flex items-center justify-center text-blue-soft shrink-0">
          {icon}
        </div>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-1">{title}</h3>
      </div>
      <div className="p-3 space-y-3">{children}</div>
    </div>
  );
}

function KPICell({ label, value, sub, trend }: { label: string; value: string; sub?: string; trend?: "up" | "down" | "flat" }) {
  return (
    <div className="rounded-sm bg-navy-darker/60 border border-navy-line px-2.5 py-2">
      <div className="text-[10px] leading-none uppercase tracking-wider text-gray-4 font-semibold flex items-center gap-1">
        {label}
        {trend === "up" && <ArrowUpRight className="w-3 h-3 text-emerald-400" />}
        {trend === "down" && <ArrowDownRight className="w-3 h-3 text-red-400" />}
        {trend === "flat" && <Minus className="w-3 h-3 text-gray-4" />}
      </div>
      <div className="text-[13px] font-bold font-mono text-white leading-tight mt-1 truncate">{value}</div>
      {sub && <div className="text-[10px] text-gray-3 leading-tight mt-0.5 line-clamp-2">{sub}</div>}
    </div>
  );
}

function BarRow({ label, value, share, color }: { label: string; value: string; share: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-[88px] shrink-0 text-[11px] text-gray-2 truncate text-right" title={label}>
        {label}
      </span>
      <div className="flex-1 h-2.5 rounded-full bg-navy-darker border border-navy-line overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(4, share))}%`, background: color }} />
      </div>
      <span className="w-[86px] shrink-0 text-[10px] font-mono text-gray-1 text-right">
        {share.toFixed(1)}% · {value}
      </span>
    </div>
  );
}

export function InsightsView({ overview, totals, timeline }: InsightsViewProps) {
  const { locale, filters } = useDashboard();
  const t = getTranslation(locale);
  const d = DICT[locale] ?? DICT.en;

  const m = useMemo(() => {
    const sorted = [...overview].sort((a, b) => b.totalMt - a.totalMt);
    const topCountry = sorted[0] ?? null;
    const totalVolume = totals?.totalMt ?? sorted.reduce((s, x) => s + x.totalMt, 0);
    const totalCif = totals?.totalCif ?? sorted.reduce((s, x) => s + (x.totalCif ?? 0), 0);
    const totalFob = totals?.totalFob ?? sorted.reduce((s, x) => s + (x.totalFob ?? 0), 0);
    const records = totals?.records ?? sorted.reduce((s, x) => s + x.records, 0);
    const countries = totals?.countries ?? sorted.length;
    const products = totals?.products ?? 0;
    const importers = totals?.importers ?? 0;
    const exporters = totals?.exporters ?? 0;
    const yearRange: [number, number] = [filters.yearStart ?? totals?.minYear ?? 0, filters.yearEnd ?? totals?.maxYear ?? 0];
    const spanYears = yearRange[1] && yearRange[0] ? yearRange[1] - yearRange[0] + 1 : timeline.length;

    const shares = sorted.map((o) => ({ ...o, share: totalVolume > 0 ? (o.totalMt / totalVolume) * 100 : 0 }));
    const top3Share = shares.slice(0, 3).reduce((s, x) => s + x.share, 0);
    const top5Share = shares.slice(0, 5).reduce((s, x) => s + x.share, 0);
    const top1Share = shares[0]?.share ?? 0;
    const hhi = shares.reduce((s, x) => s + x.share * x.share, 0);

    const tl = [...timeline].sort((a, b) => a.year - b.year);
    const yoy: Array<{ year: number; pct: number; vol: number }> = [];
    for (let i = 1; i < tl.length; i++) {
      const prev = tl[i - 1].totalMt;
      const cur = tl[i].totalMt;
      yoy.push({ year: tl[i].year, pct: prev > 0 ? ((cur - prev) / prev) * 100 : 0, vol: cur });
    }
    const yoyPcts = yoy.map((y) => y.pct);
    const avgYoy = yoyPcts.length ? yoyPcts.reduce((a, b) => a + b, 0) / yoyPcts.length : 0;
    const volSigma = stddev(yoyPcts);
    const bestYoy = yoy.length ? yoy.reduce((m, v) => (v.pct > m.pct ? v : m), yoy[0]) : null;
    const worstYoy = yoy.length ? yoy.reduce((m, v) => (v.pct < m.pct ? v : m), yoy[0]) : null;
    const peak = tl.length ? tl.reduce((m, v) => (v.totalMt > m.totalMt ? v : m), tl[0]) : null;
    const trough = tl.length ? tl.reduce((m, v) => (v.totalMt < m.totalMt ? v : m), tl[0]) : null;
    const first = tl[0] ?? null;
    const last = tl[tl.length - 1] ?? null;
    const cagrVal = first && last && first.totalMt > 0 && last.year !== first.year ? cagr(first.totalMt, last.totalMt, last.year - first.year) : null;
    const lastYoy = yoy[yoy.length - 1]?.pct ?? null;
    const momentum = lastYoy !== null && cagrVal !== null ? lastYoy - cagrVal : null;

    const avgPrice = totalVolume > 0 ? totalCif / totalVolume : 0;
    const avgFobPrice = totalVolume > 0 ? totalFob / totalVolume : 0;
    const spread = avgPrice - avgFobPrice;
    const spreadPct = avgFobPrice > 0 ? (spread / avgFobPrice) * 100 : 0;

    const priceByYear = tl.map((r) => ({ year: r.year, price: r.totalMt > 0 ? r.totalCif / r.totalMt : 0 }));
    const priceFirst = priceByYear[0]?.price ?? 0;
    const priceLast = priceByYear[priceByYear.length - 1]?.price ?? 0;
    const priceTrend = priceFirst > 0 ? ((priceLast - priceFirst) / priceFirst) * 100 : 0;
    const priceVol = stddev(priceByYear.map((p) => p.price));
    const priceVolPct = priceFirst > 0 ? (priceVol / ((priceByYear.reduce((a,b)=>a+b.price,0)/Math.max(1,priceByYear.length))||1))*100 : 0;

    const avgShipmentMt = records > 0 ? totalVolume / records : 0;
    const avgShipmentKg = avgShipmentMt * 1000;
    const recordsPerCountry = countries > 0 ? records / countries : 0;
    const volPerImporter = importers > 0 ? totalVolume / importers : 0;

    const mostValuable = sorted.length
      ? [...sorted].sort((a, b) => (b.totalCif / Math.max(1, b.totalMt)) - (a.totalCif / Math.max(1, a.totalMt)))[0]
      : null;
    const cheapest = sorted.length
      ? [...sorted].sort((a, b) => (a.totalCif / Math.max(1, a.totalMt)) - (b.totalCif / Math.max(1, b.totalMt)))[0]
      : null;

    return {
      sorted,
      shares,
      topCountry,
      top1Share,
      top3Share,
      top5Share,
      hhi,
      totalVolume,
      totalCif,
      totalFob,
      records,
      countries,
      products,
      importers,
      exporters,
      yearRange,
      spanYears,
      tl,
      yoy,
      avgYoy,
      volSigma,
      bestYoy,
      worstYoy,
      peak,
      trough,
      first,
      last,
      cagrVal,
      lastYoy,
      momentum,
      avgPrice,
      avgFobPrice,
      spread,
      spreadPct,
      priceByYear,
      priceTrend,
      priceVolPct,
      avgShipmentMt,
      avgShipmentKg,
      recordsPerCountry,
      volPerImporter,
      mostValuable,
      cheapest,
    };
  }, [overview, totals, timeline, filters.yearStart, filters.yearEnd]);

  const hasData = m.totalVolume > 0 && m.tl.length > 0;

  if (!hasData) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-3">{t.panel.askAboutData}</p>
        <div className="rounded-md border border-navy-line bg-navy-card/50 p-4 text-sm text-gray-4">{t.eda.noData}</div>
      </div>
    );
  }

  const concentrationVariant = badgeColorForShare(m.top1Share);
  const concentrationRiskText = riskLabel(m.top1Share, locale);

  const yearLabel = formatYearRange(m.yearRange[0], m.yearRange[1]);

  return (
    <div className="space-y-4 pb-2">
      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-widest font-bold text-blue-soft">{d.snapshot} · {yearLabel}</p>
        <p className="text-[11px] leading-snug text-gray-4">
          {locale === "es"
            ? "Síntesis cuantitativa del tablero completo: escala, impulso, concentración, precio y fragmentación operativa — con lectura de riesgo y oportunidad."
            : locale === "fr"
            ? "Synthèse quantitative de tout le tableau : échelle, dynamique, concentration, prix et fragmentation — avec lecture risque/opportunité."
            : locale === "pt"
            ? "Síntese quantitativa do painel completo: escala, impulso, concentração, preço e fragmentação — com leitura de risco e oportunidade."
            : "Quantitative synthesis of the whole board: scale, momentum, concentration, pricing and operational fragmentation — with risk/opportunity read."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <KPICell label={d.cagr} value={m.cagrVal !== null ? fmtPct(m.cagrVal) : "-"} sub={`${m.tl.length} ${locale === "es" ? "años" : locale === "fr" ? "ans" : locale === "pt" ? "anos" : "years"}`} trend={m.cagrVal !== null ? (m.cagrVal > 1 ? "up" : m.cagrVal < -1 ? "down" : "flat") : undefined} />
        <KPICell label={`${d.yoy} ${m.last?.year ?? ""}`} value={m.lastYoy !== null ? fmtPct(m.lastYoy) : "-"} sub={m.momentum !== null ? `${m.momentum > 0 ? "▲" : m.momentum < 0 ? "▼" : "—"} ${Math.abs(m.momentum).toFixed(1)}pp vs CAGR` : undefined} trend={m.lastYoy !== null ? (m.lastYoy > 0 ? "up" : m.lastYoy < 0 ? "down" : "flat") : undefined} />
        <KPICell label={d.avgPrice} value={formatUSD(m.avgPrice, 0)} sub={`${fmtPct(m.priceTrend)} ${locale === "es" ? "desde" : locale === "fr" ? "depuis" : locale === "pt" ? "desde" : "since"} ${m.priceByYear[0]?.year ?? ""}`} trend={m.priceTrend > 0 ? "up" : m.priceTrend < 0 ? "down" : "flat"} />
        <KPICell label={d.avgShipment} value={`${m.avgShipmentMt.toFixed(1)} mt`} sub={`${formatVolume(m.avgShipmentKg)} · ${m.records.toLocaleString()} ops`} />
      </div>

      <Section icon={<Activity className="w-3.5 h-3.5" />} title={d.executive}>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-3 rounded-sm bg-navy-darker/50 border border-navy-line p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-gray-4 font-semibold">
              {locale === "es" ? "Escala del mercado" : locale === "fr" ? "Échelle du marché" : locale === "pt" ? "Escala do mercado" : "Market scale"}
            </div>
            <div className="text-sm font-bold font-mono text-white mt-1">
              {formatVolume(m.totalVolume)} <span className="text-[11px] font-sans font-normal text-gray-3">· {formatCurrency(m.totalCif)} CIF</span>
            </div>
            <div className="text-[11px] text-gray-3 mt-1 leading-snug">
              {m.countries} {locale === "es" ? "orígenes" : locale === "fr" ? "origines" : locale === "pt" ? "origens" : "origins"} · {m.products || "—"} {locale === "es" ? "productos" : locale === "fr" ? "produits" : locale === "pt" ? "produtos" : "products"} · {m.importers || "—"} importers · {m.spanYears} {locale === "es" ? "años en rango" : "years in range"}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-navy-line bg-navy-card px-2 py-0.5 text-[10px] text-gray-2">
                <Layers className="w-3 h-3" /> {m.topCountry?.country ?? "-"} {m.top1Share.toFixed(1)}%
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${concentrationVariant === "red" ? "bg-red/15 border-red/30 text-red-300" : concentrationVariant === "yellow" ? "bg-yellow/15 border-yellow/30 text-yellow-200" : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"}`}>
                <ShieldAlert className="w-3 h-3" /> {concentrationRiskText}
              </span>
            </div>
          </div>
        </div>

        <div className="text-[11px] leading-relaxed text-gray-2 space-y-1.5">
          {locale === "es" ? (
            <>
              <p>
                <strong className="text-white">Lectura:</strong> el mercado mueve <strong className="text-white">{formatVolume(m.totalVolume)}</strong> en {m.spanYears} años ({yearLabel}) con
                un CAGR de <strong className={m.cagrVal !== null && m.cagrVal >= 0 ? "text-emerald-300" : "text-red-300"}>{m.cagrVal !== null ? fmtPct(m.cagrVal) : "-"}</strong>.
                {m.lastYoy !== null && (
                  <>
                    {" "}
                    El último año ({m.last?.year}) marcó <strong className={m.lastYoy >= 0 ? "text-emerald-300" : "text-red-300"}>{fmtPct(m.lastYoy)}</strong>
                    {m.momentum !== null && Math.abs(m.momentum) > 1.5
                      ? m.momentum > 0
                        ? " — aceleración por encima de la tendencia histórica."
                        : " — desaceleración por debajo de la tendencia histórica."
                      : " — en línea con la tendencia."}
                  </>
                )}
              </p>
              <p className="text-gray-3">
                {m.top1Share >= 50
                  ? `Dependencia crítica: ${m.topCountry?.country} concentra ${m.top1Share.toFixed(1)}% (Top 3: ${m.top3Share.toFixed(1)}%). HHI≈${m.hhi.toFixed(0)} — mercado concentrado.`
                  : m.top1Share >= 30
                  ? `Dependencia moderada: Top 1 ${m.top1Share.toFixed(1)}% y Top 3 ${m.top3Share.toFixed(1)}%. HHI≈${m.hhi.toFixed(0)} — diversificar reduce riesgo de suministro.`
                  : `Mercado atomizado: Top 1 ${m.top1Share.toFixed(1)}% y Top 3 ${m.top3Share.toFixed(1)}%. HHI≈${m.hhi.toFixed(0)} — base diversificada.`}
                {" "}
                Pico en {m.peak?.year} ({formatVolume(m.peak?.totalMt ?? 0)}) vs valle en {m.trough?.year} ({formatVolume(m.trough?.totalMt ?? 0)}).
              </p>
            </>
          ) : locale === "fr" ? (
            <>
              <p>
                <strong className="text-white">Lecture :</strong> <strong className="text-white">{formatVolume(m.totalVolume)}</strong> sur {m.spanYears} ans ({yearLabel}), TCAC{" "}
                <strong className={m.cagrVal !== null && m.cagrVal >= 0 ? "text-emerald-300" : "text-red-300"}>{m.cagrVal !== null ? fmtPct(m.cagrVal) : "-"}</strong>.
                {m.lastYoy !== null && (
                  <>
                    {" "}
                    Dernière année ({m.last?.year}) : <strong className={m.lastYoy >= 0 ? "text-emerald-300" : "text-red-300"}>{fmtPct(m.lastYoy)}</strong>
                    {m.momentum !== null && Math.abs(m.momentum) > 1.5
                      ? m.momentum > 0
                        ? " — accélération au-dessus de la tendance."
                        : " — ralentissement sous la tendance."
                      : " — aligné à la tendance."}
                  </>
                )}
              </p>
              <p className="text-gray-3">
                {m.top1Share >= 50
                  ? `Dépendance critique : ${m.topCountry?.country} ${m.top1Share.toFixed(1)}% (Top 3 ${m.top3Share.toFixed(1)}%). HHI≈${m.hhi.toFixed(0)} — marché concentré.`
                  : m.top1Share >= 30
                  ? `Dépendance modérée : Top 1 ${m.top1Share.toFixed(1)}%, Top 3 ${m.top3Share.toFixed(1)}%. HHI≈${m.hhi.toFixed(0)}.`
                  : `Marché diversifié : Top 1 ${m.top1Share.toFixed(1)}%, Top 3 ${m.top3Share.toFixed(1)}%. HHI≈${m.hhi.toFixed(0)}.`}
                {" "}
                Pic {m.peak?.year} ({formatVolume(m.peak?.totalMt ?? 0)}) vs creux {m.trough?.year} ({formatVolume(m.trough?.totalMt ?? 0)}).
              </p>
            </>
          ) : locale === "pt" ? (
            <>
              <p>
                <strong className="text-white">Leitura:</strong> <strong className="text-white">{formatVolume(m.totalVolume)}</strong> em {m.spanYears} anos ({yearLabel}), CAGR{" "}
                <strong className={m.cagrVal !== null && m.cagrVal >= 0 ? "text-emerald-300" : "text-red-300"}>{m.cagrVal !== null ? fmtPct(m.cagrVal) : "-"}</strong>.
                {m.lastYoy !== null && (
                  <>
                    {" "}
                    Último ano ({m.last?.year}): <strong className={m.lastYoy >= 0 ? "text-emerald-300" : "text-red-300"}>{fmtPct(m.lastYoy)}</strong>
                    {m.momentum !== null && Math.abs(m.momentum) > 1.5
                      ? m.momentum > 0
                        ? " — aceleração acima da tendência."
                        : " — desaceleração abaixo da tendência."
                      : " — em linha com a tendência."}
                  </>
                )}
              </p>
              <p className="text-gray-3">
                {m.top1Share >= 50
                  ? `Dependência crítica: ${m.topCountry?.country} ${m.top1Share.toFixed(1)}% (Top 3 ${m.top3Share.toFixed(1)}%). HHI≈${m.hhi.toFixed(0)} — concentrado.`
                  : m.top1Share >= 30
                  ? `Dependência moderada: Top 1 ${m.top1Share.toFixed(1)}%, Top 3 ${m.top3Share.toFixed(1)}%. HHI≈${m.hhi.toFixed(0)}.`
                  : `Atomizado: Top 1 ${m.top1Share.toFixed(1)}%, Top 3 ${m.top3Share.toFixed(1)}%. HHI≈${m.hhi.toFixed(0)} — base diversificada.`}
                {" "}
                Pico {m.peak?.year} ({formatVolume(m.peak?.totalMt ?? 0)}) vs vale {m.trough?.year} ({formatVolume(m.trough?.totalMt ?? 0)}).
              </p>
            </>
          ) : (
            <>
              <p>
                <strong className="text-white">Read:</strong> <strong className="text-white">{formatVolume(m.totalVolume)}</strong> across {m.spanYears} years ({yearLabel}), CAGR{" "}
                <strong className={m.cagrVal !== null && m.cagrVal >= 0 ? "text-emerald-300" : "text-red-300"}>{m.cagrVal !== null ? fmtPct(m.cagrVal) : "-"}</strong>.
                {m.lastYoy !== null && (
                  <>
                    {" "}
                    Last year ({m.last?.year}) printed <strong className={m.lastYoy >= 0 ? "text-emerald-300" : "text-red-300"}>{fmtPct(m.lastYoy)}</strong>
                    {m.momentum !== null && Math.abs(m.momentum) > 1.5
                      ? m.momentum > 0
                        ? " — acceleration above the historical trend."
                        : " — slowdown below trend."
                      : " — in line with trend."}
                  </>
                )}
              </p>
              <p className="text-gray-3">
                {m.top1Share >= 50
                  ? `Critical dependency: ${m.topCountry?.country} holds ${m.top1Share.toFixed(1)}% (Top 3 ${m.top3Share.toFixed(1)}%). HHI≈${m.hhi.toFixed(0)} — concentrated market.`
                  : m.top1Share >= 30
                  ? `Moderate dependency: Top 1 ${m.top1Share.toFixed(1)}%, Top 3 ${m.top3Share.toFixed(1)}%. HHI≈${m.hhi.toFixed(0)} — diversifying lowers supply risk.`
                  : `Fragmented market: Top 1 ${m.top1Share.toFixed(1)}%, Top 3 ${m.top3Share.toFixed(1)}%. HHI≈${m.hhi.toFixed(0)} — diversified base.`}
                {" "}
                Peak {m.peak?.year} ({formatVolume(m.peak?.totalMt ?? 0)}) vs trough {m.trough?.year} ({formatVolume(m.trough?.totalMt ?? 0)}).
              </p>
            </>
          )}
        </div>
      </Section>

      <Section icon={<BarChart3 className="w-3.5 h-3.5" />} title={d.growth}>
        <div className="flex items-end gap-1 h-[46px] px-1">
          {m.tl.map((r) => {
            const maxMt = Math.max(...m.tl.map((x) => x.totalMt), 1);
            const h = Math.max(6, (r.totalMt / maxMt) * 44);
            const isPeak = r.year === m.peak?.year;
            const isTrough = r.year === m.trough?.year;
            return (
              <div key={r.year} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-sm transition-all ${isPeak ? "bg-emerald-400" : isTrough ? "bg-red-400/70" : "bg-blue/60"}`}
                  style={{ height: h }}
                  title={`${r.year}: ${formatVolume(r.totalMt)}`}
                />
                <span className={`text-[9px] font-mono leading-none ${isPeak || isTrough ? "text-white font-bold" : "text-gray-4"}`}>{String(r.year).slice(-2)}</span>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-sm border border-navy-line bg-navy-darker/40 p-2">
            <div className="text-[10px] uppercase tracking-wider text-gray-4 font-semibold">{locale === "es" ? "Mejor / Peor YoY" : locale === "fr" ? "Meilleur / Pire YoY" : locale === "pt" ? "Melhor / Pior YoY" : "Best / Worst YoY"}</div>
            <div className="mt-1 space-y-0.5 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-gray-3">{m.bestYoy?.year ?? "-"}</span>
                <span className="text-emerald-300 font-bold">{m.bestYoy ? fmtPct(m.bestYoy.pct) : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-3">{m.worstYoy?.year ?? "-"}</span>
                <span className="text-red-300 font-bold">{m.worstYoy ? fmtPct(m.worstYoy.pct) : "-"}</span>
              </div>
            </div>
          </div>
          <div className="rounded-sm border border-navy-line bg-navy-darker/40 p-2">
            <div className="text-[10px] uppercase tracking-wider text-gray-4 font-semibold">{d.volatility}</div>
            <div className="text-[13px] font-bold font-mono text-white mt-1">{m.volSigma.toFixed(1)}pp</div>
            <div className="text-[10px] text-gray-3 leading-tight mt-0.5">
              {locale === "es" ? `Promedio YoY ${fmtPct(m.avgYoy)}` : locale === "fr" ? `Moyenne YoY ${fmtPct(m.avgYoy)}` : locale === "pt" ? `Média YoY ${fmtPct(m.avgYoy)}` : `Avg YoY ${fmtPct(m.avgYoy)}`} · {m.volSigma > 12 ? (locale === "es" ? "muy volátil" : "highly volatile") : m.volSigma > 6 ? (locale === "es" ? "volatilidad media" : "moderate volatility") : (locale === "es" ? "estable" : "stable")}
            </div>
          </div>
        </div>
        <div className="rounded-sm border border-navy-line bg-navy-darker/30 p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-1">
            <Activity className="w-3.5 h-3.5 text-blue-soft" />
            {locale === "es" ? "Tabla YoY" : locale === "fr" ? "Tableau YoY" : locale === "pt" ? "Tabela YoY" : "YoY table"}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {m.yoy.slice(-6).map((y) => (
              <div key={y.year} className="rounded-sm border border-navy-line bg-navy-card/60 px-2 py-1.5 text-center">
                <div className="text-[10px] font-mono text-gray-4">{y.year}</div>
                <div className={`text-[11px] font-bold font-mono ${y.pct >= 0 ? "text-emerald-300" : "text-red-300"}`}>{fmtPct(y.pct)}</div>
                <div className="text-[9px] text-gray-4 font-mono">{formatVolume(y.vol)}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[11px] leading-relaxed text-gray-3">
          {locale === "es"
            ? `El rango ${m.trough?.year}→${m.peak?.year} implica un swing de ${m.trough && m.peak ? fmtPct(((m.peak.totalMt - m.trough.totalMt) / Math.max(1, m.trough.totalMt)) * 100) : "-"} entre valle y pico. ${
                m.volSigma > 10 ? "Alta dispersión interanual: planificar con colchón de inventario y cobertura." : m.volSigma > 5 ? "Volatilidad contenida: el ciclo es legible, útil para negociar contratos anuales." : "Trayectoria muy estable: facilita forecast y pricing forward."
              }`
            : locale === "fr"
            ? `Amplitude ${m.trough?.year}→${m.peak?.year} : ${m.trough && m.peak ? fmtPct(((m.peak.totalMt - m.trough.totalMt) / Math.max(1, m.trough.totalMt)) * 100) : "-"} entre creux et pic. ${
                m.volSigma > 10 ? "Forte dispersion : prévoir stock tampon." : m.volSigma > 5 ? "Volatilité contenue." : "Trajectoire très stable."
              }`
            : locale === "pt"
            ? `Amplitude ${m.trough?.year}→${m.peak?.year}: ${m.trough && m.peak ? fmtPct(((m.peak.totalMt - m.trough.totalMt) / Math.max(1, m.trough.totalMt)) * 100) : "-"} entre vale e pico.`
            : `Swing ${m.trough?.year}→${m.peak?.year}: ${m.trough && m.peak ? fmtPct(((m.peak.totalMt - m.trough.totalMt) / Math.max(1, m.trough.totalMt)) * 100) : "-"} valley-to-peak. ${
                m.volSigma > 10 ? "High dispersion — keep buffer stock and hedge." : m.volSigma > 5 ? "Contained volatility — cycle is readable for annual contracting." : "Very stable path — friendly to forward pricing."
              }`}
        </p>
      </Section>

      <Section icon={<Globe className="w-3.5 h-3.5" />} title={d.concentration}>
        <div className="space-y-1.5">
          {m.shares.slice(0, 5).map((s, i) => {
            const palette = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];
            return <BarRow key={s.country} label={`${i + 1}. ${s.country}`} value={formatVolume(s.totalMt)} share={s.share} color={palette[i % palette.length]} />;
          })}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-sm border border-navy-line bg-navy-darker/40 px-2 py-2 text-center">
            <div className="text-[10px] uppercase tracking-wider text-gray-4 font-semibold">{d.top1}</div>
            <div className={`text-[13px] font-bold font-mono mt-0.5 ${m.top1Share >= 50 ? "text-red-300" : m.top1Share >= 30 ? "text-yellow-200" : "text-emerald-300"}`}>{m.top1Share.toFixed(1)}%</div>
            <div className="text-[10px] text-gray-4 truncate">{m.topCountry?.country}</div>
          </div>
          <div className="rounded-sm border border-navy-line bg-navy-darker/40 px-2 py-2 text-center">
            <div className="text-[10px] uppercase tracking-wider text-gray-4 font-semibold">{d.top3}</div>
            <div className="text-[13px] font-bold font-mono text-white mt-0.5">{m.top3Share.toFixed(1)}%</div>
            <div className="text-[10px] text-gray-4">{m.top3Share >= 75 ? (locale === "es" ? "muy concentrado" : "highly concentrated") : m.top3Share >= 55 ? (locale === "es" ? "concentrado" : "concentrated") : (locale === "es" ? "equilibrado" : "balanced")}</div>
          </div>
          <div className="rounded-sm border border-navy-line bg-navy-darker/40 px-2 py-2 text-center">
            <div className="text-[10px] uppercase tracking-wider text-gray-4 font-semibold">{d.hhi}</div>
            <div className="text-[13px] font-bold font-mono text-white mt-0.5">{m.hhi.toFixed(0)}</div>
            <div className="text-[10px] text-gray-4">{m.hhi > 2500 ? "conc." : m.hhi > 1500 ? "mod." : "div."}</div>
          </div>
        </div>
        <div className="rounded-sm border border-navy-line bg-navy-darker/30 p-2.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-1">
            <ShieldAlert className={`w-3.5 h-3.5 ${concentrationVariant === "red" ? "text-red-300" : concentrationVariant === "yellow" ? "text-yellow-300" : "text-emerald-300"}`} />
            {locale === "es" ? "Diagnóstico de dependencia" : locale === "fr" ? "Diagnostic de dépendance" : locale === "pt" ? "Diagnóstico de dependência" : "Dependency diagnosis"}
          </div>
          <p className="text-[11px] leading-relaxed text-gray-2">
            {locale === "es"
              ? m.top1Share >= 50
                ? `Riesgo estructural: 1 origen = ${m.top1Share.toFixed(1)}%. Diversificar a orígenes 4-6 (hoy solo ${ (100 - m.top3Share).toFixed(1)}% fuera del Top 3) y asegurar contratos multi-origen reduce exposición a shocks.`
                : m.top3Share >= 70
                ? `Concentración en 3 orígenes (${m.top3Share.toFixed(1)}%). El Top 1 (${m.topCountry?.country}) es ancla; ampliar share de ${m.shares[3]?.country ?? "orígenes secundarios"} descomprime riesgo.`
                : `Base diversificada (${m.countries} orígenes, Top 3 ${m.top3Share.toFixed(1)}%). Ventaja para negociar: rotar origen por precio sin perder volumen.`
              : locale === "fr"
              ? m.top1Share >= 50
                ? `Risque structurel : Top 1 ${m.top1Share.toFixed(1)}%. Diversifier vers rangs 4-6.`
                : `Top 3 ${m.top3Share.toFixed(1)}% — ${m.hhi > 2000 ? "concentré" : "équilibré"}.`
              : locale === "pt"
              ? m.top1Share >= 50
                ? `Risco estrutural: Top 1 ${m.top1Share.toFixed(1)}%. Diversificar para 4-6.`
                : `Top 3 ${m.top3Share.toFixed(1)}% — ${m.hhi > 2000 ? "concentrado" : "equilibrado"}.`
              : m.top1Share >= 50
              ? `Structural risk: single origin = ${m.top1Share.toFixed(1)}%. Expanding origins 4-6 (only ${(100 - m.top3Share).toFixed(1)}% outside Top 3) and multi-origin contracts lower shock exposure.`
              : m.top3Share >= 70
              ? `3-origin concentration (${m.top3Share.toFixed(1)}%). Top 1 (${m.topCountry?.country}) anchors supply; growing ${m.shares[3]?.country ?? "secondary origins"} de-risks.`
              : `Diversified base (${m.countries} origins, Top 3 ${m.top3Share.toFixed(1)}%). Edge to arbitrage origin on price while keeping volume.`}
          </p>
        </div>
      </Section>

      <Section icon={<DollarSign className="w-3.5 h-3.5" />} title={d.value}>
        <div className="grid grid-cols-2 gap-2">
          <KPICell label={d.avgPrice} value={formatUSD(m.avgPrice, 0)} sub={`${formatCurrency(m.totalCif)} / ${formatVolume(m.totalVolume)}`} />
          <KPICell label={locale === "es" ? "Precio FOB prom." : locale === "fr" ? "Prix FOB moy." : locale === "pt" ? "Preço FOB médio" : "Avg FOB price"} value={formatUSD(m.avgFobPrice, 0)} sub={`${fmtPct(m.priceTrend)} ${locale === "es" ? "tendencia precio" : "price trend"}`} trend={m.priceTrend > 0 ? "up" : m.priceTrend < 0 ? "down" : "flat"} />
        </div>
        <div className="rounded-sm border border-navy-line bg-navy-darker/30 p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-yellow-300" />
              {locale === "es" ? "Spread CIF–FOB" : "CIF–FOB spread"}
            </span>
            <span className="text-[11px] font-mono text-white">
              {formatUSD(m.spread, 0)} · {fmtPct(m.spreadPct)}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-navy-darker border border-navy-line overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue to-emerald-400" style={{ width: `${Math.min(100, Math.max(8, Math.abs(m.spreadPct) * 2))}%` }} />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-gray-4">
            <span>FOB {formatUSD(m.avgFobPrice, 0)}</span>
            <span>CIF {formatUSD(m.avgPrice, 0)}</span>
          </div>
          <p className="text-[11px] leading-relaxed text-gray-3">
            {locale === "es"
              ? `Precio medio ${fmtPricePerMt(m.totalCif, m.totalVolume)} con tendencia ${fmtPct(m.priceTrend)} desde ${m.priceByYear[0]?.year}. Volatilidad de precio ${m.priceVolPct.toFixed(1)}% (σ). Spread ${fmtPct(m.spreadPct)} marca flete+seguro implícito.`
              : locale === "fr"
              ? `Prix moyen ${fmtPricePerMt(m.totalCif, m.totalVolume)}, tendance ${fmtPct(m.priceTrend)} depuis ${m.priceByYear[0]?.year}. Volatilité prix ${m.priceVolPct.toFixed(1)}%. Spread ${fmtPct(m.spreadPct)}.`
              : locale === "pt"
              ? `Preço médio ${fmtPricePerMt(m.totalCif, m.totalVolume)}, tendência ${fmtPct(m.priceTrend)} desde ${m.priceByYear[0]?.year}. Vol. preço ${m.priceVolPct.toFixed(1)}%. Spread ${fmtPct(m.spreadPct)}.`
              : `Avg ${fmtPricePerMt(m.totalCif, m.totalVolume)} with ${fmtPct(m.priceTrend)} trend since ${m.priceByYear[0]?.year}. Price volatility ${m.priceVolPct.toFixed(1)}% (σ). Spread ${fmtPct(m.spreadPct)} is implied freight+insurance.`}
          </p>
          {m.mostValuable && m.cheapest && (
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-navy-line/60">
              <div className="rounded-sm bg-navy-card/50 border border-navy-line px-2 py-1.5">
                <div className="text-[10px] uppercase tracking-wider text-gray-4 font-semibold">{locale === "es" ? "Más caro (CIF/mt)" : locale === "fr" ? "Plus cher" : locale === "pt" ? "Mais caro" : "Priciest (CIF/mt)"}</div>
                <div className="text-[11px] font-bold text-white truncate">{m.mostValuable.country}</div>
                <div className="text-[11px] font-mono text-yellow-200">{fmtPricePerMt(m.mostValuable.totalCif, m.mostValuable.totalMt)}</div>
              </div>
              <div className="rounded-sm bg-navy-card/50 border border-navy-line px-2 py-1.5">
                <div className="text-[10px] uppercase tracking-wider text-gray-4 font-semibold">{locale === "es" ? "Más barato" : locale === "fr" ? "Moins cher" : locale === "pt" ? "Mais barato" : "Cheapest"}</div>
                <div className="text-[11px] font-bold text-white truncate">{m.cheapest.country}</div>
                <div className="text-[11px] font-mono text-emerald-300">{fmtPricePerMt(m.cheapest.totalCif, m.cheapest.totalMt)}</div>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {m.priceByYear.map((p) => {
            const maxP = Math.max(...m.priceByYear.map((x) => x.price), 1);
            const h = 14 + (p.price / maxP) * 18;
            return (
              <div key={p.year} className="flex flex-col items-center gap-1 min-w-[28px]">
                <div className="w-full rounded-sm bg-yellow-500/70" style={{ height: h }} title={`${p.year}: ${formatUSD(p.price, 0)}`} />
                <span className="text-[9px] font-mono text-gray-4">{String(p.year).slice(-2)}</span>
              </div>
            );
          })}
        </div>
      </Section>

      <Section icon={<Users className="w-3.5 h-3.5" />} title={d.ops}>
        <div className="grid grid-cols-2 gap-2">
          <KPICell label={d.records} value={m.records.toLocaleString()} sub={`${m.recordsPerCountry.toFixed(0)} / ${locale === "es" ? "país" : "country"}`} />
          <KPICell label={d.importers} value={m.importers ? String(m.importers) : "—"} sub={m.volPerImporter ? `${formatVolume(m.volPerImporter)} / importer` : undefined} />
          <KPICell label={d.diversification} value={String(m.countries)} sub={`Top 5 ${m.top5Share.toFixed(1)}%`} />
          <KPICell label={locale === "es" ? "Productos" : locale === "fr" ? "Produits" : locale === "pt" ? "Produtos" : "Products"} value={m.products ? String(m.products) : "—"} sub={`${m.avgShipmentMt.toFixed(2)} mt / op`} />
        </div>
        <p className="text-[11px] leading-relaxed text-gray-2">
          {locale === "es"
            ? `Ticket promedio ${m.avgShipmentMt.toFixed(2)} mt (${formatVolume(m.avgShipmentKg)} ) por operación · ${m.recordsPerCountry.toFixed(0)} ops por país en promedio. ${
                m.avgShipmentMt < 20 ? "Lotes pequeños: sugiere compras fraccionadas o mix de SKUs por contenedor." : m.avgShipmentMt > 45 ? "Lotes grandes: poder de negociación por volumen y logística optimizada." : "Lote medio: equilibrio entre frecuencia y escala."
              } ${m.importers > 80 ? "Base importadora amplia — mercado competitivo." : m.importers > 30 ? "Base importadora moderada — margen para consolidar." : "Base importadora concentrada — dependencia de pocos compradores."}`
            : locale === "fr"
            ? `Lot moyen ${m.avgShipmentMt.toFixed(2)} mt · ${m.recordsPerCountry.toFixed(0)} ops/pays.`
            : locale === "pt"
            ? `Lote médio ${m.avgShipmentMt.toFixed(2)} mt · ${m.recordsPerCountry.toFixed(0)} ops/país.`
            : `Avg ticket ${m.avgShipmentMt.toFixed(2)} mt (${formatVolume(m.avgShipmentKg)}) per operation · ${m.recordsPerCountry.toFixed(0)} ops per country on avg. ${
                m.avgShipmentMt < 20 ? "Small lots: fragmented buying or SKU mix per container." : m.avgShipmentMt > 45 ? "Large lots: scale leverage and optimized logistics." : "Mid-size lots: balance of frequency and scale."
              } ${m.importers > 80 ? "Broad importer base — competitive market." : m.importers > 30 ? "Moderate importer base — room to consolidate." : "Concentrated importer base — few buyers drive volume."}`}
        </p>
      </Section>

      <Section icon={<Zap className="w-3.5 h-3.5" />} title={d.outlook}>
        <div className="space-y-2">
          <div className={`rounded-sm border p-2.5 ${m.cagrVal !== null && m.cagrVal > 2 ? "bg-emerald-500/10 border-emerald-500/25" : m.cagrVal !== null && m.cagrVal < -1 ? "bg-red-500/10 border-red-500/25" : "bg-blue/10 border-blue/20"}`}>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-white">
              {m.cagrVal !== null && m.cagrVal > 2 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : m.cagrVal !== null && m.cagrVal < -1 ? <TrendingDown className="w-3.5 h-3.5 text-red-400" /> : <Activity className="w-3.5 h-3.5 text-blue-soft" />}
              {locale === "es" ? "Trayectoria" : locale === "fr" ? "Trajectoire" : locale === "pt" ? "Trajetória" : "Trajectory"}
              <span className="ml-auto font-mono text-[11px]">{m.cagrVal !== null ? fmtPct(m.cagrVal) + " CAGR" : "-"}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-gray-2 mt-1">
              {locale === "es"
                ? m.cagrVal !== null && m.cagrVal > 3
                  ? `Mercado en expansión sostenida. Mantener cobertura de origen Top 1 y negociar volumen anual con escalas por precio.`
                  : m.cagrVal !== null && m.cagrVal < -1
                  ? `Contracción estructural. Revisar mix de producto y origen barato (${m.cheapest?.country ?? "low-cost"}) para defender margen.`
                  : `Mercado lateral. Jugar spread origen-precio y eficiencia operativa (ticket ${m.avgShipmentMt.toFixed(1)} mt) para ganar share sin guerra de precios.`
                : locale === "fr"
                ? m.cagrVal !== null && m.cagrVal > 3
                  ? `Expansion soutenue — sécuriser Top 1 et négocier à l'échelle.`
                  : `Marché latéral — arbitrer par origine.`
                : locale === "pt"
                ? m.cagrVal !== null && m.cagrVal > 3
                  ? `Expansão sustentada — garantir Top 1 e negociar escala.`
                  : `Mercado lateral — arbitrar por origem.`
                : m.cagrVal !== null && m.cagrVal > 3
                ? `Sustained expansion. Lock multi-origin coverage on Top 1 and tier annual volume by price breaks.`
                : m.cagrVal !== null && m.cagrVal < -1
                ? `Structural contraction. Rebalance to cheaper origin (${m.cheapest?.country ?? "low-cost"}) and SKU mix to defend margin.`
                : `Sideways market. Play origin-price spread and ops efficiency (ticket ${m.avgShipmentMt.toFixed(1)} mt) to take share without a price war.`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-sm border border-navy-line bg-navy-darker/40 p-2">
              <div className="text-[10px] uppercase tracking-wider text-gray-4 font-semibold flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                {locale === "es" ? "Riesgo" : locale === "fr" ? "Risque" : locale === "pt" ? "Risco" : "Risk"}
              </div>
              <p className="text-[11px] leading-snug text-gray-2 mt-1">
                {m.top1Share >= 50
                  ? locale === "es"
                    ? `Alta exposición a ${m.topCountry?.country}. Mitigar con 2.º origen ≥15%.`
                    : `High exposure to ${m.topCountry?.country}. Mitigate with 2nd origin ≥15%.`
                  : locale === "es"
                  ? `Riesgo acotado. Mantener Top 3 <70% para no re-concentrar.`
                  : `Contained risk. Keep Top 3 <70% to avoid re-concentration.`}
              </p>
            </div>
            <div className="rounded-sm border border-navy-line bg-navy-darker/40 p-2">
              <div className="text-[10px] uppercase tracking-wider text-gray-4 font-semibold flex items-center gap-1">
                <Target className="w-3 h-3" />
                {locale === "es" ? "Oportunidad" : locale === "fr" ? "Opportunité" : locale === "pt" ? "Oportunidade" : "Opportunity"}
              </div>
              <p className="text-[11px] leading-snug text-gray-2 mt-1">
                {m.priceTrend < -5
                  ? locale === "es"
                    ? `Precio CIF cayendo (${fmtPct(m.priceTrend)}): ventana para fijar forward.`
                    : `CIF falling (${fmtPct(m.priceTrend)}): window to lock forward.`
                  : m.priceTrend > 5
                  ? locale === "es"
                    ? `Precio al alza (${fmtPct(m.priceTrend)}): cubrir y rotar a origen barato.`
                    : `Price up (${fmtPct(m.priceTrend)}): hedge and rotate to cheaper origin.`
                  : locale === "es"
                  ? `Precio estable. Arbitrar calidad/proteína vs USD/mt (ver P. Economics).`
                  : `Price stable. Arbitrage quality/protein vs USD/mt (see P. Economics).`}
              </p>
            </div>
          </div>

          <div className="rounded-sm border border-navy-line bg-navy-darker/30 p-2.5">
            <div className="text-[11px] font-semibold text-gray-1">{locale === "es" ? "Qué mirar en el tablero" : locale === "fr" ? "À suivre sur le board" : locale === "pt" ? "O que observar no painel" : "What to watch on the board"}</div>
            <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-gray-3 list-disc list-inside marker:text-blue-soft">
              <li>
                {locale === "es" ? "Total Imports → confirma si el impulso YoY sostiene el CAGR." : locale === "fr" ? "Total Imports → confirme si YoY soutient le TCAC." : locale === "pt" ? "Total Imports → confirme se YoY sustenta o CAGR." : "Total Imports → confirm if YoY momentum holds the CAGR."}
              </li>
              <li>
                {locale === "es" ? "By Product / HS Codes → corrige mix y precio por SKU (CIF/mt)." : "By Product / HS Codes → correct SKU mix and CIF/mt pricing."}
              </li>
              <li>{locale === "es" ? "Traders & Customs → detecta quién mueve el volumen y por qué aduana." : "Traders & Customs → see who moves volume and through which customs."}</li>
              <li>
                {locale === "es" ? "Timeline & By Country → valida estacionalidad y rotación de orígenes." : "Timeline & By Country → validate seasonality and origin rotation."}
              </li>
            </ul>
          </div>

          <div className="text-[10px] leading-relaxed text-gray-5 border-t border-navy-line/60 pt-2">
            {locale === "es"
              ? `Metodología: CAGR = (último/primero)^(1/años)-1; YoY = (año-año_prev)/año_prev; HHI = Σ(participación%²) sobre ${m.countries} países; precio = CIF/volumen; ticket = volumen/operaciones. Filtro aplicado: volumen>0, precio filtrado 20–5000 USD/mt y >18 mt.`
              : locale === "fr"
              ? `Méthodologie : TCAC, YoY, HHI, prix=CIF/volume, ticket=volume/ops.`
              : locale === "pt"
              ? `Metodologia: CAGR, YoY, HHI, preço=CIF/volume, ticket=volume/ops.`
              : `Method: CAGR=(last/first)^(1/years)-1; YoY=(y - y_prev)/y_prev; HHI=Σ(share%²) over ${m.countries} countries; price=CIF/volume; ticket=volume/ops. Applied filter: volume>0, price 20–5000 USD/mt & >18 mt.`}
          </div>
        </div>
      </Section>
    </div>
  );
}
