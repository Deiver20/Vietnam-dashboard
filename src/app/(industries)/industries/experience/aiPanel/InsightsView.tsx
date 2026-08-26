"use client";

import { AlertTriangle, CheckCircle2, Info, Loader2, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDashboard } from "@/store/useDashboard";
import { formatDateTime, formatNumber, formatUSD, formatVolume } from "@/app/lib/functions/formatters";
import { useAiPanelEnv } from "./env";

type Badge = "success" | "warning" | "info" | "danger" | "oportunidad";

interface InsightItem {
  type: string;
  title: string;
  description: string;
  badge: Badge;
}

interface TradeInsightsFacts {
  escala?: {
    totalVolumeMt: number;
    anioInicio: number | null;
    anioFin: number | null;
    cagrPct: number | null;
    ultimoYoyCompletoPct?: number | null;
    anioEnCurso?: number | null;
    mesesEnCursoIncluidos?: number | null;
    avanceYtd?: {
      anioActual: number;
      anioComparado: number;
      mesesIncluidos: number;
      volumenActual: number;
      volumenComparado: number;
      variacionPct: number | null;
    } | null;
  } | null;
  concentracion?: { top1: { country: string; sharePct: number }; top3SharePct: number; hhi: number } | null;
  mezclaProducto?: {
    top: Array<{ categoria: string; producto: string; volumenKg: number; sharePct: number | null; valorUsd: number }>;
    topLastYear?: { year: number; categoria: string; producto: string; volumenKg: number; sharePct: number | null } | null;
  } | null;
  precioComparativo?: {
    mostExpensive: { producto: string; precioUsd: number };
    cheapest: { producto: string; precioUsd: number };
    spreadPct: number | null;
  } | null;
  empresaPrincipal?: {
    name: string;
    sharePct: number | null;
    totalTraders: number;
    lastYear?: { year: number; name: string; volumeMt: number; sharePct: number | null } | null;
  } | null;
  aduanaPrincipal?: { customs: string; sharePct: number | null; totalCustoms: number } | null;
  estacionalidad?: {
    peakMonth: { month: number; avgVolumeMt: number };
    troughMonth: { month: number; avgVolumeMt: number };
  } | null;
  fragmentacion?: { medianaMt: number; totalOperaciones: number; classification: string } | null;
  riesgo?: { level: string; reasons: string[] } | null;
}

/* Las 9 categorias posibles de facts/insights, en el orden fijo de
   presentacion. "riesgo" no tiene tarjeta KPI (es un cruce narrativo, no un
   hecho aislado) -- se filtra aparte en las tarjetas, no en esta lista. */
const TYPE_ORDER = [
  "escala",
  "concentracion",
  "mezclaProducto",
  "precioComparativo",
  "empresaPrincipal",
  "aduanaPrincipal",
  "estacionalidad",
  "fragmentacion",
  "riesgo",
] as const;

const badgeStyles: Record<string, { bg: string; text: string; icon: typeof Info }> = {
  success: { bg: "rgba(0,183,34,0.15)", text: "#00B722", icon: CheckCircle2 },
  warning: { bg: "rgba(240,122,58,0.15)", text: "#F07A3A", icon: AlertTriangle },
  info: { bg: "rgba(34,123,255,0.15)", text: "#227BFF", icon: Info },
  danger: { bg: "rgba(220,38,38,0.15)", text: "#DC2626", icon: AlertTriangle },
  oportunidad: { bg: "rgba(16,185,129,0.15)", text: "#10B981", icon: Sparkles },
};

const MONTH_NAMES: Record<string, string[]> = {
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  fr: ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"],
  pt: ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"],
};
function monthName(month: number, locale: string) {
  const arr = MONTH_NAMES[locale] ?? MONTH_NAMES.en;
  return arr[month - 1] ?? String(month);
}

function fmtPct(v: number | null | undefined, dec = 1) {
  if (v === null || v === undefined || !Number.isFinite(v)) return "-";
  return `${v.toFixed(dec)}%`;
}

