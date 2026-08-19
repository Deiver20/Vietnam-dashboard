"use client";

import { useMemo } from "react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Locale } from "@/app/interfaces";

const MONTH_ABBR: Record<Locale, string[]> = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  es: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
  fr: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
  pt: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
};

interface MonthFilterProps {
  value?: number[];
  onChange: (months: number[]) => void;
  locale: Locale;
  label: string;
  placeholder: string;
  searchPlaceholder: string;
}

export function MonthFilter({
  value = [],
  onChange,
  locale,
  label,
  placeholder,
  searchPlaceholder,
}: MonthFilterProps) {
  const labels = MONTH_ABBR[locale] ?? MONTH_ABBR.en;

  const selected = useMemo(
    () => value.map((m) => labels[m - 1]).filter(Boolean),
    [value, labels]
  );

  return (
    <SearchableSelect
      label={label}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      options={labels}
      value={selected}
      multiple
      onChange={(v) => {
        const arr = Array.isArray(v) ? v : [v as string];
        onChange(arr.map((l) => labels.indexOf(l) + 1).filter((m) => m >= 1));
      }}
    />
  );
}
