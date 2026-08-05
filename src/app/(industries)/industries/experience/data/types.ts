// Typed contract of the mock data layer. Swapping in a real API only requires
// re-implementing api.ts against these same types.

export type FilterValue = string | [number, number];
export type FilterState = Record<string, FilterValue>;

// Minimal GeoJSON typings for the world atlas (transitive @types/geojson is not
// resolvable under pnpm, so the shapes we consume are declared here).
export type PolygonCoords = number[][][];
export type MultiPolygonCoords = number[][][][];

export interface WorldFeature {
  type: "Feature";
  id?: string | number;
  properties: { name: string };
  geometry:
    | { type: "Polygon"; coordinates: PolygonCoords }
    | { type: "MultiPolygon"; coordinates: MultiPolygonCoords };
}

export interface MultiLineStringGeometry {
  type: "MultiLineString";
  coordinates: number[][][];
}

export interface CornerCardData {
  title: string;
  kpi: { value: number; unit: string; delta: number };
  spark: number[];
}

export interface Industry {
  id: string;
  name: string;
  /** Chip icon — mirrors the INDUSTRY filter on /data. */
  emoji: string;
  /** Hero description shown under the industry title on Level 2. */
  description: string;
  /** Exactly 2 — Global Production and Global Price, bottom corners. */
  globalStats: CornerCardData[];
}

export type FilterDef =
  | {
      kind: "select";
      id: string;
      label: string;
      options: { value: string; label: string }[];
      defaultValue: string;
    }
  | {
      kind: "segmented";
      id: string;
      label: string;
      options: string[];
      defaultValue: string;
    }
  | {
      kind: "yearRange";
      id: string;
      label: string;
      min: number;
      max: number;
      defaultValue: [number, number];
    };

export type VizData =
  | {
      viz: "kpi";
      items: { label: string; value: number; unit: string; delta: number }[];
    }
  | {
      viz: "line";
      categories: string[];
      series: { name: string; values: number[] }[];
    }
  | {
      viz: "bar";
      categories: string[];
      series: { name: string; values: number[] }[];
    }
  | { viz: "pie"; items: { name: string; value: number }[] }
  | {
      viz: "radar";
      indicators: { name: string; max: number }[];
      series: { name: string; values: number[] }[];
    }
  | {
      viz: "table";
      columns: { title: string; key: string; align?: "left" | "right" }[];
      rows: Record<string, string | number>[];
    };

export interface BentoCellDef {
  id: string;
  title: string;
  /** [columns, rows] spanned inside the 6×4 bento grid. */
  span: [number, number];
  data: (filters: FilterState) => VizData;
}

export interface DataPage {
  id: string;
  tabLabel: string;
  title: string;
  source: string;
  filters: FilterDef[];
  cells: BentoCellDef[];
}

export interface CountryDossier {
  countryId: string;
  countryName: string;
  industryId: string;
  industryName: string;
  cover: { title: string; intro: string };
  /** ISO date of the latest data update. */
  updatedAt: string;
  pages: DataPage[];
}
