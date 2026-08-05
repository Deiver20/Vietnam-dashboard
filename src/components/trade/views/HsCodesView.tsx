"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { DataTable, type Columna } from "@/components/trade/DataTable";
import { useHsCodes } from "@/hooks/trade/useHsCodes";
import { useDebouncedFilters } from "@/hooks/trade/useDebouncedFilters";
import { CATEGORY_COLORS } from "@/app/lib/trade/constants";
import { TradeFilters, HsCodeRow } from "@/app/interfaces/trade/interface";
import { useTradeTheme } from "@/components/trade/TradeThemeContext";

function categoryStyle(name: string, dark: boolean): React.CSSProperties {
  const base = CATEGORY_COLORS[name] ?? (dark ? "#67a6ff" : "#06254B");
  const hex = base.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, ${dark ? 0.22 : 0.12})`,
    color: base,
    border: `1px solid rgba(${r}, ${g}, ${b}, ${dark ? 0.5 : 0.32})`,
  };
}

/* Badges de Code Type — mismos colores que la tabla del front AGM. */
function codeTypeStyle(name: string, dark: boolean): React.CSSProperties {
  if (name === "Vietnam") return { backgroundColor: "rgba(51,204,0,0.15)", color: "#33cc00", border: "1px solid rgba(51,204,0,0.3)" };
  if (name === "China") return { backgroundColor: "rgba(243,89,89,0.15)", color: "#f35959", border: "1px solid rgba(243,89,89,0.3)" };
  if (name.includes("MercoSur")) return { backgroundColor: "rgba(252,181,20,0.15)", color: "#fcb514", border: "1px solid rgba(252,181,20,0.3)" };
  return dark
    ? { backgroundColor: "rgba(255,255,255,0.06)", color: "#9aa7bd", border: "1px solid rgba(102,166,255,0.18)" }
    : { backgroundColor: "rgba(6,37,75,0.08)", color: "#5a6478", border: "1px solid rgba(6,37,75,0.15)" };
}

/* The five digit positions of an HS code, as in the AGM-Front dashboard. */
const HS_POSITIONS = [
  { num: "01", label: "Chapter" },
  { num: "23", label: "Heading" },
  { num: "45", label: "Sub-Heading" },
  { num: "67", label: "Tariff Item" },
  { num: "89", label: "Classification Number" },
];

const POSITION_COLORS = ["#67A6FF", "#33CC00", "#FCB514", "#F35959", "#9B59B6"];

export function HsCodesView() {
  const { filters, fetcher } = useHsCodes();
  const { datos, error, cargando } = useDebouncedFilters<TradeFilters, HsCodeRow[]>(filters, fetcher);
  const T = useTradeTheme();
  const dark = T.mode === "dark";
  const codeColor = dark ? T.textPrimary : "#06254B";
  const codeSub = dark ? "#67a6ff" : "#03488D";

  const columnas: Columna<HsCodeRow>[] = useMemo(() => [
    { key: "codigo",      titulo: "Code",  align: "center", width: "16%",
      formato: v => <span className="font-mono-numbers text-[11px]" style={{ color: codeColor }}>{String(v)}</span> },
    { key: "codigoHs",    titulo: "HS Code",  align: "center", width: "13%",
      formato: (_, row) => <span className="font-mono-numbers text-[11px]" style={{ color: codeSub }}>{String(row.fraccion ?? "").slice(0, 6)}</span> },
    { key: "partida",     titulo: "Heading",  align: "center", width: "11%",
      formato: v => <span className="font-mono-numbers text-[11px]" style={{ color: codeColor }}>{String(v)}</span> },
    { key: "producto",    titulo: "Product",  align: "center", width: "22%",
      formato: v => <span style={{ color: codeColor }}>{String(v) || "—"}</span> },
    { key: "categoria",   titulo: "Category",  align: "center", width: "13%",
      formato: v => (
        <span
          className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={categoryStyle(String(v), dark)}
        >
          {String(v)}
        </span>
      ) },
    { key: "industry",    titulo: "Industry",  align: "left", width: "12%",
      formato: v => <span style={{ color: codeColor }}>{String(v) || "—"}</span> },
    { key: "codeType",    titulo: "Code Type",  align: "center", width: "13%",
      formato: v => (
        <span
          className="inline-block rounded px-2 py-0.5 text-[10px] font-semibold"
          style={codeTypeStyle(String(v), dark)}
        >
          {String(v) || "—"}
        </span>
      ) },
  ], [codeColor, codeSub, dark]);

  return (
    <div className="flex flex-col gap-4">
      {/* HS Code banner — recycled from the AGM-Front dashboard. */}
      <div
        className="relative overflow-hidden rounded-[14px] border p-6"
        style={{ borderColor: T.border, backgroundColor: T.surface }}
      >
        <div className="relative z-10 flex flex-col items-center text-center">
          <h3
            className="mb-4 text-lg font-bold tracking-[-0.01em]"
            style={{ color: T.textPrimary }}
          >
            HS Codes
          </h3>
          <div className="flex items-start justify-center gap-6">
            {HS_POSITIONS.map((item, i) => (
              <div key={item.num} className="flex flex-col items-center gap-1">
                <span
                  className="text-[32px] font-black tabular-nums"
                  style={{
                    background: `linear-gradient(135deg, ${POSITION_COLORS[i]} 0%, ${
                      dark ? POSITION_COLORS[i] : "#fff"
                    } 100%)`,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {item.num}
                </span>
                <span
                  className="text-[10px] uppercase tracking-[0.1em]"
                  style={{ color: T.textMuted }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div
          className="rounded-md border p-4 text-sm"
          style={{ borderColor: "rgba(239, 68, 68, 0.30)", backgroundColor: dark ? "rgba(239, 68, 68, 0.12)" : "rgba(239, 68, 68, 0.08)", color: dark ? "#f87171" : "#b91c1c" }}
        >
          {error}
        </div>
      )}
      {!datos && !error && (
        <div
          className="flex items-center gap-2 rounded-lg border p-6 text-sm"
          style={{ borderColor: T.border, color: T.textMuted, backgroundColor: T.surface }}
        >
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: T.accentNavy }} /> {cargando ? "Cargando" : ""} HS Codes…
        </div>
      )}
      {datos && (
        <DataTable
          datos={datos}
          columnas={columnas}
          titulo={`HS Codes · Harmonized System classification codes`}
          nombreCSV={`hs_codes_${filters.flow}_${filters.yearStart}-${filters.yearEnd}`}
          centerTitle
          agm
        />
      )}
    </div>
  );
}
