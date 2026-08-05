import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { shallow } from "zustand/shallow";
import { seededRng } from "../data/random";
import { getIndustry } from "../data/api";
import { getCountryName } from "../data/world";
import { useIndustriesStore } from "../stores";
import MarqueeRow from "./marqueeRow";

const GAP = 14;

/* The seven data variables of /data (datasets.ts TYPES + DATA_TYPES), same
   labels and colors so both experiences read as one product. */
export const VARIABLES = [
  { key: "imports", label: "IMPORTS", color: "#F35959" },
  { key: "exports", label: "EXPORTS", color: "#0066FF" },
  { key: "pricing", label: "PRICING", color: "#FCB514" },
  { key: "production", label: "PRODUCTION", color: "#33CC00" },
  { key: "trade_volumes", label: "TRADE", color: "#A78BFA" },
  { key: "event", label: "EVENTS", color: "#EC4899" },
  { key: "project", label: "PROJECTS", color: "#94959B" },
] as const;

type VariableDef = (typeof VARIABLES)[number];

/* Seeded per (country, industry, variable) so every card is stable. */
function cardMeta(countryId: string, industryId: string, key: string) {
  const rng = seededRng(`${countryId}:${industryId}:${key}:card`);
  const bought = rng() > 0.82;
  const discount = !bought && rng() > 0.72;
  const month = 1 + Math.floor(rng() * 6);
  return {
    bought,
    discount,
    price: 499,
    originalPrice: discount ? [599, 649, 699][Math.floor(rng() * 3)] : null,
    date: `0${month}/2025`,
  };
}

function LockIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 11h-1V7A5 5 0 0 0 7 7v4H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-6 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm3-7H9V7a3 3 0 0 1 6 0v4z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/* /data's DataCard anatomy in dark mode: industry, country, type badge,
   date + status, price, bookmark and the View data CTA (green once bought). */
