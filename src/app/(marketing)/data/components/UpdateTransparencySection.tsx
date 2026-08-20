"use client";

import { useEffect, useRef, useState } from "react";
import { COUNTRIES } from "../datasets";

/* ════════════════════════ UPDATE TRANSPARENCY ════════════════════════ */
export default function UpdateTransparencySection() {
  const [inView, setInView] = useState(false);
  const updatesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = updatesRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="py-[100px] max-[720px]:py-14 bg-[#F4F6FA]">
      <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4 grid grid-cols-[1fr_1.2fr] gap-[70px] max-[720px]:gap-8 items-center max-[1100px]:grid-cols-1 max-[1100px]:gap-10">
        <div>
          <span className="kicker text-[#686970]">Data transparency</span>
          <h2 className="text-[clamp(28px,3.4vw,46px)] font-semibold leading-[1.12] tracking-[-0.02em] mb-5 text-gray-900">Data delivery delay</h2>
          <p className="text-gray-600 text-base leading-relaxed mb-4">
            Each series has a different update lag, driven by customs, port, or political processes. As soon as agencies release the data, AGM refreshes it <strong className="text-gray-900 font-semibold">instantly</strong> in your dashboard.
          </p>
          <p className="p-[18px] px-5 bg-[rgba(51,204,0,0.08)] border-l-[3px] border-[#33cc00] rounded text-sm text-gray-700 mt-6">
            We don&apos;t promise the impossible: we promise the truth. That&apos;s why each dashboard shows its last update date and frequency.
          </p>
        </div>
        <div
          ref={updatesRef}
          className="bg-white border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-[16px] p-7 px-7"
        >
          {[
            { t: "1 week", w: "8%", col: "linear-gradient(90deg, #279B00, #33CC00)", textCol: "#33cc00", flags: ["us", "de", "nl", "au"] },
            { t: "2–3 months", w: "55%", col: "linear-gradient(90deg, #d68f00, #FCB514)", textCol: "#fcb514", flags: ["mx", "br", "ar", "cn", "in", "co"] },
            { t: "4 months", w: "95%", col: "linear-gradient(90deg, #c43d3d, #F35959)", textCol: "#f35959", flags: ["za", "ng", "pe", "cl"] },
          ].map((row) => (
            <div key={row.t} className="mb-7 last:mb-0">
              <div className="flex justify-between items-baseline mb-2.5">
                <b className="text-[15px] font-semibold" style={{ color: row.textCol }}>{row.t}</b>
              </div>
              <div className="h-2 bg-gray-100 rounded overflow-hidden mb-1.5">
                <div
                  className="h-full rounded transition-[width] duration-[1400ms]"
                  style={{
                    width: inView ? row.w : "0%",
                    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                    background: row.col,
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-1.5 items-center mt-2">
                {row.flags.map((code) => {
                  const c = COUNTRIES[code];
                  if (!c) return null;
                  return (
                    <span key={code} className="text-base leading-none">
                      {c.emoji}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="mt-7 pt-5 border-t border-gray-100 flex items-center gap-2.5 text-[13px] text-gray-600">
            <span className="w-2 h-2 rounded-full bg-[#33cc00] shadow-[0_0_8px_#33cc00] animate-[pulseDot_2s_ease-in-out_infinite]" />
            Updated as soon as data is public — not before, never estimated.
          </div>
        </div>
      </div>
    </section>
  );
}
