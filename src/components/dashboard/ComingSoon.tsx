"use client";

import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { Construction } from "lucide-react";

export function ComingSoon() {
  const { locale } = useDashboard();
  const t = getTranslation(locale);

  return (
    <div className="flex flex-col items-center justify-center h-[400px] bg-navy-card border border-navy-line rounded-lg">
      <Construction className="w-12 h-12 text-blue-soft mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">{t.nav.comingSoon}</h3>
      <p className="text-sm text-gray-4">{t.panel.askAboutData}</p>
    </div>
  );
}
