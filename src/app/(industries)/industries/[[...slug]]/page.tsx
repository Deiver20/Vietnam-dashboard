// Destino: src/app/(industries)/industries/[[...slug]]/page.tsx
//
// El catch-all opcional materializa las tres profundidades de URL:
//   /industries                      → Nivel 1 (globo, todas las industrias)
//   /industries/:industryId          → Nivel 2 (globo filtrado por industria)
//   /industries/:countrySlug         → Nivel 3 (cover de país, ruta country-first)
//   /industries/:industryId/:slug    → Nivel 3 (cover de país)
//   /industries/:industryId/:slug/:variable → Nivel 4 (páginas de datos de
//                                     esa variable: imports, exports, …)
// Toda la UI la renderiza el layout del segmento (ver layout.tsx); la page
// solo existe para que la ruta resuelva. No leer params aquí: la validación y
// disambiguación de segmentos la hace useUrlSync en el cliente.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Industries | Agriglobal Market",
  description:
    "Immersive 3D globe experience: explore agroindustrial market intelligence by industry and country.",
};

export default function IndustriesPage() {
  return null;
}
