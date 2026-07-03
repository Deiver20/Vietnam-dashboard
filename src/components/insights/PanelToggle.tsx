"use client";

import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { Lightbulb, MessageSquare } from "lucide-react";

export function PanelToggle() {
  const { rightPanelMode, setRightPanelMode, locale } = useDashboard();
  const t = getTranslation(locale);

  return (
    <div className="flex bg-navy-darker rounded-sm p-1 border border-navy-line">
      <button
        type="button"
        onClick={() => setRightPanelMode("insights")}
        aria-pressed={rightPanelMode === "insights"}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded transition-all ${
          rightPanelMode === "insights"
            ? "bg-blue text-white shadow-sm"
            : "text-gray-3 hover:text-white"
        }`}
      >
        <Lightbulb className="w-3.5 h-3.5" />
        {t.panel.insights}
      </button>
      <button
        type="button"
        onClick={() => setRightPanelMode("chat")}
        aria-pressed={rightPanelMode === "chat"}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded transition-all ${
          rightPanelMode === "chat"
            ? "bg-blue text-white shadow-sm"
            : "text-gray-3 hover:text-white"
        }`}
      >
        <MessageSquare className="w-3.5 h-3.5" />
        {t.panel.chat}
      </button>
    </div>
  );
}
