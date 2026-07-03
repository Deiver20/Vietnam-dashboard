"use client";

import { useEffect } from "react";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { PanelToggle } from "@/components/insights/PanelToggle";
import { InsightsView } from "@/components/insights/InsightsView";
import { ChatView } from "@/components/insights/ChatView";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { TradeOverviewItem, TradeTotalImports, TradeTimelineItem } from "@/app/interfaces/trade/interface";

interface RightPanelProps {
  overview: TradeOverviewItem[];
  totals: TradeTotalImports | null;
  timeline: TradeTimelineItem[];
}

export function RightPanel({ overview, totals, timeline }: RightPanelProps) {
  const { rightPanelCollapsed, setRightPanelCollapsed, rightPanelMode, locale } = useDashboard();
  const t = getTranslation(locale);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 1024 && !rightPanelCollapsed) {
        setRightPanelCollapsed(true);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [rightPanelCollapsed, setRightPanelCollapsed]);

  if (rightPanelCollapsed) {
    return (
      <button
        type="button"
        onClick={() => setRightPanelCollapsed(false)}
        className="fixed right-0 top-[112px] z-30 flex items-center gap-1.5 bg-blue text-white border border-blue-600 border-r-0 rounded-l-lg px-2 py-2 shadow-lg shadow-blue/20 hover:bg-blue-600 transition-all"
        title={t.panel.open}
      >
        <PanelRightOpen className="w-4 h-4" />
        <span className="text-xs font-medium">{t.panel.open}</span>
      </button>
    );
  }

  return (
    <aside className="fixed top-[112px] right-0 bottom-0 z-30 w-80 border-l border-navy-line bg-navy-darker/95 backdrop-blur-sm flex flex-col lg:sticky lg:top-[112px] lg:h-[calc(100vh-112px)]">
      <div className="flex items-center justify-between p-3 border-b border-navy-line bg-navy-card/30">
        <PanelToggle />
        <button
          type="button"
          onClick={() => setRightPanelCollapsed(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-navy-line border border-white/20 text-gray-1 hover:text-white hover:bg-navy-line/80 hover:border-white/30 transition-all text-xs font-medium shadow-sm min-w-[80px]"
          title={t.common.close}
        >
          <PanelRightClose className="w-4 h-4 flex-shrink-0" />
          <span className="flex-shrink-0">{t.common.close}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {rightPanelMode === "insights" ? (
          <InsightsView overview={overview} totals={totals} timeline={timeline} />
        ) : (
          <ChatView overview={overview} totals={totals} />
        )}
      </div>
    </aside>
  );
}