/* Prefijo para la linea extra "del ultimo año con datos" que se agrega en
   escala/mezclaProducto/empresaPrincipal cuando el backend manda
   currentYear/topLastYear/lastYear -- no siempre es el año calendario actual
   (si el año en curso aun no tiene embarques, es el ultimo año CON datos). */
const IN_YEAR_PREFIX: Record<string, string> = { es: "En", en: "In", fr: "En", pt: "Em" };
function inYear(year: number, locale: string) {
  const prefix = IN_YEAR_PREFIX[locale] ?? IN_YEAR_PREFIX.en;
  return `${prefix} ${year}`;
}

const LOT_SIZE_LABELS: Record<string, Record<string, string>> = {
  es: { pequeno: "lote pequeño", mediano: "lote mediano", grande: "lote grande" },
  en: { pequeno: "small lot", mediano: "mid-size lot", grande: "large lot" },
  fr: { pequeno: "petit lot", mediano: "lot moyen", grande: "grand lot" },
  pt: { pequeno: "lote pequeno", mediano: "lote médio", grande: "lote grande" },
};
function lotSizeLabel(classification: string, locale: string) {
  const dict = LOT_SIZE_LABELS[locale] ?? LOT_SIZE_LABELS.en;
  return dict[classification] ?? classification;
}

const DICT: Record<string, Record<string, string>> = {
  en: {
    subtitle: "AUTOMATIC ANALYSIS",
    deep: "Deep analysis",
    updated: "Updated",
    aiTitle: "AI Insights — whole board",
    noInsights: "No insights yet for this board — the background regeneration job hasn't run for this combination yet.",
    companies: "companies",
    of: "of",
    activeCustoms: "active customs",
    spread: "Spread",
    peak: "Peak",
    trough: "trough",
    avg: "avg",
    ofVolume: "of total volume",
    growth: "Avg. annual growth",
    perShipment: "per shipment",
    shipmentsRecorded: "shipments recorded",
    through: "through",
    vsSamePeriod: "vs. same period in",
    shareOfImports: "of imports",
    shareOfExports: "of exports",
    companiesImporting: "importing companies",
    companiesExporting: "exporting companies",
    lowestIn: "lowest in",
  },
  es: {
    subtitle: "ANÁLISIS AUTOMÁTICO",
    deep: "Análisis profundo",
    updated: "Actualizado",
    aiTitle: "Insights IA — tablero completo",
    noInsights: "Aún no hay insights para este tablero — el job de regeneración todavía no corrió para esta combinación.",
    companies: "empresas",
    of: "de",
    activeCustoms: "aduanas activas",
    spread: "Spread",
    peak: "Pico",
    trough: "valle",
    avg: "prom.",
    ofVolume: "del volumen total",
    growth: "Crecimiento anual prom.",
    perShipment: "por embarque",
    shipmentsRecorded: "embarques registrados",
    through: "hasta",
    vsSamePeriod: "vs. mismo período de",
    shareOfImports: "de las importaciones",
    shareOfExports: "de las exportaciones",
    companiesImporting: "empresas importadoras",
    companiesExporting: "empresas exportadoras",
    lowestIn: "mínimo en",
  },
  fr: {
    subtitle: "ANALYSE AUTOMATIQUE",
    deep: "Analyse approfondie",
    updated: "Mis à jour",
    aiTitle: "Insights IA — tableau complet",
    noInsights: "Pas encore d'insights pour ce tableau.",
    companies: "entreprises",
    of: "sur",
    activeCustoms: "douanes actives",
    spread: "Écart",
    peak: "Pic",
    trough: "creux",
    avg: "moy.",
    ofVolume: "du volume total",
    growth: "Croissance annuelle moy.",
    perShipment: "par expédition",
    shipmentsRecorded: "expéditions enregistrées",
    through: "jusqu'à",
    vsSamePeriod: "vs. même période en",
    shareOfImports: "des importations",
    shareOfExports: "des exportations",
    companiesImporting: "entreprises importatrices",
    companiesExporting: "entreprises exportatrices",
    lowestIn: "au plus bas en",
  },
  pt: {
    subtitle: "ANÁLISE AUTOMÁTICA",
    deep: "Análise profunda",
    updated: "Atualizado",
    aiTitle: "Insights IA — painel completo",
    noInsights: "Ainda não há insights para este painel.",
    companies: "empresas",
    of: "de",
    activeCustoms: "alfândegas ativas",
    spread: "Spread",
    peak: "Pico",
    trough: "vale",
    avg: "médio",
    ofVolume: "do volume total",
    growth: "Crescimento anual méd.",
    perShipment: "por embarque",
    shipmentsRecorded: "embarques registrados",
    through: "até",
    vsSamePeriod: "vs. mesmo período em",
    shareOfImports: "das importações",
    shareOfExports: "das exportações",
    companiesImporting: "empresas importadoras",
    companiesExporting: "empresas exportadoras",
    lowestIn: "mínimo em",
  },
};

