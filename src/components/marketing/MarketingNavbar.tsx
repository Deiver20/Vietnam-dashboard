"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Flag } from "@/components/ui/Flag";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/store/useDashboard";
import { Locale } from "@/app/interfaces";
import { MarketingMobileMenu } from "./MarketingMobileMenu";
import MarketingPlaceholder from "./MarketingPlaceholder";

const links = [
  { href: "/", label: "Home" },
  { href: "/data", label: "Data" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/news", label: "News" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About Us" },
  { href: "/pricing", label: "Pricing" },
];

const DATA_ROUTES = ["/data", "/dashboard", "/industries"];

function isActive(pathname: string, href: string) {
  const roots = href === "/data" ? DATA_ROUTES : [href];
  return roots.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

const languages: { value: Locale; label: string; country: string }[] = [
  { value: "en", label: "English", country: "United States" },
  { value: "es", label: "Español", country: "Spain" },
  { value: "fr", label: "Français", country: "France" },
  { value: "pt", label: "Português", country: "Brazil" },
];

export function MarketingNavbar() {
  const pathname = usePathname();
  const { locale, setLocale } = useDashboard();
  const current = languages.find((l) => l.value === locale) ?? languages[0];

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setLangOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-lang-dropdown]")) setLangOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const headerBg = scrolled
    ? "bg-[rgba(0,23,48,0.95)] backdrop-blur-[16px] border-b border-white/[0.06]"
    : "bg-[#001730]";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 flex items-center h-[68px] ${headerBg}`}
    >
      <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4 w-full grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <Link href="/" className="shrink-0 justify-self-start" aria-label="Agriglobal Market home">
          <MarketingPlaceholder className="h-9 w-auto min-w-[80px]" text="AGM" originalFile="assets/logoAGMLightShort.svg" />
        </Link>

        <nav className="hidden lg:flex gap-7 justify-self-center" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`relative text-[13px] font-medium tracking-[0.08em] uppercase transition-colors py-1.5 ${
                isActive(pathname, l.href)
                  ? "text-white after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-0.5 after:bg-[#0066ff] after:rounded-sm"
                  : "text-white/75 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="col-start-3 flex items-center gap-3 justify-self-end">
          <div className="relative" data-lang-dropdown>
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 bg-white/[0.08] backdrop-blur-md border border-white/[0.12] rounded-full pl-2 pr-2.5 py-1 text-xs font-semibold"
              aria-label="Language selector"
              aria-expanded={langOpen}
              aria-haspopup="listbox"
            >
              <Flag country={current.country} className="w-5 h-3.5 rounded" />
              <span className="max-[720px]:hidden">{current.label}</span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", langOpen && "rotate-180")} />
            </button>
            {langOpen && (
              <div
                role="listbox"
                className="absolute right-0 top-full mt-2 w-44 rounded-md border border-white/[0.14] bg-[rgba(2,16,34,0.97)] backdrop-blur-[20px] shadow-xl overflow-hidden z-50"
              >
                {languages.map((l) => (
                  <button
                    key={l.value}
                    role="option"
                    aria-selected={locale === l.value}
                    onClick={() => {
                      setLocale(l.value);
                      setLangOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2.5 w-full px-3 py-2 text-[11px] font-semibold text-left transition-colors",
                      locale === l.value
                        ? "bg-[rgba(0,102,255,0.2)] text-white"
                        : "text-white/75 hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    <Flag country={l.country} className="w-5 h-3.5 rounded" />
                    <span className="flex-1">{l.label}</span>
                    {locale === l.value && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link href="/pricing" className="btn btn--ghost-sm max-[720px]:hidden">
            Log In
          </Link>
          <Link href="/pricing" className="btn btn--primary-sm max-[400px]:hidden">
            Sign Up Free
          </Link>
          <button
            className="lg:hidden w-11 h-11 -mr-1.5 flex items-center justify-center rounded-full text-white/85 hover:text-white cursor-pointer"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      {menuOpen && (
        <MarketingMobileMenu
          links={links}
          isActive={(href) => isActive(pathname, href)}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
}
