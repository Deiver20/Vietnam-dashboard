"use client";

import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { Globe, Menu } from "lucide-react";
import { Locale } from "@/app/interfaces";

export function Navbar() {
  const { locale, setLocale, setMobileMenuOpen } = useDashboard();
  const t = getTranslation(locale);

  const languages: { value: Locale; label: string }[] = [
    { value: "en", label: "EN" },
    { value: "es", label: "ES" },
    { value: "fr", label: "FR" },
    { value: "pt", label: "PT" },
  ];

  return (
    <header className="h-16 border-b border-navy-line bg-navy-deep/95 backdrop-blur flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 -ml-2 rounded-sm text-gray-3 hover:text-white hover:bg-navy-card transition-colors"
          aria-label={t.common.open}
        >
          <Menu className="w-5 h-5" />
        </button>

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
        <div className="flex items-center bg-navy-card/80 rounded-sm border border-navy-line p-1">
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => setLocale(lang.value)}
              className={`px-2 py-1 text-[11px] font-semibold rounded transition-all ${
                locale === lang.value
                  ? "bg-blue text-white shadow-sm"
                  : "text-gray-3 hover:text-white hover:bg-navy-line"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
