import { TradeFilters } from "@/app/interfaces/trade/interface";

function buildQueryStringFromFilters(filters: TradeFilters): string {
  const params = new URLSearchParams();

  if (filters.countryCode) params.set("countryCode", filters.countryCode);
  if (filters.industry) params.set("industry", filters.industry);

  if (filters.category && filters.category.length > 0) {
    params.set("category", filters.category.join(","));
  }

  if (filters.product && filters.product.length > 0) {
    params.set("product", filters.product.join(","));
  }

  if (filters.originCountry && filters.originCountry.length > 0) {
    params.set("originCountry", filters.originCountry.join(","));
  }

  if (filters.customs && filters.customs.length > 0) {
    params.set("customs", filters.customs.join(","));
  }

  if (filters.importer) params.set("importer", filters.importer);
  if (filters.exporter) params.set("exporter", filters.exporter);
  if (filters.yearStart) params.set("yearStart", String(filters.yearStart));
  if (filters.yearEnd) params.set("yearEnd", String(filters.yearEnd));
  if (filters.flow) params.set("flow", filters.flow);
  if (filters.fraccion && filters.fraccion.length > 0) params.set("fraccion", filters.fraccion.join(","));
  if (filters.meses && filters.meses.length > 0) params.set("meses", filters.meses.join(","));
  if (filters.years && filters.years.length > 0) params.set("years", filters.years.join(","));

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function buildTradeQueryString(filters: TradeFilters): string {
  return buildQueryStringFromFilters(filters);
}

export function buildFilterOptionsQuery(filters: TradeFilters): string {
  return buildQueryStringFromFilters(filters);
}

/* Query para el endpoint filters-all: incluye solo el scope
   (país/industria/flujo) para que las opciones de filtro se limiten a la
   combinación actual. Los filtros activos no se pasan aquí porque se quieren
   TODAS las opciones del scope. */
export function buildFiltersAllQuery(filters: TradeFilters): string {
  const params = new URLSearchParams();
  if (filters.countryCode) params.set("countryCode", filters.countryCode);
  if (filters.industry) params.set("industry", filters.industry);
  if (filters.flow) params.set("flow", filters.flow);
  const query = params.toString();
  return query ? `?${query}` : "";
}
