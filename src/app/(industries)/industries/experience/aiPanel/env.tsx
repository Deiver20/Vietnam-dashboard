"use client";

import { createContext, useContext } from "react";
import type {
  TradeOverviewItem,
  TradeTotalImports,
  TradeTimelineItem,
} from "@/app/interfaces/trade/interface";

/* The panel is mounted on the /industries Level-4 dive (useIndustriesStore,
   M49 country ids, sun/moon theme) and reads the live Vietnam trade data via
   the same hooks the dashboard tabs use. The env carries the theme/selection
   plus the fetched data so the visual components never reach into stores. */
export interface AiPanelEnv {
  dark: boolean;
  countryId: string | null;
  countryName?: string;
  industryId: string | null;
  dataType: string | null;
  overview: TradeOverviewItem[];
  totals: TradeTotalImports | null;
  timeline: TradeTimelineItem[];
}

export const AiPanelEnvContext = createContext<AiPanelEnv>({
  dark: false,
  countryId: null,
  industryId: null,
  dataType: null,
  overview: [],
  totals: null,
  timeline: [],
});

export const useAiPanelEnv = () => useContext(AiPanelEnvContext);
