"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { DASHBOARD_TABS } from "@/app/interfaces/trade/interface";
import { LayoutDashboard, Menu, X } from "lucide-react";
import PageIcon from "@/components/dashboard/PageIcon";

export function Sidebar() {
  const pathname = usePathname();
  const { locale, sidebarCollapsed, toggleSidebar } = useDashboard();
  const t = getTranslation(locale);

  const isOpen = !sidebarCollapsed;

  const mobileVisibility = isOpen ? "max-lg:flex" : "max-lg:hidden";

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label={t.common.close}
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {!isOpen && (
        <button
          onClick={toggleSidebar}
          aria-label={t.common.open}
          title={t.common.open}
          className="fixed top-3 left-3 z-40 p-2.5 rounded-sm bg-navy-darker/90 border border-navy-line text-white shadow-lg shadow-black/40 hover:bg-navy-card transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      <aside
        className={`w-72 h-full bg-navy-darker border-r border-navy-line shrink-0 overflow-y-auto flex flex-col
          fixed inset-y-0 left-0 z-50
          lg:hidden
          ${mobileVisibility}`}
      >
        <div className="flex items-center justify-between p-3 border-b border-navy-line min-h-[56px]">
          <Link
            href="/dashboard/imports-overview"
            onClick={toggleSidebar}
            className="flex items-center gap-3 min-w-0"
          >
            <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-blue to-blue-soft flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-white text-sm truncate">
              Agriglobal Market
            </span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-sm text-gray-3 hover:text-white hover:bg-navy-card transition-colors shrink-0"
            aria-label={t.common.close}
            title={t.common.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-navy-line">
          <Link
            href="/dashboard/imports-overview"
            onClick={toggleSidebar}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${
              pathname.startsWith("/dashboard")
                ? "bg-blue/15 text-blue-soft border border-blue/30"
                : "text-gray-3 hover:bg-navy-card hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>{t.nav.dashboard}</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {DASHBOARD_TABS.map((tab, i) => {
            const href = `/dashboard/${tab.id}`;
            const isActive = pathname === href;
            const label = t.nav[tab.labelKey];

            return (
              <Link
                key={tab.id}
                href={href}
                onClick={toggleSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${
                  isActive
                    ? "bg-navy-card text-white border-l-2 border-blue"
                    : "text-gray-4 hover:bg-navy-card hover:text-white"
                }`}
              >
                <PageIcon tabId={tab.id} className="w-[18px] h-[18px] shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-navy-line">
          <div className="flex items-center bg-navy-card/80 rounded-sm border border-navy-line p-1 justify-center">
            {(["en", "es", "fr", "pt"] as const).map((code) => (
              <button
                key={code}
                onClick={() => useDashboard.getState().setLocale(code)}
                className={`px-2 py-1 text-[11px] font-semibold rounded transition-all ${
                  locale === code
                    ? "bg-blue text-white shadow-sm"
                    : "text-gray-3 hover:text-white hover:bg-navy-line"
                }`}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
