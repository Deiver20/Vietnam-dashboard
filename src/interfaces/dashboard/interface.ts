export interface DatasetEntry {
  kpi: string[];
  deltas: string[];
  values: number[];
  trendDn?: boolean;
}

export interface IndustryData {
  label: string;
  imports: DatasetEntry;
  exports: DatasetEntry;
  production: DatasetEntry;
  pricing: DatasetEntry;
}

export interface HSCodeEntry {
  code: string;
  hsCode: string;
  heading: string;
  product: string;
  category: string;
  industry: string;
  codeType: string;
}

export interface TraderDetail {
  exporter: string;
  janVol: number;
  janCIF: string;
  janPrice: string;
  febVol: number;
  febCIF: string;
  febPrice: string;
  marVol: number;
  marCIF: string;
  marPrice: string;
}

export interface CountryDetail {
  country: string;
  janVol: number;
  janCIF: string;
  janPrice: string;
  febVol: number;
  febCIF: string;
  febPrice: string;
  totalVol: number;
  totalCIF: string;
  totalPrice: string;
}

export interface DashboardMapMarker {
  name: string;
  coordinates: [number, number];
  value: number;
  color: string;
}

export interface RouteOrigin {
  name: string;
  coordinates: [number, number];
  value: number;
  color: string;
}

export interface RouteDestination {
  name: string;
  coordinates: [number, number];
  color: string;
}

export interface CountryInfo {
  emoji: string;
  name: string;
}

export interface FilterDef {
  label: string;
  value: string;
}

export interface PageConfig {
  slug: string;
  label: string;
  kpiLabels: string[];
  kpiFn: (ds: DatasetEntry) => string[];
  deltaFn: (ds: DatasetEntry) => string[];
  chartTitle: string;
  chartSub: string;
  donutTitle: string;
  donutSub: string;
  tableTitle: string;
  tableSub: string;
  filters: FilterDef[];
}

/* ── Component props ──────────────────────────────────────── */
export interface PageIconProps {
  index: number;
  color: string;
}

export interface DashboardBannerProps {
  industryLabel: string;
  countryInfo: CountryInfo | null;
  typeLabel: string;
  color: string;
  urlStatus: string | null;
  urlDate: string | null;
  urlDiscount: boolean;
}

export interface DashboardTabsBarProps {
  pages: PageConfig[];
  currentPage: number;
  color: string;
  filters: FilterDef[];
  onPageChange: (index: number) => void;
}

export interface KpiTilesProps {
  kpiVals: string[];
  kpiDeltas: string[];
  kpiLabels: string[];
  color: string;
  chartColorRgb: string;
}
