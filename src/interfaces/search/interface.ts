export type SearchCategory = "all" | "data" | "products" | "news" | "events" | "dashboards";

export interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  category: SearchCategory;
  industry?: string;
  country?: string;
  date?: string;
  url: string;
  image?: string;
  meta?: string;
}
