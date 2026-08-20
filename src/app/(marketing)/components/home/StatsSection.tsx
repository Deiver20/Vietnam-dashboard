"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/hooks/home/useInView";
import { STATS } from "./homeData";

/* ════════════════════════ STATS ════════════════════════ */
export default function StatsSection() {
  const { ref: statsRef, inView: statsInView } = useInView<HTMLDivElement>();
  const [statValues, setStatValues] = useState<number[]>(STATS.map(() => 0));

  useEffect(() => {
    if (!statsInView) return;
    const duration = 1600;
    const start = performance.now();
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    let raf: number;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setStatValues(STATS.map((s) => Math.floor(easeOut(t) * s.count)));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [statsInView]);

  return (
    <section className="relative min-h-[100dvh] flex items-center" id="stats">
      <div className="relative z-[2] max-w-[1400px] mx-auto px-8 max-[720px]:px-4 py-[100px] max-[720px]:py-14 w-full">
        <div className="text-center mb-[60px] drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
          <span className="kicker">The deepest sector coverage</span>
          <h2 className="text-[clamp(28px,3.2vw,44px)] font-semibold leading-[1.15] tracking-[-0.01em] text-balance">
            A complete view of global agri-food,<br className="max-[720px]:hidden" />{" "} in a single platform.
          </h2>
        </div>
        <div ref={statsRef} className="grid grid-cols-5 max-[1100px]:grid-cols-3 max-[720px]:grid-cols-2 border border-white/[0.08] rounded-2xl overflow-hidden bg-gradient-to-b from-[rgba(10,39,72,0.6)] to-[rgba(10,39,72,0.3)] backdrop-blur-sm">
          {STATS.map((stat, i) => (
            // Cell strokes — every cell carries the border COLOR (a cell
            // without it strokes in bright currentColor); width utilities
            // then shape the grid per breakpoint:
            //   desktop  1|2|3|4|5     → right seps on 1-4
            //   tablet   1|2|3 / 4|5   → row-1 end loses its sep, row 2 tops
            //   mobile   1|2 / 3|4 / 5 → even cells end rows, rows 2-3 top,
            //                            the lone 5th spans both columns.
            <div
              key={stat.label}
              className={`py-9 px-6 text-center relative transition-colors duration-300 hover:bg-[rgba(0,102,255,0.04)] border-white/[0.06] ${
                i < STATS.length - 1 ? "border-r" : ""
              } min-[721px]:max-[1100px]:nth-[3]:border-r-0 max-[1100px]:nth-[n+4]:border-t max-[720px]:nth-[2n]:border-r-0 max-[720px]:nth-[3]:border-t max-[720px]:nth-[5]:col-span-2`}
            >
              <div className="text-[clamp(36px,4vw,56px)] font-bold tracking-[-0.03em] text-[#0066FF] mb-2 font-[var(--font-poppins)]">
                {stat.prefix}{statValues[i].toLocaleString()}
              </div>
              <div className="text-[13px] text-[#bfbfbf] tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
