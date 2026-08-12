"use client";

import { useMemo } from "react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Locale } from "@/app/interfaces";

const MONTH_ABBR: Record<Locale, string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  es: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
  fr: ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"],
  pt: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
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
