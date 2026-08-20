"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SearchModal from "@/components/SearchModal";
import { SEARCH_TERMS, POPULAR_CHIPS } from "./homeData";

/* ════════════════════════ HERO + SEARCH ════════════════════════ */
export default function HeroSection() {
  const [searchValue, setSearchValue] = useState("");
  const [placeholder, setPlaceholder] = useState(SEARCH_TERMS[0]);
  const [searchIdle, setSearchIdle] = useState(true);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startSearchTyping = useCallback(() => {
    let idx = 0;
    let charIdx = 0;
    let deleting = false;
    const TYPING_MS = 55;
    const DELETE_MS = 28;
    const PAUSE_MS = 2200;

    const type = () => {
      const term = SEARCH_TERMS[idx];
      if (!deleting) {
        setPlaceholder(term.slice(0, charIdx + 1));
        charIdx++;
        if (charIdx === term.length) {
          deleting = true;
          searchTimer.current = setTimeout(type, PAUSE_MS);
          return;
        }
      } else {
        setPlaceholder(term.slice(0, charIdx - 1));
        charIdx--;
        if (charIdx === 0) {
          deleting = false;
          idx = (idx + 1) % SEARCH_TERMS.length;
          searchTimer.current = setTimeout(type, 400);
          return;
        }
      }
      searchTimer.current = setTimeout(type, deleting ? DELETE_MS : TYPING_MS);
    };

    type();
  }, []);

  const stopSearchTyping = useCallback(() => {
    setSearchIdle(false);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    setPlaceholder("Search commodities, industries, countries…");
  }, []);

  useEffect(() => {
    startSearchTyping();
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [startSearchTyping]);

  const heroFill = (term: string) => {
    setSearchValue(term);
    stopSearchTyping();
    setSearchModalOpen(true);
  };

  const heroSearch = () => {
    setSearchModalOpen(true);
  };

  return (
    <>
      <section className="relative min-h-[100dvh] pt-[140px] pb-20 flex flex-col justify-center">
        <div className="relative z-[2] max-w-[860px] mx-auto px-8 max-[720px]:px-4 grid grid-cols-1 justify-items-center text-center">
          <div className="max-w-[760px] flex flex-col items-center">
            <div className="eyebrow justify-center">
              <span className="dot dot--green" />
              <span>Market intelligence platform · 70+ countries</span>
            </div>
            <h1 className="text-[clamp(38px,4.6vw,64px)] leading-[1.05] font-semibold tracking-[-0.02em] mb-6 text-balance drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
              Commercial<br className="max-[720px]:hidden" />{" "}
              decisions <span className="grad-blue">based</span><br className="max-[720px]:hidden" />{" "}
              on <span className="grad-green">real data.</span>
            </h1>
            <p className="text-[17px] leading-[1.65] text-[#d8d8d8] mb-9 max-w-[580px] drop-shadow-[0_1px_10px_rgba(0,0,0,0.75)]">
              Understand the market, its statistics, and key players. AGM turns
              customs and port flows into actionable charts on prices,
              supply, demand, CIF/FOB, and volumes — in USD, by country, by product.
            </p>

            {/* Hero Search */}
            <div className="w-full max-w-[700px] mt-9 mx-auto max-[720px]:max-w-full">
              <div
                className={`flex items-center gap-0 bg-white/[0.07] border-[1.5px] border-[rgba(102,166,255,0.35)] rounded-2xl py-[7px] pr-[7px] pl-[22px] backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-all duration-300 focus-within:border-[rgba(0,102,255,0.75)] focus-within:bg-[rgba(0,102,255,0.09)] focus-within:shadow-[0_8px_32px_rgba(0,0,0,0.35),0_0_0_5px_rgba(0,102,255,0.14)] ${searchIdle ? "animate-[searchGlow_3s_ease-in-out_infinite]" : ""}`}
              >
                <svg
                  className="text-[#67a6ff] shrink-0 mr-[14px] opacity-80 transition-opacity duration-200"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  className="flex-1 bg-transparent border-none outline-none text-white font-[var(--font-poppins)] text-base font-normal py-[11px] min-w-0 caret-[#67a6ff] placeholder:text-white/[0.38]"
                  type="text"
                  autoComplete="off"
                  spellCheck="false"
                  placeholder={placeholder}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={stopSearchTyping}
                  onBlur={() => {
                    if (!searchValue) {
                      setSearchIdle(true);
                      startSearchTyping();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") heroSearch();
                  }}
                />
                <button
                  className="inline-flex items-center gap-2 px-6 py-[13px] bg-gradient-to-br from-[#0066FF] to-[#0052d4] border-none rounded-[11px] text-white font-[var(--font-poppins)] text-sm font-semibold shrink-0 tracking-wide shadow-[0_4px_18px_rgba(0,102,255,0.45),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-200 hover:bg-gradient-to-br hover:from-[#1a76ff] hover:to-[#0066ff] hover:shadow-[0_7px_26px_rgba(0,102,255,0.6)] hover:-translate-y-px active:translate-y-0"
                  onClick={heroSearch}
                >
                  <span className="max-[720px]:hidden">Search</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2 mt-[14px] flex-wrap justify-center">
                <span className="text-[11px] font-semibold text-white/[0.3] tracking-wider shrink-0">Popular:</span>
                {POPULAR_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    className="px-[13px] py-[5px] bg-white/[0.06] border border-white/[0.12] rounded-full font-[var(--font-poppins)] text-xs font-medium text-white/[0.6] cursor-pointer transition-all duration-200 whitespace-nowrap backdrop-blur-md hover:bg-[rgba(0,102,255,0.2)] hover:border-[rgba(0,102,255,0.5)] hover:text-white hover:-translate-y-px"
                    onClick={() => heroFill(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <a href="#stats" className="absolute bottom-7 left-1/2 -translate-x-1/2 z-[3] w-[26px] h-[42px] border-2 border-white/25 rounded-2xl flex justify-center pt-2 bg-white/10 backdrop-blur-md" aria-label="Scroll down">
          <span className="w-1 h-2 rounded-sm bg-[#67a6ff] animate-[scrollCue_1.6s_ease-in-out_infinite]" />
        </a>
      </section>

      <SearchModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        initialQuery={searchValue}
      />
    </>
  );
}
