"use client";

import { BrainCircuit, MessageSquare } from "lucide-react";
import { useAiPanelEnv } from "./env";
import { useDashboard } from "@/store/useDashboard";
import { t } from "./strings";

export function PanelToggle() {
  const rightPanelMode = useDashboard((s) => s.rightPanelMode);
  const setRightPanelMode = useDashboard((s) => s.setRightPanelMode);
  const { dark } = useAiPanelEnv();

  const inactive = dark
    ? "text-white/50 hover:text-white"
    : "text-gray-500 hover:text-gray-800";
  const active =
    "bg-[#227BFF] text-white shadow-[0_0_12px_rgba(34,123,255,0.3)]";

  return (
    <div
      className={`flex gap-1 p-1 rounded-lg ${dark ? "bg-white/10" : "bg-black/[0.06]"}`}
    >
      <button
        onClick={() => setRightPanelMode("insights")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
          rightPanelMode === "insights" ? active : inactive
        }`}
      >
        <BrainCircuit className="w-3.5 h-3.5" />
        {t.insights}
      </button>
      <button
        onClick={() => setRightPanelMode("chat")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
          rightPanelMode === "chat" ? active : inactive
        }`}
      >
        <MessageSquare className="w-3.5 h-3.5" />
        {t.chat}
      </button>
    </div>
  );
}
