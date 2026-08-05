"use client";

// Kicks off every network fetch the 3D experience needs, WITHOUT importing
// any of its heavy modules (three.js, r3f, gsap) — so it can run from the
// small route-level chunk while the big experience chunk is still
// downloading. Called from experienceClient.tsx on mount and from the
// /marketplace warm-up. Keep this module's static imports tiny: react-dom,
// theme, data/world (110m roster + topojson-client/d3-geo) and the three
// texture URL stubs (Next static-image imports are metadata objects only).
import { preconnect, preload } from "react-dom";
import { theme } from "./theme";
import { loadDetailedWorld } from "./data/world";
import earthMapUrl from "@/assets/earth_blue_marble.webp";
import earthNormalUrl from "@/assets/earth_normal_2048.webp";
import earthSpecularUrl from "@/assets/earth_specular_2048.webp";

let warmed = false;

export function warmupIndustriesExperience() {
  if (warmed || typeof window === "undefined") return;
  warmed = true;

  // Backdrop (also shown by the dynamic-import loading fallback) + the
  // Level-4 dashboard backdrops live on Cloudinary.
  preconnect("https://res.cloudinary.com");
  preload(theme.bgImage, { as: "image", fetchPriority: "high" });

  // Earth textures download in parallel with the three.js chunk; when
  // materials.ts later evaluates, TextureLoader hits the HTTP cache.
  for (const url of [earthMapUrl.src, earthNormalUrl.src, earthSpecularUrl.src]) {
    preload(url, { as: "image", fetchPriority: "high" });
  }

  // 50m world polygons: fetch + topojson decode in parallel too. Once both
  // the data AND the heavy chunk are in, pre-fill the triangulation caches
  // during idle so the globe's first render skips its ~150–400 ms
  // main-thread block (the dynamic imports below resolve from the already
  // loaded experience chunk — they don't add a second download).
  loadDetailedWorld()
    .then(async () => {
      const [{ getCountryGeometries, getBorderGeometry }, { GLOBE_RADIUS }] =
        await Promise.all([import("./map/countryShapes"), import("./map/globe")]);
      const prewarm = () => {
        // Same radii as globe.tsx — the caches are keyed by first call.
        getCountryGeometries(GLOBE_RADIUS + 0.002);
        getBorderGeometry(GLOBE_RADIUS + 0.004);
      };
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(prewarm);
      } else {
        window.setTimeout(prewarm, 0);
      }
    })
    .catch(() => {
      // Non-fatal: globe.tsx suspends on loadDetailedWorld() itself and
      // world.ts allows the fetch to retry.
    });
}
