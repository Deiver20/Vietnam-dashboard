import Link from "next/link";
import MarketingPlaceholder from "./MarketingPlaceholder";

export function MarketingFooter() {
  return (
    <footer className="relative z-10 bg-[#000C1A] pt-[70px]">
      <div className="max-w-[1400px] mx-auto px-8 pb-[50px] grid grid-cols-[1.3fr_2fr] gap-[60px] max-[720px]:gap-8 max-[1100px]:grid-cols-1 max-[720px]:px-4">
        <div>
          <MarketingPlaceholder className="h-[90px] w-auto max-w-[220px] mb-5 object-contain" text="Logo" originalFile="assets/Logo_variations.png" />
          <p className="text-[13px] text-[#94959b] leading-relaxed max-w-[360px] mb-6">
            Agri-food and rendering market intelligence platform. +10 years driving digital
            transformation across +70 countries.
          </p>
          <div className="flex gap-2.5">
            {[
              { label: "LinkedIn", text: "L", originalFile: "assets/linkedin.webp" },
              { label: "Facebook", text: "F", originalFile: "assets/facebook.webp" },
              { label: "X", text: "X", originalFile: "assets/socialX.webp" },
              { label: "Instagram", text: "I", originalFile: "assets/instagram.webp" },
              { label: "YouTube", text: "Y", originalFile: "assets/youtube.webp" },
              { label: "Email", text: "E", originalFile: "assets/email.webp" },
            ].map((item) => (
              <a
                key={item.label}
                href="#"
                aria-label={item.label}
                className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center transition-all hover:bg-[#0066ff] hover:-translate-y-0.5"
              >
                <MarketingPlaceholder className="w-[18px] h-[18px] rounded-sm" text={item.text} originalFile={item.originalFile} />
              </a>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 max-[720px]:grid-cols-2">
          <div>
            <h5 className="text-xs font-semibold tracking-[0.1em] uppercase text-white mb-3.5">
              Links
            </h5>
            <ul className="flex flex-col gap-2">
              {[
                { href: "/data", label: "Data" },
                { href: "/marketplace", label: "Marketplace" },
                { href: "/events", label: "Events" },
                { href: "/about", label: "About Us" },
                { href: "/pricing", label: "Pricing" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[13px] text-[#94959b] hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-semibold tracking-[0.1em] uppercase text-white mb-3.5">
              Users
            </h5>
            <ul className="flex flex-col gap-2">
              {[
                { href: "/pricing", label: "Login" },
                { href: "/pricing", label: "Sign Up Free" },
                { href: "#", label: "Contact" },
                { href: "#", label: "Help Center" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[13px] text-[#94959b] hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/[0.06] py-5 px-8 max-w-[1400px] mx-auto flex justify-between flex-wrap gap-3 text-xs text-[#94959b] max-[720px]:px-4">
        <span>©2026 Agriglobal Market — All Rights Reserved</span>
        <span>Built for decision makers in global agri-food.</span>
      </div>
    </footer>
  );
}
