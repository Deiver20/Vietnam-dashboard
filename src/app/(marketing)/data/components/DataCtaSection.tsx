/* ════════════════════════ CTA ════════════════════════ */
export default function DataCtaSection() {
  return (
    <section className="relative" id="cta">
      <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4 py-[100px] max-[720px]:py-14">
        <div className="flex gap-10 items-start max-[1100px]:flex-col">
          <div className="flex-1">
            <span className="eyebrow">
              <span className="dot dot--green" /> 2 free dashboards · No card · Immediate access
            </span>
            <h2 className="text-[clamp(28px,3.4vw,46px)] font-semibold leading-[1.12] tracking-[-0.02em] mb-5">
              See your markets
              <br className="max-[720px]:hidden" />{" "}
              like never before.
            </h2>
            <p className="text-[#d8d8d8] text-base leading-relaxed mb-8 max-w-lg">
              Create your free account and explore two full dashboards in under a minute. If you decide to stay, your commercial team will thank you.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <a href="#" className="btn btn--primary btn--lg">
                <span>Sign Up Free Now</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
              <a href="#" className="btn btn--ghost btn--lg">
                Talk to Sales
              </a>
            </div>
          </div>
          <aside className="w-[380px] shrink-0 max-[1100px]:w-full">
            <span className="inline-block text-[10px] font-semibold tracking-[0.1em] uppercase text-[#bfbfbf] bg-white/[0.06] px-3 py-1 rounded-full mb-4">
              ⭐ Custom PowerBI Solution
            </span>
            <h3 className="text-xl font-semibold mb-2">
              Custom Dashboard
              <br className="max-[720px]:hidden" />{" "}
              <small className="text-[#bfbfbf] font-normal">For your industry, your brand, your filters</small>
            </h3>
            <p className="text-[13px] text-[#bfbfbf] leading-relaxed mb-4">
              Our PowerBI Solutions team builds dashboards with brand identity, custom filters, and responsive web + mobile design — with a satisfaction guarantee.
            </p>
            <a className="link link--white" href="#">
              Request a proposal →
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}
