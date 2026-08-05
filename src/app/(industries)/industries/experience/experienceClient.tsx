"use client";

// Destino: src/app/(industries)/industries/experience/experienceClient.tsx
//
// ssr:false es OBLIGATORIO: map/materials.ts crea TextureLoader, texturas y
// materiales en el scope de módulo (toca Image/document al evaluarse), y
// map/countryShapes.ts triangula geometría al cargar. Ese grafo de módulos no
// debe evaluarse nunca en el servidor. En Next 15+/16, `ssr: false` solo está
// permitido dentro de un client component — por eso existe este wrapper.
import { useEffect } from "react";
import dynamic from "next/dynamic";
import { theme } from "./theme";
import { warmupIndustriesExperience } from "./warmup";

const Experience = dynamic(() => import("./index"), {
  ssr: false,
  // While the heavy three.js chunk loads, paint the experience's own backdrop
  // (same image the /marketplace globe shows) instead of a blank frame — the
  // handoff between the two immersive views reads as one continuous scene
  // rather than a blink. The image is already in the browser cache when
  // arriving from any page that uses this backdrop.
  loading: () => (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: theme.bg,
        backgroundImage: `url("${theme.bgImage}")`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  ),
});

export default function ExperienceClient() {
  // Start every fetch the experience needs (backdrop, earth textures, 50m
  // world polygons) in parallel with the heavy chunk download above.
  useEffect(() => {
    warmupIndustriesExperience();
  }, []);

  return <Experience />;
}
