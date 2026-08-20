import { plansData } from "../plansData";
import type { PlanCardsProps } from "@/interfaces/pricing/interface";

/* Per-plan accent colors. */
const ACCENT: Record<string, string> = {
  basic: "#FCB514",
  advanced: "#33CC00",
  premium: "#5656F0",
  titanium: "#94959B",
};

export default function PlanCards({ isMonthly }: PlanCardsProps) {
  return (
    // Light mode — matches the light sections on /about and /home.
    <section className="pt-14 pb-20 bg-[#F4F6FA]" data-screen-label="02 Plan Cards">
      <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4">
        <div className="grid grid-cols-4 gap-4 mb-8 max-[1100px]:grid-cols-2 max-[720px]:grid-cols-1">
          {plansData.map((plan) => {
            const accent = ACCENT[plan.id] ?? "#0066FF";
            return (
            <article
              key={plan.id}
              className={`relative p-8 px-6 pt-9 flex flex-col transition-all duration-300 rounded-lg overflow-hidden ${plan.featured ? "border bg-white shadow-none" : "border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.12)]"}`}
              style={
                plan.featured
                  ? {
                      borderColor: accent,
                      background: `linear-gradient(180deg, ${accent}14, #ffffff)`,
                      boxShadow: `0 30px 60px -20px ${accent}59`,
                    }
                  : undefined
              }
            >
              {/* Accent top bar — the plan's color at a glance. */}
              <span className="absolute top-0 left-0 right-0 h-[4px]" style={{ background: accent }} aria-hidden="true" />
              {plan.featured && (
                <span className="absolute top-[16px] right-6 text-white text-[11px] font-semibold tracking-[0.08em] uppercase px-3 py-1 rounded-full" style={{ background: accent }}>
                  Most popular
                </span>
              )}
              <header className="mb-6">
                <h3 className="text-[22px] font-semibold tracking-[-0.01em] mb-1" style={{ color: plan.id === "titanium" ? "#6b7280" : accent }}>{plan.name}</h3>
                <p className="text-[13px] text-gray-500 leading-[1.5]">{plan.desc}</p>
              </header>
              <div className="text-[38px] font-bold tracking-[-0.03em] tabular-nums mb-1 text-gray-900">
                <span className="text-[22px] text-gray-400 mr-0.5 align-top leading-[1.6]">$</span>
                <span>{(isMonthly ? plan.monthly : plan.annual).toLocaleString()}</span>
                <small className="text-sm font-medium text-gray-400 tracking-normal">{isMonthly ? "/mo" : "/year"}</small>
              </div>
              <div className="inline-block text-[11px] font-semibold text-[#279b00] bg-[rgba(51,204,0,0.12)] px-2 py-[3px] rounded mb-6">
                {isMonthly ? "Billed monthly" : plan.save}
              </div>
              <ul className="flex flex-col gap-2.5 text-[13px] text-gray-600 mb-7 flex-grow">
                {plan.feats.map((feat, idx) => (
                  <li key={idx} className="pl-[22px] relative leading-[1.5]">
                    <span className="absolute left-0 top-[6px] w-[14px] h-[9px] border-l-2 border-b-2 border-green rotate-[-45deg] rounded-[1px]" />
                    {feat.bold && !feat.boldEnd && <b className="text-gray-900 font-semibold">{feat.bold}</b>}
                    {feat.bold && feat.boldEnd && (
                      <>
                        <span>{feat.bold}</span>
                        <b className="text-gray-900 font-semibold">{feat.text}</b>
                      </>
                    )}
                    {!feat.boldEnd && feat.text}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className={`btn btn--block ${plan.featured ? "btn--primary" : "btn--ghost !text-gray-700 !border-gray-300 hover:!bg-gray-100 hover:!text-gray-900 hover:!border-gray-400"}`}
                style={plan.featured ? { background: accent, boxShadow: `0 4px 14px ${accent}66` } : undefined}
              >
                {plan.cta}
              </a>
            </article>
            );
          })}
        </div>

        <p className="text-center text-sm text-gray-500 pt-[30px]">
          Need a custom package? We build tailored solutions for governments, associations and global traders.{" "}
          <a href="#" className="link">Request a proposal →</a>
        </p>

        {/* Single chart */}
        <div className="mt-8 py-7 px-8 bg-white bg-gradient-to-br from-[rgba(0,102,255,0.06)] to-[rgba(51,204,0,0.04)] border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-lg flex items-center justify-between flex-wrap gap-5">
          <div>
            <div className="text-xs font-bold tracking-[0.1em] uppercase text-[#0066ff] mb-1.5">No plan needed</div>
            <div className="text-xl font-semibold text-gray-900 mb-1">Single chart access</div>
            <div className="text-[13px] text-gray-500">Buy access to an individual dashboard without a subscription.</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[36px] font-bold text-gray-900 tracking-[-0.02em]">
              $499<small className="text-sm font-medium text-gray-400">/year</small>
            </div>
            <a href="#" className="btn btn--primary mt-2.5 inline-flex">Buy a Chart →</a>
          </div>
        </div>
      </div>
    </section>
  );
}
