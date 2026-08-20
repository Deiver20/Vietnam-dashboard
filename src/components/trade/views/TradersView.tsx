"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { ArrowDownToLine, ArrowUpFromLine, Shield } from "lucide-react";
import { ChartCard } from "@/components/trade/ChartCard";
import { BarChart, makeFormatters } from "@/components/trade/charts";
import { PillToggle } from "@/components/trade/PillToggle";
import { TraderPivotTable } from "@/components/trade/TraderPivotTable";
import { TradeRoutesMap, RouteOrigin } from "@/components/trade/TradeRoutesMap";
import { getTraderCoordinates, VIETNAM_DESTINATION } from "@/components/trade/traderCoordinates";
import { useTradersByYear } from "@/hooks/trade/useTradersByYear";
import { useTraderMonthly } from "@/hooks/trade/useTraderMonthly";
import { useYearComparator } from "@/hooks/trade/useYearComparator";
import { useDebouncedFilters } from "@/hooks/trade/useDebouncedFilters";
import { YEAR_PALETTE, getUnitLabel } from "@/app/lib/trade/constants";
import { useTradeTheme } from "@/components/trade/TradeThemeContext";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { TradeFilters, TraderByYearRow, TraderMonthlyBreakdown, TraderType } from "@/app/interfaces/trade/interface";

const TIPO_COLOR: Record<TraderType, string> = {
  importer: "#03488D",
  exporter: "#1D9E75",
  customs:  "#E07B2A",
};

function formatTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

function tipoLabels(t: ReturnType<typeof getTranslation>["traders"]) {
  return {
    importer: { label: t.importers, singular: t.importer, plural: t.importers.toLowerCase() },
    exporter: { label: t.exporters, singular: t.exporter, plural: t.exporters.toLowerCase() },
    customs:  { label: t.customs,   singular: t.custom,    plural: t.customs.toLowerCase() },
  } as const;
}

type LeftMetric = "volumenKg" | "valorUsd";
type RightMetric = "precioUsd";
type Vista = "graficos" | "tabla" | "mapa";

