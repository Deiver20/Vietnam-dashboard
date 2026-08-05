"use client";

import { useEffect, useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { ChartCard } from "@/components/trade/ChartCard";
import { LineChart, makeFormatters } from "@/components/trade/charts";
import { DataTable, type Columna } from "@/components/trade/DataTable";
import { PillToggle } from "@/components/trade/PillToggle";
import { useByCountry } from "@/hooks/trade/useByCountry";
import { useDebouncedFilters } from "@/hooks/trade/useDebouncedFilters";
import { getCountryColor, COLORS, getUnitLabel } from "@/app/lib/trade/constants";
import { useTradeTheme } from "@/components/trade/TradeThemeContext";
import { TradeFilters, ByCountryResponse, ByCountryRanking } from "@/app/interfaces/trade/interface";

const fontQ = "var(--font-poppins), Poppins, sans-serif";

const fmtPct = (n: number) => `${n.toFixed(1)}%`;

const MONTH_NAMES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

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

type Vista = "graficos" | "tabla";
type ModoTiempo = "meses" | "anos";

export function ByCountryView() {
  const { filters, fetcher } = useByCountry();
  const { datos: data } = useDebouncedFilters<TradeFilters, ByCountryResponse>(filters, fetcher);
  const [vista, setVista] = useState<Vista>("graficos");
  const [modoTiempo, setModoTiempo] = useState<ModoTiempo>("meses");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const T = useTradeTheme();

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
    return topCountries.map((country, i) => ({ key: country, nombre: country, color: getCountryColor(i) }));
  }, [data, topCountries]);

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
  }, [data, topCountries, modoTiempo, selectedYear]);

  const columnas: Columna<ByCountryRanking>[] = useMemo(() => [
    { key: "country",  titulo: "País" },
    { key: "registros", titulo: "Registros", align: "right", width: "110px",
      formato: v => Number(v).toLocaleString("es-MX", { maximumFractionDigits: 0 }) },
    { key: "volumenKg", titulo: `Volumen (${unit.short})`,   align: "right", width: "120px", formato: v => formatters.unit(Number(v)) },
    { key: "valorUsd",  titulo: "Valor USD", align: "right", width: "120px", formato: v => formatters.usd(Number(v)) },
    { key: "precioUsd", titulo: `USD/${unit.per}`,    align: "right", width: "100px", formato: v => `$${Number(v).toFixed(2)}` },
    { key: "share",     titulo: "Participación", align: "right", width: "140px",
      formato: v => (
        <div className="flex items-center gap-2 justify-end">
          <div
            className="h-1.5 w-12 overflow-hidden rounded-full"
            style={{ backgroundColor: T.surfaceHover }}
          >
            <div
              className="h-full"
              style={{ width: `${Math.min(100, Number(v))}%`, backgroundColor: T.accent }}
            />
          </div>
          <span
            className="font-mono-numbers text-[11px]"
            style={{ color: T.textPrimary }}
          >
            {fmtPct(Number(v))}
          </span>
        </div>
      ) },
  ], [unit.short, unit.per, formatters, T]);

  return (
    <div className="space-y-4">
      {vista === "graficos" && (
        <ChartCard
          eyebrow="TIMELINE TOP 6"
          title={
            modoTiempo === "anos"
              ? <>Volumen anual <em className="acc">por país</em></>
              : <>Volumen mensual <em className="acc">por país</em></>
          }
          acciones={
            <div className="flex flex-wrap items-center gap-2">
              <PillToggle<ModoTiempo>
                options={[
                  { id: "meses", label: "Meses" },
                  { id: "anos", label: "Años" },
                ]}
                value={modoTiempo}
                onChange={setModoTiempo}
                ariaLabel="Cambiar granularidad"
              />
              <PillToggle<Vista>
                options={[
                  { id: "graficos", label: "Gráficos" },
                  { id: "tabla", label: "Tabla" },
                ]}
                value={vista}
                onChange={setVista}
                ariaLabel="Cambiar vista"
              />
            </div>
          }
        >
          {modoTiempo === "meses" && (
            <div
              className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border px-4 py-2.5"
              style={{ borderColor: T.border, backgroundColor: T.surface }}
            >
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ fontFamily: fontQ, color: T.accentNavy }}
              >
                Año
              </span>
              {availableYears.length === 0 ? (
                <div
                  className="flex items-center gap-2 text-xs"
                  style={{ fontFamily: fontQ, color: T.textMuted }}
                >
                  <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: T.accentNavy }} /> Cargando años…
                </div>
              ) : (
                <select
                  aria-label="Año"
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
            <div className="flex h-[480px] items-center justify-center text-gray-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <LineChart
              datos={timelineData}
              xKey="label"
              series={timelineSeries}
              yFormat={formatters.unit}
              altura={480}
            />
          )}
        </ChartCard>
      )}

      {vista === "tabla" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <PillToggle<Vista>
              options={[
                { id: "graficos", label: "Gráficos" },
                { id: "tabla", label: "Tabla" },
              ]}
              value={vista}
              onChange={setVista}
              ariaLabel="Cambiar vista"
            />
          </div>
          {data && (
            <DataTable
              datos={data.ranking}
              columnas={columnas}
              titulo="Ranking completo por país"
              nombreCSV={`by_country_${filters.flow}_${filters.yearStart}-${filters.yearEnd}`}
            />
          )}
        </div>
      )}
    </div>
  );
}
