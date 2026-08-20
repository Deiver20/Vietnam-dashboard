"use client";

import React, { useEffect, useRef } from "react";
import HeroFlowField from "./HeroFlowField";
import Starfield from "./Starfield";

/**
 * Shared animated hero backdrop used by /data and the /dashboard banner so both
 * stay identical: background image + twinkling starfield + light-blue particle
 * flow field + two satellites that drift across the scene at random and rotate
 * to follow the pointer. Render it inside a `relative overflow-hidden` hero; it
 * fills the section (absolute inset-0) behind the hero content (use z-10 there).
 */

const lerpAngle = (a: number, b: number, t: number) => {
  let diff = b - a;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return a + diff * t;
};

const getAngleToCenter = (el: HTMLElement | null) => {
  if (!el) return 0;
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const angle = (Math.atan2(window.innerHeight / 2 - cy, window.innerWidth / 2 - cx) * 180) / Math.PI;
  return angle - 90;
};

/* Mouse-follow easing per frame. Deliberately glacial (per design review:
   0.03 read as too aggressive) — the satellite barely turns during a
   crossing. Entry orientation is handled separately: every new crossing
   snaps the sprite to face the page center, so the slow follow only ever
   fine-tunes from there. */
const FOLLOW_EASE = 0.001;

export default function SatelliteHeroBackdrop() {
  const leftSatRef = useRef<HTMLDivElement>(null);
  const rightSatRef = useRef<HTMLDivElement>(null);
  const leftWrapRef = useRef<HTMLDivElement>(null);
  const rightWrapRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
  });
  const rotationRef = useRef({ left: 0, right: 0 });
  const satRafRef = useRef<number | null>(null);

  /* ── Satellites rotate to follow the pointer ── */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    const initLeft = getAngleToCenter(leftSatRef.current);
    const initRight = getAngleToCenter(rightSatRef.current);
    rotationRef.current = { left: initLeft, right: initRight };
    if (leftSatRef.current) leftSatRef.current.style.transform = `rotate(${initLeft.toFixed(2)}deg)`;
    if (rightSatRef.current) rightSatRef.current.style.transform = `rotate(${initRight.toFixed(2)}deg)`;

    const animate = () => {
      const mouse = mouseRef.current;
      const updateSat = (el: HTMLElement | null, key: "left" | "right") => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const mouseAngle = (Math.atan2(mouse.y - cy, mouse.x - cx) * 180) / Math.PI;
        const targetAngle = mouseAngle - 90;
        rotationRef.current[key] = lerpAngle(rotationRef.current[key], targetAngle, FOLLOW_EASE);
        el.style.transform = `rotate(${rotationRef.current[key].toFixed(2)}deg)`;
      };
      updateSat(leftSatRef.current, "left");
      updateSat(rightSatRef.current, "right");
      satRafRef.current = requestAnimationFrame(animate);
    };
    satRafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (satRafRef.current) cancelAnimationFrame(satRafRef.current);
    };
  }, []);

  /* ── Satellites: random side-to-side crossings, strictly one at a time —
        the idle satellite stays parked off-screen until the active one has
        fully left, then takes over after a short random breather. ── */
  useEffect(() => {
    const OFF_LEFT = -60; // vw, fully off the left edge
    const OFF_RIGHT = 110; // vw, fully off the right edge
    const sats = [
      // big satellite → upper band
      { ref: rightWrapRef, satRef: rightSatRef, key: "right" as const, topMin: 2, topMax: 22 },
      // small satellite → lower band
      { ref: leftWrapRef, satRef: leftSatRef, key: "left" as const, topMin: 50, topMax: 74 },
    ];

    type Cross = { from: number; to: number; dur: number; t0: number };
    const newCross = (s: (typeof sats)[number], now: number, midStart: boolean): Cross => {
      const ltr = Math.random() < 0.5; // random direction
      const from = ltr ? OFF_LEFT : OFF_RIGHT;
      const to = ltr ? OFF_RIGHT : OFF_LEFT;
      const dur = (110 + Math.random() * 36) * 1000; // ≈2 min crossing
      const top = s.topMin + Math.random() * (s.topMax - s.topMin);
      if (s.ref.current) s.ref.current.style.top = `${top.toFixed(1)}%`;
      const p0 = midStart ? Math.random() : 0;
      const t0 = now - p0 * dur;
      // Park the wrap at the crossing's starting point right away (the tick
      // applies this same transform next frame) so the entry angle below is
      // measured from the real position, not wherever the last flight ended.
      const x = from + (to - from) * p0;
      if (s.ref.current) s.ref.current.style.transform = `translateX(${x.toFixed(2)}vw)`;
      // Enter facing the center of the page — kills the upside-down entries
      // (rotation used to carry over from the previous crossing) — and let
      // the follow RAF ease from there toward the cursor.
      const satEl = s.satRef.current;
      if (satEl) {
        const angle = getAngleToCenter(satEl);
        rotationRef.current[s.key] = angle;
        satEl.style.transform = `rotate(${angle.toFixed(2)}deg)`;
      }
      return { from, to, dur, t0 };
    };

    // Random pick opens the show mid-flight; the other waits off-screen.
    let active = Math.random() < 0.5 ? 0 : 1;
    const parked = sats[1 - active].ref.current;
    if (parked) parked.style.transform = `translateX(${OFF_LEFT}vw)`;
    let cross = newCross(sats[active], performance.now(), true);
    // 0 while a flight is running; otherwise the timestamp when the next
    // satellite may enter (a 4–14s breather between flights).
    let handoffAt = 0;

    let raf = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (handoffAt) {
        if (now >= handoffAt) {
          handoffAt = 0;
          active = 1 - active;
          cross = newCross(sats[active], now, false);
        }
        return;
      }
      const p = (now - cross.t0) / cross.dur;
      const el = sats[active].ref.current;
      if (p >= 1) {
        if (el) el.style.transform = `translateX(${cross.to}vw)`; // fully off
        handoffAt = now + 4000 + Math.random() * 10000;
        return;
      }
      const x = cross.from + (cross.to - cross.from) * p;
      if (el) el.style.transform = `translateX(${x.toFixed(2)}vw)`;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      {/* Background image. Sized to the full viewport (h-screen, top-anchored)
          exactly like the /industries experience and the /marketplace globe
          paint it (cover, centered over 100vh) — the hero's overflow-hidden
          crops the rest, so every hero shows the SAME top slice of the same
          picture and pages read as one continuous world. */}
      <div className="absolute inset-x-0 top-0 z-0 h-screen overflow-hidden" aria-hidden="true">
        <img
          src="https://res.cloudinary.com/wcwmpxez/image/upload/v1784568972/new-background-image-agm-globe_uho6xv.webp"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
      </div>

      {/* Starfield */}
      <Starfield className="absolute inset-0 z-[0]" />

      {/* Particle flow field — just behind the satellites */}
      <HeroFlowField variant="data" globalPointer density={0.5} className="absolute inset-0 z-[1]" />

      {/* Satellites — random side-to-side crossings; keep their pointer-follow
          rotation and pulsing lights. Right one has higher z (it's bigger). */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div ref={rightWrapRef} className="absolute left-0 top-[10%] z-[2]" style={{ transform: "translateX(-60vw)" }}>
          <div
            ref={rightSatRef}
            className="relative select-none pointer-events-none"
            style={{ transformOrigin: "center center", width: 270, height: 178.5 }}
          >
            <img
              src="/imgs/rightsatellite.webp"
              alt=""
              className="block select-none pointer-events-none"
              style={{ width: 270, height: 178.5 }}
              aria-hidden="true"
              draggable={false}
            />
            <div
              className="absolute top-[53%] left-[50%] rounded-full bg-yellow-300 animate-[strongPulse_2.5s_ease-in-out_infinite]"
              style={{ width: 3, height: 3, boxShadow: "0 0 8px rgba(253,224,71,0.95)" }}
            />
          </div>
        </div>

        <div ref={leftWrapRef} className="absolute left-0 top-[58%] z-[1]" style={{ transform: "translateX(-60vw)" }}>
          <div
            ref={leftSatRef}
            className="relative select-none pointer-events-none"
            style={{ transformOrigin: "center center", width: 211.5, height: 100.875 }}
          >
            <img
              src="/imgs/leftsatellite.webp"
              alt=""
              className="block select-none pointer-events-none"
              style={{ width: 211.5, height: 100.875 }}
              aria-hidden="true"
              draggable={false}
            />
            <div
              className="absolute top-[41%] left-[57%] rounded-full bg-yellow-300 animate-[strongPulse_2.5s_ease-in-out_infinite]"
              style={{ width: 3, height: 3, boxShadow: "0 0 8px rgba(253,224,71,0.95)" }}
            />
            <div
              className="absolute top-[19%] left-[56%] rounded-full bg-yellow-300 animate-[strongPulse_2.5s_ease-in-out_infinite]"
              style={{ width: 3, height: 3, boxShadow: "0 0 8px rgba(253,224,71,0.95)" }}
            />
            <div
              className="absolute top-[17%] left-[46%] rounded-full bg-yellow-300 animate-[strongPulse_2.5s_ease-in-out_infinite]"
              style={{ width: 3, height: 3, boxShadow: "0 0 8px rgba(253,224,71,0.95)" }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
