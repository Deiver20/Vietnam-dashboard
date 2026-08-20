"use client";

import SatelliteHeroBackdrop from "@/components/SatelliteHeroBackdrop";
import { useDataFilters } from "@/hooks/data/useDataFilters";
import DataHero from "./DataHero";
import DataFilterBar from "./DataFilterBar";
import DataResultsGrid from "./DataResultsGrid";
import WhatsInsideSection from "./WhatsInsideSection";
import UpdateTransparencySection from "./UpdateTransparencySection";
import DataFaqSection from "./DataFaqSection";
import DataCtaSection from "./DataCtaSection";

export default function DataContent() {
  const filters = useDataFilters();

  return (
    <>
      {/* Page-wide fixed backdrop, same pattern as /pricing: it stays static
          while the page scrolls, showing through every section that has no
          solid background (hero, FAQ, CTA). */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <SatelliteHeroBackdrop />
      </div>

      <div className="relative z-10">
        <DataHero />
        <DataFilterBar filters={filters} />
        <DataResultsGrid filters={filters} />
        <WhatsInsideSection />
        <UpdateTransparencySection />
        <DataFaqSection />
        <DataCtaSection />
      </div>
    </>
  );
}
