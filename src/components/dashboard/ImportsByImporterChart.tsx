"use client";

import { TradeFilters } from "@/app/interfaces/trade/interface";
import { Locale } from "@/app/interfaces";
import { useRaceData } from "@/hooks/trade/useRaceData";
import { BarRaceChart } from "./BarRaceChart";
import { Loader2 } from "lucide-react";

interface ImportsByImporterChartProps {
  filters: TradeFilters;
  title: string;
  subtitle: string;
  locale: Locale;
  interval?: number;
  runKey?: number;
}

export function ImportsByImporterChart({
  filters,
  title,
  subtitle,
  locale,
  interval,
  runKey,
}: ImportsByImporterChartProps) {
  const { data, loading, error } = useRaceData(filters, "importer");

  if (loading && data.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(380px,72vw,560px)] flex items-center justify-center text-gray-4">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading...
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(380px,72vw,560px)] flex items-center justify-center text-red text-sm">
        {error}
      </div>
    );
  }

  return (
    <BarRaceChart
      data={data}
      title={title}
      subtitle={subtitle}
      dimension="importer"
      locale={locale}
      interval={interval}
      runKey={runKey}
    />
  );
}
