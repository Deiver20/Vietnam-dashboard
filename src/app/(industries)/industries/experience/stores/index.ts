import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { FilterState, FilterValue } from "../data/types";

export type Level = 1 | 2 | 3 | 4;

// Level 4 renders the Cover page (index 0, dashboardPages.tsx) followed by
// the /dashboard pages (Imports Overview … Price Projection) at indices 1..N.
// A literal, NOT DASHBOARD_TABS.length + 1: importing the dashboard data here
// would drag it into the experience's first-paint chunk (dashboardPages.tsx
// asserts the two stay in sync in dev).
export const DATA_PAGE_COUNT = 11;

interface IndustriesStore {
  level: Level;
  introDone: boolean;
  selectedIndustryId: string | null;
  selectedCountryId: string | null;
  hoveredCountryId: string | null;
  /** /data variable picked on the cover carousel (imports, exports, …) —
   *  selects the dataset the Level-4 dashboard pages read. */
  dataType: string | null;
  pageIndex: number;
  pageCount: number;
  /** Global GSAP lock — every transition sets it, its owner timeline clears it. */
  transitioning: boolean;
  filters: Record<string, FilterState>;
  /** Level-4 sun/moon switch — lives here (not local state) so DashboardBackdrop
   *  can pick the matching dark/light backdrop for whichever design is showing. */
  dashboardDark: boolean;

  selectIndustry: (id: string | null) => void;
  selectCountry: (id: string) => void;
  advance: () => void;
  retreat: () => void;
  /** Data pages → country cover in one jump, whatever the current page. */
  closePages: () => void;
  goToPage: (index: number) => void;
  setFilter: (pageKey: string, id: string, value: FilterValue) => void;
  toggleDashboardDark: () => void;
  reset: () => void;
}

export const useIndustriesStore = create<IndustriesStore>()(
  subscribeWithSelector((set, get, store) => ({
    level: 1,
    introDone: false,
    selectedIndustryId: null,
    selectedCountryId: null,
    hoveredCountryId: null,
    dataType: null,
    pageIndex: 0,
    pageCount: 0,
    // Locked until the camera intro finishes.
    transitioning: true,
    filters: {},
    // Dark mode is the default: the /dashboard pages open in dark chrome
    // unless the user flips the sun/moon switch to light.
    dashboardDark: true,

    selectIndustry: (id) => {
      const s = get();
      if (s.transitioning) return;
      // Country-first path: picking (or clearing/swapping) the industry on
      // the country cover swaps panel content in place — no scene
      // transition, so no lock and no owner needed.
      if (s.level === 3) {
        if (id === s.selectedIndustryId) return;
        if (id === null) {
          set({ selectedIndustryId: null, pageIndex: 0, pageCount: 0 });
          return;
        }
        if (!s.selectedCountryId) return;
        set({
          selectedIndustryId: id,
          pageIndex: 0,
          pageCount: DATA_PAGE_COUNT,
        });
        return;
      }
      if (s.level > 3) return;
      if (id === null) {
        if (s.level === 2) {
          set({ transitioning: true, level: 1, selectedIndustryId: null });
        }
        return;
      }
      if (s.level === 1) {
        set({ transitioning: true, level: 2, selectedIndustryId: id });
      } else if (s.selectedIndustryId !== id) {
        set({ transitioning: true, selectedIndustryId: id });
      }
    },

    selectCountry: (id) => {
      const s = get();
      // Both entry paths zoom to the country: from an industry globe
      // (Level 2) with its dossier ready, or industry-less from Level 1 —
      // the cover then asks for an industry before any data pages exist.
      if (s.transitioning || s.level > 2) return;
      set({
        transitioning: true,
        level: 3,
        selectedCountryId: id,
        pageIndex: 0,
        pageCount: s.selectedIndustryId ? DATA_PAGE_COUNT : 0,
      });
    },

    advance: () => {
      const s = get();
      if (s.transitioning) return;
      if (s.level === 3 && s.selectedIndustryId) {
        set({ transitioning: true, level: 4, pageIndex: 0 });
      } else if (s.level === 4 && s.pageIndex + 1 < s.pageCount) {
        set({ transitioning: true, pageIndex: s.pageIndex + 1 });
      }
    },

    retreat: () => {
      const s = get();
      if (s.transitioning) return;
      if (s.level === 2) {
        set({ transitioning: true, level: 1, selectedIndustryId: null });
      } else if (s.level === 3) {
        // Back to world view: whatever the entry path, an industry in play
        // returns to its industry globe; otherwise to the plain globe. (The
        // ALL IND. chip already covers dropping the industry in place.)
        set({ transitioning: true, level: s.selectedIndustryId ? 2 : 1 });
      } else if (s.level === 4) {
        if (s.pageIndex > 0) {
          set({ transitioning: true, pageIndex: s.pageIndex - 1 });
        } else {
          set({ transitioning: true, level: 3 });
        }
      }
    },

    closePages: () => {
      const s = get();
      if (s.transitioning || s.level !== 4) return;
      // Same level-4→3 transition as retreat-from-page-0: dashboardPages
      // owns the lock, every panel keys on the level change.
      set({ transitioning: true, level: 3 });
    },

    goToPage: (index) => {
      const s = get();
      if (s.transitioning || index < 0 || index >= s.pageCount) return;
      if (s.level === 3) {
        set({ transitioning: true, level: 4, pageIndex: index });
      } else if (s.level === 4 && index !== s.pageIndex) {
        set({ transitioning: true, pageIndex: index });
      }
    },

    setFilter: (pageKey, id, value) =>
      set((s) => ({
        filters: {
          ...s.filters,
          [pageKey]: { ...s.filters[pageKey], [id]: value },
        },
      })),

    toggleDashboardDark: () => set((s) => ({ dashboardDark: !s.dashboardDark })),

    reset: () => set(store.getInitialState()),
  }))
);
