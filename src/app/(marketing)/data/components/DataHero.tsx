import DataViewSwitch from "./DataViewSwitch";

/* ════════════════════════ HERO ════════════════════════ */
export default function DataHero() {
  return (
    <section className="relative pt-[110px] pb-8 min-h-[400px]">
      {/* No local backdrop — the page-wide fixed satellite backdrop
          (DataContent) shows through, exactly like the /pricing hero. */}

      <div className="relative z-10 max-w-[1400px] mx-auto px-8 max-[720px]:px-4">
        <div className="flex items-center gap-12 max-[960px]:flex-col max-[960px]:items-start">
          <div className="flex-1 min-w-0">
            <span className="eyebrow drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
              <span className="dot dot--green" />
              DATA Platform · Analytic AI includes
            </span>
            <h1 className="text-[clamp(24px,2.8vw,40px)] font-semibold leading-[1.15] tracking-[-0.02em] mt-2 text-balance drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
              Market intelligence <span className="grad-blue">designed for</span>{" "}
              <span className="grad-green">million-dollar decisions.</span>
            </h1>
            <p className="text-[15px] text-[#d8d8d8] leading-[1.6] max-w-[540px] mt-3 drop-shadow-[0_1px_10px_rgba(0,0,0,0.75)]">
              Verified market data, trade statistics and industry benchmarks from global agri-food sectors.
              Structured datasets built for analytics, forecasting and strategic planning.
            </p>
          </div>

          <div className="shrink-0 self-start max-[960px]:self-auto">
            <DataViewSwitch />
          </div>
        </div>
      </div>
    </section>
  );
}
