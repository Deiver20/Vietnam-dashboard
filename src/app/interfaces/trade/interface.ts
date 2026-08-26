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
  countryCode?: string;
  industry?: string;
  category?: string[];
  product?: string[];
  originCountry?: string[];
  customs?: string[];
  importer?: string;
  exporter?: string;
  yearStart?: number;
  yearEnd?: number;
  animationSpeed?: number;
  flow?: Flow;
  fraccion?: string[];
  meses?: number[];
  years?: number[];
}

export type Flow = "imports" | "exports";

export interface TradeSelectOption {
  label: string;
  value: string;
}

export interface TradeFilterOptions {
  categories: string[];
  products: string[];
  originCountries: string[];
  customs: Array<string | TradeSelectOption>;
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

// Contrato Fase A del agente de trade chat (POST /trade/chat): identidad
// fija del tablero. countryCode/industry/flow SIEMPRE viajan completos en
// cada request -- el backend los valida fail-closed (400 si falta alguno) y
// nunca deja que el LLM los cambie. No incluye sub-filtros (producto, aduana,
// años...): esos ya no le sirven al agente, sus propias tools tienen sus
// propios parámetros.
export interface TradeChatContexto {
  countryCode: string;
  industry: string;
  flow: Flow;
}

export const ALLOWED_PRODUCTS = [
  "Blood meal",
  "Feather meal",
  "Fish meal",
  "Fish oil",
  "Guts",
  "Bovine Meal",
  "Porcine Meal",
  "Poultry Meal",
  "Sheep Meal",
  "Pork fat",
  "Poultry fat",
  "Tallow",
  "Yellow grease",
];

export const DASHBOARD_TABS = [
  { id: "price-projection", labelKey: "priceProjection" as const, labelTop: "Price", labelBottom: "Trend" },
  { id: "imports-overview", labelKey: "importsOverview" as const, labelTop: "Imports", labelBottom: "Overview" },
  { id: "hs-codes", labelKey: "hsCodes" as const, labelTop: "HS Codes", labelBottom: null },
  { id: "total-imports", labelKey: "totalImports" as const, labelTop: "Total Imports", labelBottom: null },
  { id: "imports-by-product", labelKey: "importsByProduct" as const, labelTop: "By Product", labelBottom: null },
  { id: "imports-timeline", labelKey: "importsTimeline" as const, labelTop: "Imports", labelBottom: "Timeline" },
  { id: "traders-and-customs", labelKey: "tradersAndCustoms" as const, labelTop: "Traders & Customs", labelBottom: null },
  { id: "imports-by-country", labelKey: "importsByCountry" as const, labelTop: "Imports by Country", labelBottom: null },
  { id: "countries-detailed", labelKey: "countriesDetailed" as const, labelTop: "Countries", labelBottom: "Detailed" },
  { id: "imports-operations", labelKey: "importsOperations" as const, labelTop: "Imports", labelBottom: "Operations" },
];

export interface HsCodeRow {
  fraccion: string;
  codigo?: string;
  codigoHs?: string;
  partida?: string;
  categoria?: string;
  producto?: string;
  industry?: string;
  codeType?: string;
  registros: number;
  volumenKg: number;
  valorUsd: number;
  precioUsd: number;
}

export interface ByProductRow {
  categoria: string;
  producto: string;
  year: number;
  registros: number;
  volumenKg: number;
  valorUsd: number;
  precioUsd: number;
  valorMxn?: number;
  precioMxn?: number;
}

export interface ByProductComparative {
  categoria: string;
  producto: string;
  years: Record<number, { registros: number; volumenKg: number; valorUsd: number; precioUsd: number }>;
}

export type ByProductResponse = ByProductRow[] | ByProductComparative[];

export interface MonthlyAccumRow {
  year: number;
  month: number;
  volumenKg: number;
  acumulado: number;
}

export interface TimelineResponse {
  countries: string[];
  yearlyRibbon: Array<{ country: string; year: number; volumenKg: number }>;
  accumulated: MonthlyAccumRow[];
}

export interface ByCountryRanking {
  country: string;
  registros: number;
  volumenKg: number;
  valorUsd: number;
  precioUsd: number;
  share: number;
}

export interface ByCountryResponse {
  ranking: ByCountryRanking[];
  timeline: Array<{ country: string; year: number; month: number; volumenKg: number }>;
}

export type TraderType = "importer" | "exporter" | "customs";

export interface TraderByYearRow {
  entidad: string;
  year: number;
  registros: number;
  volumenKg: number;
  valorUsd: number;
  cifFiltrado?: number;
  volFiltrado?: number;
  precioUsd: number;
  lat?: number | null;
  lng?: number | null;
  productos?: string[];
}

export interface TraderMonthlyCell {
  volumenKg: number;
  valorUsd: number;
  precioUsd?: number;
}

export interface TraderMonthlyProductRow {
  producto: string;
  categoria: string;
  registros: number;
  totalVolumenKg: number;
  totalValorUsd: number;
  precioUsd?: number;
  monthly: Record<string, TraderMonthlyCell>;
}

export interface TraderMonthlyRow {
  entidad: string;
  registros: number;
  totalVolumenKg: number;
  totalValorUsd: number;
  precioUsd?: number;
  monthly: Record<string, TraderMonthlyCell>;
  products: TraderMonthlyProductRow[];
}

export interface TraderMonthlyBreakdown {
  years: number[];
  months: number[];
  monthKeys: string[];
  rows: TraderMonthlyRow[];
  totals: { registros: number; volumenKg: number; valorUsd: number; monthly: Record<string, TraderMonthlyCell> };
}

export interface CountryMonthlyCell {
  volumenKg: number;
  valorUsd: number;
  precioUsd?: number;
}

export interface CountryMonthlyProductRow {
  producto: string;
  categoria: string;
  registros: number;
  totalVolumenKg: number;
  totalValorUsd: number;
  precioUsd?: number;
  monthly: Record<string, CountryMonthlyCell>;
}

export interface CountryMonthlyRow {
  country: string;
  registros: number;
  totalVolumenKg: number;
  totalValorUsd: number;
  precioUsd?: number;
  monthly: Record<string, CountryMonthlyCell>;
  products: CountryMonthlyProductRow[];
}

export interface CountryMonthlyBreakdown {
  years: number[];
  months: number[];
  monthKeys: string[];
  rows: CountryMonthlyRow[];
  totals: { registros: number; volumenKg: number; valorUsd: number; monthly: Record<string, CountryMonthlyCell> };
}

export interface DetailedTradeRow {
  flujo: "imports" | "exports";
  año: number;
  mes: number;
  fecha?: string | null;
  fraccion: string;
  codigoHs: string | null;
  partida: string | null;
  producto: string;
  categoria: string;
  paisOrigen: string;
  exportador: string;
  importador: string;
  aduana: string;
  cantidadKg: number;
  valorUsd: number;
  precioUsdKg: number;
}

export interface DetailedTradeResponse {
  rows: DetailedTradeRow[];
  total: number;
  truncated: boolean;
  appliedRange: { yearStart: number; yearEnd: number };
}

export type HierarchyMetric = "volumenKg" | "precioUsd";

export type HierarchyDimension =
  | "categoria"
  | "producto"
  | "country"
  | "exportador"
  | "importador"
  | "aduana";

export interface HierarchyRow {
  categoria: string | null;
  producto: string | null;
  country: string | null;
  exportador: string | null;
  importador: string | null;
  aduana: string | null;
  registros: number;
  volumenKg: number;
  valorUsd: number;
  cifFiltrado?: number;
  volFiltrado?: number;
  precioUsd?: number;
  _metric: HierarchyMetric;
}
