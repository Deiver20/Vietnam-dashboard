// Destino: src/app/(industries)/industries/layout.tsx
//
// CRÍTICO: la experiencia 3D vive en el LAYOUT del segmento, no en page.tsx.
// En App Router los layouts persisten entre navegaciones de sus rutas hijas,
// mientras que las pages se REMONTAN al cambiar los segmentos dinámicos.
// Si la escena viviera en page.tsx, el botón atrás del navegador (que hace un
// soft-navigation entre URLs /industries/*) destruiría y recrearía todo el
// canvas WebGL. Aquí solo se remonta la page (que devuelve null) y la escena
// sobrevive; useUrlSync converge el estado con la nueva URL.
import type { ReactNode } from "react";
import ExperienceClient from "./experience/experienceClient";
import SiteNav from "./experience/siteNav";

export default function IndustriesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <SiteNav />
      <ExperienceClient />
      {children}
    </>
  );
}
