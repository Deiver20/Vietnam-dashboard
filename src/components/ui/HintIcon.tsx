"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

interface HintIconProps {
  text: string;
}

const TOOLTIP_GAP = 12;
const EDGE_PAD = 8;

export function HintIcon({ text }: HintIconProps) {
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
    if (!tip) {
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
  }, [tip]);

  const tooltip = tip
    ? createPortal(
        <div
          ref={tipRef}
          className="pointer-events-none fixed z-[100] w-max max-w-[min(300px,75vw)] rounded-md border border-navy-line bg-navy-darker px-3 py-2 text-[11px] font-normal normal-case tracking-normal text-gray-3 shadow-2xl"
          style={pos ?? undefined}
        >
          {text}
        </div>,
        document.body
      )
    : null;

  return (
    <span className="inline-flex items-center" onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {tooltip}
      <Info className="w-3.5 h-3.5 text-gray-5 cursor-help" />
    </span>
  );
}