export function TradersView() {
  const [tipo, setTipo] = useState<TraderType>("importer");
  const [leftMetric, setLeftMetric] = useState<LeftMetric>("volumenKg");
  const [vista, setVista] = useState<Vista>("graficos");
  const { yearA, setYearA, yearB, setYearB, yearsList } = useYearComparator();
  const [singleYear, setSingleYear] = useState<number | null>(null);
  const T = useTradeTheme();
  const locale = useDashboard((s) => s.locale);
  const tt = getTranslation(locale).traders;
  const ys = getTranslation(locale).yearSelector;
  const LABELS = tipoLabels(tt);
  const ROW_LABEL: Record<TraderType, string> = {
    importer: LABELS.importer.singular,
    exporter: LABELS.exporter.singular,
    customs:  LABELS.customs.singular,
  };
  const ROW_LABEL_PLURAL: Record<TraderType, string> = {
    importer: LABELS.importer.plural,
    exporter: LABELS.exporter.plural,
    customs:  LABELS.customs.plural,
  };
  const TIPO_META: Record<TraderType, { label: string; color: string }> = {
    importer: { label: LABELS.importer.label, color: TIPO_COLOR.importer },
    exporter: { label: LABELS.exporter.label, color: TIPO_COLOR.exporter },
    customs:  { label: LABELS.customs.label,  color: TIPO_COLOR.customs },
  };

  const unit = useMemo(() => getUnitLabel(), []);
  const formatters = useMemo(() => makeFormatters(unit), [unit]);

  const sortedYears: [number, number] = useMemo(() => {
    return ([yearA, yearB].sort((a, b) => a - b) as [number, number]);
  }, [yearA, yearB]);

  const comparar = vista === "graficos";

  // Single-year mode (tabla / mapa): default to the LAST available year, and
  // keep it in local state so it never touches the comparison years.
  const singleYearValue = useMemo(() => {
    return singleYear ?? (yearsList.length ? yearsList[yearsList.length - 1] : yearA);
  }, [singleYear, yearsList, yearA]);

  const years: [number, number] = useMemo(() => {
    return comparar ? sortedYears : [singleYearValue, singleYearValue];
  }, [comparar, sortedYears, singleYearValue]);

  const { filters, fetcher } = useTradersByYear(tipo, years);
  const { datos } = useDebouncedFilters<TradeFilters, TraderByYearRow[]>(filters, fetcher);

  const { filters: monthlyFilters, fetcher: monthlyFetcher } = useTraderMonthly(tipo, years);
  const { datos: breakdown, cargando: cargandoBreakdown, error: errorBreakdown } = useDebouncedFilters<TradeFilters, TraderMonthlyBreakdown>(monthlyFilters, monthlyFetcher);

const LEFT_METRIC_OPTIONS: { id: LeftMetric; label: string }[] = [
    { id: "volumenKg", label: tt.leftVolume.replace("{short}", unit.short) },
    { id: "valorUsd",  label: tt.leftUsd },
  ];

  const LEFT_METRIC_FORMAT: Record<LeftMetric, (v: number) => string> = {
    volumenKg: formatters.unit,
    valorUsd:  formatters.usd,
  };

  const allByVolume = useMemo(() => {
    if (!datos) return [] as TraderByYearRow[];
    const map = new Map<string, TraderByYearRow>();
    datos.forEach(r => {
      const prev = map.get(r.entidad);
      if (!prev) {
        map.set(r.entidad, { ...r });
        return;
      }
      prev.volumenKg += r.volumenKg;
      prev.valorUsd += r.valorUsd;
      prev.registros += r.registros;
      prev.cifFiltrado = (prev.cifFiltrado ?? 0) + (r.cifFiltrado ?? 0);
      prev.volFiltrado = (prev.volFiltrado ?? 0) + (r.volFiltrado ?? 0);
      prev.precioUsd = (prev.cifFiltrado ?? 0) > 0 && (prev.volFiltrado ?? 0) > 0
        ? (prev.cifFiltrado ?? 0) / (prev.volFiltrado ?? 0)
        : prev.volumenKg > 0 ? prev.valorUsd / prev.volumenKg : 0;
      if ((!prev.lat || !prev.lng) && r.lat && r.lng) {
        prev.lat = r.lat;
        prev.lng = r.lng;
      }
    });
    return Array.from(map.values()).sort((a, b) => b.volumenKg - a.volumenKg);
  }, [datos]);

  const topByVolume = useMemo(() => allByVolume.slice(0, 15), [allByVolume]);

  const topByLeftMetric = useMemo(() => {
    if (!datos) return [] as TraderByYearRow[];
    return [...allByVolume].sort((a, b) => b[leftMetric] - a[leftMetric]).slice(0, 15);
  }, [allByVolume, leftMetric, datos]);

  const topByPrice = useMemo(() => {
    if (!datos) return [] as TraderByYearRow[];
    return [...topByVolume].sort((a, b) => b.precioUsd - a.precioUsd).slice(0, 15);
  }, [datos, topByVolume]);

  const mapOrigins: RouteOrigin[] = useMemo(() => {
    const out: RouteOrigin[] = [];
    for (const p of allByVolume) {
      if (p.volumenKg <= 1) continue;
      const hasCoords = p.lat != null && p.lng != null && Number.isFinite(p.lat) && Number.isFinite(p.lng);
      const coords = hasCoords
        ? [p.lng as number, p.lat as number] as [number, number]
        : getTraderCoordinates(p.entidad);
      if (!coords) continue;
      out.push({
        name: p.entidad,
        coordinates: coords,
        value: p.volumenKg,
        color: TIPO_META[tipo].color,
        productos: Array.isArray(p.productos) ? p.productos : undefined,
      });
    }
    return out;
  }, [allByVolume, tipo]);

  const leftChartData = useMemo(() => {
    if (!datos) return [];
    return topByLeftMetric
      .map(p => {
        const rowA = datos.find(d => d.entidad === p.entidad && d.year === yearA);
        const rowB = datos.find(d => d.entidad === p.entidad && d.year === yearB);
        return {
          entidad: p.entidad,
          [String(yearA)]: rowA ? rowA[leftMetric] : 0,
          [String(yearB)]: rowB ? rowB[leftMetric] : 0,
        };
      })
      .filter(d => (d[String(yearA)] as number) > 0);
  }, [datos, topByLeftMetric, yearA, yearB, leftMetric]);

  const rightChartData = useMemo(() => {
    if (!datos) return [];
    return topByPrice
      .map(p => {
        const rowA = datos.find(d => d.entidad === p.entidad && d.year === yearA);
        const rowB = datos.find(d => d.entidad === p.entidad && d.year === yearB);
        return {
          entidad: p.entidad,
          [String(yearA)]: rowA ? rowA.precioUsd : 0,
          [String(yearB)]: rowB ? rowB.precioUsd : 0,
        };
      })
      .filter(d => (d[String(yearA)] as number) > 0);
  }, [datos, topByPrice, yearA, yearB]);

  const series = useMemo(() => {
    if (yearA === yearB) {
      return [{ key: String(yearB), nombre: String(yearB), color: YEAR_PALETTE[0] }];
    }
    return [
      { key: String(yearA), nombre: String(yearA), color: YEAR_PALETTE[0] },
      { key: String(yearB), nombre: String(yearB), color: YEAR_PALETTE[1] },
    ];
  }, [yearA, yearB]);

  const altura = Math.max(360, topByLeftMetric.length * 30 + 60);
  const yWidth = tipo === "customs" ? 150 : 220;

  const responsiveYWidth = Math.min(
    Math.max(typeof window === "undefined" ? 220 : Math.floor(window.innerWidth * 0.36), 118),
    yWidth
  );

  const leftTitleLabel = LEFT_METRIC_OPTIONS.find(o => o.id === leftMetric)?.label ?? "";

  const selectStyle: React.CSSProperties = {
    fontFamily: "var(--font-poppins), Poppins, sans-serif",
    fontSize: 12,
    fontWeight: 600,
    color: T.textPrimary,
    backgroundColor: T.surfaceAlt,
    border: `1px solid ${T.borderStrong}`,
    borderRadius: 4,
    padding: "6px 28px 6px 10px",
    cursor: "pointer",
    appearance: "none",
    backgroundImage: T.mode === "dark"
      ? "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='%23cbd5e8' d='M0 0l5 6 5-6z'/></svg>\")"
      : "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='%2306254B' d='M0 0l5 6 5-6z'/></svg>\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
  };

  return (
    <div className="space-y-4">
      <div
        className="flex flex-col items-stretch justify-between gap-3 rounded-lg border p-3 shadow-sm sm:flex-row sm:items-center"
        style={{ borderColor: T.border, backgroundColor: T.surface }}
      >
          <div className="flex min-w-0 flex-wrap items-center gap-3">
          <span
            className="text-[10px] font-semibold uppercase"
            style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", letterSpacing: "0.18em", color: T.textMuted }}
          >
            {tt.view}
          </span>
          <div className="inline-flex flex-wrap items-center gap-2">
            {(Object.keys(TIPO_META) as TraderType[]).map(opt => {
              const Icon = opt === "importer" ? ArrowDownToLine : opt === "exporter" ? ArrowUpFromLine : Shield;
              const active = tipo === opt;
              const color = TIPO_META[opt].color;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setTipo(opt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase transition-all"
                  style={{
                    borderRadius: 2,
                    background: active ? color : "transparent",
                    color: active ? "#FFFFFF" : T.textMuted,
                    border: `1px solid ${active ? color : T.borderStrong}`,
                    fontFamily: "var(--font-poppins), Poppins, sans-serif",
                    letterSpacing: "0.1em",
                  }}
                >
                  <Icon size={12} />
                  {TIPO_META[opt].label}
                </button>
              );
            })}
          </div>
          <div
            className="flex flex-wrap items-center gap-2 rounded-md border px-2.5 py-1.5"
            style={{ borderColor: T.borderStrong, backgroundColor: T.surfaceAlt }}
            role="group"
            aria-label="Selector de año"
          >
            {yearsList.length === 0 ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: T.accentNavy }} />
            ) : comparar ? (
              <>
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", color: T.accentNavy }}
                >
                  {ys.compare}
                </span>
                <select
                  aria-label={ys.yearA}
                  value={yearA}
                  onChange={e => setYearA(Number(e.target.value))}
                  style={selectStyle}
                >
                  {yearsList.filter(y => y !== yearB).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <span
                  className="text-xs"
                  style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", color: T.textMuted }}
                >
                  {ys.vs}
                </span>
                <select
                  aria-label={ys.yearB}
                  value={yearB}
                  onChange={e => setYearB(Number(e.target.value))}
                  style={selectStyle}
                >
                  {yearsList.filter(y => y !== yearA).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", color: T.accentNavy }}
                >
                  Año
                </span>
                <select
                  aria-label="Año"
                  value={singleYearValue}
                  onChange={e => setSingleYear(Number(e.target.value))}
                  style={selectStyle}
                >
                  {yearsList.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>
<span className="self-start sm:self-auto">
        <PillToggle<Vista>
          options={[
            { id: "graficos", label: tt.viewCharts },
            { id: "tabla", label: tt.viewTable },
            { id: "mapa", label: tt.viewMap },
          ]}
          value={vista}
          onChange={setVista}
          ariaLabel={tt.toggleView}
        />
        </span>
      </div>

      {vista === "graficos" && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard
              title={formatTemplate(tt.topBy, {
                plural: ROW_LABEL_PLURAL[tipo],
                metric: leftTitleLabel.toLowerCase(),
                years: comparar ? `${yearA} vs ${yearB}` : String(singleYearValue),
              })}
              acciones={
                <PillToggle<LeftMetric>
                  options={LEFT_METRIC_OPTIONS}
                  value={leftMetric}
                  onChange={setLeftMetric}
                  ariaLabel={tt.toggleMetric}
                />
              }
            >
              {!datos ? (
                <div className="flex h-[min(420px,78vw)] min-h-[300px] items-center justify-center text-gray-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <BarChart
                  datos={leftChartData}
                  xKey="entidad"
                  orientacion="horizontal"
                  series={series}
                  yFormat={LEFT_METRIC_FORMAT[leftMetric]}
                   altura={altura}
                   yWidth={responsiveYWidth}
                   stack
                 />
               )}
             </ChartCard>

            <ChartCard
              title={formatTemplate(tt.topByPrice, {
                plural: ROW_LABEL_PLURAL[tipo],
                unit: unit.per,
                years: comparar ? `${yearA} vs ${yearB}` : String(singleYearValue),
              })}
            >
              {!datos ? (
                <div className="flex h-[min(420px,78vw)] min-h-[300px] items-center justify-center text-gray-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <BarChart
                  datos={rightChartData}
                  xKey="entidad"
                  orientacion="horizontal"
                  series={series}
                  yFormat={(v) => `$${v.toFixed(2)}`}
                  altura={altura}
                  yWidth={responsiveYWidth}
                  stack
                />
              )}
            </ChartCard>
          </div>
        </>
      )}

      {vista === "tabla" && (
        <ChartCard
          title={formatTemplate(tt.pivotTitle, { singular: ROW_LABEL[tipo].toLowerCase() })}
          subtitle={formatTemplate(tt.pivotSubtitle, {
            singular: ROW_LABEL[tipo].toLowerCase(),
            short: unit.short,
            years: comparar ? `${yearA} vs ${yearB}` : String(singleYearValue),
          })}
        >
          {errorBreakdown && (
            <div
              className="rounded-md border p-4 text-sm"
              style={{ borderColor: "rgba(239, 68, 68, 0.30)", backgroundColor: T.mode === "dark" ? "rgba(239, 68, 68, 0.12)" : "rgba(239, 68, 68, 0.08)", color: T.mode === "dark" ? "#f87171" : "#b91c1c" }}
            >
              Error al cargar el desglose: {errorBreakdown}
            </div>
          )}

          {!errorBreakdown && (!breakdown || cargandoBreakdown) && (
            <div
              className="flex items-center gap-2 rounded-lg border p-6 text-sm"
              style={{ borderColor: T.border, color: T.textMuted, backgroundColor: T.surface }}
            >
              <Loader2 className="h-4 w-4 animate-spin" style={{ color: T.accentNavy }} /> {formatTemplate(tt.loadingBreakdown, { singular: ROW_LABEL[tipo].toLowerCase() })}
            </div>
          )}

          {!errorBreakdown && breakdown && breakdown.monthKeys.length > 0 && breakdown.rows.length > 0 && (
            <TraderPivotTable data={breakdown} rowLabel={ROW_LABEL[tipo]} unit={unit} />
          )}

          {!errorBreakdown && breakdown && (breakdown.monthKeys.length === 0 || breakdown.rows.length === 0) && !cargandoBreakdown && (
            <div
              className="flex h-[240px] items-center justify-center rounded-lg border text-sm"
              style={{ borderColor: T.border, color: T.textMuted, backgroundColor: T.surface }}
            >
              Sin datos para los filtros seleccionados.
            </div>
          )}
        </ChartCard>
      )}

      {vista === "mapa" && (
        <ChartCard
          title={tt.mapTitle}
          subtitle={formatTemplate(tt.mapSubtitle, {
            plural: ROW_LABEL_PLURAL[tipo],
            short: unit.short,
            years: comparar ? `${yearA}-${yearB}` : String(singleYearValue),
          })}
        >
          {!datos ? (
            <div className="flex h-[min(380px,70vw)] min-h-[280px] items-center justify-center text-gray-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <TradeRoutesMap
              origins={mapOrigins}
              destination={VIETNAM_DESTINATION}
              unit={unit.short}
              valueFormatter={formatters.unit}
            />
          )}
        </ChartCard>
      )}
    </div>
  );
}

