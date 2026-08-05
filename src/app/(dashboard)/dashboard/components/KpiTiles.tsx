import { formatDelta } from "../chartHelpers";
import type { KpiTilesProps } from "@/interfaces/dashboard/interface";

/* KPI tiles grid */
export default function KpiTiles({
  kpiVals,
  kpiDeltas,
  kpiLabels,
  color,
  chartColorRgb,
}: KpiTilesProps) {
  return (
    <div className="grid grid-cols-4 gap-3 bg-transparent border-none p-0 pb-5 max-[900px]:grid-cols-2">
      {kpiVals.map((val, i) => {
        const d = formatDelta(kpiDeltas[i]);
        return (
          <div
            key={i}
            className="relative p-5 pb-4 border border-gray-200 rounded-[14px] bg-white overflow-hidden transition-all shadow-sm"
            style={{ borderColor: `rgba(${chartColorRgb},0.45)`, boxShadow: `0 0 28px rgba(${chartColorRgb},0.08)` }}
          >
            <div
              className="absolute right-[-8px] bottom-[-10px] text-[72px] font-extrabold tracking-[-0.04em] opacity-[0.08] leading-none pointer-events-none whitespace-nowrap"
              style={{ color }}
            >
              {val}
            </div>
            <div className="text-[10px] tracking-[0.10em] text-gray-400 uppercase mb-2">{kpiLabels[i]}</div>
            <div
              className="text-[32px] font-bold tracking-[-0.04em] leading-none mb-1.5"
              style={{
                backgroundImage: `linear-gradient(160deg, #1a1a2e 30%, rgba(${chartColorRgb},0.9) 130%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {val}
            </div>
            {d && (
              <div className={`text-xs opacity-85 flex items-center gap-1 ${d.up ? "text-[#33cc00]" : d.dn ? "text-[#f35959]" : "text-gray-500"}`}>
                {d.text}
              </div>
            )}
            <svg className="w-full h-8 mt-3.5 opacity-55 block" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,22 L15,18 L30,21 L45,14 L60,16 L75,10 L100,6" fill="none" stroke={color} strokeWidth="1.8" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