function VariableCard({
  v,
  countryId,
  industryId,
  saved,
  onToggleSave,
  onView,
}: {
  v: VariableDef;
  countryId: string;
  industryId: string;
  saved: boolean;
  onToggleSave: () => void;
  onView: () => void;
}) {
  const meta = cardMeta(countryId, industryId, v.key);
  const industry = getIndustry(industryId);
  const industryName = industry?.name ?? industryId;
  const locked = !meta.bought;
  return (
    <article
      className="relative shrink-0 w-[300px] rounded-xl overflow-hidden border backdrop-blur-lg flex flex-col pointer-events-auto"
      style={{
        // Soft data-type wash over the dark glass, mirroring /data's cards
        // (inverted: the type color glows from the bottom of the card).
        background: `linear-gradient(0deg, ${v.color}2b, rgba(2, 13, 28, 0.10) 62%), rgba(2, 13, 28, 0.78)`,
        borderColor: `${v.color}45`,
        boxShadow: `0 0 24px ${v.color}14`,
      }}
    >
      <div className="relative px-3.5 py-3.5 flex flex-col gap-1.5">
        <span className="flex items-center gap-1.5 text-[15px] font-bold tracking-[-0.01em] leading-tight text-white">
          {industry?.emoji && (
            <span className="text-[16px] leading-none">{industry.emoji}</span>
          )}
          {industryName}
        </span>
        <span className="text-[13px] font-semibold tracking-[0.01em] text-white/90">
          {getCountryName(countryId)}
        </span>
        <div>
          <span
            className="inline-block text-[10px] font-bold tracking-[0.09em] uppercase px-2.5 py-[4px] rounded backdrop-blur-[6px]"
            style={{
              background: `${v.color}15`,
              border: `1px solid ${v.color}50`,
              color: v.color,
              boxShadow: `0 0 12px ${v.color}15`,
            }}
          >
            {v.label}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-[var(--font-jetbrains)] text-white/60">
            {meta.date}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-[7px] py-[3px] rounded text-[8px] font-bold tracking-[0.08em] uppercase border ${
              locked
                ? "bg-[#8B95A5] text-white border-[#9AA3B2]"
                : "bg-[#33cc00] text-white border-[#2eb800]"
            }`}
          >
            {locked ? <LockIcon /> : <CheckIcon />}
            {locked ? " LOCKED" : " BOUGHT"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {meta.originalPrice && (
            <span className="text-[11px] line-through font-medium text-white/50">
              USD ${meta.originalPrice}
            </span>
          )}
          <span
            className={`text-[14px] font-bold tracking-[-0.02em] tabular-nums ${
              locked ? "text-[#67A6FF]" : "text-[#33cc00]"
            }`}
          >
            USD ${meta.price}
          </span>
          {meta.originalPrice && (
            <span className="text-[9px] font-bold tracking-[0.06em] uppercase px-1.5 py-[2px] rounded bg-[rgba(252,181,20,0.15)] text-[#FCB514] border border-[rgba(252,181,20,0.3)]">
              SALE
            </span>
          )}
        </div>
        <div className="flex gap-2 mt-1">
          <button
            onClick={onView}
            className={`flex flex-1 items-center justify-center h-[34px] px-3 text-white text-[11px] font-bold tracking-[0.06em] rounded-lg transition-all uppercase cursor-pointer hover:-translate-y-px ${
              locked
                ? "bg-[#0066ff] hover:bg-[#1a76ff] hover:shadow-[0_6px_20px_rgba(0,102,255,0.4)]"
                : "bg-gradient-to-r from-[#33cc00] to-[#279b00] border border-[rgba(51,204,0,0.4)] hover:from-[#3de600] hover:to-[#33cc00] hover:shadow-[0_6px_24px_rgba(51,204,0,0.45)]"
            }`}
          >
            View data
          </button>
          <button
            className={`shrink-0 w-[34px] h-[34px] rounded-lg flex items-center justify-center transition-all border backdrop-blur-md cursor-pointer ${
              saved
                ? "bg-[rgba(0,102,255,0.25)] border-[rgba(102,166,255,0.5)] text-[#93c5fd]"
                : "bg-[rgba(0,0,0,0.35)] border-white/20 text-white/70 hover:bg-[rgba(0,102,255,0.25)] hover:border-[rgba(102,166,255,0.5)] hover:text-[#93c5fd]"
            }`}
            aria-label="Save"
            onClick={(e) => {
              e.preventDefault();
              onToggleSave();
            }}
          >
            <BookmarkIcon />
          </button>
        </div>
      </div>
    </article>
  );
}

type Ctx = { industryId: string; countryId: string } | null;

/* Horizontal carousel of the seven /data variables, bottom of the country
   cover (Level 3). Its "View data" CTAs perform the dive into the data
   pages that the wheel used to do. */
export default function DataCarousel() {
  const [ctx, setCtx] = useState<Ctx>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
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

    const playSwap = (next: Ctx) => {
      tlRef.current?.kill();
      const tl = gsap.timeline();
      tl.to(el(), { autoAlpha: 0, y: 14, duration: 0.28, ease: "power2.in" });
      tl.add(() => setCtx(next));
      tl.fromTo(
        el(),
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" }
      );
      tlRef.current = tl;
    };

    const ctxOf = (lvl: number, sel: string | null, ctry: string | null): Ctx =>
      lvl === 3 && sel && ctry ? { industryId: sel, countryId: ctry } : null;

    const unsub = useIndustriesStore.subscribe(
      (s) => [s.level, s.selectedIndustryId, s.selectedCountryId] as const,
      ([lvl, sel, ctry], [prevLvl, prevSel, prevCtry]) => {
        const next = ctxOf(lvl, sel, ctry);
        const prev = ctxOf(prevLvl, prevSel, prevCtry);
        if (next && !prev) {
          setCtx(next);
          // Slow reveal when landing on the cover, quick when coming back
          // from the data pages.
          playEnter(prevLvl < 3 ? 1.45 : 0.35);
        } else if (!next && prev) {
          playExit();
        } else if (
          next &&
          prev &&
          (next.industryId !== prev.industryId ||
            next.countryId !== prev.countryId)
        ) {
          playSwap(next);
        }
      },
      { equalityFn: shallow }
    );

    return () => {
      unsub();
      tlRef.current?.kill();
    };
  }, []);

  const viewData = (v: VariableDef) => {
    const s = useIndustriesStore.getState();
    if (!s.selectedCountryId || !s.selectedIndustryId) return;
    // The variable selects the dataset the dashboard pages read; goToPage
    // performs the same dive-down transition the wheel used to.
    useIndustriesStore.setState({ dataType: v.key });
    s.goToPage(0);
  };

  return (
    <div
      ref={wrapRef}
      className="absolute left-11 right-11"
      style={{ fontFamily: "var(--font-poppins), sans-serif", bottom: "108px" }}
    >
      {ctx && (
        <MarqueeRow gap={GAP}>
          {VARIABLES.map((v) => {
            const saveKey = `${ctx.countryId}:${ctx.industryId}:${v.key}`;
            return (
              <VariableCard
                key={v.key}
                v={v}
                countryId={ctx.countryId}
                industryId={ctx.industryId}
                saved={saved.has(saveKey)}
                onToggleSave={() =>
                  setSaved((prev) => {
                    const next = new Set(prev);
                    if (next.has(saveKey)) next.delete(saveKey);
                    else next.add(saveKey);
                    return next;
                  })
                }
                onView={() => viewData(v)}
              />
            );
          })}
        </MarqueeRow>
      )}
    </div>
  );
}
