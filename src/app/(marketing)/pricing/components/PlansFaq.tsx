import { faqData } from "../plansData";

export default function PlansFaq() {
  return (
    // No section background — the page's fixed starfield backdrop shows through;
    // the cards below carry a backdrop blur to keep the text readable.
    <section className="pt-[60px] pb-[100px]" data-screen-label="05 FAQ">
      <div className="max-w-[900px] mx-auto px-8 max-[720px]:px-4">
        <div className="mx-auto mb-[60px] text-center max-w-[720px]">
          <span className="kicker">FAQ</span>
          <h2 className="text-[clamp(28px,3.4vw,46px)] font-semibold leading-[1.12] tracking-[-0.02em] [text-wrap:balance]">Common questions before signing up.</h2>
        </div>
        <div className="mt-9">
          {faqData.map((item) => (
            <details
              key={item.q}
              className="group backdrop-blur-md bg-gradient-to-b from-[rgba(10,39,72,0.55)] to-[rgba(10,39,72,0.3)] border border-white/[0.08] rounded-md overflow-hidden transition-colors duration-300 mb-2.5 hover:border-[rgba(102,166,255,0.25)] open:border-[rgba(0,102,255,0.4)] open:bg-gradient-to-b open:from-[rgba(0,102,255,0.12)] open:to-[rgba(10,39,72,0.35)]"
            >
              <summary className="list-none cursor-pointer py-[18px] px-[22px] flex justify-between items-center text-[15px] font-medium gap-4 [&::-webkit-details-marker]:hidden">
                <span>{item.q}</span>
                <i className="not-italic w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-[18px] font-light text-blue-soft transition-transform duration-300 flex-shrink-0 group-open:rotate-45">+</i>
              </summary>
              <p className="px-[22px] pb-[22px] text-sm text-gray-2 leading-[1.65]">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
