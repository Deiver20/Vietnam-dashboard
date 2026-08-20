import { COUNTRIES, IND, REGIONS, TYPES } from "../datasets";

/* ════════════════════════ WHAT'S INSIDE ════════════════════════ */
export default function WhatsInsideSection() {
  return (
    <section className="relative py-[100px] max-[720px]:py-14 bg-[#001730]">
      <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4">
        <div className="mb-10">
          <span className="kicker">What each subscription includes</span>
          <h2 className="text-[clamp(28px,3.4vw,46px)] font-semibold leading-[1.12] tracking-[-0.02em] mb-5">
            Three filtering dimensions.
            <br className="max-[720px]:hidden" />{" "}
            A universe of business answers.
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-5 max-[1100px]:grid-cols-2 max-[720px]:grid-cols-1">
          {/* Industries */}
          <div className="p-7 pb-8 bg-gradient-to-b from-[rgba(10,39,72,0.5)] to-[rgba(10,39,72,0.15)] border border-white/[0.08] rounded-[16px] transition-all hover:border-[rgba(102,166,255,0.25)]">
            <div className="mb-5 pb-5 border-b border-white/[0.08]">
              <span className="inline-block font-[var(--font-jetbrains)] text-xs font-semibold text-[#33cc00] tracking-[0.1em] mb-3">01</span>
              <h3 className="text-[22px] font-semibold tracking-[-0.01em] mb-1.5 text-white">{Object.keys(IND).length} Industries</h3>
              <p className="text-[13px] text-[#94959b] leading-relaxed">From rendering to vegetable oils. The complete agri value chain.</p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {Object.entries(IND).map(([key, item]) => (
                <li key={key} className="flex items-center gap-2.5 text-sm text-[#d8d8d8]">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                  {item.label}
                  <small className="ml-auto text-[11px] text-[#94959b] font-[var(--font-jetbrains)]">{item.chips.join(" · ")}</small>
                </li>
              ))}
              <li className="flex items-center gap-2.5 text-sm text-[#686970]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "#94959B" }} />
                + 2 additional industries
              </li>
            </ul>
          </div>

          {/* Geographies */}
          <div className="p-7 pb-8 bg-gradient-to-b from-[rgba(10,39,72,0.5)] to-[rgba(10,39,72,0.15)] border border-white/[0.08] rounded-[16px] transition-all hover:border-[rgba(102,166,255,0.25)]">
            <div className="mb-5 pb-5 border-b border-white/[0.08]">
              <span className="inline-block font-[var(--font-jetbrains)] text-xs font-semibold text-[#33cc00] tracking-[0.1em] mb-3">02</span>
              <h3 className="text-[22px] font-semibold tracking-[-0.01em] mb-1.5 text-white">{REGIONS.length - 1} Regions · {Object.keys(COUNTRIES).length}+ countries</h3>
              <p className="text-[13px] text-[#94959b] leading-relaxed">Real customs and port data, not surveys.</p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {REGIONS.filter((r) => r.key !== "all").map((reg) => {
                const regionCountries = Object.entries(COUNTRIES).filter(([, c]) => c.region === reg.key);
                const emojis = regionCountries.slice(0, 4).map(([, c]) => c.emoji);
                const more = regionCountries.length > 4 ? `+${regionCountries.length - 4}` : "";
                return (
                  <li key={reg.key} className="block p-3 px-3.5 bg-white/[0.04] border border-white/[0.08] rounded-[10px]">
                    <div className="flex justify-between items-center mb-2">
                      <b className="text-sm font-semibold text-white">{reg.label}</b>
                      <span className="text-[11px] text-[#94959b] font-[var(--font-jetbrains)]">{regionCountries.length} countries</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {emojis.map((e) => (
                        <span key={e} className="text-lg leading-none">{e}</span>
                      ))}
                      {more && <span className="text-[11px] text-[#94959b] bg-white/[0.08] px-2 py-0.5 rounded-full font-[var(--font-jetbrains)]">{more}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Data types */}
          <div className="p-7 pb-8 bg-gradient-to-b from-[rgba(10,39,72,0.5)] to-[rgba(10,39,72,0.15)] border border-white/[0.08] rounded-[16px] transition-all hover:border-[rgba(102,166,255,0.25)]">
            <div className="mb-5 pb-5 border-b border-white/[0.08]">
              <span className="inline-block font-[var(--font-jetbrains)] text-xs font-semibold text-[#33cc00] tracking-[0.1em] mb-3">03</span>
              <h3 className="text-[22px] font-semibold tracking-[-0.01em] mb-1.5 text-white">{Object.keys(TYPES).length} Data types</h3>
              <p className="text-[13px] text-[#94959b] leading-relaxed">Each answers a different business question.</p>
            </div>
            <ul className="flex flex-col gap-2">
              {[
                {
                  key: "imports",
                  bg: "rgba(243,89,89,0.18)",
                  svg: <path d="M19 12H5m7 7l-7-7 7-7" />,
                  p: "Where does my market buy from? Origin, destination, tariff code, CIF.",
                },
                {
                  key: "exports",
                  bg: "rgba(0,102,255,0.18)",
                  svg: <path d="M5 12h14m-7-7l7 7-7 7" />,
                  p: "Who does my competition sell to? FOB volumes and outbound trends.",
                },
                {
                  key: "production",
                  bg: "rgba(51,204,0,0.18)",
                  svg: <path d="M3 21h18M5 21V10m4 11V6m4 15V13m4 8V8m4 13V4" />,
                  p: "Production capacity by country and industry, compared year-on-year.",
                },
                {
                  key: "pricing",
                  bg: "rgba(252,181,20,0.18)",
                  svg: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
                  p: "Historical CIF/FOB prices in USD. Negotiate with real leverage.",
                },
                {
                  key: "trade_volumes",
                  bg: "rgba(167,139,250,0.18)",
                  svg: <path d="M18 20V10M12 20V4M6 20v-6" />,
                  p: "Trade flow volumes and market share by corridor and season.",
                },
                {
                  key: "event",
                  bg: "rgba(236,72,153,0.18)",
                  svg: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
                  p: "Industry events, trade shows, and regulatory milestones.",
                },
                {
                  key: "project",
                  bg: "rgba(148,149,155,0.18)",
                  svg: <path d="M12 2l7 4v6c0 5-3.5 9.5-7 11-3.5-1.5-7-6-7-11V6l7-4z" />,
                  p: "Investment projects, capacity expansions, and plant openings.",
                },
              ].map((t) => {
                const typeData = TYPES[t.key];
                return (
                  <li key={t.key} className="grid grid-cols-[40px_1fr] gap-3.5 items-start py-1">
                    <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{ background: t.bg, color: typeData?.color || "#67A6FF" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {t.svg}
                      </svg>
                    </div>
                    <div>
                      <b className="block text-[15px] font-semibold text-white mb-1">{typeData?.label || t.key}</b>
                      <p className="text-[12.5px] text-[#94959b] leading-relaxed">{t.p}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
