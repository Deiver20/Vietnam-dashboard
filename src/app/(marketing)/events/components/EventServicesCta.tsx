import Placeholder from "@/components/Placeholder";

/* ════════ SERVICES CTA ════════ */
export default function EventServicesCta() {
  return (
    <section className="relative py-24 overflow-hidden mt-10">
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <Placeholder className="w-full h-full object-cover opacity-[0.15]" text="REAM BG" originalFile="assets/ream2026_fondo.png" />
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(7,7,77,0.92)] via-[rgba(0,23,48,0.96)] to-[rgba(0,50,124,0.72)]" />
      </div>
      <div className="relative z-[2] max-w-[1400px] mx-auto px-8 max-[720px]:px-4 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-[70px] max-[720px]:gap-8 items-center">
        <div>
          <span className="kicker">AGM Event Services</span>
          <h2 className="text-[clamp(28px,3vw,44px)] font-semibold leading-[1.1] tracking-[-0.02em] mb-[18px]">
            We don&apos;t just attend events.<br className="max-[720px]:hidden" />{" "}
            <span className="grad-yellow">We build them.</span>
          </h2>
          <p className="text-base text-[#d8d8d8] leading-[1.65] mb-7">
            AGM designs and produces international industry events from concept to execution —
            including REAM, the largest agri-food &amp; rendering convention in the Americas.
            Partner with us to put your brand at the center of the sector.
          </p>
          <div className="flex flex-col gap-[11px] mb-[34px]">
            {[
              "Full event branding & digital marketing campaigns",
              "Simultaneous translation & professional logistics",
              "Dedicated event website development",
              "Media management & coverage",
              "PowerBI impact report: reach, attendance & media data",
              "Sponsorship packages for industry visibility",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm text-[#d8d8d8]">
                <span className="shrink-0 w-4 h-[11px] mt-1 border-l-2 border-b-2 border-[#33cc00] rotate-[-45deg] rounded-[1px]" />
                {item}
              </div>
            ))}
          </div>
          <div className="flex gap-3 flex-wrap">
            <a href="#" className="btn btn--primary">Talk to Our Events Team</a>
            <a href="https://renderingamerica.com" target="_blank" rel="noopener" className="btn btn--ghost">REAM 2026 Site →</a>
          </div>
        </div>
        <div className="bg-black/40 backdrop-blur-lg border border-[rgba(252,181,20,0.25)] rounded-[var(--radius-xl)] p-9 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)]">
          <span className="inline-block mb-3.5 text-[10px] font-bold tracking-[0.1em] uppercase text-[#FCB514] bg-[rgba(252,181,20,0.12)] px-3 py-1 rounded-full">⭐ Flagship Event 2026</span>
          <h3 className="text-[28px] font-bold tracking-[-0.02em] leading-[1.2] mb-1.5">
            REAM 2026
            <small className="block text-[13px] font-medium text-[#bfbfbf] tracking-normal mt-0.5 mb-4">Mendoza, Argentina · Sep 8–10</small>
          </h3>
          <p className="text-[13px] text-[#bfbfbf] leading-[1.6] mb-[22px]">
            The 4th edition of the Reunión de las Américas brings together the most
            important players in rendering, pet food, biofuels, meat and animal feed
            across Latin America and beyond.
          </p>
          <div className="flex flex-col gap-2.5">
            <a href="https://renderingamerica.com" target="_blank" rel="noopener" className="btn btn--primary btn--block">
              <span>Register Now</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
            <a href="#" className="btn btn--ghost btn--block">Sponsorship Opportunities</a>
          </div>
          <div className="flex gap-2.5 flex-wrap mt-[18px] pt-4 border-t border-[rgba(252,181,20,0.15)]">
            <div className="text-xs text-[#94959b]">
              <b className="block text-xl font-bold text-white tracking-[-0.02em]">500+</b>
              Attendees
            </div>
            <div className="text-xs text-[#94959b] ml-5">
              <b className="block text-xl font-bold text-white tracking-[-0.02em]">30+</b>
              Countries
            </div>
            <div className="text-xs text-[#94959b] ml-5">
              <b className="block text-xl font-bold text-white tracking-[-0.02em]">6</b>
              Industries
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
