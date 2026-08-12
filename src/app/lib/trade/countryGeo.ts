"use client";

import { feature } from "topojson-client";
import worldTopo from "world-atlas/countries-110m.json";
import type { FeatureCollection, Geometry, Position } from "geojson";

export type CountryWorldFeatureProps = {
  name: string;
  iso: string;
  volumenMt: number;
};

const GEO_NAME_SET: ReadonlySet<string> = (() => {
  try {
    const topo = worldTopo as unknown as { objects: { countries: unknown } };
    const fc = feature(topo as never, topo.objects.countries as never) as unknown as {
      features: Array<{ properties: { name: string } }>;
    };
    return new Set(fc.features.map((f) => f.properties.name));
  } catch {
    return new Set();
  }
})();

const ALIASES: Record<string, string> = {
  "United States": "United States of America",
  "Taiwan, China": "Taiwan",
  "Solomon Islands": "Solomon Is.",
};

export function normalizeCountryName(name: string): string {
  const t = (name ?? "").trim();
  if (GEO_NAME_SET.has(t)) return t;
  const alias = ALIASES[t];
  if (alias) return alias;
  const stripped = t.replace(/,.*$/, "").trim();
  if (stripped !== t && GEO_NAME_SET.has(stripped)) return stripped;
  return t;
}

function wrapLon(lon: number): number {
  let l = lon;
  while (l > 180) l -= 360;
  while (l < -180) l += 360;
  return l;
}

/**
 * Split a single ring at the antimeridian so every resulting ring stays inside
 * [-180, 180]. Rings that never cross it are returned untouched. This prevents
 * the classic MapLibre artifacts (stretched fills, diagonal seams, "formitas")
 * caused by world-atlas polygons that wrap around ±180 (Russia, Fiji, etc.).
 */
function splitRingAtAntimeridian(ring: Position[]): Position[][] {
  const n = ring.length;
  if (n < 3) return [ring];

  const pts = ring.map(([lon, lat]) => [wrapLon(lon), lat] as Position);

  // Indices where the ring crosses the antimeridian: the segment leaving
  // `breakIdx - 1` and entering `breakIdx` jumps by more than 180°.
  const breaks: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    if (Math.abs(b[0] - a[0]) > 180) breaks.push((i + 1) % n);
  }
  if (breaks.length === 0) return [ring];

  // Intersection of the segment (idx-1 -> idx) with the antimeridian (±180).
  const intersectionAt = (idx: number): Position => {
    const prev = pts[(idx - 1 + n) % n];
    const cur = pts[idx];
    const delta = cur[0] - prev[0];
    const target = delta > 0 ? 180 : -180;
    const t = (target - prev[0]) / delta;
    return [target, prev[1] + t * (cur[1] - prev[1])];
  };

  // Every crossing splits the ring: walk the arc between consecutive crossings
  // and close each arc along the antimeridian.
  const pieces: Position[][] = [];
  const m = breaks.length;
  for (let k = 0; k < m; k++) {
    const start = breaks[k];
    const end = breaks[(k + 1) % m];
    const piece: Position[] = [intersectionAt(start)];
    let i = start;
    while (i !== end) {
      piece.push(pts[i]);
      i = (i + 1) % n;
    }
    piece.push(intersectionAt(end));
    pieces.push(piece);
  }
  return pieces;
}

function splitGeometry(geometry: Geometry): Geometry {
  switch (geometry.type) {
    case "Polygon":
      return {
        type: "MultiPolygon",
        coordinates: splitRingAtAntimeridian(geometry.coordinates[0]).map(
          (ring) => [ring],
        ),
      };
    case "MultiPolygon":
      return {
        type: "MultiPolygon",
        coordinates: geometry.coordinates.flatMap((poly) =>
          splitRingAtAntimeridian(poly[0]).map((ring) => [ring]),
        ),
      };
    default:
      return geometry;
  }
}

export function buildWorldCountries(): FeatureCollection<Geometry, CountryWorldFeatureProps> {
  const topo = worldTopo as unknown;
  const countries = (topo as { objects: { countries: unknown } }).objects.countries as never;
  const fc = feature(topo as never, countries) as unknown as FeatureCollection<Geometry, { name: string }>;
  return {
    type: "FeatureCollection",
    features: fc.features.map((f, i) => {
      const name = f.properties?.name ?? "";
      return {
        type: "Feature" as const,
        id: f.id ?? `geo-${i}`,
        properties: { name, iso: String(f.id ?? ""), volumenMt: 0 },
        geometry: splitGeometry(f.geometry),
      };
    }),
  };
}

export function applyCountryVolumes(
  geo: FeatureCollection<Geometry, CountryWorldFeatureProps>,
  volumes: Array<{ country: string; volumenMt: number }>,
): FeatureCollection<Geometry, CountryWorldFeatureProps> {
  const byName = new Map(volumes.map(v => [normalizeCountryName(v.country), v.volumenMt]));
  return {
    ...geo,
    features: geo.features.map((f) => ({
      ...f,
      properties: { ...f.properties, volumenMt: byName.get(f.properties.name) ?? 0 },
    })),
  };
}
