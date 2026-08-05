import type {
  BentoCellDef,
  CountryDossier,
  DataPage,
  FilterState,
  VizData,
} from "./types";
import { seededRng, walk } from "./random";
import { getIndustry } from "./industries";
import { getCountryName } from "./world";

const YEAR_MIN = 2016;
const YEAR_MAX = 2025;
const YEARS = Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) =>
  String(YEAR_MIN + i)
);

const SEGMENTS: Record<string, string[]> = {
  meat: ["Beef", "Pork", "Poultry", "Sheep & Goat"],
  biofuels: ["Ethanol", "Biodiesel", "Renewable Diesel", "Biogas"],
  feed: ["Poultry Feed", "Swine Feed", "Cattle Feed", "Aqua Feed"],
  fertilizers: ["Nitrogen", "Phosphate", "Potash", "Specialty"],
  rendering: ["Edible Fats", "Inedible Fats", "Protein Meals", "Hides"],
  petfood: ["Dry Food", "Wet Food", "Treats", "Veterinary Diets"],
  grains: ["Wheat", "Maize", "Rice", "Barley"],
  fats_oils: ["Palm", "Soybean Oil", "Rapeseed", "Animal Fats"],
  additives: ["Enzymes", "Probiotics", "Amino Acids", "Minerals"],
  livestock: ["Cattle", "Swine", "Poultry", "Small Ruminants"],
};

const PRODUCTS: Record<string, string[]> = {
  meat: ["Beef cuts", "Pork bellies", "Chicken breast", "Lamb", "Offal", "Sausages", "Cured meats", "Frozen meat"],
  biofuels: ["Ethanol", "FAME", "HVO", "Biogas", "Pellets", "Bagasse", "Corn oil", "Glycerin"],
  feed: ["Compound feed", "Premix", "Concentrates", "Soymeal", "Fishmeal", "DDGS", "Silage", "Mineral blocks"],
  fertilizers: ["Urea", "DAP", "MAP", "Potash", "NPK blends", "Ammonia", "Nitrates", "Micronutrients"],
  rendering: ["Tallow", "MBM", "Poultry meal", "Feather meal", "Blood meal", "Yellow grease", "Gelatin", "Hides"],
  petfood: ["Kibble", "Wet cans", "Treats", "Toppers", "Freeze-dried", "Vet diets", "Supplements", "Chews"],
  grains: ["Wheat", "Maize", "Rice", "Barley", "Oats", "Sorghum", "Rye", "Millet"],
  fats_oils: ["Palm oil", "Soybean oil", "Rapeseed oil", "Sunflower oil", "Tallow", "Lard", "Coconut oil", "Olive oil"],
  additives: ["Enzymes", "Probiotics", "Lysine", "Methionine", "Phytase", "Vitamins", "Antioxidants", "Binders"],
  livestock: ["Cattle", "Calves", "Piglets", "Broilers", "Layers", "Lambs", "Goats", "Dairy cows"],
};

const SOURCES: Record<string, string> = {
  meat: "USDA FAS & national meat boards",
  biofuels: "IEA Bioenergy & EPA RFS data",
  feed: "FEFAC & global feed survey",
  fertilizers: "IFA & World Bank commodity data",
  rendering: "NRA & EFPRA industry reports",
  petfood: "Euromonitor & APPA market data",
  grains: "IGC & USDA WASDE",
  fats_oils: "USDA Oilseeds & Oil World",
  additives: "FEFANA & market research panels",
  livestock: "FAOSTAT & national herd census",
};

const REGIONS = ["National", "North", "South", "East", "West"];

function yearsOf(filters: FilterState): [number, number] {
  const v = filters["years"];
  if (Array.isArray(v)) return [v[0], v[1]];
  return [YEAR_MIN, YEAR_MAX];
}

function sliceYears(values: number[], [y0, y1]: [number, number]) {
  return values.slice(y0 - YEAR_MIN, y1 - YEAR_MIN + 1);
}

function categoriesFor([y0, y1]: [number, number]) {
  return YEARS.slice(y0 - YEAR_MIN, y1 - YEAR_MIN + 1);
}

function str(filters: FilterState, id: string, fallback: string) {
  const v = filters[id];
  return typeof v === "string" ? v : fallback;
}

