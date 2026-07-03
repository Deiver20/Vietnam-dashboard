"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { DASHBOARD_TABS } from "@/app/interfaces/trade/interface";

export function DashboardTabs() {
  const pathname = usePathname();
  const { locale } = useDashboard();
  const t = getTranslation(locale);

  return (
    <div className="border-b border-navy-line bg-navy-darker/50 backdrop-blur-sm overflow-x-auto">
      <div className="flex min-w-max px-4 py-2 gap-2">
        {DASHBOARD_TABS.map((tab) => {
          const href = `/dashboard/${tab.id}`;
          const isActive = pathname === href;

          return (
            <Link
              key={tab.id}
              href={href}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                isActive
                  ? "bg-gradient-to-r from-blue to-blue-2 text-white shadow-md shadow-blue/20"
                  : "text-gray-4 hover:text-white hover:bg-navy-card border border-transparent"
              }`}
            >
              {t.nav[tab.labelKey]}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
