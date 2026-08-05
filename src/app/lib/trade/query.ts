import { TradeFilters, ALLOWED_PRODUCTS } from "@/app/interfaces/trade/interface";

export function getEffectiveProducts(filters: TradeFilters): string[] {
  if (filters.product && filters.product.length > 0) {
    return filters.product;
  }
  return ALLOWED_PRODUCTS;
}

function buildQueryStringFromFilters(filters: TradeFilters, useDefaults: boolean): string {
  const params = new URLSearchParams();

  if (filters.category && filters.category.length > 0) {
    params.set("category", filters.category.join(","));
  }

  if (useDefaults) {
    const products = getEffectiveProducts(filters);
    if (products.length > 0) {
      params.set("product", products.join(","));
    }
  } else if (filters.product && filters.product.length > 0) {
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
  return buildQueryStringFromFilters(filters, true);
}

export function buildFilterOptionsQuery(filters: TradeFilters): string {
  return buildQueryStringFromFilters(filters, false);
}

export function buildFiltersAllQuery(_filters: TradeFilters): string {
  return "";
}
