"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { ChartCard } from "@/components/trade/ChartCard";
import { CountryPivotTable } from "@/components/trade/CountryPivotTable";
import { CountryChoroplethMap } from "@/components/trade/CountryChoroplethMap";
import { PillToggle } from "@/components/trade/PillToggle";
import { useCountryMonthly } from "@/hooks/trade/useCountryMonthly";
import { useByCountry } from "@/hooks/trade/useByCountry";
import { useYearComparator } from "@/hooks/trade/useYearComparator";
import { useDebouncedFilters } from "@/hooks/trade/useDebouncedFilters";
import { getUnitLabel } from "@/app/lib/trade/constants";
import { useTradeTheme } from "@/components/trade/TradeThemeContext";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { TradeFilters, CountryMonthlyBreakdown, ByCountryResponse } from "@/app/interfaces/trade/interface";

function formatTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

type Vista = "pivot" | "mapa";

export function CountriesDetailedView() {
  const { yearA, setYearA, yearB, setYearB, yearsList } = useYearComparator();
  const [vista, setVista] = useState<Vista>("pivot");
  const [mapYear, setMapYear] = useState<number | null>(null);
  const T = useTradeTheme();
  const flow = useDashboard((s) => s.filters.flow);
  const locale = useDashboard((s) => s.locale);
  const t = getTranslation(locale);
  const cd = t.countriesDetailed;
  const ys = t.yearSelector;
  const paisLabel = flow === "exports" ? cd.countryOfDestination : cd.countryOfOrigin;

  const unit = useMemo(() => getUnitLabel(), []);

  const defaultYear = yearsList.length > 0 ? yearsList[yearsList.length - 1] : null;
  const effectiveMapYear = mapYear ?? defaultYear;

  const sortedYears: [number, number] = useMemo(() => {
    return ([yearA, yearB].sort((a, b) => a - b) as [number, number]);
  }, [yearA, yearB]);

  const { filters: pivotFilters, fetcher: pivotFetcher } = useCountryMonthly(sortedYears);
  const { datos: pivot, error, cargando } = useDebouncedFilters<TradeFilters, CountryMonthlyBreakdown>(pivotFilters, pivotFetcher);

  const { filters: countryFilters, fetcher: countryFetcher } = useByCountry();
  const mapFilters = useMemo<TradeFilters>(() => ({
    ...countryFilters,
    yearStart: effectiveMapYear ?? undefined,
    yearEnd: effectiveMapYear ?? undefined,
  }), [countryFilters, effectiveMapYear]);
  const { datos: countryData } = useDebouncedFilters<TradeFilters, ByCountryResponse>(mapFilters, countryFetcher);

  const mapRows = useMemo(() => {
    if (!countryData) return [] as Array<{ country: string; volumenMt: number }>;
    return countryData.ranking
      .filter(r => r.volumenKg > 0)
      .map(r => ({ country: r.country, volumenMt: r.volumenKg }));
  }, [countryData]);

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

  const isMapa = vista === "mapa";

  return (
    <div className="space-y-4">
      <div
        className="flex flex-wrap items-center gap-3 rounded-lg border px-3 py-3 sm:px-4"
        style={{ borderColor: T.border, backgroundColor: T.surface }}
        role="group"
        aria-label={cd.yearComparatorAria}
      >
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.2em]"
          style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", color: T.accentNavy }}
        >
          {isMapa ? t.filters.year : ys.compare}
        </span>
        {yearsList.length === 0 ? (
          <div
            className="flex items-center gap-2 text-xs"
            style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", color: T.textMuted }}
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: T.accentNavy }} /> {cd.loadingYears}
          </div>
        ) : isMapa ? (
          <select
            aria-label={t.filters.year}
            value={effectiveMapYear ?? undefined}
            onChange={e => setMapYear(Number(e.target.value))}
            style={selectStyle}
          >
            {yearsList.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        ) : (
          <>
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
        )}
        <span className="w-full sm:ml-auto sm:w-auto" style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif" }}>
          <PillToggle<Vista>
            options={[
              { id: "pivot", label: cd.viewPivot },
              { id: "mapa", label: cd.viewMap },
            ]}
            value={vista}
            onChange={setVista}
            ariaLabel={cd.toggleView}
          />
        </span>
      </div>

      <ChartCard
        title={isMapa ? cd.mapTitle : cd.pivotTitle}
        subtitle={
          isMapa
            ? formatTemplate(cd.mapSubtitle, { short: unit.short, label: paisLabel, year: String(effectiveMapYear ?? "—") })
            : cd.pivotSubtitle.replace("{short}", unit.short)
        }
      >
        {error && !isMapa && (
          <div
            className="rounded-md border p-4 text-sm"
            style={{ borderColor: "rgba(239, 68, 68, 0.30)", backgroundColor: T.mode === "dark" ? "rgba(239, 68, 68, 0.12)" : "rgba(239, 68, 68, 0.08)", color: T.mode === "dark" ? "#f87171" : "#b91c1c" }}
          >
            {cd.loadBreakdownError} {error}
          </div>
        )}

        {!isMapa && !error && (!pivot || cargando) && (
          <div
            className="flex items-center gap-2 rounded-lg border p-6 text-sm"
            style={{ borderColor: T.border, color: T.textMuted, backgroundColor: T.surface }}
          >
            <Loader2 className="h-4 w-4 animate-spin" style={{ color: T.accentNavy }} /> {cd.loadingBreakdown}
          </div>
        )}

        {!isMapa && !error && pivot && pivot.monthKeys.length > 0 && pivot.rows.length > 0 && (
          <CountryPivotTable data={pivot} unit={unit} />
        )}

        {!isMapa && !error && pivot && (pivot.monthKeys.length === 0 || pivot.rows.length === 0) && !cargando && (
          <div
            className="flex h-[240px] items-center justify-center rounded-lg border text-sm"
            style={{ borderColor: T.border, color: T.textMuted, backgroundColor: T.surface }}
          >
            {cd.noData}
          </div>
        )}

        {isMapa && (
          mapRows.length > 0 ? (
            <CountryChoroplethMap data={mapRows} unit={unit.short} />
          ) : (
            <div
              className="flex h-[min(380px,70vw)] min-h-[280px] items-center justify-center rounded-lg border text-sm"
              style={{ borderColor: T.border, color: T.textMuted, backgroundColor: T.surface }}
            >
              <Loader2 className="h-4 w-4 animate-spin mr-2" style={{ color: T.accentNavy }} /> {cd.loadingVolume}
            </div>
          )
        )}
      </ChartCard>
    </div>
  );
}
