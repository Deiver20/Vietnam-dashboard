"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/* ════════════════════════ EVENTS ════════════════════════ */
export default function EventCountdown() {
  const [countdown, setCountdown] = useState({ d: "--", h: "--", m: "--", s: "--" });

  useEffect(() => {
    const target = new Date("2026-09-08T09:00:00-03:00").getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setCountdown({ d: "00", h: "00", m: "00", s: "00" });
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown({
        d: String(d).padStart(2, "0"),
        h: String(h).padStart(2, "0"),
        m: String(m).padStart(2, "0"),
        s: String(s).padStart(2, "0"),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="events" className="py-[100px] max-[720px]:py-14 relative bg-[#f4f7fc]">
      <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4">
        <div className="mb-[50px] max-w-[720px] mx-auto text-center">
          <span className="kicker justify-center">Flagship event</span>
          <h2 className="text-[clamp(28px,3.4vw,46px)] font-semibold leading-[1.12] tracking-[-0.02em] text-balance text-[#001730]">
            The largest business convention
          </h2>
        </div>
        <div className="rounded-2xl border border-[rgba(102,166,255,0.18)] backdrop-blur-[16px] p-10 max-[720px]:p-6 overflow-hidden relative">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source src="/videos/loop-1_5.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,23,48,0.82)] via-[rgba(0,23,48,0.88)] to-[rgba(3,15,28,1)] z-[1]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(102,166,255,0.35)] to-transparent z-[2]" />
          <div className="relative z-[3] grid grid-cols-[1.2fr_1fr] gap-12 items-center max-[1000px]:grid-cols-1 max-[1000px]:gap-10 max-[1000px]:text-center">
            <div className="flex flex-col items-start gap-5 max-[1000px]:items-center">
              <span className="kicker">Upcoming event</span>
              <h2 className="text-[clamp(36px,4.5vw,56px)] font-bold tracking-[-0.03em] leading-[1.05]">
                <span className="grad-blue">8–10 Sep 2026</span>
              </h2>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase text-[#bfbfbf] bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#33cc00] shadow-[0_0_8px_#33cc00]" />
                4ª Edición — Reunión de las Américas
              </span>
              <p className="text-[14px] font-semibold tracking-[0.1em] uppercase text-white/[0.85]">
                Mendoza, Argentina
              </p>
              <p className="text-[15px] leading-[1.65] text-[#d8d8d8] max-w-[460px]">
                The largest business convention in the agri-food and rendering industries.
                Three days of high-level networking, strategic panels, and exclusive insights
                with key players across the Americas.
              </p>
              <div className="flex gap-3 mt-1 max-[720px]:flex-wrap max-[720px]:justify-center">
                <a href="https://renderingamerica.com" target="_blank" rel="noopener" className="btn btn--primary">
                  Más Información
                </a>
                <Link href="/events" className="btn btn--ghost">
                  Ver Agenda
                </Link>
              </div>
            </div>
            <div className="flex flex-col items-center gap-6">
              <img
                src="/assets/ream_2026_logo.webp"
                alt="REAM 2026 Logo"
                className="h-[120px] w-auto opacity-90 brightness-110 drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)] max-[720px]:h-[90px]"
                loading="lazy"
              />
              <div className="flex gap-3 max-[720px]:gap-2" aria-label="Cuenta regresiva">
                {[
                  { num: countdown.d, lbl: "Días" },
                  { num: countdown.h, lbl: "Horas" },
                  { num: countdown.m, lbl: "Min" },
                  { num: countdown.s, lbl: "Seg" },
                ].map((unit, i, arr) => (
                  <div key={unit.lbl} className="flex items-center gap-3 max-[720px]:gap-2">
                    <div className="flex flex-col items-center gap-1.5 min-w-[78px] max-[380px]:min-w-[56px]">
                      <div className="flex items-center justify-center w-[78px] h-[78px] rounded-xl bg-[#0a2748] border border-[rgba(102,166,255,0.22)] text-[32px] font-bold text-white tracking-[-0.02em] font-[var(--font-jetbrains)] shadow-[0_4px_16px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] max-[720px]:w-[64px] max-[720px]:h-[64px] max-[720px]:text-[26px] max-[380px]:w-[56px] max-[380px]:h-[56px] max-[380px]:text-[22px]">
                        {unit.num}
                      </div>
                      <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#94959b]">{unit.lbl}</span>
                    </div>
                    {i < arr.length - 1 && (
                      <span className="text-[24px] font-light text-[#94959b]/40 mb-3 leading-none select-none max-[720px]:hidden">:</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
