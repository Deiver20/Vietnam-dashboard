"use client";

import { createContext, useContext } from "react";

/* /dashboard renders light (default). The /industries experience wraps these
   same chart components in <ChartDarkContext.Provider value={true}> so axes,
   legends and gridlines switch to dark-surface colors. */
export const ChartDarkContext = createContext(false);

export const useChartDark = () => useContext(ChartDarkContext);

/* Shared palette for both modes. */
export function chartAxisColors(dark: boolean) {
  return {
    axis: dark ? "#9fb0c9" : "#666",
    axisStrong: dark ? "#cbd5e8" : "#444",
    axisLine: dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.1)",
    splitLine: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
  };
}
