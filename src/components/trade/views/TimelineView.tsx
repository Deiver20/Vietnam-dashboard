"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { ChartCard } from "@/components/trade/ChartCard";
import { RibbonChart, LineChart, makeFormatters } from "@/components/trade/charts";
import { useTimeline } from "@/hooks/trade/useTimeline";
import { useDebouncedFilters } from "@/hooks/trade/useDebouncedFilters";
import { MESES, RIBBON_PALETTE, YEAR_PALETTE, getUnitLabel } from "@/app/lib/trade/constants";
import { useTradeTheme } from "@/components/trade/TradeThemeContext";
import { TradeFilters, TimelineResponse } from "@/app/interfaces/trade/interface";

function countryColor(idx: number): string {
  return RIBBON_PALETTE[idx % RIBBON_PALETTE.length];
}

export function TimelineView() {
  const { filters, fetcher } = useTimeline();
  const { datos: data } = useDebouncedFilters<TradeFilters, TimelineResponse>(filters, fetcher);
  const T = useTradeTheme();

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
    return data.countries.map((c, i) => ({ key: c, nombre: c, color: countryColor(i) }));
  }, [data]);

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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title={filters.flow === "imports" ? "Importaciones por país" : "Exportaciones por país"}
          subtitle="Barras anuales por posición (mayor a menor); las cintas muestran la subida o bajada entre años."
        >
          {!data ? (
            <div className="flex h-[420px] items-center justify-center text-gray-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : yearlyData.length === 0 ? (
            <div className="flex h-[420px] items-center justify-center text-sm" style={{ color: T.textMuted }}>Sin datos para los filtros seleccionados.</div>
          ) : (
            <div className="flex items-stretch gap-4">
              <aside
                className="flex w-[200px] shrink-0 flex-col gap-1.5 rounded-xs border px-3 py-3"
                aria-label="Leyenda de países"
                style={{ borderColor: T.border, backgroundColor: T.surface }}
              >
                <h4
                  className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", color: T.accentNavy }}
                >
                  País de Origen
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
                  altura={420}
                />
              </div>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title={filters.flow === "imports" ? "Importaciones acumuladas" : "Exportaciones acumuladas"}
          subtitle={`Cada año reinicia su acumulado en enero (${unit.short}, mes a mes).`}
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
              altura={420}
            />
          )}
        </ChartCard>
      </div>
    </div>
  );
}