const BADGE_LABELS: Record<string, Record<string, string>> = {
  en: { success: "Positive", warning: "Watch", info: "Info", danger: "Risk", oportunidad: "Opportunity" },
  es: { success: "Positivo", warning: "Atención", info: "Info", danger: "Riesgo", oportunidad: "Oportunidad" },
  fr: { success: "Positif", warning: "Attention", info: "Info", danger: "Risque", oportunidad: "Opportunité" },
  pt: { success: "Positivo", warning: "Atenção", info: "Info", danger: "Risco", oportunidad: "Oportunidade" },
};

const KPI_LABELS: Record<string, Record<string, string>> = {
  en: {
    escala: "Total import volume",
    concentracion: "Top origin country",
    mezclaProducto: "Top imported product",
    precioComparativo: "Most vs. least expensive product",
    empresaPrincipal: "Top importing company",
    aduanaPrincipal: "Top customs",
    estacionalidad: "Peak month",
    fragmentacion: "Typical shipment size",
  },
  es: {
    escala: "Volumen total importado",
    concentracion: "Principal país de origen",
    mezclaProducto: "Producto más importado",
    precioComparativo: "Producto más caro vs. más barato",
    empresaPrincipal: "Principal empresa importadora",
    aduanaPrincipal: "Aduana principal",
    estacionalidad: "Mes de mayor volumen",
    fragmentacion: "Tamaño típico de embarque",
  },
  fr: {
    escala: "Volume total importé",
    concentracion: "Principal pays d'origine",
    mezclaProducto: "Produit le plus importé",
    precioComparativo: "Produit le plus cher vs. le moins cher",
    empresaPrincipal: "Principale entreprise importatrice",
    aduanaPrincipal: "Douane principale",
    estacionalidad: "Mois de pointe",
    fragmentacion: "Taille typique d'expédition",
  },
  pt: {
    escala: "Volume total importado",
    concentracion: "Principal país de origem",
    mezclaProducto: "Produto mais importado",
    precioComparativo: "Produto mais caro vs. mais barato",
    empresaPrincipal: "Principal empresa importadora",
    aduanaPrincipal: "Alfândega principal",
    estacionalidad: "Mês de pico",
    fragmentacion: "Tamanho típico de embarque",
  },
};

/* Estas categorias tienen redaccion direccional ("importado"/"origen"/
   "importadora") que solo aplica al flujo de importaciones -- para
   exportaciones hay que invertir el sentido (exportado/destino/exportadora).
   Las demas categorias (aduanaPrincipal, precioComparativo, etc.) ya son
   neutrales o se aclaran en el propio texto del sub via "isExport". */
