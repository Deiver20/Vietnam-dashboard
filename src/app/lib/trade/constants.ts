export const MESES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export const MESES_LONG = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const COLORS = {
  navyDeep:     "#06254B",
  navyPrimary:  "#03488D",
  yellow:       "#F8D227",
  textDark:     "#1C1C1C",
  textEditorial:"#3a4256",
  textMuted:    "#5a6478",
  border:       "rgba(6, 37, 75, 0.10)",
  borderStrong: "rgba(6, 37, 75, 0.15)",
  borderSubtle: "rgba(6, 37, 75, 0.06)",
  bgPage:       "#F2F8FF",
  bgCard:       "#FFFFFF",
};

export const COUNTRY_PALETTE = [
  "#03488D", "#1D9E75", "#E07B2A", "#1a3a6b", "#06254B",
  "#3B82F6", "#06B6D4", "#14B8A6", "#84CC16", "#A855F7",
  "#EC4899", "#F97316", "#EF4444", "#8B5CF6", "#0EA5E9",
  "#22C55E", "#EAB308", "#F59E0B",
];

export const RIBBON_PALETTE = [
  "#F8D227", "#F59E0B", "#F97316", "#EF4444", "#A855F7", "#EC4899",
  "#3B82F6", "#06B6D4", "#14B8A6", "#10B981", "#84CC16", "#EAB308",
];

export const CATEGORY_COLORS: Record<string, string> = {
  Pollo:         "#1D9E75",
  Huevo:         "#1a3a6b",
  Pavo:          "#E07B2A",
  Pato:          "#0EA5E9",
  Ganso:         "#94A3B8",
  Embutidos:     "#A855F7",
  Preparaciones: "#EC4899",
};

export const YEAR_PALETTE = [
  "#03488D", "#F8D227", "#1D9E75", "#E07B2A", "#A855F7",
  "#EC4899", "#3B82F6", "#14B8A6", "#EF4444", "#0EA5E9",
];

export function getCountryColor(idx: number): string {
  return COUNTRY_PALETTE[idx % COUNTRY_PALETTE.length];
}

export function getYearColor(year: number, yearStart?: number): string {
  if (yearStart !== undefined) {
    const idx = year - yearStart;
    return YEAR_PALETTE[idx % YEAR_PALETTE.length];
  }
  return COUNTRY_PALETTE[year % COUNTRY_PALETTE.length];
}

export const TOP_RIBBON_COUNTRIES = 5;
export const OTROS_COLOR = "#94A3B8";

export const UNIT_VOLUMEN = {
  short: "mt",
  long: "Toneladas métricas",
  per: "mt",
} as const;

export function getUnitLabel(): { short: string; long: string; per: string } {
  return UNIT_VOLUMEN;
}
