import SatelliteHeroBackdrop from "@/components/SatelliteHeroBackdrop";

/* ════════ HERO ════════ */
export default function LatestHero() {
  return (
    <section className="relative pt-[110px] pb-8 overflow-hidden min-h-[400px]">
      {/* Site-wide animated hero backdrop (same as /data). */}
      <SatelliteHeroBackdrop />
      <div className="relative z-10 max-w-[1400px] mx-auto px-8 max-[720px]:px-4">
        <div className="flex items-center gap-12 max-[960px]:flex-col max-[960px]:items-start">
          <div className="flex-1 min-w-0">
            <span className="eyebrow drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
              <span className="dot dot--green" />
              Certified content · Updated daily
            </span>
            <h1 className="text-[clamp(24px,2.8vw,40px)] font-semibold leading-[1.15] tracking-[-0.02em] mt-2 text-balance drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
              <span className="grad-blue">Data-driven</span> insights for agri-food decisions.
            </h1>
            <p className="text-[15px] text-[#d8d8d8] leading-[1.6] max-w-[540px] mt-3 drop-shadow-[0_1px_10px_rgba(0,0,0,0.75)]">
              Verified datasets, market intelligence and analytics from global agri-food sectors.
              Structured data and benchmarks designed for forecasting, strategy and investment planning.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
