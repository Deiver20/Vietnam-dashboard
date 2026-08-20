/* ════════════════════════════════════════════════════════════
   SEARCH DATA — normalized items from all pages
   ════════════════════════════════════════════════════════════ */

import type { SearchCategory, SearchItem } from "@/interfaces/search/interface";

const INDUSTRY_LABELS: Record<string, string> = {
  rendering: "Rendering",
  chicken_meat: "Chicken Meat",
  biofuels: "Biofuels",
  feed: "Feed",
  fertilizers: "Fertilizers",
  petfood: "Pet Food",
  grains: "Grains",
  veg_oils: "Veg. Oils",
  aquaculture: "Aquaculture",
};

const COUNTRY_LABELS: Record<string, string> = {
  us: "United States", mx: "Mexico", ar: "Argentina", br: "Brazil",
  co: "Colombia", cl: "Chile", pe: "Peru", de: "Germany",
  nl: "Netherlands", cn: "China", in: "India", au: "Australia",
  za: "South Africa", ng: "Nigeria", es: "Spain", ec: "Ecuador",
  be: "Belgium", th: "Thailand",
};

/* ── Data cards ───────────────────────────────────────── */
const dataItems: SearchItem[] = [
  { id: "d-r01", title: "Rendering Imports — United States", subtitle: "Import volume, CIF price, Top origins", category: "data", industry: "rendering", country: "us", date: "04/2025", url: "/data", meta: "Dashboard · $70" },
  { id: "d-r02", title: "Rendering Imports — Mexico", subtitle: "Import volume, CIF price, Top origins", category: "data", industry: "rendering", country: "mx", date: "04/2025", url: "/data", meta: "Dashboard · $70" },
  { id: "d-r05", title: "Rendering Exports — United States", subtitle: "Export volume, FOB value, Destinations", category: "data", industry: "rendering", country: "us", date: "03/2025", url: "/data", meta: "Dashboard · $70" },
  { id: "d-r10", title: "IMPORTS RESEARCH", subtitle: "Rendering · Research report", category: "data", industry: "rendering", country: "us", date: "01 May 2025", url: "/data", meta: "Research · $70" },
  { id: "d-b01", title: "Biofuels Imports — United States", subtitle: "Biodiesel vol, Ethanol ref, USD/ton", category: "data", industry: "biofuels", country: "us", date: "04/2025", url: "/data", meta: "Dashboard · $70" },
  { id: "d-b03", title: "Biofuels Pricing — Argentina", subtitle: "Biodiesel vol, Ethanol ref, USD/ton", category: "data", industry: "biofuels", country: "ar", date: "03/2025", url: "/data", meta: "Dashboard · $70" },
  { id: "d-f01", title: "Fertilizers Imports — United States", subtitle: "Urea CIF, Phosphate, Trade flow", category: "data", industry: "fertilizers", country: "us", date: "04/2025", url: "/data", meta: "Dashboard · $70" },
  { id: "d-p01", title: "Pet Food Imports — United States", subtitle: "Dry food, Wet food, USD/kg", category: "data", industry: "petfood", country: "us", date: "04/2025", url: "/data", meta: "Dashboard · $70" },
  { id: "d-c01", title: "Chicken Meat Imports — United States", subtitle: "Live weight, Cut imports, FOB value", category: "data", industry: "chicken_meat", country: "us", date: "04/2025", url: "/data", meta: "Dashboard · $70" },
  { id: "d-g01", title: "Grains Imports — United States", subtitle: "Soy FOB, Corn CIF, Trade vol", category: "data", industry: "grains", country: "us", date: "04/2025", url: "/data", meta: "Dashboard · $70" },
];