export function buildDossier(
  countryId: string,
  industryId: string
): CountryDossier {
  const industry = getIndustry(industryId);
  const industryName = industry?.name ?? industryId;
  const countryName = getCountryName(countryId);
  const seedBase = `${countryId}:${industryId}`;
  const rng = seededRng(seedBase);

  const gdpShare = Math.round((2 + rng() * 16) * 10) / 10;
  const growth = Math.round((rng() * 9 - 1.5) * 10) / 10;
  const rank = 1 + Math.floor(rng() * 40);
  const segments = SEGMENTS[industryId] ?? SEGMENTS.grains;
  const products = PRODUCTS[industryId] ?? PRODUCTS.grains;
  const source = SOURCES[industryId] ?? "National statistics office";
  const updatedAt = `2026-07-${String(2 + Math.floor(rng() * 12)).padStart(2, "0")}`;

  const intro =
    `${industryName} accounts for an estimated ${gdpShare}% of ${countryName}'s ` +
    `economic output, ranking #${rank} worldwide. The sector ` +
    `${growth >= 0 ? "expanded" : "contracted"} ${Math.abs(growth)}% year-on-year, ` +
    `led by ${segments[0].toLowerCase()} and ${segments[1].toLowerCase()}. ` +
    `Explore the data variables below.`;

  const yearRangeFilter = {
    kind: "yearRange" as const,
    id: "years",
    label: "Years",
    min: YEAR_MIN,
    max: YEAR_MAX,
    defaultValue: [YEAR_MIN, YEAR_MAX] as [number, number],
  };

  const kpiCell = (
    id: string,
    title: string,
    span: [number, number],
    items: (filters: FilterState) => VizData & { viz: "kpi" }
  ): BentoCellDef => ({ id, title, span, data: items });

  const overview: DataPage = {
    id: "overview",
    tabLabel: "Overview",
    title: `${industryName} Overview`,
    source: `${source} — sector overview tables (simulated data)`,
    filters: [
      {
        kind: "segmented",
        id: "metric",
        label: "Metric",
        options: ["Value", "Volume"],
        defaultValue: "Value",
      },
      yearRangeFilter,
    ],
    cells: [
      kpiCell("ov-kpi", "Key Indicators", [6, 1], (filters) => {
        const metric = str(filters, "metric", "Value");
        const k = metric === "Value" ? 1 : 0.72;
        const r = seededRng(`${seedBase}:ovkpi:${metric}`);
        return {
          viz: "kpi",
          items: [
            { label: `${metric} of output`, value: Math.round(r() * 900 * k) / 10, unit: metric === "Value" ? "B USD" : "M t", delta: Math.round((r() * 12 - 3) * 10) / 10 },
            { label: "Share of GDP", value: gdpShare, unit: "%", delta: Math.round((r() * 2 - 0.8) * 10) / 10 },
            { label: "Global rank", value: rank, unit: "", delta: 0 },
            { label: "YoY growth", value: growth, unit: "%", delta: growth },
          ],
        };
      }),
      {
        id: "ov-trend",
        title: "Output Trend",
        span: [4, 2],
        data: (filters) => {
          const yr = yearsOf(filters);
          const metric = str(filters, "metric", "Value");
          const base = walk(`${seedBase}:ovtrend:${metric}`, YEARS.length, 30, 95);
          return {
            viz: "line",
            categories: categoriesFor(yr),
            series: [{ name: `${metric} index`, values: sliceYears(base, yr) }],
          };
        },
      },
      {
        id: "ov-share",
        title: "Segment Share",
        span: [2, 2],
        data: (filters) => {
          const metric = str(filters, "metric", "Value");
          const r = seededRng(`${seedBase}:ovshare:${metric}`);
          return {
            viz: "pie",
            items: segments.map((name) => ({ name, value: Math.round(10 + r() * 40) })),
          };
        },
      },
      {
        id: "ov-region",
        title: "Regional Distribution",
        span: [6, 1],
        data: (filters) => {
          const metric = str(filters, "metric", "Value");
          const r = seededRng(`${seedBase}:ovregion:${metric}`);
          const regions = REGIONS.slice(1);
          return {
            viz: "bar",
            categories: regions,
            series: [{ name: metric, values: regions.map(() => Math.round(20 + r() * 70)) }],
          };
        },
      },
    ],
  };

  const production: DataPage = {
    id: "production",
    tabLabel: "Production",
    title: `${industryName} Production`,
    source: `${source} — production series (simulated data)`,
    filters: [
      {
        kind: "select",
        id: "segment",
        label: "Segment",
        options: [
          { value: "all", label: "All segments" },
          ...segments.map((s) => ({ value: s, label: s })),
        ],
        defaultValue: "all",
      },
      yearRangeFilter,
    ],
    cells: [
      {
        id: "pr-trend",
        title: "Production by Segment",
        span: [4, 2],
        data: (filters) => {
          const yr = yearsOf(filters);
          const seg = str(filters, "segment", "all");
          const names = seg === "all" ? segments.slice(0, 3) : [seg];
          return {
            viz: "line",
            categories: categoriesFor(yr),
            series: names.map((name) => ({
              name,
              values: sliceYears(walk(`${seedBase}:pr:${name}`, YEARS.length, 15, 90), yr),
            })),
          };
        },
      },
      kpiCell("pr-kpi", "Capacity", [2, 2], (filters) => {
        const seg = str(filters, "segment", "all");
        const r = seededRng(`${seedBase}:prkpi:${seg}`);
        return {
          viz: "kpi",
          items: [
            { label: "Installed capacity", value: Math.round(r() * 800) / 10, unit: "GW·eq", delta: Math.round(r() * 80) / 10 },
            { label: "Utilization", value: Math.round((55 + r() * 40) * 10) / 10, unit: "%", delta: Math.round((r() * 6 - 2) * 10) / 10 },
          ],
        };
      }),
      {
        id: "pr-facilities",
        title: "Facilities by Region",
        span: [3, 2],
        data: (filters) => {
          const seg = str(filters, "segment", "all");
          const r = seededRng(`${seedBase}:prfac:${seg}`);
          const regions = REGIONS.slice(1);
          return {
            viz: "bar",
            categories: regions,
            series: [{ name: "Facilities", values: regions.map(() => Math.round(40 + r() * 260)) }],
          };
        },
      },
      {
        id: "pr-mix",
        title: "Output Mix",
        span: [3, 2],
        data: (filters) => {
          const seg = str(filters, "segment", "all");
          const r = seededRng(`${seedBase}:prmix:${seg}`);
          return {
            viz: "pie",
            items: products.slice(0, 4).map((name) => ({ name, value: Math.round(8 + r() * 30) })),
          };
        },
      },
    ],
  };

  const trade: DataPage = {
    id: "trade",
    tabLabel: "Trade",
    title: `${industryName} Trade`,
    source: `UN Comtrade & ${source} (simulated data)`,
    filters: [
      {
        kind: "segmented",
        id: "flow",
        label: "Flow",
        options: ["Exports", "Imports"],
        defaultValue: "Exports",
      },
      yearRangeFilter,
    ],
    cells: [
      {
        id: "tr-volume",
        title: "Trade Volume",
        span: [3, 2],
        data: (filters) => {
          const yr = yearsOf(filters);
          const flow = str(filters, "flow", "Exports");
          return {
            viz: "line",
            categories: categoriesFor(yr),
            series: [
              { name: flow, values: sliceYears(walk(`${seedBase}:tr:${flow}`, YEARS.length, 20, 90), yr) },
              { name: "Balance", values: sliceYears(walk(`${seedBase}:tr:bal`, YEARS.length, -15, 25), yr) },
            ],
          };
        },
      },
      {
        id: "tr-partners",
        title: "Top Partners",
        span: [3, 2],
        data: (filters) => {
          const flow = str(filters, "flow", "Exports");
          const r = seededRng(`${seedBase}:trp:${flow}`);
          const partners = ["China", "USA", "Germany", "Japan", "Brazil"].filter(
            (p) => p !== countryName
          ).slice(0, 4);
          return {
            viz: "bar",
            categories: partners,
            series: [{ name: flow, values: partners.map(() => Math.round(10 + r() * 80)) }],
          };
        },
      },
      {
        id: "tr-products",
        title: `Top Traded Products`,
        span: [4, 2],
        data: (filters) => {
          const flow = str(filters, "flow", "Exports");
          const r = seededRng(`${seedBase}:trt:${flow}`);
          const values = products.map(() => Math.round(r() * 4200) / 10);
          const total = values.reduce((a, b) => a + b, 0);
          const rows = products.map((p, i) => ({
            product: p,
            value: values[i],
            share: `${Math.round((values[i] / total) * 1000) / 10}%`,
          }));
          rows.sort((a, b) => b.value - a.value);
          return {
            viz: "table",
            columns: [
              { title: "Product", key: "product" },
              { title: `${flow} (M USD)`, key: "value", align: "right" },
              { title: "Share", key: "share", align: "right" },
            ],
            rows,
          };
        },
      },
      kpiCell("tr-kpi", "Openness", [2, 2], (filters) => {
        const flow = str(filters, "flow", "Exports");
        const r = seededRng(`${seedBase}:trkpi:${flow}`);
        return {
          viz: "kpi",
          items: [
            { label: `${flow} total`, value: Math.round(r() * 1400) / 10, unit: "B USD", delta: Math.round((r() * 14 - 4) * 10) / 10 },
            { label: "Trade openness", value: Math.round((20 + r() * 60) * 10) / 10, unit: "%", delta: Math.round((r() * 4 - 1) * 10) / 10 },
          ],
        };
      }),
    ],
  };

  const workforce: DataPage = {
    id: "workforce",
    tabLabel: "Workforce",
    title: `${industryName} Workforce`,
    source: `ILO labour statistics & ${source} (simulated data)`,
    filters: [
      {
        kind: "select",
        id: "region",
        label: "Region",
        options: REGIONS.map((v) => ({ value: v, label: v })),
        defaultValue: "National",
      },
      yearRangeFilter,
    ],
    cells: [
      kpiCell("wf-kpi", "Employment", [2, 2], (filters) => {
        const region = str(filters, "region", "National");
        const r = seededRng(`${seedBase}:wfkpi:${region}`);
        return {
          viz: "kpi",
          items: [
            { label: "Employed", value: Math.round(r() * 9000) / 10, unit: "k", delta: Math.round((r() * 8 - 3) * 10) / 10 },
            { label: "Avg. wage index", value: Math.round((80 + r() * 60) * 10) / 10, unit: "", delta: Math.round(r() * 5 * 10) / 10 },
          ],
        };
      }),
      {
        id: "wf-trend",
        title: "Employment Trend",
        span: [4, 2],
        data: (filters) => {
          const yr = yearsOf(filters);
          const region = str(filters, "region", "National");
          return {
            viz: "line",
            categories: categoriesFor(yr),
            series: [
              { name: "Employment", values: sliceYears(walk(`${seedBase}:wf:${region}`, YEARS.length, 40, 90), yr) },
            ],
          };
        },
      },
      {
        id: "wf-skills",
        title: "Skills Index",
        span: [3, 2],
        data: (filters) => {
          const region = str(filters, "region", "National");
          const r = seededRng(`${seedBase}:wfsk:${region}`);
          const indicators = ["Technical", "Digital", "Management", "R&D", "Operations"];
          return {
            viz: "radar",
            indicators: indicators.map((name) => ({ name, max: 100 })),
            series: [
              { name: region, values: indicators.map(() => Math.round(40 + r() * 55)) },
            ],
          };
        },
      },
      {
        id: "wf-regions",
        title: "Employment by Region",
        span: [3, 2],
        data: (filters) => {
          const region = str(filters, "region", "National");
          const r = seededRng(`${seedBase}:wfrg:${region}`);
          const employed = REGIONS.slice(1).map(() => Math.round(r() * 2400) / 10);
          const total = employed.reduce((a, b) => a + b, 0);
          const rows = REGIONS.slice(1).map((name, i) => ({
            region: name,
            employed: employed[i],
            share: `${Math.round((employed[i] / total) * 1000) / 10}%`,
          }));
          return {
            viz: "table",
            columns: [
              { title: "Region", key: "region" },
              { title: "Employed (k)", key: "employed", align: "right" },
              { title: "Share", key: "share", align: "right" },
            ],
            rows,
          };
        },
      },
    ],
  };

  return {
    countryId,
    countryName,
    industryId,
    industryName,
    cover: { title: industryName, intro },
    updatedAt,
    pages: [overview, production, trade, workforce],
  };
}
