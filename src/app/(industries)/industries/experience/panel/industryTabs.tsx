import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";
import { gsap } from "gsap";
import useMoveTo from "@/hooks/useMoveTo";
import DataViewSwitch from "@/app/(main)/data/components/DataViewSwitch";
import { getIndustries, getIndustry, getCountryDossier } from "../data/api";
import { getCountryFlag } from "../data/countryFlags";
import { getCountryName } from "../data/world";
import { useIndustriesStore } from "../stores";

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
`;

const DEFAULT_TITLE = "Market intelligence";

/* Industry chip — same look as the INDUSTRY filter chips on /data. */
function Chip({
  active,
  emoji,
  label,
  onClick,
}: {
  active: boolean;
  emoji: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`pointer-events-auto shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-medium transition-all border cursor-pointer backdrop-blur-md ${
        active
          ? "bg-[rgba(0,102,255,0.18)] border-[rgba(0,102,255,0.45)] text-[#67A6FF] shadow-[0_0_12px_rgba(0,102,255,0.12)]"
          : "bg-[rgba(2,13,28,0.55)] border-white/[0.10] text-[#94959b] hover:border-[rgba(102,166,255,0.25)] hover:text-[#d8d8d8]"
      }`}
      onClick={onClick}
    >
      <span className="text-sm leading-none">{emoji}</span>
      {label}
    </button>
  );
}

export default function IndustryTabs() {
  const level = useIndustriesStore((s) => s.level);
  const selectedId = useIndustriesStore((s) => s.selectedIndustryId);
  const countryId = useIndustriesStore((s) => s.selectedCountryId);
  const selectIndustry = useIndustriesStore((s) => s.selectIndustry);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const enter = useMoveTo<HTMLDivElement>("toBottom", 0.8);

  // What the hero should say for the current state: Level 1 pitches the
  // section, Level 2 names the industry, Level 3 names the country with the
  // dossier intro as description.
  const countryName = level >= 3 && countryId ? getCountryName(countryId) : "";
  const targetTitle =
    level >= 3 && countryId
      ? countryName
      : selectedId
        ? getIndustry(selectedId)?.name ?? DEFAULT_TITLE
        : DEFAULT_TITLE;
  const targetSub =
    level >= 3 && countryId
      ? selectedId
        ? getCountryDossier(countryId, selectedId).cover.intro
        : `Select an industry above to explore ${countryName}'s production, trade and workforce data.`
      : level === 1
        ? "Select an industry — or press a country on the globe"
        : (selectedId && getIndustry(selectedId)?.description) ??
          "Press a country on the globe";
  // Companion tag beside the country title: the industry in play on the cover.
  const targetTag =
    level >= 3 && countryId && selectedId
      ? getIndustry(selectedId)?.name ?? ""
      : "";
  // Country flag beside the h1 — only when the title IS a country name, so
  // it shows on both country covers (/industries/:country and
  // /industries/:industry/:country) and never on the world/industry views.
  const targetFlag = level >= 3 && countryId ? getCountryFlag(countryId) : "";

  const [display, setDisplay] = useState({
    title: targetTitle,
    sub: targetSub,
    tag: targetTag,
    flag: targetFlag,
  });

  useEffect(() => {
    const unIntro = useIndustriesStore.subscribe(
      (s) => s.introDone,
      (done) => {
        if (done) enter.restart();
      }
    );
    // The hero lives on levels 1–3; only the data pages (4) take the full
    // viewport for themselves.
    const unLevel = useIndustriesStore.subscribe(
      (s) => s.level,
      (lvl, prev) => {
        if (prev === 3 && lvl === 4) enter.reverse();
        else if (prev === 4 && lvl === 3) enter.restart(false);
      }
    );
    return () => {
      unIntro();
      unLevel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Crossfade title + description whenever the state changes what they say.
  useLayoutEffect(() => {
    if (
      targetTitle === display.title &&
      targetSub === display.sub &&
      targetTag === display.tag &&
      targetFlag === display.flag
    )
      return;
    const els = [titleRef.current, subRef.current].filter(
      Boolean
    ) as HTMLElement[];
    if (!els.length) return;
    const tl = gsap.timeline();
    tl.to(els, {
      y: -14,
      autoAlpha: 0,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () =>
        setDisplay({
          title: targetTitle,
          sub: targetSub,
          tag: targetTag,
          flag: targetFlag,
        }),
    });
    tl.to(els, { y: 0, autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0.3);
    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetTitle, targetSub, targetTag, targetFlag]);

  return (
    <Wrapper ref={enter.ref}>
      <div style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
        <div className="max-w-[1400px] mx-auto px-8 pt-[100px]">
          {/* Industry chip row — mirrors the INDUSTRY filter bar on /data */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pointer-events-auto">
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#686970] shrink-0 mr-2">
              Industry
            </span>
            <Chip
              active={selectedId === null}
              emoji="🏭"
              label="ALL IND."
              onClick={() => selectIndustry(null)}
            />
            {getIndustries().map((ind) => (
              <Chip
                key={ind.id}
                active={selectedId === ind.id}
                emoji={ind.emoji}
                label={ind.name.toUpperCase()}
                onClick={() => selectIndustry(ind.id)}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-8 mt-4">
            <h1
              ref={titleRef}
              className="text-[clamp(24px,2.8vw,40px)] font-semibold leading-[1.15] tracking-[-0.02em] text-balance drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]"
            >
              {display.title === DEFAULT_TITLE ? (
                <>
                  Market <span className="grad-blue">intelligence</span>
                </>
              ) : (
                <>
                  {display.flag && (
                    <span className="mr-3 align-middle" aria-hidden="true">
                      {display.flag}
                    </span>
                  )}
                  <span className="grad-blue">{display.title}</span>
                  {display.tag && (
                    <span className="text-white/60 font-medium text-[0.55em] tracking-[0.02em] ml-3">
                      · {display.tag}
                    </span>
                  )}
                </>
              )}
            </h1>
            <div className="shrink-0 pointer-events-auto">
              <DataViewSwitch active="globe" />
            </div>
          </div>
          <div ref={subRef}>
            <p
              className={`text-[15px] text-[#d8d8d8] leading-[1.6] mt-3 drop-shadow-[0_1px_10px_rgba(0,0,0,0.75)] ${
                level >= 2 ? "max-w-[405px]" : "max-w-[540px]"
              }`}
            >
              {display.sub}
            </p>
            {level === 2 && (
              <div className="mt-3 text-[12px] tracking-[2px] text-[#8a8b92] drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
                Press a country on the globe
              </div>
            )}
            {level >= 3 && (
              <button
                className="btn btn--ghost btn--ghost-sm mt-4 pointer-events-auto"
                onClick={() => useIndustriesStore.getState().retreat()}
              >
                ← Back to world view
              </button>
            )}
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
