"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DashboardState, Locale, ChatMessage } from "@/app/interfaces";
import { TradeFilters } from "@/app/interfaces/trade/interface";
import { DASHBOARD_YEAR_RANGE } from "@/app/constants";

interface TradeDashboardState extends DashboardState {
  filters: TradeFilters;
  setFilters: (filters: TradeFilters | ((prev: TradeFilters) => TradeFilters)) => void;
  resetFilters: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const initialFilters: TradeFilters = {
  category: [],
  product: [],
  originCountry: [],
  customs: [],
  importer: "",
  exporter: "",
  yearStart: DASHBOARD_YEAR_RANGE.min,
  yearEnd: DASHBOARD_YEAR_RANGE.max,
  animationSpeed: 4000,
  flow: "imports",
  fraccion: [],
  meses: [],
  years: [],
};

export const useDashboard = create<TradeDashboardState>()(
  persist(
    (set) => ({
      locale: "en",
      rightPanelCollapsed: false,
      rightPanelMode: "insights",
      chatMessages: [],
      isLoadingChat: false,
      filters: initialFilters,
      sidebarCollapsed: true,

      setLocale: (locale) => set({ locale }),
      setRightPanelCollapsed: (collapsed) => set({ rightPanelCollapsed: collapsed }),
      setRightPanelMode: (mode) => set({ rightPanelMode: mode }),
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),
      setIsLoadingChat: (loading) => set({ isLoadingChat: loading }),
      clearChat: () => set({ chatMessages: [] }),
      setFilters: (filters) => set((state) =>
        typeof filters === "function" ? { filters: filters(state.filters) } : { filters }
      ),
      resetFilters: () => set({ filters: initialFilters }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: "trade-dashboard-store",
      version: 3,
      partialize: (state) => ({
        locale: state.locale,
        rightPanelCollapsed: state.rightPanelCollapsed,
        rightPanelMode: state.rightPanelMode,
        filters: state.filters,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
      migrate: (persistedState, version) => {
        if (version < 2) {
          return { locale: "en", filters: initialFilters };
        }
        if (version < 3) {
          const old = (persistedState as Partial<TradeDashboardState>) ?? {};
          return {
            ...old,
            filters: { ...initialFilters, ...(old.filters ?? {}) },
          } as TradeDashboardState;
        }
        return persistedState as TradeDashboardState;
      },
    }
  )
);

export type { Locale, ChatMessage, TradeFilters };
