"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styled from "styled-components";
import { seededRng } from "./data/random";
import { theme } from "./theme";
import { useIndustriesStore } from "./stores";

// One pool of dark/light PAIRS, one stable pick per data variable (imports,
// exports, …) — not re-rolled on every visit and not re-rolled when the
// sun/moon switch flips: picking the pair index once and then reading
// .dark/.light off of it keeps the same design across the toggle, only
// swapping which rendition of it is showing.
const DASHBOARD_BACKGROUND_PAIRS = [
  {
    dark: "https://res.cloudinary.com/wcwmpxez/image/upload/v1784655729/darkmode1_xmayay.webp",
    light: "https://res.cloudinary.com/wcwmpxez/image/upload/v1784655730/lightmode1_oudlu8.webp",
  },
  {
    dark: "https://res.cloudinary.com/wcwmpxez/image/upload/v1784655729/darkmode2_wqkemj.webp",
    light: "https://res.cloudinary.com/wcwmpxez/image/upload/v1784655730/lightmode2_j14xkj.webp",
  },
  {
    dark: "https://res.cloudinary.com/wcwmpxez/image/upload/v1784655729/darkmode3_xlryjs.webp",
    light: "https://res.cloudinary.com/wcwmpxez/image/upload/v1784655730/lightmode3_vmw4t9.webp",
  },
  {
    dark: "https://res.cloudinary.com/wcwmpxez/image/upload/v1784655729/darkmode4_vefwiv.webp",
    light: "https://res.cloudinary.com/wcwmpxez/image/upload/v1784655730/lightmode4_gf7lnq.webp",
  },
  {
    dark: "https://res.cloudinary.com/wcwmpxez/image/upload/v1784655729/darkmode5_pjcrpq.webp",
    light: "https://res.cloudinary.com/wcwmpxez/image/upload/v1784655730/lightmode5_jlrrwa.webp",
  },
];

function backgroundFor(key: string, dark: boolean) {
  const rng = seededRng(`dashboard-bg:${key}`);
  const pair =
    DASHBOARD_BACKGROUND_PAIRS[
      Math.floor(rng() * DASHBOARD_BACKGROUND_PAIRS.length)
    ];
  return dark ? pair.dark : pair.light;
}

const Layer = styled.div`
  position: absolute;
  inset: 0;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
`;

/* Sits as the first child of the scene Wrapper, i.e. behind <Map/>'s
   transparent canvas — the flat country extrusion and the additive starfield
   are drawn INSIDE that canvas, so they keep rendering over whichever layer
   is showing here untouched.

   Owns just the backdrop image, not the `transitioning` GSAP lock: Level
   3→4 (entering a dashboard) pushes the base scene image up and off while
   the variable's own backdrop pushes in from below in lockstep (identical
   duration/ease on both tweens keeps their shared edge glued together, so
   there's never a gap). Level 4→3 reverses it. */
export default function DashboardBackdrop() {
  const level = useIndustriesStore((s) => s.level);
  const dataType = useIndustriesStore((s) => s.dataType);
  const dark = useIndustriesStore((s) => s.dashboardDark);
  const baseRef = useRef<HTMLDivElement>(null);
  const dashRef = useRef<HTMLDivElement>(null);
  // The dash layer's image itself is never touched directly — two stacked
  // sub-layers hold the current and next image so the sun/moon toggle can
  // crossfade between them instead of popping the backgroundImage in place.
  const dashImgARef = useRef<HTMLDivElement>(null);
  const dashImgBRef = useRef<HTMLDivElement>(null);
  const activeIsARef = useRef(true);
  const prevLevelRef = useRef(level);

  useEffect(() => {
    gsap.set(baseRef.current, { yPercent: 0 });
    gsap.set(dashRef.current, { yPercent: 100 });
    gsap.set(dashImgARef.current, { autoAlpha: 1 });
    gsap.set(dashImgBRef.current, { autoAlpha: 0 });
  }, []);

  useEffect(() => {
    const base = baseRef.current;
    const dash = dashRef.current;
    if (!base || !dash) return;
    const prevLevel = prevLevelRef.current;
    prevLevelRef.current = level;

    if (prevLevel !== 4 && level === 4) {
      // Entering fresh: collapse back to a single active layer showing the
      // freshly-picked image — the slide-up is already the reveal, so no
      // crossfade is needed here, only on in-place toggles (below).
      gsap.killTweensOf([dashImgARef.current, dashImgBRef.current]);
      if (dashImgARef.current) {
        dashImgARef.current.style.backgroundImage = `url(${backgroundFor(dataType ?? "imports", dark)})`;
      }
      activeIsARef.current = true;
      gsap.set(dashImgARef.current, { autoAlpha: 1 });
      gsap.set(dashImgBRef.current, { autoAlpha: 0 });

      gsap.killTweensOf([base, dash]);
      gsap.set(dash, { yPercent: 100 });
      gsap.set(base, { yPercent: 0 });
      gsap.to(base, { yPercent: -100, duration: 0.9, ease: "power2.inOut" });
      gsap.to(dash, { yPercent: 0, duration: 0.9, ease: "power2.inOut" });
    } else if (prevLevel === 4 && level !== 4) {
      // Mirror image of the entry, not a reverse of the same tween: the
      // dashboard backdrop leaves through the BOTTOM (yPercent 0 → 100)
      // while the base scene image drops back in from ABOVE (it's already
      // parked at -100 from the entry, so → 0 slides it down into place).
      // Both edges trace the same H(1-t)/Ht curve, so the seam stays glued.
      gsap.killTweensOf([base, dash]);
      gsap.to(dash, { yPercent: 100, duration: 0.7, ease: "power2.inOut" });
      gsap.to(base, { yPercent: 0, duration: 0.7, ease: "power2.inOut" });
    }
  }, [level, dataType, dark]);

  // The sun/moon switch can flip while already sitting on level 4 — cross-
  // fade into the same-design dark/light twin instead of swapping it in
  // place (the entry/exit tween above owns the slide; this only ever runs
  // once the backdrop is already fully in view).
  useEffect(() => {
    if (level !== 4) return;
    const showing = activeIsARef.current ? dashImgARef.current : dashImgBRef.current;
    const standby = activeIsARef.current ? dashImgBRef.current : dashImgARef.current;
    if (!showing || !standby) return;
    standby.style.backgroundImage = `url(${backgroundFor(dataType ?? "imports", dark)})`;
    gsap.killTweensOf([showing, standby]);
    gsap.to(standby, { autoAlpha: 1, duration: 0.8, ease: "power1.inOut" });
    gsap.to(showing, { autoAlpha: 0, duration: 0.8, ease: "power1.inOut" });
    activeIsARef.current = !activeIsARef.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark]);

  return (
    <>
      {/* Longhand `backgroundColor`/`backgroundImage`, never the `background`
          shorthand: setting the shorthand inline (even just for the color,
          as this layer briefly is before its image loads) implicitly resets
          background-size/-position to their initial values on THIS element's
          inline style, which then outranks the class's `cover`/`center` —
          the image would render at its native pixel size instead of filling
          the viewport. Longhands only touch the one property each sets. */}
      <Layer
        ref={baseRef}
        style={{ backgroundColor: theme.bg, backgroundImage: `url("${theme.bgImage}")` }}
      />
      <Layer ref={dashRef} style={{ backgroundColor: theme.bg }}>
        <Layer ref={dashImgARef} />
        <Layer ref={dashImgBRef} />
      </Layer>
    </>
  );
}
