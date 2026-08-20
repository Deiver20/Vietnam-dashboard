export interface CardData {
  id: string;
  cat: string;
  type: string;
  country: string;
  status: "locked" | "bought";
  price: number;
  originalPrice?: number;
  discount?: boolean;
  date: string;
  title?: string;
  subtitle?: string;
  img?: string;
}

export interface Country {
  emoji: string;
  name: string;
  region: string;
  flag?: string;
}

export interface Industry {
  label: string;
  color: string;
  /** Industry emoji — the same glyph the filters and /industries use. */
  emoji: string;
  img: string;
  chips: string[];
  /** Small description shown in the /data/[industry] header. */
  desc: string;
  /** Reference world price in USD/t — anchors the deterministic series. */
  basePrice: number;
}

export interface DataType {
  label: string;
  cls: string;
  color: string;
}

export interface ActiveChip {
  label: string;
  key: string;
  color: string;
}

/* ── Price series (candlestick + table) ─────────────────────── */

/** One month of OHLC world-price data. */
export interface Candle {
  o: number;
  h: number;
  l: number;
  c: number;
}

/** Where a product can be bought: country + customs office + incoterm. */
export interface ProductCountryRow {
  country: string;
  aduana: string;
  incoterm: string;
}

/** One shipping port within a country: customs office + its incoterm. */
export interface PortRow {
  aduana: string;
  incoterm: string;
}

export interface IndustryProduct {
  key: string;
  label: string;
  rows: ProductCountryRow[];
}

/** Current-month stats + the two estimated months. */
export interface PriceStats {
  avg: number;
  max: number;
  min: number;
  est1: number;
  est2: number;
}

/** Shared filter state + derived data exposed by the `useDataFilters` hook. */
export interface DataFilters {
  fCat: string;
  setFCat: (v: string) => void;
  fSearch: string;
  setFSearch: (v: string) => void;
  /** Industry keys that survive the Industry + search filters. */
  visibleIndustries: string[];
  /** Event/project cards that survive the Industry + search filters. */
  otherCards: CardData[];
  activeChips: ActiveChip[];
  savedCards: Set<string>;
  toggleSave: (id: string) => void;
  removeChip: (key: string) => void;
  resetAll: () => void;
}

export interface DataFilterBarProps {
  filters: DataFilters;
}

export interface DataResultsGridProps {
  filters: DataFilters;
}

/** Filter state + derived data for the /data/[industry] page. */
export interface IndustryFilters {
  fCountry: string;
  setFCountry: (v: string) => void;
  fType: string;
  setFType: (v: string) => void;
  fProduct: string;
  setFProduct: (v: string) => void;
  visibleCards: CardData[];
  usedCountries: string[];
  activeCount: number;
  resetAll: () => void;
}
