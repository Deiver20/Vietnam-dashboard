"use client";

import type React from "react";
import { useCallback, useRef, useState } from "react";

export function YearInput({ value }: { value: number }) {
  return (
    <div className="w-16 rounded-md border border-navy-line bg-navy-darker px-2 py-1.5 text-center text-sm font-mono tabular-nums text-white shadow-sm">
      {value}
    </div>
  );
}

interface RangeSliderProps {
  min: number;
  max: number;
  startYear: number;
  endYear: number;
  onChange: (start: number, end: number) => void;
  accentColor?: string;
  className?: string;
}

export function RangeSlider({
  min,
  max,
  startYear,
  endYear,
  onChange,
  accentColor = "#3b82f6",
  className = "w-full",
}: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"start" | "end" | null>(null);

  const range = max - min || 1;
  const startPct = ((startYear - min) / range) * 100;
  const endPct = ((endYear - min) / range) * 100;

  const valueFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return min;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      return Math.round(min + ratio * range);
    },
    [min, range]
  );

  const handlePointerDown = (handle: "start" | "end") => (e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(handle);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const value = valueFromClientX(e.clientX);
    if (dragging === "start") {
      onChange(Math.min(value, endYear), endYear);
    } else {
      onChange(startYear, Math.max(value, startYear));
    }
  };

  const stopDragging = () => setDragging(null);

  return (
    <div className={`relative select-none py-3 ${className}`}>
      <div ref={trackRef} className="relative h-1.5 rounded-full bg-navy-line">
        <div
          className="absolute h-1.5 rounded-full"
          style={{ left: `${startPct}%`, right: `${100 - endPct}%`, backgroundColor: accentColor }}
        />
        <Handle
          position={startPct}
          label="Año inicial"
          value={startYear}
          min={min}
          max={endYear}
          accentColor={accentColor}
          onPointerDown={handlePointerDown("start")}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onKey={(v) => onChange(Math.min(v, endYear), endYear)}
        />
        <Handle
          position={endPct}
          label="Año final"
          value={endYear}
          min={startYear}
          max={max}
          accentColor={accentColor}
          onPointerDown={handlePointerDown("end")}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onKey={(v) => onChange(startYear, Math.max(v, startYear))}
        />
      </div>
    </div>
  );
}

function Handle({
  position,
  label,
  value,
  min,
  max,
  accentColor,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onKey,
}: {
  position: number;
  label: string;
  value: number;
  min: number;
  max: number;
  accentColor: string;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  onKey: (value: number) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") onKey(value - 1);
        if (e.key === "ArrowRight" || e.key === "ArrowUp") onKey(value + 1);
      }}
      style={{
        left: `${position}%`,
        borderColor: accentColor,
        boxShadow: focused ? `0 0 0 3px ${accentColor}66` : undefined,
      }}
      className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border-2 bg-navy-card shadow-md transition-transform hover:scale-110 focus:outline-none active:cursor-grabbing"
    />
  );
}
