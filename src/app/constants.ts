export const DASHBOARD_YEAR_RANGE = { min: 2022, max: 2026 } as const;

/* Año de inicio del rango de filtros según el país (código IOC de la MV).
   Vietnam solo tiene datos desde 2022; Colombia desde 2019. */
const COUNTRY_MIN_YEAR: Record<string, number> = {
  COL: 2019,
  VIE: 2022,
};

export function getMinYearForCountry(countryCode?: string | null): number {
  if (countryCode && COUNTRY_MIN_YEAR[countryCode] != null) {
    return COUNTRY_MIN_YEAR[countryCode];
  }
  return DASHBOARD_YEAR_RANGE.min;
}
