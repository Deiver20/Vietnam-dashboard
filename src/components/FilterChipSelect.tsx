"use client";

import type { ReactNode } from "react";

export interface FilterChipOption {
  value: string;
  label: string;
}

/* Site-wide filter slicer replicating the /dashboard structure:
   <Filter name> <Selected> <down-chevron>. The chip is purely visual; an
   invisible native <select> overlays it so picking, keyboard navigation and
   screen readers all stay native. `active` adds the blue applied accent used
   across the site so the user can see which filters are filtering. */
export default function FilterChipSelect({
  label,
  value,
  options,
  onChange,
  active = false,
  className = "",
  valuePrefix,
}: {
  label: string;
  value: string;
  options: FilterChipOption[];
  onChange: (value: string) => void;
  active?: boolean;
  className?: string;
  /** Optional node rendered before the selected label (e.g. a flag/emoji). */
  valuePrefix?: ReactNode;
}) {
  const selected = options.find((o) => o.value === value);
  return (
    <div
      className={`relative flex items-center gap-2 px-2.5 py-[6px] rounded-md text-[11px] border transition-all shrink-0 cursor-pointer ${
        active
          ? "bg-[rgba(0,102,255,0.16)] border-[rgba(0,102,255,0.55)] shadow-[0_0_10px_rgba(0,102,255,0.14)]"
          : "bg-white/[0.04] border-white/[0.08] hover:border-[rgba(102,166,255,0.4)] hover:bg-[rgba(0,102,255,0.06)]"
      } ${className}`}
    >
      <span className="text-[10px] text-[#94959b] uppercase tracking-[0.06em] font-semibold whitespace-nowrap">
        {label}
      </span>
      <span className="text-white font-medium inline-flex items-center gap-1.5 whitespace-nowrap">
        {valuePrefix}
        {selected?.label ?? value}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <polygon points="6 9 12 15 18 9" />
        </svg>
      </span>
      <select
        className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
