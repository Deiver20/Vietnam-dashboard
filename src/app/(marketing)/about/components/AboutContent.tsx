"use client";

import Link from "next/link";
import Placeholder from "@/components/Placeholder";
import SatelliteHeroBackdrop from "@/components/SatelliteHeroBackdrop";

/* ── Data ─────────────────────────────────────────────── */
const services = [
  {
    ico: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 17l5-5 4 4 8-8"/><polyline points="14 8 21 8 21 15"/></svg>,
    title: "Market Intelligence Platform",
    desc: "Customs and port data turned into actionable dashboards. Imports, exports, production, and CIF/FOB pricing — by country, product and year.",
    link: "/data", linkText: "Explore Data →",
  },
  {
    ico: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M8 4v16"/></svg>,
    title: "Custom Native Dashboards",
    desc: "Tailored intelligence reports with your brand identity, custom filters, and responsive Web & Mobile design — with satisfaction guarantee.",
    link: "#", linkText: "Request a proposal →",
  },
  {
    ico: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
    title: "B2B Marketplace",
    desc: "Buy and sell agri-food products across 18 categories — from rendering byproducts and grains to machinery and pet food ingredients.",
    link: "/marketplace", linkText: "Visit Marketplace →",
  },
  {
    ico: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    title: "Event Organization",
    desc: "Full-service event production for the agri-food industry — including REAM, the Americas' largest rendering & agri-food convention.",
    link: "/events", linkText: "View Events →",
  },
  {
    ico: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
    title: "Web & App Development",
    desc: "Custom web applications and native mobile apps for iOS and Android. API integrations, CRM systems and data flow management.",
    link: "#", linkText: "Learn more →",
  },
  {
    ico: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    title: "AI Help Center",
    desc: "24/7 intelligent customer support powered by AI. Instant responses to technical questions, platform guidance and industry inquiries.",
    link: "#", linkText: "Visit Help Center →",
    icoStyle: { background: "linear-gradient(135deg,rgba(51,204,0,0.18),rgba(51,204,0,0.05))", borderColor: "rgba(51,204,0,0.25)", color: "var(--color-green)" },
  },
  {
    ico: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
    title: "SEO & Code Optimization",
    desc: "Search engine research, code optimization for better performance, and exhaustive testing processes for digital products.",
    link: "#", linkText: "Learn more →",
    icoStyle: { background: "linear-gradient(135deg,rgba(252,181,20,0.18),rgba(252,181,20,0.05))", borderColor: "rgba(252,181,20,0.25)", color: "var(--color-yellow)" },
  },
  {
    ico: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    title: "CRM & Social Media",
    desc: "Web and iOS/Android CRM systems. Multi-user platforms with online chat, content publishing and social media integration.",
    link: "#", linkText: "Learn more →",
    icoStyle: { background: "linear-gradient(135deg,rgba(238,132,52,0.18),rgba(238,132,52,0.05))", borderColor: "rgba(238,132,52,0.25)", color: "#EE8434" },
  },
];

const industries = [
  { ico: "🏭", name: "Rendering" },
  { ico: "🐾", name: "Pet Food" },
  { ico: "⛽", name: "Biofuels" },
  { ico: "🌾", name: "Animal Feed" },
  { ico: "🥩", name: "Meat & Livestock" },
  { ico: "🌽", name: "Grains & Cereals" },
  { ico: "🌿", name: "Fertilizers" },
  { ico: "🫙", name: "Vegetable Oils" },
  { ico: "🧪", name: "Additives" },
  { ico: "🐟", name: "Aquaculture" },
  { ico: "☕", name: "Coffee & Cocoa" },
  { ico: "⚗️", name: "Enzymes & Chemicals" },
];

/* Same logo sets as the Home page (PartnersClients). */
const clients = Array.from({ length: 12 }, (_, i) => ({
  src: `/logos/clients/client_${i + 1}.svg`,
  alt: `Client ${i + 1}`,
}));
const partners = Array.from({ length: 5 }, (_, i) => ({
  src: `/logos/partners/partner_${i + 1}.svg`,
  alt: `Partner ${i + 1}`,
}));

const flags = [
  { img: true, code: "USA" },
  { img: true, code: "BRA" },
  { img: true, code: "ARG" },
  { img: false, code: "🇲🇽 MEX" },
  { img: false, code: "🇨🇳 CHN" },
  { img: false, code: "🇩🇪 DEU" },
  { img: false, code: "🇳🇱 NLD" },
  { img: false, code: "🇮🇳 IND" },
  { img: false, code: "🇦🇺 AUS" },
  { img: false, code: "🇿🇦 ZAF" },
  { img: false, code: "🇨🇴 COL" },
  { img: false, code: "🇯🇵 JPN" },
  { img: false, code: "🇳🇬 NGA" },
  { img: false, code: "🇫🇷 FRA" },
  { img: false, code: "🇪🇸 ESP" },
  { img: false, code: "🇨🇱 CHL" },
  { img: false, code: "🇮🇩 IDN" },
  { img: false, code: "🇹🇭 THA" },
  { img: false, code: "🇵🇪 PER" },
  { img: false, code: "+51 more →" },
];

