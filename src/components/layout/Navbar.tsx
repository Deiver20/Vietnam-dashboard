"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { Globe, Rocket } from "lucide-react";
import { Locale } from "@/app/interfaces";

export function Navbar() {
  const { locale, setLocale } = useDashboard();
  const t = getTranslation(locale);
  const pathname = usePathname();
  const isOldDashboard = pathname?.startsWith("/dashboard/");

  const languages: { value: Locale; label: string }[] = [
    { value: "en", label: "EN" },
    { value: "es", label: "ES" },
    { value: "fr", label: "FR" },
    { value: "pt", label: "PT" },
  ];

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
