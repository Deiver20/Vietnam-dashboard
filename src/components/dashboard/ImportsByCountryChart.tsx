"use client";

import { TradeFilters } from "@/app/interfaces/trade/interface";
import { Locale } from "@/app/interfaces";
import { useRaceData } from "@/hooks/trade/useRaceData";
import { BarRaceChart } from "./BarRaceChart";
import { Loader2 } from "lucide-react";

interface ImportsByCountryChartProps {
  filters: TradeFilters;
  title: string;
  subtitle: string;
  locale: Locale;
}

export function ImportsByCountryChart({
  filters,
  title,
  subtitle,
  locale,
}: ImportsByCountryChartProps) {
  const { data, loading, error } = useRaceData(filters, "country");

  if (loading && data.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[560px] flex items-center justify-center text-gray-4">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading...
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[560px] flex items-center justify-center text-red text-sm">
        {error}
      </div>
    );
  }

  return (
    <BarRaceChart
      data={data}
      title={title}
      subtitle={subtitle}
      dimension="country"
      locale={locale}
    />
  );
}
