"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DASHBOARD_TABS } from "@/app/interfaces/trade/interface";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import PageIcon from "./PageIcon";

const DEFAULT_COLOR = "#0066FF";

export function DashboardTabs() {
  const pathname = usePathname();
  const { locale } = useDashboard();
  const t = getTranslation(locale);

  return (
    <div className="border-b border-white/[0.07] bg-[#000C1A] hidden lg:block">
      <div className="flex" role="tablist" aria-label={t.nav.dashboardPages}>
        {DASHBOARD_TABS.map((tab, i) => {
          const href = `/dashboard/${tab.id}`;
          const isActive = pathname === href;
          const showDivider = i > 0;

          return (
            <Fragment key={tab.id}>
              {showDivider && (
                <div className="w-px self-stretch bg-white/[0.06] shrink-0" aria-hidden="true" />
              )}
              <Link
                href={href}
                className={`relative flex flex-col items-center justify-center gap-1 flex-1 min-w-0 py-2.5 px-1 text-[10px] font-medium transition-all ${
                  isActive
                    ? "text-white"
                    : "text-[#94959b] hover:text-[#c5c6cc] hover:bg-white/[0.03]"
                }`}
                style={
                  isActive
                    ? {
                        background: `${DEFAULT_COLOR}22`,
                        boxShadow: `inset 0 0 0 1px ${DEFAULT_COLOR}55, 0 0 12px ${DEFAULT_COLOR}22`,
                      }
                    : {}
                }
                role="tab"
                aria-selected={isActive}
              >
                <span style={{ color: isActive ? DEFAULT_COLOR : undefined }}>
                  <PageIcon index={i} color={isActive ? DEFAULT_COLOR : undefined} />
                </span>
                <span className="leading-tight text-center whitespace-normal">
                  {t.nav[tab.labelKey]}
                </span>
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ background: DEFAULT_COLOR }}
                  />
                )}
              </Link>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