/* ── News ─────────────────────────────────────────────── */
const newsItems: SearchItem[] = [
  { id: "n-1", title: "La Unión Nacional de Avicultores busca desarrollar un Sistema Integral de Información Estratégica", subtitle: "Poultry · Innovation", category: "news", industry: "chicken_meat", date: "2026-05-15", url: "/news", image: "assets/news_poultry.webp", meta: "News · 2h ago" },
  { id: "n-3", title: "¿Son los insectos una proteína sostenible para la alimentación animal?", subtitle: "Agriculture · Innovation", category: "news", industry: "feed", date: "2026-05-14", url: "/news", image: "assets/news_insects.webp", meta: "News · 1d ago" },
  { id: "n-5", title: "Mapa de fabricantes de alimentos para mascotas en EE. UU.", subtitle: "Big Data · Pet Food", category: "news", industry: "petfood", date: "2026-05-08", url: "/news", image: "assets/news_petfood_map.webp", meta: "News · 9d ago" },
  { id: "n-7", title: "Las importaciones de soja de China alcanzan un nivel casi récord", subtitle: "Commodities · Trade", category: "news", industry: "grains", date: "2026-04-28", url: "/news", meta: "News · 19d ago" },
  { id: "n-9", title: "ABRA lanza el exclusivo Monitor CSI", subtitle: "Rendering · Big Data", category: "news", industry: "rendering", date: "2026-04-18", url: "/news", meta: "News · 29d ago" },
  { id: "n-11", title: "EE.UU.: 2024 fue un año récord para las exportaciones de carne de cerdo", subtitle: "Meat · Commodities", category: "news", industry: "chicken_meat", date: "2026-04-05", url: "/news", meta: "News · 42d ago" },
];

/* ── Events ───────────────────────────────────────────── */
const eventItems: SearchItem[] = [
  { id: "e-100", title: "REAM 2026", subtitle: "4ª Reunión de las Américas · Agri-Food & Rendering", category: "events", industry: "rendering", date: "2026-09-08", url: "/events", meta: "Sep 8–10 · Mendoza, Argentina · AGM Organized" },
  { id: "e-1", title: "EFPRA 2026", subtitle: "European Fat Processors & Renderers Association Congress", category: "events", industry: "rendering", date: "2026-05-27", url: "/events", meta: "May 27–30 · Tenerife, Spain" },
  { id: "e-2", title: "VICTAM EUROPA", subtitle: "World's largest animal feed processing event", category: "events", industry: "feed", date: "2026-06-02", url: "/events", meta: "Jun 2–4 · Utrecht, Netherlands" },
  { id: "e-3", title: "Argus Biofuels Conference", subtitle: "International biofuels & feedstock pricing summit", category: "events", industry: "biofuels", date: "2026-06-15", url: "/events", meta: "Jun 15–17 · São Paulo, Brazil" },
  { id: "e-5", title: "Foro de Mascotas 2026", subtitle: "Feria líder de la industria de alimentos para mascotas en LatAm", category: "events", industry: "petfood", date: "2026-06-24", url: "/events", meta: "Jun 24–26 · Guadalajara, Mexico" },
  { id: "e-7", title: "Bioenergy Americas Summit", subtitle: "Renewable fuels, SAF feedstocks and biobased materials", category: "events", industry: "biofuels", date: "2026-07-22", url: "/events", meta: "Jul 22–24 · Houston, United States" },
  { id: "e-9", title: "Feed & Grain Expo", subtitle: "Premier event for feed, grain and agri-processing professionals", category: "events", industry: "feed", date: "2026-08-12", url: "/events", meta: "Aug 12–14 · Denver, United States" },
  { id: "e-12", title: "AGM LATAM Data Summit", subtitle: "Annual intelligence conference for the agri-food sector in Latin America", category: "events", industry: "rendering", date: "2026-11-05", url: "/events", meta: "Nov 5–6 · Bogotá, Colombia · AGM Organized" },
];

/* ── Dashboards ───────────────────────────────────────── */
const dashboardItems: SearchItem[] = [
  { id: "db-rendering", title: "Rendering Dashboard", subtitle: "Imports · Exports · Production · Pricing", category: "dashboards", industry: "rendering", url: "/dashboard", meta: "2.84B · 3.42M t · $832/t" },
  { id: "db-petfood", title: "Pet Food Dashboard", subtitle: "Imports · Exports · Production · Pricing", category: "dashboards", industry: "petfood", url: "/dashboard", meta: "4.21B · 2.85M t · $1,478/t" },
  { id: "db-biofuels", title: "Biofuels Dashboard", subtitle: "Imports · Exports · Production · Pricing", category: "dashboards", industry: "biofuels", url: "/dashboard", meta: "5.68B · 4.21M t · $1,349/t" },
  { id: "db-feed", title: "Feed Dashboard", subtitle: "Imports · Exports · Production · Pricing", category: "dashboards", industry: "feed", url: "/dashboard", meta: "Trade flows · Composition · Protein" },
  { id: "db-chicken", title: "Chicken Meat Dashboard", subtitle: "Imports · Exports · Production · Pricing", category: "dashboards", industry: "chicken_meat", url: "/dashboard", meta: "Live weight · Cut imports · FOB" },
  { id: "db-grains", title: "Grains Dashboard", subtitle: "Imports · Exports · Production · Pricing", category: "dashboards", industry: "grains", url: "/dashboard", meta: "Soy FOB · Corn CIF · Trade vol" },
];

