"use client";

import { useEffect, useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { ChartCard } from "@/components/trade/ChartCard";
import { LineChart, makeFormatters } from "@/components/trade/charts";
import { PillToggle } from "@/components/trade/PillToggle";
import { useByCountry } from "@/hooks/trade/useByCountry";
import { useDebouncedFilters } from "@/hooks/trade/useDebouncedFilters";
import { getCountryColor, getUnitLabel } from "@/app/lib/trade/constants";
import { useTradeTheme } from "@/components/trade/TradeThemeContext";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { translateCountry } from "@/app/lib/i18n/tradeData";
import { TradeFilters, ByCountryResponse } from "@/app/interfaces/trade/interface";

const fontQ = "var(--font-poppins), Poppins, sans-serif";

function formatTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

const selectStyle = (T: ReturnType<typeof useTradeTheme>): React.CSSProperties => ({
  fontFamily: fontQ,
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
});

type ModoTiempo = "meses" | "anos";

export function ByCountryView() {
  const { filters, fetcher } = useByCountry();
  const { datos: data } = useDebouncedFilters<TradeFilters, ByCountryResponse>(filters, fetcher);
  const [modoTiempo, setModoTiempo] = useState<ModoTiempo>("meses");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const T = useTradeTheme();
  const locale = useDashboard((s) => s.locale);
  const t = getTranslation(locale);
  const bc = t.byCountry;
  const MONTH_NAMES = t.filters.monthAbbr;

  const unit = useMemo(() => getUnitLabel(), []);
  const formatters = useMemo(() => makeFormatters(unit), [unit]);

  const topCountries = useMemo(() => {
    if (!data) return [] as string[];
    return data.ranking.slice(0, 6).map(r => r.country);
  }, [data]);

  const availableYears = useMemo(() => {
    if (!data) return [] as number[];
    const set = new Set<number>();
    data.timeline.forEach(t => set.add(t.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [data]);

  useEffect(() => {
    if (availableYears.length === 0) {
      if (selectedYear !== null) setSelectedYear(null);
      return;
    }
    if (selectedYear === null || !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const timelineSeries = useMemo(() => {
    if (!data) return [];
    return topCountries.map((country, i) => ({ key: country, nombre: translateCountry(country, locale), color: getCountryColor(i, T.mode) }));
  }, [data, topCountries, T.mode, locale]);

  const timelineData = useMemo(() => {
    if (!data || topCountries.length === 0) return [] as Array<Record<string, number | string>>;
    const filtered = data.timeline.filter(t => topCountries.includes(t.country));

    if (modoTiempo === "anos") {
      const map: Record<string, Record<string, number | string>> = {};
      filtered.forEach(t => {
        const key = String(t.year);
        if (!map[key]) map[key] = { label: key };
        const prev = Number(map[key][t.country] ?? 0);
        map[key][t.country] = prev + t.volumenKg;
      });
      return Object.keys(map).sort().map(k => map[k]);
    }

    if (selectedYear === null) return [];
    const map: Record<string, Record<string, number | string>> = {};
    filtered
      .filter(t => t.year === selectedYear)
      .forEach(t => {
        const key = String(t.month);
        if (!map[key]) map[key] = { label: MONTH_NAMES[t.month - 1] ?? key };
        const prev = Number(map[key][t.country] ?? 0);
        map[key][t.country] = prev + t.volumenKg;
      });
    return Array.from({ length: 12 }, (_, i) => {
      const key = String(i + 1);
      return map[key] ?? { label: MONTH_NAMES[i] };
    });
  }, [data, topCountries, modoTiempo, selectedYear, MONTH_NAMES]);

  return (
    <div className="space-y-4">
      <ChartCard
        title={bc.title}
        subtitle={
          modoTiempo === "anos"
            ? formatTemplate(bc.subtitleYearly, { short: unit.short })
            : formatTemplate(bc.subtitleMonthly, { short: unit.short, year: String(selectedYear ?? "—") })
        }
        acciones={
          <div className="flex flex-wrap items-center gap-2">
            <PillToggle<ModoTiempo>
              options={[
                { id: "meses", label: bc.monthsLabel },
                { id: "anos", label: bc.yearsLabel },
              ]}
              value={modoTiempo}
              onChange={setModoTiempo}
              ariaLabel={bc.toggleGranularity}
            />
          </div>
        }
      >
        {modoTiempo === "meses" && (
          <div
            className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2.5 sm:px-4"
            style={{ borderColor: T.border, backgroundColor: T.surface }}
          >
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{ fontFamily: fontQ, color: T.accentNavy }}
            >
              {t.filters.year}
            </span>
            {availableYears.length === 0 ? (
              <div
                className="flex items-center gap-2 text-xs"
                style={{ fontFamily: fontQ, color: T.textMuted }}
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: T.accentNavy }} /> {bc.loadingYears}
              </div>
            ) : (
              <select
                aria-label={bc.yearSelectorAria}
                value={selectedYear ?? availableYears[0]}
                onChange={e => setSelectedYear(Number(e.target.value))}
                style={selectStyle(T)}
              >
                {availableYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            )}
          </div>
        )}
        {!data ? (
          <div className="flex h-[min(380px,70vw)] min-h-[280px] items-center justify-center text-gray-4">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <LineChart
            datos={timelineData}
            xKey="label"
            series={timelineSeries}
            yFormat={formatters.unit}
            altura={380}
            etiquetasFinales
          />
        )}
      </ChartCard>
    </div>
  );
}
