import { TradeFilters, ALLOWED_PRODUCTS } from "@/app/interfaces/trade/interface";

export function getEffectiveProducts(filters: TradeFilters): string[] {
  if (filters.product && filters.product.length > 0) {
    return filters.product;
  }
  return ALLOWED_PRODUCTS;
}

export function buildTradeQueryString(filters: TradeFilters): string {
  const params = new URLSearchParams();

  filters.category?.forEach((v) => params.append("category", v));
  getEffectiveProducts(filters).forEach((v) => params.append("product", v));
  filters.originCountry?.forEach((v) => params.append("originCountry", v));
  filters.customs?.forEach((v) => params.append("customs", v));
  if (filters.importer) params.set("importer", filters.importer);
  if (filters.exporter) params.set("exporter", filters.exporter);
  if (filters.yearStart) params.set("yearStart", String(filters.yearStart));
  if (filters.yearEnd) params.set("yearEnd", String(filters.yearEnd));

  const query = params.toString();
  return query ? `?${query}` : "";
}
