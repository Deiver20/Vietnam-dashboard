"use client";

import { memo, useMemo, useState } from "react";
import { getTranslation } from "@/app/utils/translations";
import { useDashboard } from "@/store/useDashboard";
import { formatUSD } from "@/app/lib/functions/formatters";
import { Loader2 } from "lucide-react";

export const SOYBEAN_MEAL_LABEL = "Soybean Meal";
export const SOYBEAN_MEAL_PROTEIN = 48;
export const SOYBEAN_MEAL_DIGESTIBILITY = 88;
export const REFERENCE_PROTEIN = 48;

const PROTEIN_REFERENCE: Record<string, number> = {
  "Blood meal": 85,
  "Feather meal": 80,
  "Fish meal": 62,
  "Bovine Meal": 45,
  "Porcine Meal": 60,
  "Poultry Meal": 60,
  "Sheep Meal": 60,
};

const DIGESTIBILITY: Record<string, number> = {
  "Blood meal": 90,
  "Feather meal": 60,
  "Fish meal": 85,
  "Bovine Meal": 75,
  "Porcine Meal": 80,
  "Poultry Meal": 80,
  "Sheep Meal": 70,
  [SOYBEAN_MEAL_LABEL]: SOYBEAN_MEAL_DIGESTIBILITY,
};

type Mode = "cruda" | "digestible";

interface ProteinEconomicsProps {
  productLabel: string;
  currentPrice: number | null;
  soymealFut: number | null;
  loading: boolean;
}

interface Row {
  label: string;
  cif: number | null;
  cp: number;
  dig: number | null;
  digestibleProtein: number | null;
  usdPerProtein: number | null;
  usdPerDigestible: number | null;
  eq48: number | null;
  eq48Digestible: number | null;
}

function buildRow(
  label: string,
  cif: number | null,
  cp: number,
  dig: number | null
): Row {
  const digestibleProtein = dig != null ? (cp * dig) / 100 : null;
  return {
    label,
    cif,
    cp,
    dig,
    digestibleProtein,
    usdPerProtein: cif != null && cp > 0 ? cif / cp : null,
    usdPerDigestible:
      cif != null && digestibleProtein != null && digestibleProtein > 0
        ? cif / digestibleProtein
        : null,
    eq48: cif != null && cp > 0 ? (cif * REFERENCE_PROTEIN) / cp : null,
    eq48Digestible:
      cif != null && digestibleProtein != null && digestibleProtein > 0
        ? (cif * REFERENCE_PROTEIN) / digestibleProtein
        : null,
  };
}

export const ProteinEconomics = memo(function ProteinEconomics({
  productLabel,
  currentPrice,
  soymealFut,
  loading,
}: ProteinEconomicsProps) {
  const locale = useDashboard((s) => s.locale);
  const t = getTranslation(locale);
  const [mode, setMode] = useState<Mode>("cruda");

  const rows = useMemo<Row[]>(() => {
    const result: Row[] = [];
    const selectedCp = PROTEIN_REFERENCE[productLabel];
    const selectedDig = DIGESTIBILITY[productLabel];

    if (selectedCp != null && currentPrice != null && currentPrice > 0) {
      if (mode === "cruda" || selectedDig != null) {
        result.push(buildRow(productLabel, currentPrice, selectedCp, selectedDig ?? null));
      }
    }
    if (soymealFut != null && soymealFut > 0) {
      result.push(
        buildRow(
          SOYBEAN_MEAL_LABEL,
          soymealFut,
          SOYBEAN_MEAL_PROTEIN,
          SOYBEAN_MEAL_DIGESTIBILITY
        )
      );
    }
    return result;
  }, [productLabel, currentPrice, soymealFut, mode]);

  const bestLabel = useMemo(() => {
    if (rows.length === 0) return null;
    const metric = mode === "cruda" ? "usdPerProtein" : "usdPerDigestible";
    const valid = rows.filter((r) => r[metric] != null);
    if (valid.length === 0) return null;
    return valid.reduce((min, r) =>
      r[metric]! < min[metric]! ? r : min
    ).label;
  }, [rows, mode]);

  if (loading && currentPrice == null && soymealFut == null) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 flex items-center justify-center text-gray-4 h-[140px]">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 flex items-center justify-center text-gray-4 text-sm h-[140px]">
        {t.eda.noData}
      </div>
    );
  }

  const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: "var(--font-poppins), Poppins, sans-serif",
    fontSize: 10,
    fontWeight: 600,
    padding: "3px 8px",
    backgroundColor: active ? "var(--color-blue)" : "transparent",
    color: active ? "#ffffff" : "#94a3b8",
    transition: "all 150ms ease",
  });

  return (
    <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-white mb-3">Protein Economics</h3>
      <table className="w-full text-[11px] border-collapse">
        <thead>
          <tr className="text-left text-gray-5">
            <th className="font-medium p-1.5">Producto</th>
            <th className="font-medium p-1.5 text-right">CIF USD/MT</th>
            <th className="font-medium p-1.5 text-right">
              {mode === "cruda" ? "Prot." : "Prot. Dig."}
            </th>
            <th className="font-medium p-1.5 text-right">
              {mode === "cruda" ? "USD / Prot." : "USD / Dig.Prot."}
            </th>
            <th className="font-medium p-1.5 text-right">Eq. 48%</th>
            <th className="p-1.5 text-right">
              <div
                role="group"
                aria-label="Modo de proteína"
                className="inline-flex overflow-hidden rounded-sm border border-navy-line"
              >
                <button
                  type="button"
                  onClick={() => setMode("cruda")}
                  aria-pressed={mode === "cruda"}
                  style={toggleBtnStyle(mode === "cruda")}
                >
                  Cruda
                </button>
                <button
                  type="button"
                  onClick={() => setMode("digestible")}
                  aria-pressed={mode === "digestible"}
                  style={toggleBtnStyle(mode === "digestible")}
                >
                  Digestible
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isBest = bestLabel === row.label;
            const proteinValue =
              mode === "cruda"
                ? row.cp.toFixed(0) + "%"
                : row.digestibleProtein != null
                ? row.digestibleProtein.toFixed(2) + "%"
                : "-";
            const usdPerProteinValue =
              mode === "cruda"
                ? row.usdPerProtein
                : row.usdPerDigestible;
            const eq48Value =
              mode === "cruda" ? row.eq48 : row.eq48Digestible;
            return (
              <tr key={row.label} className="border-t border-navy-line">
                <td className="p-1.5 text-gray-3 font-medium">
                  {row.label}
                  {isBest && <span className="ml-1.5 text-emerald-400">●</span>}
                </td>
                <td className="p-1.5 text-right text-white font-mono">
                  {row.cif != null ? formatUSD(row.cif, 2) : "-"}
                </td>
                <td className="p-1.5 text-right text-gray-3 font-mono">
                  {proteinValue}
                </td>
                <td
                  className="p-1.5 text-right font-mono"
                  style={{ color: isBest ? "#34d399" : "#fff" }}
                >
                  {usdPerProteinValue != null
                    ? formatUSD(usdPerProteinValue, 2)
                    : "-"}
                </td>
                <td className="p-1.5 text-right text-white font-mono">
                  {eq48Value != null ? formatUSD(eq48Value, 2) : "-"}
                </td>
                <td className="p-1.5"></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
