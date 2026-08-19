"use client";

import { useEffect } from "react";
import { useDashboard } from "@/store/useDashboard";
import { DASHBOARD_YEAR_RANGE, getMinYearForCountry } from "@/app/constants";

/* Default del rango de años por pestaña, sin quitar la disponibilidad de años
   en el filtro. Se aplica al entrar a una pestaña (o al cambiar de país):
   - `total-imports` → últimos 3 años.
   - `imports-timeline` → últimos 5 años.
   - resto → rango completo del país (Colombia desde 2019, Vietnam desde 2022).
   Además, al cambiar de país se sube el año inicial al mínimo del país nuevo
   (evita que Vietnam cargue 2020/2021 si se venía de Colombia con 2019). Solo
   se auto-ajusta cuando el valor coincide con un estado "por defecto" conocido
   (rango completo / últimos 3 / últimos 5) o quedó por debajo del mínimo del
   país, para no pisar una selección manual no-default. */
export function useTabYearDefaults(tabId: string) {
  const countryCode = useDashboard((s) => s.filters.countryCode);
  const setFilters = useDashboard((s) => s.setFilters);

  useEffect(() => {
    const state = useDashboard.getState().filters;
    const maxYear = DASHBOARD_YEAR_RANGE.max;
    const countryMin = getMinYearForCountry(state.countryCode);
    const rawStart = state.yearStart ?? countryMin;
    const rawEnd = state.yearEnd ?? maxYear;
    const isFull = rawStart === countryMin && rawEnd === maxYear;
    const isLast3 = rawStart === maxYear - 2 && rawEnd === maxYear;
    const isLast5 = rawStart === maxYear - 4 && rawEnd === maxYear;

    let next: { yearStart: number; yearEnd: number } | null = null;

    if (tabId === "total-imports") {
      if (isFull || isLast5) next = { yearStart: maxYear - 2, yearEnd: maxYear };
    } else if (tabId === "imports-timeline") {
      if (isFull || isLast3) next = { yearStart: maxYear - 4, yearEnd: maxYear };
    } else if (rawStart < countryMin || isLast3 || isLast5) {
      next = { yearStart: countryMin, yearEnd: maxYear };
    }

    if (next) setFilters((prev) => ({ ...prev, ...next }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabId, countryCode, setFilters]);
}
