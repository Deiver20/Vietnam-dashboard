"use client";

// Destino: src/app/(industries)/industries/experience/index.tsx
//
// Sustituye a los DOS archivos originales de Vite `industries/index.tsx`
// (lazy wrapper, ya innecesario: next/dynamic hace el code-splitting) y
// `industries/demo.tsx` (el contenido real). Es idéntico a demo.tsx salvo
// "use client" y el font-family explícito del Wrapper (ver MIGRATION.md §7.5:
// el original hereda la fuente por defecto del navegador; sin este reset,
// la Poppins global de agm-next cambiaría la métrica de todos los textos).
import { useEffect } from "react";
import styled from "styled-components";
import useSnapWheel from "@/hooks/useSnapWheel";
import DashboardBackdrop from "./dashboardBackdrop";
import HoverTooltip from "./hoverTooltip";
import Map from "./map";
import Panel from "./panel";
import { useIndustriesStore } from "./stores";
import { theme } from "./theme";
import useUrlSync from "./useUrlSync";

const Wrapper = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  /* Solid fallback only — DashboardBackdrop owns the actual backdrop image
     (as the first child, behind <Map/>'s transparent canvas) so it can push
     a per-dashboard-variable image in/out without a second, redundant image
     layer painted here too. */
  background: ${theme.bg};
  overflow: hidden;
  /* Fidelidad: el proyecto original no define font-family global, así que la
     UI hereda la fuente por defecto del navegador (serif). Este reset evita
     heredar la Poppins del body de agm-next. Si el equipo prefiere Poppins,
     borrar esta línea es la única desviación consciente del pixel-perfect. */
  font-family: "Times New Roman", Times, serif;
`;

export default function IndustriesExperience() {
  // Declared before the reset effect: its cleanup (unsubscribe) must run
  // before reset() fires on unmount, so leaving the page never re-navigates.
  useUrlSync();

  useEffect(() => {
    useIndustriesStore.getState().reset();
    return () => {
      useIndustriesStore.getState().reset();
    };
  }, []);

  useSnapWheel({
    onNext: () => {
      const s = useIndustriesStore.getState();
      // The cover (Level 3) no longer scrolls into the data pages — the
      // carousel's "View data" buttons own that jump. Wheel-next only pages
      // forward inside the data pages themselves.
      if (s.level < 4) return;
      s.advance();
    },
    onPrev: () => {
      // Scroll-up/swipe-down NEVER navigates back — the gesture misfired
      // constantly on tablets. Going back is owned exclusively by the
      // explicit controls (back button / breadcrumbs / Back to world view).
    },
    locked: () => useIndustriesStore.getState().transitioning,
  });

  return (
    <Wrapper>
      <DashboardBackdrop />
      <Map />
      <Panel />
      <HoverTooltip />
    </Wrapper>
  );
}