/* ── Products (marketplace categories) ───────────────── */
const productItems: SearchItem[] = [
  { id: "pr-rendering", title: "Byproducts for Recycling", subtitle: "Animal by-products · Feather meal · Blood meal · Bone meal", category: "products", industry: "rendering", url: "/marketplace", image: "assets/marketplace_byproducts.webp", meta: "Featured Category" },
  { id: "pr-fats", title: "Fats & Oils", subtitle: "Animal fats · Vegetable oils · UCO · Tallow", category: "products", industry: "veg_oils", url: "/marketplace", image: "assets/marketplace_fats.webp", meta: "Category" },
  { id: "pr-grains", title: "Grains & Oilseeds", subtitle: "Soy · Corn · Wheat · Barley · Sorghum", category: "products", industry: "grains", url: "/marketplace", image: "assets/marketplace_grain.webp", meta: "Category" },
  { id: "pr-petfood", title: "Pet Food", subtitle: "Dry food · Wet food · Treats · Ingredients", category: "products", industry: "petfood", url: "/marketplace", image: "assets/petfood.webp", meta: "Category" },
  { id: "pr-biofuels", title: "Biofuels", subtitle: "Biodiesel · Ethanol · SAF · Feedstocks", category: "products", industry: "biofuels", url: "/marketplace", image: "assets/biofuels.webp", meta: "Category" },
  { id: "pr-fertilizers", title: "Fertilizers", subtitle: "Urea · Phosphate · Potash · NPK", category: "products", industry: "fertilizers", url: "/marketplace", image: "assets/fertilizers.webp", meta: "Category" },
];

export const ALL_SEARCH_ITEMS: SearchItem[] = [
  ...dataItems,
  ...newsItems,
  ...eventItems,
  ...dashboardItems,
  ...productItems,
];

export const CATEGORY_LABELS: Record<SearchCategory, string> = {
  all: "All Results",
  data: "Data & Reports",
  products: "Products",
  news: "News",
  events: "Events",
  dashboards: "Dashboards",
};

export const CATEGORY_COLORS: Record<SearchCategory, string> = {
  all: "#67A6FF",
  data: "#0066FF",
  products: "#33CC00",
  news: "#FCB514",
  events: "#F35959",
  dashboards: "#67A6FF",
};

export function searchItems(query: string, category: SearchCategory = "all", limit = 10): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  let items = ALL_SEARCH_ITEMS;
  if (category !== "all") {
    items = items.filter((i) => i.category === category);
  }

  const scored = items.map((item) => {
    let score = 0;
    const text = `${item.title} ${item.subtitle || ""} ${item.industry || ""} ${item.country || ""} ${item.meta || ""}`.toLowerCase();

    if (item.title.toLowerCase().includes(q)) score += 10;
    if (item.subtitle?.toLowerCase().includes(q)) score += 5;
    if (item.industry?.toLowerCase().includes(q)) score += 3;
    if (item.country && COUNTRY_LABELS[item.country]?.toLowerCase().includes(q)) score += 3;
    if (text.includes(q)) score += 1;

    return { item, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.item);
}

export function countByCategory(query: string): Record<SearchCategory, number> {
  const q = query.trim().toLowerCase();
  const counts: Record<string, number> = { all: 0, data: 0, products: 0, news: 0, events: 0, dashboards: 0 };

  if (!q) return counts as Record<SearchCategory, number>;

  ALL_SEARCH_ITEMS.forEach((item) => {
    const text = `${item.title} ${item.subtitle || ""} ${item.industry || ""}`.toLowerCase();
    if (text.includes(q)) {
      counts.all++;
      counts[item.category]++;
    }
  });

  return counts as Record<SearchCategory, number>;
}
