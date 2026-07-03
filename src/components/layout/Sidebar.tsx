"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { DASHBOARD_TABS } from "@/app/interfaces/trade/interface";
import { LayoutDashboard, X } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { locale, mobileMenuOpen, setMobileMenuOpen } = useDashboard();
  const t = getTranslation(locale);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`
          fixed top-0 left-0 z-50 w-72 h-full flex-col bg-navy-darker border-r border-navy-line shadow-2xl
          transform transition-transform duration-300 ease-out
          lg:hidden
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-navy-line">
          <Link
            href="/dashboard/imports-overview"
            onClick={handleLinkClick}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-blue to-blue-soft flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white leading-tight text-sm">Agriglobal Market</h2>
              <p className="text-xs text-gray-4">{t.dashboard.title}</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-sm text-gray-3 hover:text-white hover:bg-navy-card transition-colors"
            aria-label={t.common.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-navy-line">
          <Link
            href="/dashboard/imports-overview"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${
              pathname.startsWith("/dashboard")
                ? "bg-blue/15 text-blue-soft border border-blue/30"
                : "text-gray-3 hover:bg-navy-card hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            {t.nav.dashboard}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {DASHBOARD_TABS.map((tab) => {
            const href = `/dashboard/${tab.id}`;
            const isActive = pathname === href;

            return (
              <Link
                key={tab.id}
                href={href}
                onClick={handleLinkClick}
                className={`block px-3 py-2.5 rounded-sm text-sm transition-colors ${
                  isActive
                    ? "bg-navy-card text-white border-l-2 border-blue"
                    : "text-gray-4 hover:bg-navy-card hover:text-white"
                }`}
              >
                {t.nav[tab.labelKey]}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
