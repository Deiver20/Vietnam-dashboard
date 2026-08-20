"use client";

import { useState } from "react";
import SatelliteHeroBackdrop from "@/components/SatelliteHeroBackdrop";
import PlansHero from "./PlansHero";
import PlanCards from "./PlanCards";
import ComparisonTable from "./ComparisonTable";
import PaymentSection from "./PaymentSection";
import PlansFaq from "./PlansFaq";
import PlansCta from "./PlansCta";

export default function PlansContent() {
  const [isMonthly, setIsMonthly] = useState(false);

  return (
    <>
      {/* Page-wide immersive backdrop (same as /about): the animated hero
          background sits fixed behind the WHOLE page, static while scrolling. */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <SatelliteHeroBackdrop />
      </div>

      <main className="relative z-10 flex-1">
        <PlansHero />
        <PlanCards isMonthly={isMonthly} />
        <ComparisonTable />
        <PaymentSection />
        <PlansFaq />
        <PlansCta />
      </main>
    </>
  );
}