const KPI_LABELS_EXPORT_OVERRIDES: Record<string, Record<string, string>> = {
  en: {
    escala: "Total export volume",
    concentracion: "Top destination country",
    mezclaProducto: "Top exported product",
    empresaPrincipal: "Top exporting company",
  },
  es: {
    escala: "Volumen total exportado",
    concentracion: "Principal país de destino",
    mezclaProducto: "Producto más exportado",
    empresaPrincipal: "Principal empresa exportadora",
  },
  fr: {
    escala: "Volume total exporté",
    concentracion: "Principal pays de destination",
    mezclaProducto: "Produit le plus exporté",
    empresaPrincipal: "Principale entreprise exportatrice",
  },
  pt: {
    escala: "Volume total exportado",
    concentracion: "Principal país de destino",
    mezclaProducto: "Produto mais exportado",
    empresaPrincipal: "Principal empresa exportadora",
  },
};

/* Nadie de negocio interpreta "HHI 1077" sin contexto -- se traduce a una
   palabra usando los mismos umbrales ya usados en el prompt del backend
   (>2500 concentrado, >1500 moderado, resto diversificado). El HHI crudo
   queda como dato de respaldo entre parentesis. */
function nivelConcentracion(hhi: number, locale: string): string {
  const NIVELES: Record<string, [string, string, string]> = {
    es: ["diversificado", "moderado", "concentrado"],
    en: ["diversified", "moderate", "concentrated"],
    fr: ["diversifié", "modéré", "concentré"],
    pt: ["diversificado", "moderado", "concentrado"],
  };
  const [bajo, medio, alto] = NIVELES[locale] ?? NIVELES.en;
  if (hhi > 2500) return alto;
  if (hhi > 1500) return medio;
  return bajo;
}

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isStr = (v: unknown): v is string => typeof v === "string" && v.length > 0;

/* kpiContent nunca debe tirar el panel entero: facts es un jsonb sin schema
   forzado en la BD, y una fila puede quedar temporalmente en el formato
   viejo de una categoria mientras el job de regeneracion todavia no paso por
   ese combo (paso exactamente con "fragmentacion" al cambiar su forma en
   TAREA 8). Cada case valida los campos puntuales que va a usar antes de
   tocarlos -- si algo no calza, se omite esa tarjeta como si la categoria
   fuera null, nunca se rompe el render. El try/catch de switchSafe es la
   ultima red por si se nos escapa un caso no cubierto por los checks. */
