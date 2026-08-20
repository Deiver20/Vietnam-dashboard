"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { ChartCard } from "@/components/trade/ChartCard";
import { RibbonChart, LineChart, makeFormatters } from "@/components/trade/charts";
import { useTimeline } from "@/hooks/trade/useTimeline";
import { useDebouncedFilters } from "@/hooks/trade/useDebouncedFilters";
import { RIBBON_PALETTE, YEAR_PALETTE, getUnitLabel } from "@/app/lib/trade/constants";
import { useTradeTheme } from "@/components/trade/TradeThemeContext";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { translateCountry } from "@/app/lib/i18n/tradeData";
import { TradeFilters, TimelineResponse } from "@/app/interfaces/trade/interface";

function formatTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

function countryColor(idx: number): string {
  return RIBBON_PALETTE[idx % RIBBON_PALETTE.length];
}

export function TimelineView() {
  const { filters, fetcher } = useTimeline();
  const { datos: data } = useDebouncedFilters<TradeFilters, TimelineResponse>(filters, fetcher);
  const T = useTradeTheme();
  const locale = useDashboard((s) => s.locale);
  const tl = getTranslation(locale).timeline;
  const tFilters = getTranslation(locale).filters;
  const MESES = tFilters.monthAbbr;

  const unit = useMemo(() => getUnitLabel(), []);
  const formatters = useMemo(() => makeFormatters(unit), [unit]);

  const yearlyData = useMemo(() => {
    if (!data) return [];
    const { yearlyRibbon, countries } = data;
    if (!countries.length) return [];
    const map: Record<number, Record<string, number | string>> = {};
    yearlyRibbon.forEach(r => {
      if (!map[r.year]) {
        map[r.year] = { year: r.year };
        countries.forEach(c => { map[r.year][c] = 0; });
      }
      const v = map[r.year][r.country];
      map[r.year][r.country] = (typeof v === "number" ? v : 0) + r.volumenKg;
    });
    return Object.values(map).sort((a, b) => Number(a.year) - Number(b.year));
  }, [data]);

  const countrySeries = useMemo(() => {
    if (!data) return [];
    return data.countries.map((c, i) => ({ key: c, nombre: translateCountry(c, locale), color: countryColor(i) }));
  }, [data, locale]);

  const years = useMemo(() => {
    if (!data) return [] as number[];
    const s = new Set<number>();
    data.accumulated.forEach(r => s.add(r.year));
    return Array.from(s).sort((a, b) => a - b);
  }, [data]);

  const mergedAcc = useMemo(() => {
    if (!data) return [];
    const map: Record<string, { mes: string } & Record<string, number>> = {};
    const order = MESES;
    data.accumulated.forEach(r => {
      const key = MESES[(r.month - 1) >= 0 ? (r.month - 1) : 0] ?? String(r.month);
      if (!map[key]) map[key] = { mes: key } as { mes: string } & Record<string, number>;
      map[key][String(r.year)] = r.acumulado;
    });
    return order.map(m => map[m]).filter(Boolean) as Array<{ mes: string } & Record<string, number>>;
  }, [data]);

  const yearSeries = useMemo(() => {
    return years.map((y, i) => ({
      key: String(y),
      nombre: String(y),
      color: YEAR_PALETTE[i % YEAR_PALETTE.length],
    }));
  }, [years]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
        <ChartCard
          title={filters.flow === "imports" ? tl.titleImports : tl.titleExports}
          subtitle={tl.subtitleRibbon}
        >
          {!data ? (
            <div className="flex h-[420px] items-center justify-center text-gray-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : yearlyData.length === 0 ? (
            <div className="flex h-[420px] items-center justify-center text-sm" style={{ color: T.textMuted }}>{tl.noData}</div>
          ) : (
            <div className="flex flex-col items-stretch gap-4 md:flex-row">
              <aside
                className="grid w-full shrink-0 grid-cols-2 gap-1.5 rounded-xs border px-3 py-3 sm:grid-cols-3 md:flex md:w-[200px] md:flex-col md:grid-cols-1"
                aria-label={tl.legendAria}
                style={{ borderColor: T.border, backgroundColor: T.surface }}
              >
                <h4
                  className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", color: T.accentNavy }}
                >
                  {tl.legendHeader}
                </h4>
                {countrySeries.map(s => (
                  <div
                    key={s.key}
                    className="flex items-center gap-2 text-[11px]"
                    style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif" }}
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="font-medium" style={{ color: T.textPrimary }}>{s.nombre}</span>
                  </div>
                ))}
              </aside>
              <div className="min-w-0 flex-1">
                <RibbonChart
                  datos={yearlyData}
                  xKey="year"
                  series={countrySeries}
                  yFormat={formatters.mil}
                   altura={360}
                />
              </div>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title={filters.flow === "imports" ? tl.titleAccumulatedImports : tl.titleAccumulatedExports}
          subtitle={formatTemplate(tl.subtitleAccumulated, { short: unit.short })}
        >
          {!data ? (
            <div className="flex h-[420px] items-center justify-center text-gray-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : mergedAcc.length === 0 ? (
            <div className="flex h-[420px] items-center justify-center text-sm" style={{ color: T.textMuted }}>Sin datos para los filtros seleccionados.</div>
          ) : (
            <LineChart
              datos={mergedAcc}
              xKey="mes"
              series={yearSeries}
              yFormat={formatters.mil}
               altura={360}
              etiquetasFinales
            />
          )}
        </ChartCard>
      </div>
    </div>
  );
}
