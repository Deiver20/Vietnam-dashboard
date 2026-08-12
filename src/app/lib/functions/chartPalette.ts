"use client";

import { useRef, useState, useLayoutEffect } from "react";

/* The immersive shell wraps dashboard pages in a .trade-scope that flips
   between .trade-scope-dark and .trade-scope-light. Recharts inks (grid,
   axes, tooltip, legend) can't take the scope's CSS variables, so read the
   live mode from the nearest scope and pick the matching palette. Outside
   the shell (the standalone navy /dashboard) there's no scope -> defaults
   to dark, the original look. */

export function useScopeLight() {
  const ref = useRef<HTMLDivElement>(null);
  const [light, setLight] = useState(false);
  useLayoutEffect(() => {
    const scope = ref.current?.closest(".trade-scope");
    setLight(!!scope?.classList.contains("trade-scope-light"));
  });
  return { ref, light };
}

export type ChartPalette = {
  grid: string;
  axis: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipLabel: string;
  legend: string;
};

export function chartPalette(light: boolean): ChartPalette {
  if (light) {
    return {
      grid: "rgba(6, 37, 75, 0.16)",
      axis: "#5a6478",
      tooltipBg: "#ffffff",
      tooltipBorder: "rgba(6, 37, 75, 0.15)",
      tooltipLabel: "#5a6478",
      legend: "#06254B",
    };
  }
  return {
    grid: "#1a2b40",
    axis: "#94959b",
    tooltipBg: "#061224",
    tooltipBorder: "#1a2b40",
    tooltipLabel: "#c5c6cc",
    legend: "#c5c6cc",
  };
}