function kpiContentUnsafe(type: string, facts: TradeInsightsFacts, d: Record<string, string>, locale: string, isExport: boolean): { value: string; sub: string } | null {
  switch (type) {
    case "escala": {
      const f = facts.escala;
      if (!f || !isNum(f.totalVolumeMt)) return null;
      const parts: string[] = [];
      // Tendencia: solo entre años COMPLETOS (12 meses) -- nunca incluye el
      // año en curso parcial, que siempre "caeria" artificialmente frente a
      // un año completo por tener menos meses.
      if (isNum(f.anioInicio) && isNum(f.anioFin)) {
        parts.push(`${f.anioInicio}–${f.anioFin} · ${d.growth} ${fmtPct(f.cagrPct)}`);
      }
      // Avance del año en curso (YTD): mismos meses vs. el año anterior --
      // solo aparece si el backend detecto que el ultimo año esta incompleto.
      const ytd = f.avanceYtd;
      if (ytd && isNum(ytd.anioActual) && isNum(ytd.mesesIncluidos) && isNum(ytd.volumenActual)) {
        const mes = monthName(ytd.mesesIncluidos, locale);
        const variacion = isNum(ytd.variacionPct) ? ` · ${fmtPct(ytd.variacionPct)} ${d.vsSamePeriod} ${ytd.anioComparado}` : "";
        parts.push(`${inYear(ytd.anioActual, locale)} (${d.through} ${mes}): ${formatVolume(ytd.volumenActual)}${variacion}`);
      }
      return { value: formatVolume(f.totalVolumeMt), sub: parts.join(" · ") };
    }
    case "concentracion": {
      const f = facts.concentracion;
      if (!f?.top1 || !isStr(f.top1.country) || !isNum(f.hhi)) return null;
      const nivel = nivelConcentracion(f.hhi, locale);
      const shareOf = isExport ? d.shareOfExports : d.shareOfImports;
      return {
        value: `${f.top1.country} ${fmtPct(f.top1.sharePct)}`,
        sub: `${fmtPct(f.top1.sharePct)} ${shareOf} · Top 3: ${fmtPct(f.top3SharePct)} · ${nivel} (HHI ${f.hhi})`,
      };
    }
    case "mezclaProducto": {
      const top = facts.mezclaProducto?.top?.[0];
      if (!top || !isStr(top.producto) || !isNum(top.volumenKg)) return null;
      const base = `${formatVolume(top.volumenKg)} · ${fmtPct(top.sharePct)} ${d.ofVolume}`;
      const ly = facts.mezclaProducto?.topLastYear;
      const lastYearPart = ly && isNum(ly.year) && isStr(ly.producto)
        ? ` · ${inYear(ly.year, locale)}: ${ly.producto} (${fmtPct(ly.sharePct)})`
        : "";
      return { value: top.producto, sub: base + lastYearPart };
    }
    case "precioComparativo": {
      const f = facts.precioComparativo;
      if (!f?.mostExpensive || !f?.cheapest || !isStr(f.mostExpensive.producto) || !isNum(f.mostExpensive.precioUsd) || !isStr(f.cheapest.producto) || !isNum(f.cheapest.precioUsd)) return null;
      return {
        value: `${f.mostExpensive.producto}: ${formatUSD(f.mostExpensive.precioUsd, 0)}`,
        sub: `vs ${f.cheapest.producto}: ${formatUSD(f.cheapest.precioUsd, 0)} · ${d.spread} ${fmtPct(f.spreadPct)}`,
      };
    }
    case "empresaPrincipal": {
      const f = facts.empresaPrincipal;
      if (!f || !isStr(f.name) || !isNum(f.totalTraders)) return null;
      const companiesLabel = isExport ? d.companiesExporting : d.companiesImporting;
      const base = `${d.of} ${f.totalTraders} ${companiesLabel}`;
      const ly = f.lastYear;
      const lastYearPart = ly && isNum(ly.year) && isStr(ly.name)
        ? ` · ${inYear(ly.year, locale)}: ${ly.name} (${fmtPct(ly.sharePct)})`
        : "";
      return { value: `${f.name} ${fmtPct(f.sharePct)}`, sub: base + lastYearPart };
    }
    case "aduanaPrincipal": {
      const f = facts.aduanaPrincipal;
      if (!f || !isStr(f.customs) || !isNum(f.totalCustoms)) return null;
      const shareOf = isExport ? d.shareOfExports : d.shareOfImports;
      return {
        value: `${f.customs} ${fmtPct(f.sharePct)}`,
        sub: `${fmtPct(f.sharePct)} ${shareOf} · ${d.of} ${f.totalCustoms} ${d.activeCustoms}`,
      };
    }
    case "estacionalidad": {
      const f = facts.estacionalidad;
      if (!f?.peakMonth || !f?.troughMonth || !isNum(f.peakMonth.month) || !isNum(f.peakMonth.avgVolumeMt) || !isNum(f.troughMonth.month)) return null;
      return {
        value: monthName(f.peakMonth.month, locale),
        sub: `${formatVolume(f.peakMonth.avgVolumeMt)} ${d.avg} · ${d.lowestIn} ${monthName(f.troughMonth.month, locale)}`,
      };
    }
    case "fragmentacion": {
      const f = facts.fragmentacion;
      if (!f || !isNum(f.medianaMt) || !isNum(f.totalOperaciones) || !isStr(f.classification)) return null;
      return {
        value: `${f.medianaMt} mt ${d.perShipment}`,
        sub: `${formatNumber(f.totalOperaciones)} ${d.shipmentsRecorded} · ${lotSizeLabel(f.classification, locale)}`,
      };
    }
    default:
      return null;
  }
}

