import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { shallow } from "zustand/shallow";
import NumberAnimation from "@/components/numberAnimation";
import { getIndustries } from "../data/api";
import type { Industry } from "../data/types";
import { useIndustriesStore } from "../stores";
import MarqueeRow from "./marqueeRow";

const ACCENT = "#67A6FF";
const ACCENT_RGB = "0,102,255";
const GAP = 14;

function Spark({ data }: { data: number[] }) {
  const w = 100;
  const h = 18;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map(
    (v, i) =>
      `${((i / (data.length - 1)) * w).toFixed(1)},${(
        h -
        1.5 -
        ((v - min) / range) * (h - 4)
      ).toFixed(1)}`
  );
  return (
    <svg
      className="w-full h-4 opacity-55 block"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
    >
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={ACCENT}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* One card per industry — a condensed, clickable Global Production KPI tile
   so the country cover can offer every industry without leaving the globe. */
function IndustryCard({
  industry,
  onSelect,
}: {
  industry: Industry;
  onSelect: (id: string) => void;
}) {
  const production = industry.globalStats[0];
  const up = production.kpi.delta >= 0;
  const watermark = production.kpi.value.toLocaleString("en-US", {
    maximumFractionDigits: 1,
  });

  return (
    <article
      onClick={() => onSelect(industry.id)}
      className="relative shrink-0 w-[210px] rounded-xl overflow-hidden border backdrop-blur-lg flex flex-col pointer-events-auto cursor-pointer transition-transform hover:-translate-y-1"
      style={{
        background: "rgba(2, 13, 28, 0.78)",
        borderColor: `rgba(${ACCENT_RGB}, 0.35)`,
        boxShadow: `0 0 20px rgba(${ACCENT_RGB}, 0.10)`,
      }}
    >
      <div className="relative px-3.5 pt-2.5 pb-2.5 flex flex-col">
        <div
          className="absolute right-[-6px] bottom-[6px] text-[40px] font-extrabold tracking-[-0.04em] opacity-[0.08] leading-none pointer-events-none whitespace-nowrap"
          style={{ color: ACCENT }}
        >
          {watermark}
        </div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[15px] leading-none">{industry.emoji}</span>
          <span className="text-[13px] font-bold tracking-[-0.01em] text-white">
            {industry.name}
          </span>
        </div>
        <div className="text-[8.5px] tracking-[0.10em] text-[#94959b] uppercase mb-0.5">
          {production.title}
        </div>
        <div className="flex items-baseline gap-1.5">
          <NumberAnimation
            value={production.kpi.value}
            duration={1.2}
            options={{ maximumFractionDigits: 1 }}
            className="text-[19px] font-bold tracking-[-0.03em] leading-none"
            style={{
              backgroundImage: `linear-gradient(160deg, #ffffff 30%, rgba(${ACCENT_RGB},0.9) 130%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          />
          <span className="text-[10px] text-[#94959b]">
            {production.kpi.unit}
          </span>
        </div>
        <div
          className={`text-[10px] opacity-85 flex items-center gap-1 ${
            up ? "text-[#33cc00]" : "text-[#f35959]"
          }`}
        >
          {up ? "▲" : "▼"} {Math.abs(production.kpi.delta)}%
        </div>
        <div className="mt-1">
          <Spark data={production.spark} />
        </div>
      </div>
    </article>
  );
}

/* Country cover, no industry yet (country-first path): the INDUSTRY chips
   from the hero, duplicated at the bottom as Global Production cards — the
   same information Level 2 shows per industry, but all ten at once so
   picking one is a single click without scrolling back up. Selecting a card
   calls the same selectIndustry() the top chips use, which swaps the cover
   in place and lands on /industries/:industryId/:country. */
export default function IndustryPicker() {
  // Set once on first activation and never cleared — the exit only fades
  // via GSAP (see DataCarousel's identical pattern), so unmounting here
  // wouldn't cut its own animation short.
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    if (wrapRef.current) gsap.set(wrapRef.current, { autoAlpha: 0, y: 60 });
  }, []);

  useEffect(() => {
    const el = () => wrapRef.current;

    const playEnter = (delay: number) => {
      tlRef.current?.kill();
      const tl = gsap.timeline();
      tl.fromTo(
        el(),
        { autoAlpha: 0, y: 60 },
        { autoAlpha: 1, y: 0, duration: 0.8, delay, ease: "power3.out" }
      );
      tlRef.current = tl;
    };

    const playExit = () => {
      tlRef.current?.kill();
      const tl = gsap.timeline();
      tl.to(el(), { autoAlpha: 0, y: 60, duration: 0.4, ease: "power2.in" });
      tlRef.current = tl;
    };

    const ctxOf = (lvl: number, sel: string | null, ctry: string | null) =>
      lvl === 3 && !sel && !!ctry;

    const unsub = useIndustriesStore.subscribe(
      (s) => [s.level, s.selectedIndustryId, s.selectedCountryId] as const,
      ([lvl, sel, ctry], [prevLvl, prevSel, prevCtry]) => {
        const next = ctxOf(lvl, sel, ctry);
        const prev = ctxOf(prevLvl, prevSel, prevCtry);
        if (next && !prev) {
          setMounted(true);
          // Slow reveal when landing on the cover, quick when clearing the
          // industry back to "no selection" in place (ALL IND.).
          playEnter(prevLvl < 3 ? 1.45 : 0.35);
        } else if (!next && prev) {
          playExit();
        }
      },
      { equalityFn: shallow }
    );

    return () => {
      unsub();
      tlRef.current?.kill();
    };
  }, []);

  if (!mounted) return null;

  const selectIndustry = (id: string) =>
    useIndustriesStore.getState().selectIndustry(id);

  return (
    <div
      ref={wrapRef}
      className="absolute bottom-11 left-11 right-11"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      <MarqueeRow gap={GAP}>
        {getIndustries().map((ind) => (
          <IndustryCard key={ind.id} industry={ind} onSelect={selectIndustry} />
        ))}
      </MarqueeRow>
    </div>
  );
}
