import Placeholder from "@/components/Placeholder";
import { ArrowRight } from "./icons";

export default function PlansCta() {
  return (
    <section className="relative py-[100px] max-[720px]:py-14 overflow-hidden" data-screen-label="06 CTA">
      <div className="absolute inset-0 z-0">
        <Placeholder className="absolute inset-0 w-full h-full object-cover opacity-25" text="Contact Banner" originalFile="assets/contact_banner.webp" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-br from-[rgba(7,7,77,0.85)] via-[rgba(0,23,48,0.9)] to-[rgba(0,50,124,0.65)]" />
      </div>
      <div className="relative z-[2] max-w-[1400px] mx-auto px-8 grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-[60px] max-[720px]:gap-8 items-center max-[1100px]:grid-cols-1 max-[720px]:px-4">
        <div>
          <span className="eyebrow">
            <span className="dot dot--green" />
            2 free dashboards on sign-up · No card required
          </span>
          <h2 className="text-[clamp(34px,4vw,56px)] font-semibold leading-[1.1] tracking-[-0.02em] mt-3 mb-[18px] [text-wrap:balance]">
            Start today.<br className="max-[720px]:hidden" />{" "}Upgrade when you&apos;re ready.
          </h2>
          <p className="text-[17px] text-gray-2 leading-[1.6] mb-8 max-w-[540px]">
            Create a free account and explore two full dashboards. If you decide to stay, your commercial team will thank you.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#" className="btn btn--primary btn--lg">
              <span>Sign Up Free</span>
              <ArrowRight size={18} />
            </a>
            <a href="#" className="btn btn--ghost btn--lg">Talk to Sales</a>
          </div>
        </div>
        <aside className="bg-[rgba(0,0,0,0.35)] backdrop-blur-[16px] border border-[rgba(252,181,20,0.3)] rounded-lg p-7 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)]">
          <span className="inline-block bg-[rgba(252,181,20,0.15)] text-yellow text-[11px] font-semibold tracking-[0.08em] uppercase px-3 py-[5px] rounded-full mb-4">💼 Enterprise</span>
          <h3 className="text-[28px] font-bold tracking-[-0.02em] mb-3.5">
            Custom Package<small className="block text-sm font-medium text-gray-2 tracking-normal mt-1">For governments, associations & global traders</small>
          </h3>
          <p className="text-[13px] text-gray-3 leading-[1.5] mb-[18px]">
            Custom dashboards, multi-team access, co-branding, SLA guarantees and dedicated account management. Let&apos;s build your solution.
          </p>
          <a href="#" className="link link--white">Request a proposal →</a>
        </aside>
      </div>
    </section>
  );
}
