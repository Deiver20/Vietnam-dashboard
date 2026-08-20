/* ════════════════════════ FAQ ════════════════════════ */
export default function DataFaqSection() {
  return (
    // No section background — the page's fixed satellite backdrop shows
    // through (same pattern as the /pricing FAQ); the blurred cards float
    // over it.
    <section className="py-20 pb-[100px]">
      <div className="max-w-[900px] mx-auto px-8 max-[720px]:px-4">
        <div className="mb-10">
          <span className="kicker">Frequently asked questions</span>
          <h2 className="text-[clamp(28px,3.4vw,46px)] font-semibold leading-[1.12] tracking-[-0.02em]">What people ask us before signing up.</h2>
        </div>
        <div className="flex flex-col gap-2.5">
          {[
            {
              q: "Is the data official or estimated?",
              a: "Official data from customs, port, and trade agencies. Each dashboard shows its source. We don't publish estimates disguised as facts.",
            },
            {
              q: "Can I embed the dashboards on my site?",
              a: "Yes. All plans include an embed URL. Premium and Titanium plans allow co-branded dashboards with your identity.",
            },
            {
              q: "How many users can I add?",
              a: "Basic: 1 · Advanced: 3 · Premium: 5 · Titanium: 8. Additional users from $800/year.",
            },
            {
              q: "What if the industry I need isn't listed?",
              a: "We have a PowerBI Solutions team that builds custom dashboards with brand identity and tailored filters. Talk to sales.",
            },
            {
              q: "Can I pay in installments?",
              a: "Yes: Basic 1, Advanced 2, Premium 3, and Titanium up to 4. Bank transfer gets an additional 3% discount.",
            },
            {
              q: "Do you have a refund policy?",
              a: "Yes, we have a detailed refund and cancellation policy in our terms and conditions.",
            },
          ].map((faq) => (
            <details
              key={faq.q}
              className="group backdrop-blur-md bg-gradient-to-b from-[rgba(10,39,72,0.55)] to-[rgba(10,39,72,0.3)] border border-white/[0.08] rounded-[12px] overflow-hidden transition-colors hover:border-[rgba(102,166,255,0.25)] open:border-[rgba(0,102,255,0.4)] open:bg-gradient-to-b open:from-[rgba(0,102,255,0.12)] open:to-[rgba(10,39,72,0.35)]"
            >
              <summary className="list-none cursor-pointer px-5 py-[18px] flex justify-between items-center text-[15px] font-medium gap-4">
                <span>{faq.q}</span>
                <i className="not-italic w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-lg font-light text-[#67A6FF] transition-transform duration-300 shrink-0 group-open:rotate-45">
                  +
                </i>
              </summary>
              <p className="px-5 pb-5 text-sm text-[#d8d8d8] leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
