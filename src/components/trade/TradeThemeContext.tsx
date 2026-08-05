"use client";

import { createContext, useContext } from "react";

/* Design-system skin for the shared `trade/` views (charts, cards, tables).
   Light is the default so the original /dashboard keeps its look; the
   immersive industries shell wraps its tab content in a dark provider. The
   palette follows DASHBOARD_EXPERIENCE_GUIDE.md §4 (navy surfaces, glass
   borders, light ink) so every view reads as one product. */

export interface TradeTheme {
  mode: "light" | "dark";
  surface: string;        // card background
  surfaceAlt: string;     // zebra / header background
  surfaceHover: string;   // row hover
  border: string;         // card / row borders
  borderStrong: string;   // inputs / chips
  textPrimary: string;    // titles, values
  textBody: string;       // table cells
  textMuted: string;      // labels, secondary
  textFaint: string;      // watermarks, placeholders
  accent: string;         // yellow accent line / CSV button
  accentNavy: string;     // blue accent (eyebrow, links)
  accentText: string;     // ink on accent chips
  axisText: string;       // chart ticks
  axisLine: string;       // gridlines
  tooltipBg: string;
  tooltipBorder: string;
  tooltipShadow: string;
}

export const lightTheme: TradeTheme = {
  mode: "light",
  surface: "#FFFFFF",
  surfaceAlt: "#F2F8FF",
  surfaceHover: "rgba(6, 37, 75, 0.04)",
  border: "rgba(6, 37, 75, 0.10)",
  borderStrong: "rgba(6, 37, 75, 0.15)",
  textPrimary: "#06254B",
  textBody: "#334155",
  textMuted: "#5a6478",
  textFaint: "#9ca3af",
  accent: "#F8D227",
  accentNavy: "#03488D",
  accentText: "#06254B",
  axisText: "#5a6478",
  axisLine: "rgba(6, 37, 75, 0.08)",
  tooltipBg: "#FFFFFF",
  tooltipBorder: "rgba(6, 37, 75, 0.15)",
  tooltipShadow: "0 14px 36px rgba(6, 37, 75, 0.10)",
};

export const darkTheme: TradeTheme = {
  mode: "dark",
  surface: "rgba(10, 39, 72, 0.72)",
  surfaceAlt: "rgba(4, 16, 32, 0.62)",
  surfaceHover: "rgba(255, 255, 255, 0.06)",
  border: "rgba(102, 166, 255, 0.18)",
  borderStrong: "rgba(102, 166, 255, 0.30)",
  textPrimary: "#e8eefc",
  textBody: "#c5c6cc",
  textMuted: "#9aa7bd",
  textFaint: "#7d8aa0",
  accent: "#F8D227",
  accentNavy: "#67a6ff",
  accentText: "#ffffff",
  axisText: "#9fb0c9",
  axisLine: "rgba(255, 255, 255, 0.14)",
  tooltipBg: "#061224",
  tooltipBorder: "rgba(102, 166, 255, 0.25)",
  tooltipShadow: "0 14px 36px rgba(0, 0, 0, 0.5)",
};

const TradeThemeContext = createContext<TradeTheme>(lightTheme);

export const TradeThemeProvider = TradeThemeContext.Provider;

export function useTradeTheme(): TradeTheme {
  return useContext(TradeThemeContext);
}
