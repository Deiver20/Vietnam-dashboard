"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { ChartCard } from "@/components/trade/ChartCard";
import { CountryPivotTable } from "@/components/trade/CountryPivotTable";
import { useCountryMonthly } from "@/hooks/trade/useCountryMonthly";
import { useYearComparator } from "@/hooks/trade/useYearComparator";
import { useDebouncedFilters } from "@/hooks/trade/useDebouncedFilters";
import { getUnitLabel } from "@/app/lib/trade/constants";
import { useTradeTheme } from "@/components/trade/TradeThemeContext";
import { TradeFilters, CountryMonthlyBreakdown } from "@/app/interfaces/trade/interface";

export function CountriesDetailedView() {
  const { yearA, setYearA, yearB, setYearB, yearsList } = useYearComparator();
  const T = useTradeTheme();

  const unit = useMemo(() => getUnitLabel(), []);

  const sortedYears: [number, number] = useMemo(() => {
    return ([yearA, yearB].sort((a, b) => a - b) as [number, number]);
  }, [yearA, yearB]);

  const { filters, fetcher } = useCountryMonthly(sortedYears);
  const { datos: pivot, error, cargando } = useDebouncedFilters<TradeFilters, CountryMonthlyBreakdown>(filters, fetcher);

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
        className="flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3"
        style={{ borderColor: T.border, backgroundColor: T.surface }}
        role="group"
        aria-label="Comparador de años"
      >
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.2em]"
          style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", color: T.accentNavy }}
        >
          Comparar
        </span>
        {yearsList.length === 0 ? (
          <div
            className="flex items-center gap-2 text-xs"
            style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", color: T.textMuted }}
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: T.accentNavy }} /> Cargando años…
          </div>
        ) : (
          <>
            <select
              aria-label="Año A"
              value={yearA}
              onChange={e => setYearA(Number(e.target.value))}
              style={selectStyle}
            >
              {yearsList.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <span
              className="text-xs"
              style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", color: T.textMuted }}
            >
              vs
            </span>
            <select
              aria-label="Año B"
              value={yearB}
              onChange={e => setYearB(Number(e.target.value))}
              style={selectStyle}
            >
              {yearsList.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </>
        )}
      </div>

      <ChartCard
        eyebrow="PAÍSES · DETALLADO"
        title={<>Pivot <em className="acc">país × mes</em></>}
        subtitle={`Volumen (${unit.short}), valor y precio por país y mes, ordenado por volumen total.`}
      >
        {error && (
          <div
            className="rounded-md border p-4 text-sm"
            style={{ borderColor: "rgba(239, 68, 68, 0.30)", backgroundColor: T.mode === "dark" ? "rgba(239, 68, 68, 0.12)" : "rgba(239, 68, 68, 0.08)", color: T.mode === "dark" ? "#f87171" : "#b91c1c" }}
          >
            Error al cargar el desglose: {error}
          </div>
        )}

        {!error && (!pivot || cargando) && (
          <div
            className="flex items-center gap-2 rounded-lg border p-6 text-sm"
            style={{ borderColor: T.border, color: T.textMuted, backgroundColor: T.surface }}
          >
            <Loader2 className="h-4 w-4 animate-spin" style={{ color: T.accentNavy }} /> Cargando desglose por país…
          </div>
        )}

        {!error && pivot && pivot.monthKeys.length > 0 && pivot.rows.length > 0 && (
          <CountryPivotTable data={pivot} unit={unit} />
        )}

        {!error && pivot && (pivot.monthKeys.length === 0 || pivot.rows.length === 0) && !cargando && (
          <div
            className="flex h-[240px] items-center justify-center rounded-lg border text-sm"
            style={{ borderColor: T.border, color: T.textMuted, backgroundColor: T.surface }}
          >
            Sin datos para los filtros seleccionados.
          </div>
        )}
      </ChartCard>
    </div>
  );
}
