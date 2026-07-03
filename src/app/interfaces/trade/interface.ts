export interface TradeOverviewItem {
  country: string;
  totalMt: number;
  records: number;
  totalFob: number;
  totalCif: number;
}

export interface TradeTotalImports {
  totalMt: number;
  records: number;
  totalFob: number;
  totalCif: number;
  countries: number;
  products: number;
  importers: number;
  exporters: number;
  minYear: number;
  maxYear: number;
}

export interface TradeTimelineItem {
  year: number;
  totalMt: number;
  records: number;
  totalFob: number;
  totalCif: number;
}

export interface TradeFilters {
  category?: string[];
  product?: string[];
  originCountry?: string[];
  customs?: string[];
  importer?: string;
  exporter?: string;
  yearStart?: number;
  yearEnd?: number;
}

export interface TradeFilterOptions {
  categories: string[];
  products: string[];
  originCountries: string[];
  customs: string[];
  years: number[];
  importers: string[];
  exporters: string[];
}

export interface RaceItem {
  name: string;
  value: number;
  records?: number;
}

export interface RaceYearData {
  year: number;
  items: RaceItem[];
}

export interface TradeApiResponse<T> {
  success: boolean;
  data: T;
  filtersApplied?: Record<string, unknown>;
}

export interface ChatContext {
  stats: Partial<TradeTotalImports>;
  filters: TradeFilters;
  dataSnapshot: {
    topCountries: TradeOverviewItem[];
    topProducts: { product: string; totalMt: number }[];
  };
}

export const ALLOWED_PRODUCTS = [
  "Blood Meal",
  "Feather Meal",
  "Fish Meal",
  "Fish Oil",
  "Guts",
  "Bovine Meal",
  "Porcine Meal",
  "Poultry Meal",
  "Sheep Meal",
  "Pork Fat",
  "Poultry Fat",
  "Tallow",
  "Yellow Grease",
];

export const DASHBOARD_TABS = [
  { id: "imports-overview", labelKey: "importsOverview" as const },
  { id: "total-imports", labelKey: "totalImports" as const },
  { id: "hs-codes", labelKey: "hsCodes" as const },
  { id: "imports-by-product", labelKey: "importsByProduct" as const },
  { id: "imports-timeline", labelKey: "importsTimeline" as const },
  { id: "traders-and-customs", labelKey: "tradersAndCustoms" as const },
  { id: "traders-and-customs-detailed", labelKey: "tradersAndCustomsDetailed" as const },
  { id: "countries-detailed", labelKey: "countriesDetailed" as const },
  { id: "imports-by-country", labelKey: "importsByCountry" as const },
  { id: "imports-operations", labelKey: "importsOperations" as const },
];
