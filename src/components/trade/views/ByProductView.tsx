"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { ChartCard } from "@/components/trade/ChartCard";
import { BarChart, makeFormatters } from "@/components/trade/charts";
import { useByProduct } from "@/hooks/trade/useByProduct";
import { useYearComparator } from "@/hooks/trade/useYearComparator";
import { useDebouncedFilters } from "@/hooks/trade/useDebouncedFilters";
import { YEAR_PALETTE, UNIT_VOLUMEN, getUnitLabel } from "@/app/lib/trade/constants";
import { useTradeTheme } from "@/components/trade/TradeThemeContext";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { translateProduct } from "@/app/lib/i18n/tradeData";
import { TradeFilters, ByProductResponse, ByProductComparative, ByProductRow } from "@/app/interfaces/trade/interface";

function formatTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

export function ByProductView() {
  const { yearA, yearB, yearsList, setYearA, setYearB } = useYearComparator();
  const T = useTradeTheme();
  const dark = T.mode === "dark";
  const locale = useDashboard((s) => s.locale);
  const t = getTranslation(locale);
  const ys = t.yearSelector;
  const bp = t.byProduct;

  const unit = useMemo(() => getUnitLabel(), []);
  const formatters = useMemo(() => makeFormatters(unit), [unit]);

  const sortedYears: [number, number] = useMemo(() => {
    return ([yearA, yearB].sort((a, b) => a - b) as [number, number]);
  }, [yearA, yearB]);

  const { filters, fetcher } = useByProduct(sortedYears);
  const { datos } = useDebouncedFilters<TradeFilters, ByProductResponse>(filters, fetcher);

  const topByVolume = useMemo(() => {
    if (!datos) return [];
    const list: ByProductRow[] = Array.isArray(datos) && datos.length > 0 && "years" in datos[0]
      ? flattenComparatives(datos as ByProductComparative[])
      : (datos as ByProductRow[]);
    const map = new Map<string, ByProductRow>();
    list.forEach(r => {
      const prev = map.get(r.producto);
      if (!prev || r.volumenKg > prev.volumenKg) map.set(r.producto, r);
    });
    return Array.from(map.values()).sort((a, b) => b.volumenKg - a.volumenKg).slice(0, 15);
  }, [datos]);

  const topByPrice = useMemo(() => {
    if (!datos) return [];
    const list: ByProductRow[] = Array.isArray(datos) && datos.length > 0 && "years" in datos[0]
      ? flattenComparatives(datos as ByProductComparative[])
      : (datos as ByProductRow[]);
    const map = new Map<string, ByProductRow>();
    list.forEach(r => {
      const prev = map.get(r.producto);
      const price = r.precioUsd;
      const prevPrice = prev?.precioUsd ?? -1;
      if (!prev || price > prevPrice) map.set(r.producto, r);
    });
    return Array.from(map.values())
      .sort((a, b) => b.precioUsd - a.precioUsd)
      .slice(0, 15);
  }, [datos]);

  const volumeData = useMemo(() => {
    if (!datos) return [];
    const list: ByProductRow[] = Array.isArray(datos) && datos.length > 0 && "years" in datos[0]
      ? flattenComparatives(datos as ByProductComparative[])
      : (datos as ByProductRow[]);
    const yearASet = new Set(
      list.filter(d => d.year === yearA && d.volumenKg > 0).map(d => d.producto)
    );
    return topByVolume
      .filter(p => yearASet.has(p.producto))
      .map(p => {
        const rowA = list.find(d => d.producto === p.producto && d.year === yearA);
        const rowB = list.find(d => d.producto === p.producto && d.year === yearB);
        return {
          producto: translateProduct(p.producto, locale),
          [String(yearA)]: rowA?.volumenKg ?? 0,
          [String(yearB)]: rowB?.volumenKg ?? 0,
        };
      })
      .filter(d => (d[String(yearA)] as number) > 0);
  }, [datos, topByVolume, yearA, yearB, locale]);

  const priceData = useMemo(() => {
    if (!datos) return [];
    const list: ByProductRow[] = Array.isArray(datos) && datos.length > 0 && "years" in datos[0]
      ? flattenComparatives(datos as ByProductComparative[])
      : (datos as ByProductRow[]);
    const yearASet = new Set(
      list.filter(d => d.year === yearA && d.volumenKg > 0).map(d => d.producto)
    );
    return topByPrice
      .filter(p => yearASet.has(p.producto))
      .map(p => {
        const rowA = list.find(d => d.producto === p.producto && d.year === yearA);
        const rowB = list.find(d => d.producto === p.producto && d.year === yearB);
        return {
          producto: translateProduct(p.producto, locale),
          [String(yearA)]: rowA?.precioUsd ?? 0,
          [String(yearB)]: rowB?.precioUsd ?? 0,
        };
      })
      .filter(d => (d[String(yearA)] as number) > 0);
  }, [datos, topByPrice, yearA, yearB, locale]);

  const volumeSeries = useMemo(() => [
    { key: String(yearA), nombre: String(yearA), color: YEAR_PALETTE[0] },
    { key: String(yearB), nombre: String(yearB), color: YEAR_PALETTE[1] },
  ], [yearA, yearB]);

  const volumenAlt = Math.max(360, topByVolume.length * 28 + 60);
  const precioAlt = Math.max(360, topByPrice.length * 28 + 60);

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
    backgroundImage: dark
      ? "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='%23cbd5e8' d='M0 0l5 6 5-6z'/></svg>\")"
      : "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='%2306254B' d='M0 0l5 6 5-6z'/></svg>\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
  };

  return (
    <div className="space-y-4">
<div
        className="flex flex-col gap-2 rounded-lg border px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:px-4"
        role="group"
        aria-label={bp.yearComparatorAria}
        style={{ borderColor: T.border, backgroundColor: T.surface }}
      >
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.2em] sm:mr-1"
          style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", color: T.accentNavy }}
        >
          {ys.compare}
        </span>
        {yearsList.length === 0 ? (
          <div
            className="flex items-center gap-2 text-xs"
            style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", color: T.textMuted }}
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: T.accentNavy }} /> {bp.loadingYears}
          </div>
        ) : (
          <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
            <select
              aria-label={ys.yearA}
              value={yearA}
              onChange={e => setYearA(Number(e.target.value))}
              style={{ ...selectStyle, minWidth: 0, flex: "1 1 0" }}
            >
              {yearsList.filter(y => y !== yearB).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <span
              className="shrink-0 text-xs"
              style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", color: T.textMuted }}
            >
              {ys.vs}
            </span>
            <select
              aria-label={ys.yearB}
              value={yearB}
              onChange={e => setYearB(Number(e.target.value))}
              style={{ ...selectStyle, minWidth: 0, flex: "1 1 0" }}
            >
              {yearsList.filter(y => y !== yearA).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title={bp.titleVolume}
          subtitle={formatTemplate(bp.subtitleVolume, { short: unit.short, yearA: String(yearA), yearB: String(yearB) })}
        >
          {!datos ? (
            <div className="flex h-[480px] items-center justify-center text-gray-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <BarChart
              datos={volumeData}
              xKey="producto"
              orientacion="horizontal"
              series={volumeSeries}
              yFormat={formatters.unit}
              altura={volumenAlt}
              stack
            />
          )}
        </ChartCard>

        <ChartCard
          title={bp.titlePrice}
          subtitle={formatTemplate(bp.subtitlePrice, { per: UNIT_VOLUMEN.per, yearA: String(yearA), yearB: String(yearB) })}
        >
          {!datos ? (
            <div className="flex h-[480px] items-center justify-center text-gray-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <BarChart
              datos={priceData}
              xKey="producto"
              orientacion="horizontal"
              series={volumeSeries}
              yFormat={(v) => `$${v.toFixed(2)}`}
              altura={precioAlt}
              stack
            />
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function flattenComparatives(comps: ByProductComparative[]): ByProductRow[] {
  const rows: ByProductRow[] = [];
  for (const c of comps) {
    for (const [yearStr, data] of Object.entries(c.years)) {
      const year = Number(yearStr);
      rows.push({
        categoria: c.categoria,
        producto: c.producto,
        year,
        registros: data.registros,
        volumenKg: data.volumenKg,
        valorUsd: data.valorUsd,
        precioUsd: data.precioUsd,
      });
    }
  }
  return rows;
}

