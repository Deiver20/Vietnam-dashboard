export default function PlansHero() {
  return (
    <section className="relative pt-[110px] pb-8 min-h-[400px]" data-screen-label="01 Hero">
      {/* No local background — the page-wide fixed backdrop shows through. */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-8 max-[720px]:px-4">
        <div className="flex items-center gap-12 max-[960px]:flex-col max-[960px]:items-start">
          <div className="flex-1 min-w-0">
            <span className="eyebrow drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
              <span className="dot dot--green" />
              Annual plans · Immediate access · No hidden fees
            </span>
            <h1 className="text-[clamp(24px,2.8vw,40px)] font-semibold leading-[1.15] tracking-[-0.02em] mt-2 text-balance drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
              Find the right <span className="grad-blue">plan for you.</span>
            </h1>
            <p className="text-[15px] text-gray-2 leading-[1.6] max-w-[540px] mt-3 drop-shadow-[0_1px_10px_rgba(0,0,0,0.75)]">
              From individual analysts to large corporations. Every plan includes access to our market intelligence platform, mobile app, and data exports.
            </p>
          </div>
          <div className="flex flex-col items-end gap-[18px] max-[960px]:items-start max-[960px]:w-full">
            <div className="inline-flex items-center gap-3 bg-white/[0.06] backdrop-blur-md border border-white/[0.1] rounded-full py-1.5 pr-2 pl-4 text-[13px] font-medium text-gray-3">
              <span>Annual</span>
              <span className="relative w-12 h-[26px] rounded-full flex-shrink-0 bg-blue">
                <span className="absolute top-[3px] left-[3px] w-5 h-5 rounded-full bg-white" />
              </span>
              <span>Monthly</span>
              <span className="bg-[rgba(51,204,0,0.15)] text-green border border-[rgba(51,204,0,0.3)] rounded-full text-[10px] font-bold tracking-[0.08em] px-2.5 py-[3px]">
                Save up to 40%
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
