import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { shallow } from "zustand/shallow";
import NumberAnimation from "@/components/numberAnimation";
import { getCountryIndustryStats } from "../data/api";
import { getCountryFlag } from "../data/countryFlags";
import { ANTARCTICA_ID, countryFeatures, countryIdOf, getCountryName } from "../data/world";
import { useIndustriesStore } from "../stores";
import MarqueeRow from "./marqueeRow";

const ACCENT = "#67A6FF";
const ACCENT_RGB = "0,102,255";
const GAP = 14;

const clearLock = () => useIndustriesStore.setState({ transitioning: false });

// Every pickable country on the globe (Antarctica has no dossier — same
// exclusion useUrlSync applies to its slug map). Static, computed once.
const COUNTRIES = countryFeatures
  .filter((f) => countryIdOf(f) !== ANTARCTICA_ID)
  .map((f) => {
    const id = countryIdOf(f);
    return { id, name: getCountryName(id), flag: getCountryFlag(id) };
  });

function Spark({ data }: { data: number[] }) {
  const w = 100;
  const h = 26;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map(
    (v, i) =>
      `${((i / (data.length - 1)) * w).toFixed(1)},${(
        h -
        2 -
        ((v - min) / range) * (h - 6)
      ).toFixed(1)}`
  );
  return (
    <svg
      className="w-full h-8 mt-2 opacity-55 block"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
    >
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={ACCENT}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* One card per country — the same condensed KPI tile as IndustryPicker's
   cards, scoped to the industry in play instead of global figures. */
function CountryCard({
  id,
  flag,
  name,
  industryId,
  onSelect,
}: {
  id: string;
  flag: string;
  name: string;
  industryId: string;
  onSelect: (id: string) => void;
}) {
  const production = getCountryIndustryStats(id, industryId)[0];
  if (!production) return null;
  const up = production.kpi.delta >= 0;
  const watermark = production.kpi.value.toLocaleString("en-US", {
    maximumFractionDigits: 1,
  });

  return (
    <article
      onClick={() => onSelect(id)}
      className="relative shrink-0 w-[190px] rounded-xl overflow-hidden border backdrop-blur-lg flex flex-col pointer-events-auto cursor-pointer transition-transform hover:-translate-y-1"
      style={{
        background: "rgba(2, 13, 28, 0.78)",
        borderColor: `rgba(${ACCENT_RGB}, 0.35)`,
        boxShadow: `0 0 20px rgba(${ACCENT_RGB}, 0.10)`,
      }}
    >
      <div className="relative px-4 pt-3.5 pb-3 flex flex-col">
        <div
          className="absolute right-[-6px] bottom-[6px] text-[42px] font-extrabold tracking-[-0.04em] opacity-[0.08] leading-none pointer-events-none whitespace-nowrap"
          style={{ color: ACCENT }}
        >
          {watermark}
        </div>
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[17px] leading-none">{flag}</span>
          <span className="text-[13px] font-bold tracking-[-0.01em] text-white truncate">
            {name}
          </span>
        </div>
        <div className="text-[9px] tracking-[0.10em] text-[#94959b] uppercase mb-1">
          {production.title}
        </div>
        <div className="flex items-baseline gap-1.5">
          <NumberAnimation
            value={production.kpi.value}
            duration={1.2}
            options={{ maximumFractionDigits: 1 }}
            className="text-[20px] font-bold tracking-[-0.03em] leading-none"
            style={{
              backgroundImage: `linear-gradient(160deg, #ffffff 30%, rgba(${ACCENT_RGB},0.9) 130%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          />
          <span className="text-[11px] text-[#94959b]">
            {production.kpi.unit}
          </span>
        </div>
        <div
          className={`text-[11px] opacity-85 flex items-center gap-1 ${
            up ? "text-[#33cc00]" : "text-[#f35959]"
          }`}
        >
          {up ? "▲" : "▼"} {Math.abs(production.kpi.delta)}%
        </div>
        <Spark data={production.spark} />
      </div>
    </article>
  );
}

/* Industry globe, no country yet (Level 2): every country as a condensed
   Production card — replaces the old two-tile corner KPIs with the full
   picture, and doubles as a picker. Selecting a card calls the same
   selectCountry() the 3D globe's own click handler uses, landing on
   /industries/:industryId/:country. */
export default function CountryPicker() {
  const [mounted, setMounted] = useState(false);
  const [industryId, setIndustryId] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    if (wrapRef.current) gsap.set(wrapRef.current, { autoAlpha: 0, y: 60 });
  }, []);

  useEffect(() => {
    const el = () => wrapRef.current;

    const playEnter = (delay: number, onDone?: () => void) => {
      tlRef.current?.kill();
      const tl = gsap.timeline({ onComplete: onDone });
      tl.fromTo(
        el(),
        { autoAlpha: 0, y: 60 },
        { autoAlpha: 1, y: 0, duration: 0.8, delay, ease: "power3.out" }
      );
      tlRef.current = tl;
    };

    const playExit = (onDone?: () => void) => {
      tlRef.current?.kill();
      const tl = gsap.timeline({ onComplete: onDone });
      tl.to(el(), { autoAlpha: 0, y: 60, duration: 0.4, ease: "power2.in" });
      tlRef.current = tl;
    };

    const ctxOf = (lvl: number, sel: string | null) => (lvl === 2 ? sel : null);

    const unsub = useIndustriesStore.subscribe(
      (s) => [s.level, s.selectedIndustryId] as const,
      ([lvl, sel], [prevLvl, prevSel]) => {
        const next = ctxOf(lvl, sel);
        const prev = ctxOf(prevLvl, prevSel);
        // Inherited from the retired CornerCards: this is the sole owner of
        // the pure Level-1↔2 lock. Every other transition's lock belongs to
        // a camera / page timeline elsewhere.
        const ownsLock = (prevLvl === 1 && lvl === 2) || (prevLvl === 2 && lvl === 1);
        if (next && !prev) {
          setMounted(true);
          setIndustryId(next);
          // Slow reveal entering the industry globe from Level 1, quick when
          // returning from a country cover.
          playEnter(prevLvl < 2 ? 1.1 : 0.35, ownsLock ? clearLock : undefined);
        } else if (!next && prev) {
          playExit(ownsLock ? clearLock : undefined);
        } else if (next && prev && next !== prev) {
          setIndustryId(next);
        }
      },
      { equalityFn: shallow }
    );

    return () => {
      unsub();
      tlRef.current?.kill();
    };
  }, []);

  if (!mounted || !industryId) return null;

  const selectCountry = (id: string) =>
    useIndustriesStore.getState().selectCountry(id);

  return (
    <div
      ref={wrapRef}
      className="absolute bottom-11 left-11 right-11"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      <MarqueeRow gap={GAP}>
        {COUNTRIES.map((c) => (
          <CountryCard
            key={c.id}
            id={c.id}
            flag={c.flag}
            name={c.name}
            industryId={industryId}
            onSelect={selectCountry}
          />
        ))}
      </MarqueeRow>
    </div>
  );
}
