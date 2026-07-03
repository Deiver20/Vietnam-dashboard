"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DashboardState, Locale, ChatMessage } from "@/app/interfaces";
import { TradeFilters } from "@/app/interfaces/trade/interface";

interface TradeDashboardState extends DashboardState {
  filters: TradeFilters;
  setFilters: (filters: TradeFilters) => void;
  resetFilters: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const initialFilters: TradeFilters = {
  category: [],
  product: [],
  originCountry: [],
  customs: [],
  importer: "",
  exporter: "",
  yearStart: 2020,
  yearEnd: 2026,
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
      mobileMenuOpen: false,

      setLocale: (locale) => set({ locale }),
      setRightPanelCollapsed: (collapsed) => set({ rightPanelCollapsed: collapsed }),
      setRightPanelMode: (mode) => set({ rightPanelMode: mode }),
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),
      setIsLoadingChat: (loading) => set({ isLoadingChat: loading }),
      clearChat: () => set({ chatMessages: [] }),
      setFilters: (filters) => set({ filters }),
      resetFilters: () => set({ filters: initialFilters }),
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
    }),
    {
      name: "trade-dashboard-store",
      partialize: (state) => ({
        locale: state.locale,
        rightPanelCollapsed: state.rightPanelCollapsed,
        rightPanelMode: state.rightPanelMode,
        filters: state.filters,
      }),
    }
  )
);

export type { Locale, ChatMessage, TradeFilters };
