"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { Globe, Rocket, ChevronDown, Check } from "lucide-react";
import { Flag } from "@/components/ui/Flag";
import { cn } from "@/lib/utils";
import { Locale } from "@/app/interfaces";

const languages: { value: Locale; label: string; country: string }[] = [
  { value: "en", label: "English", country: "United States" },
  { value: "es", label: "Español", country: "Spain" },
  { value: "fr", label: "Français", country: "France" },
  { value: "pt", label: "Português", country: "Brazil" },
];

export function Navbar() {
  const { locale, setLocale } = useDashboard();
  const t = getTranslation(locale);
  const pathname = usePathname();
  const isOldDashboard = pathname?.startsWith("/dashboard/");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = languages.find((l) => l.value === locale) ?? languages[0];

  return (
    <header className="hidden lg:flex h-16 border-b border-navy-line bg-navy-deep/95 backdrop-blur items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-sm bg-gradient-to-br from-blue via-blue-2 to-blue-soft flex items-center justify-center shadow-lg shadow-blue/20">
          <Globe className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-white leading-tight text-sm sm:text-base">
            <span className="grad-blue">Agriglobal</span> Market
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-4 hidden sm:block">{t.dashboard.title}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isOldDashboard && (
          <Link
            href="/industries/rendering/vietnam/imports"
            className="inline-flex items-center gap-1.5 rounded-sm bg-blue px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg shadow-blue/20 transition-all hover:bg-blue-2"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nuevo Dashboard</span>
          </Link>
        )}
        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-sm bg-navy-card/80 border border-navy-line px-2.5 py-1.5 text-[11px] font-semibold text-gray-3 hover:text-white transition-colors"
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <Flag country={current.country} className="w-5 h-3.5 rounded" />
            <span>{current.label}</span>
            <ChevronDown
              className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")}
            />
          </button>
          {open && (
            <div
              role="listbox"
              className="absolute right-0 top-full mt-2 w-44 rounded-md border border-navy-line bg-navy-card shadow-xl overflow-hidden z-50"
            >
              {languages.map((l) => (
                <button
                  key={l.value}
                  role="option"
                  aria-selected={locale === l.value}
                  onClick={() => {
                    setLocale(l.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-3 py-2 text-[11px] font-semibold text-left transition-colors",
                    locale === l.value
                      ? "bg-blue text-white"
                      : "text-gray-3 hover:bg-navy-line hover:text-white"
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
      </div>
    </header>
  );
}
