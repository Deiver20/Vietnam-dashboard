import { CanvasTexture, SRGBColorSpace } from "three";
import { geoBounds, type GeoProjection } from "d3-geo";
import type { Feature } from "geojson";

// High-resolution top-face texture for the selected country: the global
// 4096px earth map only gives a country a couple hundred pixels, so Level 3
// composes a dedicated texture from NASA GIBS Blue Marble tiles (same shaded
// relief style as the globe, CORS-open, no API key). Both the tiles and the
// flat shape use Mercator, so tiles map affinely onto the fitted projection.

// Design-space box the flat country is fitted into (world units at z=0).
// flatCountry.tsx fits its d3 projection to this same box.
export const FIT_W = 1.5;
export const FIT_H = 1.1;

const TILE_URL = (z: number, y: number, x: number) =>
  "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/" +
  `BlueMarble_ShadedRelief_Bathymetry/default/default/GoogleMapsCompatible_Level8/${z}/${y}/${x}.jpeg`;
const MAX_ZOOM = 8; // the GIBS layer's deepest level (≈500 m/px)
const TARGET_PX = 2048; // canvas width, i.e. on-screen budget for FIT_W
const MAX_TILES = 80;
const MAX_MERC_LAT = 85.051; // Web-Mercator latitude limit
const CACHE_LIMIT = 6;

const cache = new Map<string, CanvasTexture>();

const latToTileY = (lat: number, n: number) => {
  const phi = (Math.min(MAX_MERC_LAT, Math.max(-MAX_MERC_LAT, lat)) * Math.PI) / 180;
  const y = (1 - Math.log(Math.tan(phi) + 1 / Math.cos(phi)) / Math.PI) / 2;
  return Math.min(n - 1, Math.max(0, Math.floor(y * n)));
};

const tileYToLat = (y: number, n: number) =>
  (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI;

function loadTile(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export async function loadCountryTexture(
  countryId: string,
  feature: Feature,
  projection: GeoProjection
): Promise<CanvasTexture | null> {
  const cached = cache.get(countryId);
  if (cached) return cached;

  const [[west, south], [east, north]] = geoBounds(feature as never);
  const lonSpan = east - west;
  // Antimeridian countries (Fiji): the fitted projection splits them anyway,
  // so a stitched texture can't line up — keep the global texture there.
  if (lonSpan <= 0) return null;

  // Deep enough that the country fills the canvas budget, capped by the
  // layer's max level and a sane tile count.
  let z = Math.min(
    MAX_ZOOM,
    Math.max(2, Math.ceil(Math.log2((TARGET_PX * 360) / (256 * lonSpan))))
  );
  let n = 2 ** z;
  let x0 = Math.floor(((west + 180) / 360) * n);
  let x1 = Math.floor(((east + 180) / 360) * n);
  let y0 = latToTileY(north, n);
  let y1 = latToTileY(south, n);
  while (z > 2 && (x1 - x0 + 1) * (y1 - y0 + 1) > MAX_TILES) {
    z -= 1;
    n = 2 ** z;
    x0 = Math.floor(((west + 180) / 360) * n);
    x1 = Math.floor(((east + 180) / 360) * n);
    y0 = latToTileY(north, n);
    y1 = latToTileY(south, n);
  }

  const scale = TARGET_PX / FIT_W;
  const canvas = document.createElement("canvas");
  canvas.width = TARGET_PX;
  canvas.height = Math.round(FIT_H * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const jobs: Promise<void>[] = [];
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      jobs.push(
        loadTile(TILE_URL(z, ty, tx)).then((img) => {
          // Both spaces are Mercator: projecting the tile's corners lands it
          // affinely on the canvas. Slight bleed hides antialiasing seams.
          const nw = projection([(tx / n) * 360 - 180, tileYToLat(ty, n)])!;
          const se = projection([
            ((tx + 1) / n) * 360 - 180,
            tileYToLat(ty + 1, n),
          ])!;
          const cx = (nw[0] + FIT_W / 2) * scale;
          const cy = (nw[1] + FIT_H / 2) * scale;
          ctx.drawImage(
            img,
            cx - 0.5,
            cy - 0.5,
            (se[0] - nw[0]) * scale + 1,
            (se[1] - nw[1]) * scale + 1
          );
        })
      );
    }
  }
  const results = await Promise.allSettled(jobs);
  if (!results.some((r) => r.status === "fulfilled")) return null;

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 8;

  cache.set(countryId, tex);
  if (cache.size > CACHE_LIMIT) {
    const [oldestId, oldest] = cache.entries().next().value!;
    oldest.dispose();
    cache.delete(oldestId);
  }
  return tex;
}
