"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useAiPanelEnv } from "./env";
import { useInsights } from "./useInsights";
import { t } from "./strings";

const badgeStyles: Record<
  string,
  { bg: string; text: string; icon: typeof Info }
> = {
  success: { bg: "rgba(0,183,34,0.15)", text: "#00B722", icon: CheckCircle2 },
  warning: { bg: "rgba(240,122,58,0.15)", text: "#F07A3A", icon: AlertTriangle },
  info: { bg: "rgba(34,123,255,0.15)", text: "#227BFF", icon: Info },
};

export function InsightsView() {
  const { insights } = useInsights();
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const { dark } = useAiPanelEnv();

  const divider = dark ? "border-white/10" : "border-black/[0.08]";

  const handleGenerateInsights = () => {
    setIsGeneratingInsights(true);
    setTimeout(() => setIsGeneratingInsights(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`shrink-0 pb-3 border-b ${divider}`}>
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-[10px] font-bold uppercase tracking-widest ${
              dark ? "text-white/50" : "text-gray-500"
            }`}
          >
            {t.insightsSubtitle}
          </span>
        </div>
        <button
          onClick={handleGenerateInsights}
          disabled={isGeneratingInsights}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-60 disabled:cursor-not-allowed bg-[#227BFF] hover:bg-[#1B66D9] text-white rounded-lg cursor-pointer"
        >
          {isGeneratingInsights ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.analyzing}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {t.generateInsights}
            </>
          )}
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto py-3 space-y-2">
        {insights.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Sparkles
              className={`h-8 w-8 mb-2 ${dark ? "text-white/40" : "text-gray-400"}`}
            />
            <p
              className={`text-xs font-medium ${dark ? "text-white/50" : "text-gray-500"}`}
            >
              {t.noInsights}
            </p>
          </div>
        ) : (
          insights.map((item) => {
            const style = badgeStyles[item.badge ?? "info"];
            const Icon = style.icon;
            return (
              <div
                key={item.id}
                className={`flex items-start gap-2.5 pb-2.5 border-b ${divider}`}
              >
                <div
                  className="h-6 w-6 rounded flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: style.bg }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: style.text }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[11px] font-medium ${
                      dark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {item.title}
                  </p>
                  <p
                    className={`text-[10px] mt-0.5 leading-tight ${
                      dark ? "text-white/60" : "text-gray-600"
                    }`}
                  >
                    {item.description}
                  </p>
                </div>
                <span
                  className="inline-flex items-center rounded-full px-1.5 py-0 text-[9px] font-semibold shrink-0"
                  style={{ background: style.bg, color: style.text }}
                >
                  {item.badge}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