function kpiContent(type: string, facts: TradeInsightsFacts, d: Record<string, string>, locale: string, isExport: boolean): { value: string; sub: string } | null {
  try {
    return kpiContentUnsafe(type, facts, d, locale, isExport);
  } catch {
    return null;
  }
}

export function InsightsView() {
  const { dark } = useAiPanelEnv();
  const locale = useDashboard((s) => s.locale);
  const filters = useDashboard((s) => s.filters);
  const d = DICT[locale] ?? DICT.en;
  const isExport = filters.flow === "exports";
  const kpiLabels = {
    ...(KPI_LABELS[locale] ?? KPI_LABELS.en),
    ...(isExport ? (KPI_LABELS_EXPORT_OVERRIDES[locale] ?? KPI_LABELS_EXPORT_OVERRIDES.en) : {}),
  };
  const badgeLabels = BADGE_LABELS[locale] ?? BADGE_LABELS.en;

  const divider = dark ? "border-white/10" : "border-black/[0.08]";
  const cardBg = dark ? "bg-white/[0.04] border-white/10" : "bg-black/[0.03] border-black/[0.06]";
  const muted = dark ? "text-white/50" : "text-gray-500";
  const textMain = dark ? "text-white" : "text-gray-900";
  const textSec = dark ? "text-white/70" : "text-gray-600";
  const textTert = dark ? "text-white/50" : "text-gray-500";

  const [facts, setFacts] = useState<TradeInsightsFacts | null>(null);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastBoardKeyRef = useRef<string>("");
  const abortRef = useRef<AbortController | null>(null);

  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api";

  // Identidad real del tablero: solo pais/flujo/industria/idioma. Cambiar un
  // filtro de producto/aduana/etc en otra pestana del dashboard NO dispara
  // un nuevo fetch -- el panel muestra el resumen del pais completo, no de
  // un sub-filtro.
  const boardKey = `${filters.countryCode ?? ""}|${filters.flow ?? ""}|${filters.industry ?? ""}|${locale}`;

  const fetchBoard = useCallback(async () => {
    if (!filters.countryCode || !filters.flow || !filters.industry) return;
    // Cancela cualquier fetch anterior todavia en vuelo: al cambiar de pais
    // rapido (Vietnam -> Colombia), el efecto de sincronizacion de filtros
    // (ver DashboardPages) puede disparar este fetchBoard una vez con el
    // pais VIEJO (mientras filters.countryCode todavia no se actualizaba) y
    // otra vez, milisegundos despues, con el pais NUEVO -- sin abortar, la
    // respuesta del pais viejo podia llegar despues y pisar los datos
    // correctos del pais nuevo (condicion de carrera: React no garantiza
    // que las respuestas lleguen en el mismo orden en que se dispararon).
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const p = new URLSearchParams();
      p.set("countryCode", String(filters.countryCode));
      p.set("flow", String(filters.flow));
      p.set("industry", String(filters.industry));
      p.set("locale", locale);
      const res = await fetch(`${backendBase}/trade/insights?${p.toString()}`, { method: "GET", signal: controller.signal });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt.slice(0, 300)}`);
      }
      const json = await res.json();
      setFacts((json.data?.facts ?? null) as TradeInsightsFacts | null);
      setInsights((json.data?.insights ?? []) as InsightItem[]);
      setUpdatedAt((json.data?.updatedAt ?? null) as string | null);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return; // fetch obsoleto, se ignora en silencio
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  }, [filters.countryCode, filters.flow, filters.industry, locale, backendBase]);

  useEffect(() => {
    if (lastBoardKeyRef.current === boardKey) return;
    lastBoardKeyRef.current = boardKey;
    fetchBoard();
  }, [boardKey, fetchBoard]);

  /* NO agregar un cleanup que aborte en desmontaje aqui: en React Strict
     Mode (activo por defecto en Next.js) cada componente se monta, limpia y
     vuelve a montar en dev -- un cleanup de este efecto abortaria el unico
     fetch real antes de que resuelva, y el guard de lastBoardKeyRef de
     arriba evita todo reintento (ya quedo marcado como "manejado" para ese
     boardKey), dejando el panel en "sin insights" para siempre. El abort
     dentro de fetchBoard() (al iniciar CADA fetch nuevo) ya es suficiente
     para descartar respuestas obsoletas al cambiar de pais/tablero -- eso
     no depende del desmontaje del componente. */

  const kpiTypes = TYPE_ORDER.filter((t) => t !== "riesgo" && facts?.[t]);
  const orderedInsights = TYPE_ORDER.map((type) => insights.find((i) => i.type === type)).filter(
    (i): i is InsightItem => Boolean(i)
  );

  return (
    <div className="flex flex-col h-full">
      <div className={`shrink-0 pb-3 border-b ${divider}`}>
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${muted}`}>{d.subtitle}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#227BFF] text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
            <Sparkles className="h-3 w-3" /> {d.deep}
          </span>
        </div>
        {updatedAt && (
          <p className={`text-[10px] mt-1.5 ${textTert}`}>
            {d.updated}: {formatDateTime(updatedAt)}
          </p>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto py-3 space-y-3 pr-1">
        {loading && !facts ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#227BFF]" />
          </div>
        ) : error ? (
          <div className={`rounded-lg border p-3 text-xs ${dark ? "bg-red-500/10 border-red-500/20 text-red-300" : "bg-red-50 border-red-200 text-red-700"}`}>
            <div className="font-semibold">Error</div>
            <div className="mt-1 break-words">{error}</div>
          </div>
        ) : !facts ? (
          <div className={`flex flex-col items-center justify-center py-10 text-center ${muted}`}>
            <Sparkles className={`w-8 h-8 mb-2 ${dark ? "text-white/40" : "text-gray-400"}`} />
            <p className="text-xs px-4">{d.noInsights}</p>
          </div>
        ) : (
          <>
            {kpiTypes.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {kpiTypes.map((type) => {
                  const content = kpiContent(type, facts, d, locale, isExport);
                  if (!content) return null;
                  return (
                    <div key={type} className={`rounded-lg border p-2.5 ${cardBg}`}>
                      <div className={`text-[10px] uppercase tracking-wider font-bold ${muted}`}>{kpiLabels[type]}</div>
                      <div className={`text-[13px] font-bold mt-1 line-clamp-2 ${textMain}`} title={content.value}>{content.value}</div>
                      <div className={`text-[10px] ${textTert}`}>{content.sub}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {orderedInsights.length > 0 && (
              <div className={`rounded-lg border overflow-hidden ${cardBg}`}>
                <div className={`flex items-center px-3 py-2.5 border-b ${divider} ${dark ? "bg-white/[0.04]" : "bg-black/[0.02]"}`}>
                  <div className={`text-[11px] font-bold ${textMain} flex items-center gap-1.5`}>
                    <Sparkles className="w-3.5 h-3.5 text-[#227BFF]" /> {d.aiTitle}
                  </div>
                </div>
                <div className="p-3 space-y-2.5">
                  {orderedInsights.map((item) => {
                    const style = badgeStyles[item.badge ?? "info"] ?? badgeStyles.info;
                    const Icon = style.icon;
                    return (
                      <div key={item.type} className={`flex items-start gap-2.5 pb-2.5 border-b last:border-0 last:pb-0 ${divider}`}>
                        <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: style.bg }}>
                          <Icon className="h-3.5 w-3.5" style={{ color: style.text }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-[11px] font-semibold leading-tight ${textMain}`}>{item.title}</p>
                          <p className={`text-[11px] mt-1 leading-relaxed ${textSec}`}>{item.description}</p>
                        </div>
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0"
                          style={{ background: style.bg, color: style.text }}
                        >
                          {badgeLabels[item.badge] ?? item.badge}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
