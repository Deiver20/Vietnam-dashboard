"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import { useAiPanelEnv } from "./env";
import { useDashboard } from "@/store/useDashboard";
import { PanelToggle } from "./PanelToggle";
import { InsightsView } from "./InsightsView";
import { ChatView } from "./ChatView";

/* AI insights/chat panel. Desktop: 400px aside / 48px rail. Mobile (<lg,
   where the aside is hidden): Sparkles FAB + right drawer.

   Visual shell ported from the AGM /industries dive (frosted chrome, themed
   by its sun/moon switch); panel state and chat logic are the Vietnam
   dashboard's (useDashboard → /trade/chat). */
export function RightPanel() {
  const rightPanelCollapsed = useDashboard((s) => s.rightPanelCollapsed);
  const setRightPanelCollapsed = useDashboard((s) => s.setRightPanelCollapsed);
  const rightPanelMode = useDashboard((s) => s.rightPanelMode);
  const { dark } = useAiPanelEnv();
  const [mobileOpen, setMobileOpen] = useState(false);

  const surfaceStyle = dark
    ? {
        background: "rgba(0, 12, 26, 0.72)",
        border: "1px solid rgba(102, 166, 255, 0.18)",
        boxShadow: "0 0 32px rgba(0, 40, 90, 0.30)",
      }
    : {
        background: "rgba(255, 255, 255, 0.82)",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        boxShadow: "0 4px 28px rgba(0, 0, 0, 0.12)",
      };
  const mutedText = dark ? "text-white/50" : "text-gray-500";
  const hoverBtn = dark
    ? "hover:bg-white/10 text-white/50 hover:text-white"
    : "hover:bg-black/[0.05] text-gray-500 hover:text-gray-800";

  const panelContent = (
    <div className="flex flex-col h-full">
      <div className="shrink-0 pb-3">
        <PanelToggle />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        {rightPanelMode === "insights" ? <InsightsView /> : <ChatView />}
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`pointer-events-auto hidden lg:flex flex-col shrink-0 h-full rounded-[14px] overflow-hidden transition-all duration-300 ease-in-out backdrop-blur-[18px]`}
        style={{ width: rightPanelCollapsed ? 48 : 400, ...surfaceStyle }}
      >
        {rightPanelCollapsed ? (
          <div className="flex flex-col items-center pt-4 gap-4">
            <button
              onClick={() => setRightPanelCollapsed(false)}
              className={`inline-flex items-center justify-center h-9 w-9 transition-colors rounded-lg cursor-pointer ${hoverBtn}`}
              aria-label="Expand panel"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex flex-col items-center gap-3">
              <Sparkles className="h-5 w-5 text-[#227BFF]" />
              <div
                className={`text-[9px] font-bold uppercase tracking-widest ${mutedText}`}
                style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
              >
                AI
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full p-4">
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-[10px] font-bold uppercase tracking-widest ${mutedText}`}
              >
                Panel
              </span>
              <button
                onClick={() => setRightPanelCollapsed(true)}
                className={`inline-flex items-center justify-center h-7 w-7 transition-colors rounded-lg cursor-pointer ${hoverBtn}`}
                aria-label="Collapse panel"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0">{panelContent}</div>
          </div>
        )}
      </aside>

      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="pointer-events-auto fixed bottom-6 right-6 z-40 h-12 w-12 flex items-center justify-center shadow-[0_0_20px_rgba(34,123,255,0.45)] bg-[#227BFF] hover:bg-[#1B66D9] text-white rounded-full transition-all cursor-pointer"
          aria-label="Open AI panel"
        >
          <Sparkles className="h-5 w-5" />
        </button>

        {mobileOpen && (
          <div className="pointer-events-auto fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileOpen(false)}
            />
            <div
              className="absolute right-0 top-0 h-full w-[85vw] max-w-[400px] flex flex-col backdrop-blur-[18px]"
              style={{
                background: surfaceStyle.background,
                borderLeft: dark
                  ? "1px solid rgba(102, 166, 255, 0.18)"
                  : "1px solid rgba(0, 0, 0, 0.08)",
              }}
            >
              <div
                className={`flex items-center justify-between p-4 border-b ${
                  dark ? "border-white/10" : "border-black/[0.08]"
                }`}
              >
                <span
                  className={`text-sm font-semibold ${dark ? "text-white" : "text-gray-900"}`}
                >
                  Panel AI
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className={`h-8 w-8 inline-flex items-center justify-center rounded-lg cursor-pointer ${hoverBtn}`}
                  aria-label="Close AI panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4 flex-1 min-h-0">{panelContent}</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
