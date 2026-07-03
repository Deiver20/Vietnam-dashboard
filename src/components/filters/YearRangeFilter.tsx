"use client";

import { RangeSlider, YearInput } from "@/components/ui/RangeSlider";

interface YearRangeFilterProps {
  startYear?: number;
  endYear?: number;
  minYear: number;
  maxYear: number;
  startLabel: string;
  endLabel: string;
  onStartChange: (year?: number) => void;
  onEndChange: (year?: number) => void;
}

export function YearRangeFilter({
  startYear,
  endYear,
  minYear,
  maxYear,
  startLabel,
  endLabel,
  onStartChange,
  onEndChange,
}: YearRangeFilterProps) {
  const validStart = Math.max(minYear, Math.min(startYear ?? minYear, maxYear));
  const validEnd = Math.max(minYear, Math.min(endYear ?? maxYear, maxYear));

  const handleChange = (start: number, end: number) => {
    const newStart = Math.max(minYear, Math.min(start, maxYear));
    const newEnd = Math.max(minYear, Math.min(end, maxYear));

    if (newStart > newEnd) {
      onStartChange(newEnd);
      onEndChange(newStart);
      return;
    }

    if (newStart !== startYear) onStartChange(newStart);
    if (newEnd !== endYear) onEndChange(newEnd);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="block text-[11px] text-gray-4 uppercase tracking-wider font-semibold">
        {startLabel} / {endLabel}
      </label>
      <div className="flex items-center gap-3">
        <YearInput value={validStart} />
        <div className="flex-1 min-w-0">
          <RangeSlider
            min={minYear}
            max={maxYear}
            startYear={validStart}
            endYear={validEnd}
            onChange={handleChange}
          />
        </div>
        <YearInput value={validEnd} />
      </div>
    </div>
  );
}
