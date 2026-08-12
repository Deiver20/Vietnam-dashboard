"use client";

import { useTradeTheme } from "./TradeThemeContext";

const fontQ = "var(--font-poppins), Poppins, sans-serif";

export type PillOption<T extends string> = {
  id: T;
  label: string;
};

export function PillToggle<T extends string>({
  options, value, onChange, ariaLabel,
}: {
  options: PillOption<T>[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  const T = useTradeTheme();
  const activeBg = T.mode === "dark" ? T.accentNavy : "#03488D";
  const activeInk = T.mode === "dark" ? "#06254B" : "#FFFFFF";
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex overflow-hidden rounded-xs border"
      style={{ borderColor: T.borderStrong }}
    >
      {options.map(opt => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className="px-3 py-1 text-[11px] font-semibold transition-colors"
            style={{
              fontFamily: fontQ,
              backgroundColor: active ? activeBg : "transparent",
              color: active ? activeInk : T.accentNavy,
              borderRight: `1px solid ${T.borderStrong}`,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
