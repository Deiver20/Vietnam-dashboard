"use client";

import { useEffect, useState } from "react";

/* ── Countdown hook ───────────────────────────────────── */
export function useCountdown(targetStr: string) {
  const [time, setTime] = useState({ d: "--", h: "--", m: "--", s: "--" });
  useEffect(() => {
    const target = new Date(targetStr);
    const pad = (n: number) => String(n).padStart(2, "0");
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTime({ d: "00", h: "00", m: "00", s: "00" }); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime({ d: pad(d), h: pad(h), m: pad(m), s: pad(s) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetStr]);
  return time;
}
