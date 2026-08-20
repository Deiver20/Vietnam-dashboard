import HeroFlowField from "@/components/HeroFlowField";

/* ════════════════════════ CTA ════════════════════════ */
export default function CtaSection() {
  return (
    <section className="relative py-[100px] max-[720px]:py-14 overflow-hidden" id="cta">
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <img
          src="https://res.cloudinary.com/wcwmpxez/image/upload/v1784568972/new-background-image-agm-globe_uho6xv.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
        <HeroFlowField variant="data" globalPointer density={0.5} className="absolute inset-0" />
      </div>
      <div className="relative z-[2] max-w-[1400px] mx-auto px-8 max-[720px]:px-4 flex flex-col items-center text-center drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
        <div className="eyebrow relative backdrop-blur-3xl bg-[#001730]/50 border border-white/15 rounded-full px-5 py-2">
          <span className="dot dot--green" />
          <span>Immediate access · 2 free charts on sign-up</span>
        </div>
        <h2 className="text-[clamp(34px,4vw,56px)] font-semibold leading-[1.1] tracking-[-0.02em] my-3 text-balance">
          Start making decisions<br className="max-[720px]:hidden" />{" "} with real data, today.
        </h2>
        <p className="text-[17px] text-[#d8d8d8] leading-[1.6] mb-8 max-w-[540px]">
          Create a free account and get access to 2 dashboards. No card required. No commitments. Your commercial team will thank you.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href="#" className="btn btn--primary btn--lg">
            <span>Sign Up Free Now</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