const flagFiles: Record<string, string> = {
  USA: "assets/flag_usa.png",
  BRA: "assets/flag_brazil.png",
  ARG: "assets/flag_argentina.png",
};

/* ── Page ─────────────────────────────────────────────── */
export default function AboutContent() {
  return (
    <>
      {/* Page-wide immersive backdrop: the hero's animated background now sits
          fixed behind the WHOLE page (image + stars + flow field + satellites),
          so sections scroll over one continuous world instead of a boxed hero. */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <SatelliteHeroBackdrop />
      </div>

      <div className="relative z-10">
      {/* ════════ HERO ════════ (no local background — the page backdrop shows) */}
      <section className="relative pt-[110px] pb-8 min-h-[400px]">
        <div className="relative z-10 max-w-[1400px] mx-auto px-8 max-[720px]:px-4">
          <div className="flex items-center gap-12 max-[960px]:flex-col max-[960px]:items-start">
            <div className="flex-1 min-w-0">
              <span className="eyebrow drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
                <span className="dot dot--green" />
                +10 years in agri-food intelligence
              </span>
              <h1 className="text-[clamp(24px,2.8vw,40px)] font-semibold leading-[1.15] tracking-[-0.02em] mt-2 text-balance drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
                We connect <span className="grad-blue">markets,</span> <span className="grad-green">globally.</span>
              </h1>
              <p className="text-[15px] text-[#d8d8d8] leading-[1.6] max-w-[540px] mt-3 drop-shadow-[0_1px_10px_rgba(0,0,0,0.75)]">
                Agriglobal Market is a technology and intelligence platform for the agri-food and rendering industry. We turn trade data into decisions — present in +70 countries, across 11 industries.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ════════ SERVICES ════════ (light mode — mirrors the home "Data Charts · The AGM Product" section) */}
      <section className="py-[100px] max-[720px]:py-14 bg-[#F4F6FA]" id="services">
        <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4">
          <div className="mb-12">
            <span className="kicker">What we do</span>
            <h2 className="text-[clamp(26px,2.8vw,38px)] font-semibold tracking-[-0.02em] leading-[1.1] text-gray-900">
              A complete ecosystem<br className="max-[720px]:hidden" />{" "}for the agri-food industry.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((svc) => (
              <div key={svc.title} className="flex flex-col p-6 rounded-[var(--radius-md)] bg-white border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-[rgba(0,102,255,0.35)] hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-1">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-[18px] border"
                  style={svc.icoStyle || { background: "linear-gradient(135deg, rgba(0,102,255,0.12), rgba(0,102,255,0.03))", borderColor: "rgba(0,102,255,0.2)", color: "#0066ff" }}
                >
                  {svc.ico}
                </div>
                <h3 className="text-[17px] font-semibold tracking-[-0.01em] mb-2.5 text-gray-900">{svc.title}</h3>
                <p className="text-[13px] text-gray-500 leading-[1.6] flex-1">{svc.desc}</p>
                <Link href={svc.link} className="link text-xs mt-3.5 inline-block">{svc.linkText}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ INDUSTRIES ════════ */}
      {/* No section background — the page backdrop shows through here. */}
      <section className="py-20">
        <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4">
          <div className="text-center mb-10">
            <span className="kicker justify-center">Industry coverage</span>
            <h2 className="text-[clamp(26px,2.8vw,38px)] font-semibold tracking-[-0.02em] leading-[1.1]">11 industries. One platform.</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {industries.map((ind) => (
              <div key={ind.name} className="px-4 py-[18px] bg-white/[0.03] backdrop-blur-md border border-white/[0.07] rounded-[var(--radius-md)] text-center text-xs font-semibold text-[#bfbfbf] transition-all duration-200 tracking-[0.02em] hover:bg-[rgba(0,102,255,0.1)] hover:border-[rgba(0,102,255,0.3)] hover:text-white">
                <div className="text-[22px] mb-2">{ind.ico}</div>
                {ind.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CLIENTS & PARTNERS ════════ */}
      <section className="py-20 bg-[#001730]">
        <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-[60px] max-[720px]:gap-8">
            <div>
              <div className="mb-7">
                <span className="kicker">Our clients</span>
                <h3 className="text-xl font-medium text-[#d8d8d8]">Trusted by industry leaders<br className="max-[720px]:hidden" />{" "}across 5 continents.</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {clients.map((logo, i) => (
                  <img
                    key={`c-${i}`}
                    src={logo.src}
                    alt={logo.alt}
                    className="w-full aspect-[3/1] max-h-[40px] object-contain opacity-60 hover:opacity-100 hover:-translate-y-[3px] transition-all duration-300"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="mb-7">
                <span className="kicker">Our partners</span>
                <h3 className="text-xl font-medium text-[#d8d8d8]">Strategic alliances with<br className="max-[720px]:hidden" />{" "}leading trade associations.</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {partners.map((logo, i) => (
                  <img
                    key={`p-${i}`}
                    src={logo.src}
                    alt={logo.alt}
                    className="w-full aspect-[3/1] max-h-[40px] object-contain opacity-60 hover:opacity-100 hover:-translate-y-[3px] transition-all duration-300"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ PRESENCE ════════ */}
      {/* Light-mode styling — mirrors the "Data Charts · The AGM Product" section on the home page. */}
      <section className="py-[60px] bg-[#F4F6FA]">
        <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-[60px] max-[720px]:gap-8 items-center">
          <div>
            <span className="kicker">Global reach</span>
            <h2 className="text-[clamp(28px,3vw,42px)] font-semibold tracking-[-0.02em] mb-4 text-gray-900">
              Present in<br className="max-[720px]:hidden" />{" "}<span className="grad-green">+70 countries.</span>
            </h2>
            <p className="text-base text-gray-500 leading-[1.65]">
              From the Argentine pampas to Asian ports, AGM captures real trade flows across the Americas, Europe, Asia, Africa and Oceania.
            </p>
            <div className="flex gap-3 flex-wrap mt-6">
              {[
                { r: "Americas", c: "34 countries" },
                { r: "Europe", c: "18 countries" },
                { r: "Asia", c: "12 countries" },
              ].map((x) => (
                <div key={x.r} className="text-[13px] text-gray-500">
                  <b className="block text-[22px] text-gray-900 font-bold">{x.r}</b>
                  {x.c}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {flags.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-[11px] py-[5px] bg-white border border-gray-200 rounded-full text-[11px] font-semibold font-[var(--font-jetbrains)] text-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                {f.img ? <Placeholder className="w-3.5 h-3.5 rounded-full" text={f.code[0]} originalFile={flagFiles[f.code]} /> : null}
                {f.code}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <Placeholder className="w-full h-full object-cover opacity-10" text="Contact" originalFile="assets/contact_banner.webp" />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,23,48,0.88)] to-[#001730]" />
        </div>
        <div className="relative z-[2] max-w-[1400px] mx-auto px-8 max-[720px]:px-4 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12 items-center">
          <div>
            <span className="eyebrow mb-7">
              <span className="dot dot--green" />
              2 free dashboards on sign-up
            </span>
            <h2 className="text-[clamp(28px,3vw,44px)] font-semibold leading-[1.1] tracking-[-0.02em] mb-[18px]">
              Let&apos;s build the future<br className="max-[720px]:hidden" />{" "}of agri-food intelligence.
            </h2>
            <p className="text-base text-[#d8d8d8] leading-[1.65] mb-7">
              Join thousands of companies using AGM to make smarter decisions in global agri-food markets.
            </p>
            <div className="flex gap-3 flex-wrap">
              <a href="#" className="btn btn--primary btn--lg">
                <span>Get Started Free</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </a>
              <a href="mailto:service@agriglobalmarket.com" className="btn btn--ghost btn--lg">Contact Us</a>
            </div>
          </div>
          <aside className="rounded-[var(--radius-xl)] p-8 border border-white/[0.07]" style={{ background: "linear-gradient(180deg, rgba(10,39,72,0.55), rgba(10,39,72,0.2))" }}>
            <span className="inline-block mb-3 text-[10px] font-bold tracking-[0.1em] uppercase text-[#FCB514] bg-[rgba(252,181,20,0.12)] px-3 py-1 rounded-full">⭐ Flagship Event</span>
            <h3 className="text-[22px] font-bold tracking-[-0.02em] mb-1">
              REAM 2026
              <small className="block text-[13px] font-medium text-[#bfbfbf] tracking-normal mt-1">Mendoza, Argentina · Sep 8–10</small>
            </h3>
            <p className="text-[13px] text-[#bfbfbf] leading-[1.6] mb-4">
              The largest business convention in the agri-food and rendering industries. 500+ attendees from 30+ countries.
            </p>
            <a href="https://renderingamerica.com" target="_blank" rel="noopener" className="link link--white">renderingamerica.com →</a>
          </aside>
        </div>
      </section>
      </div>
    </>
  );
}
