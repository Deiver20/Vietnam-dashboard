"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Info } from "lucide-react";
import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
  loading?: boolean;
  variant?: "blue" | "green" | "yellow";
  hint?: string;
}

const variantClasses = {
  blue: "from-blue/20 to-blue-2/10 text-blue-soft shadow-blue/10",
  green: "from-green/20 to-green-2/10 text-green shadow-green/10",
  yellow: "from-yellow/20 to-yellow/10 text-yellow shadow-yellow/10",
};

const TOOLTIP_GAP = 12;
const EDGE_PAD = 8;

export function KpiCard({ label, value, sub, icon, loading, variant = "blue", hint }: KpiCardProps) {
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    setTip({ x: e.clientX, y: e.clientY });
  };

  const handleLeave = () => {
    setTip(null);
    setPos(null);
  };

  useLayoutEffect(() => {
    if (!hint || !tip) {
      setPos(null);
      return;
    }
    const el = tipRef.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const tw = el?.offsetWidth ?? 260;
    const th = el?.offsetHeight ?? 60;
    let left = tip.x + TOOLTIP_GAP;
    if (left + tw > vw - EDGE_PAD) left = tip.x - tw - TOOLTIP_GAP;
    if (left < EDGE_PAD) left = EDGE_PAD;
    let top = tip.y + TOOLTIP_GAP;
    if (top + th > vh - EDGE_PAD) top = tip.y - th - TOOLTIP_GAP;
    if (top < EDGE_PAD) top = EDGE_PAD;
    setPos({ left, top });
  }, [tip, hint]);

  const tooltip =
    hint && tip
      ? createPortal(
          <div
            ref={tipRef}
            className="pointer-events-none fixed z-[100] w-max max-w-[min(300px,75vw)] rounded-md border border-navy-line bg-navy-darker px-3 py-2 text-[11px] font-normal normal-case tracking-normal text-gray-3 shadow-2xl"
            style={pos ?? undefined}
          >
            {hint}
          </div>,
          document.body
        )
      : null;

  return (
    <div className="group relative rounded-md bg-navy-card border border-navy-line p-4 transition-all hover:border-blue/40 hover:shadow-lg hover:shadow-blue/5">
      <div className="absolute inset-0 rounded-md bg-gradient-to-br from-blue/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {tooltip}

      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-gray-4 text-[11px] uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1.5">
            {label}
            {hint && (
              <span className="inline-flex items-center" onMouseMove={handleMove} onMouseLeave={handleLeave}>
                <Info className="w-3.5 h-3.5 text-gray-5 cursor-help" />
              </span>
            )}
          </p>
          {loading ? (
            <div className="flex items-center gap-2 h-8">
              <Loader2 className="w-4 h-4 animate-spin text-gray-5" />
              <span className="text-sm text-gray-5">{label}</span>
            </div>
          ) : (
            <>
              <p className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
                {value}
              </p>
              {sub && <p className="text-xs text-gray-3 mt-1.5">{sub}</p>}
            </>
          )}
        </div>
        {icon && !loading && (
          <div
            className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-sm bg-gradient-to-br ${variantClasses[variant]} flex items-center justify-center shadow-inner`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}