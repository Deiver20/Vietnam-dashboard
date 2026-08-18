"use client";

import { useRef, useState, useEffect, useCallback } from "react";

/* The immersive shell wraps dashboard pages in a .trade-scope that flips
   between .trade-scope-dark and .trade-scope-light. Recharts inks (grid,
   axes, tooltip, legend) can't take the scope's CSS variables, so read the
   live mode from the nearest scope and pick the matching palette. Outside
   the shell (the standalone navy /dashboard) there's no scope -> defaults
   to dark, the original look. */

export function useScopeLight() {
  const [light, setLight] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);

  const ref = useCallback((el: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!el) return;
    const scope = el.closest(".trade-scope");
    if (!scope) return;
    const update = () => setLight(scope.classList.contains("trade-scope-light"));
    update();
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "class") {
          update();
          break;
        }
      }
    });
    observer.observe(scope, { attributes: true, attributeFilter: ["class"] });
    observerRef.current = observer;
  }, []);

  useEffect(
    () => () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    },
    []
  );

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
      grid: "rgba(6, 37, 75, 0.08)",
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
