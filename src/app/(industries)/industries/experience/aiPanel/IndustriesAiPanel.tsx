"use client";

import { useMemo } from "react";
import { useIndustriesStore } from "../stores";
import { useDashboard } from "@/store/useDashboard";
import { useTradeData } from "@/hooks/trade/useTradeData";
import { AiPanelEnvContext } from "./env";
import { RightPanel } from "./RightPanel";

/* /industries mount: env from the experience store (M49 country ids, the
   dive's sun/moon theme) plus the live Vietnam trade data the dashboard tabs
   render — the panel is a visual shell; the data and chat logic are the
   Vietnam dashboard's. */
export function IndustriesAiPanel() {
  const countryId = useIndustriesStore((s) => s.selectedCountryId);
  const industryId = useIndustriesStore((s) => s.selectedIndustryId);
  const dataType = useIndustriesStore((s) => s.dataType);
  const dark = useIndustriesStore((s) => s.dashboardDark);

  const filters = useDashboard((s) => s.filters);
  const { overview, totals, timeline } = useTradeData(filters);

  const env = useMemo(
    () => ({ dark, countryId, industryId, dataType, overview, totals, timeline }),
    [dark, countryId, industryId, dataType, overview, totals, timeline]
  );

  return (
    <AiPanelEnvContext.Provider value={env}>
      <RightPanel />
    </AiPanelEnvContext.Provider>
  );
}
