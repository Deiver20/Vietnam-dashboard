import type { Coords, MapItem } from "@/interfaces/marketplace/interface";

/* ═══════════════════════════════════════════════════════════
   Constants & helpers (shared by the marketplace map views)
   ═══════════════════════════════════════════════════════════ */

export const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
export const MAP_W = 1000;
export const MAP_H_FLAT = 500; // equirectangular projection height (lat +90..-90), used for centering
export const MAP_VB_FLAT_H = 416; // displayed viewBox height — crops the empty south pole (lat ≈ -60 down)
export const FLAT_SCALE = MAP_W / (2 * Math.PI); // fills the rectangle edge-to-edge, straight sides
export const GLOBE_VB = 560; // square globe viewBox ("meet"-fit to the stage)
// The globe's projection scale is dynamic now — useMarketplaceMap derives it
// from the /industries camera-dolly model so both globes match in size/zoom.
const DEG = Math.PI / 180;

export const BLUE = "#2A84FF"; // a product (no quantity/price)
export const GREEN = "#33CC00"; // a live offer (product with quantity + available price)

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export const shortLon = (d: number) => ((((d % 360) + 540) % 360) - 180);
export const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

/** Great-circle central angle between two [lon,lat] points, in degrees. */
export function angularDist(a: Coords, b: Coords) {
  const f1 = a[1] * DEG;
  const f2 = b[1] * DEG;
  const dl = (b[0] - a[0]) * DEG;
  const c = Math.sin(f1) * Math.sin(f2) + Math.cos(f1) * Math.cos(f2) * Math.cos(dl);
  return Math.acos(clamp(c, -1, 1)) / DEG;
}

/** Is a point on the front hemisphere of an orthographic globe? */
export const visibleOnGlobe = (p: Coords, center: Coords) => angularDist(p, center) < 88;

export interface Cluster {
  id: string;
  coords: Coords;
  items: MapItem[];
}

/** Greedy proximity clustering by great-circle distance. */
export function clusterItems(items: MapItem[], thresholdDeg: number): Cluster[] {
  const clusters: Cluster[] = [];
  for (const it of items) {
    let placed = false;
    for (const c of clusters) {
      if (angularDist(it.coords, c.coords) <= thresholdDeg) {
        c.items.push(it);
        const n = c.items.length;
        c.coords = [
          c.items.reduce((s, x) => s + x.coords[0], 0) / n,
          c.items.reduce((s, x) => s + x.coords[1], 0) / n,
        ];
        placed = true;
        break;
      }
    }
    if (!placed) clusters.push({ id: it.id, coords: [it.coords[0], it.coords[1]], items: [it] });
  }
  return clusters;
}

export const truncate = (str: string, n = 20) =>
  str.length > n ? str.slice(0, n).replace(/\s+$/, "") + "…" : str;
