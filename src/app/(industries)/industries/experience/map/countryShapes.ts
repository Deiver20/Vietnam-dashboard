import {
  BufferGeometry,
  Float32BufferAttribute,
  ShapeUtils,
  Vector2,
  Vector3,
} from "three";
import { countryIdOf, getDetailedWorld } from "../data/world";
import type { WorldFeature } from "../data/types";

/* Geometry is built from the runtime-fetched 50m polygons: callers must have
   awaited loadDetailedWorld() first (globe.tsx suspends on it; warmup.ts
   pre-fills the caches below during idle once the data lands). */
function requireDetailed() {
  const detailed = getDetailedWorld();
  if (!detailed) {
    throw new Error(
      "countryShapes: loadDetailedWorld() has not resolved yet — suspend on it before building geometry"
    );
  }
  return detailed;
}

const DEG = Math.PI / 180;

/** Standard three.js spherical mapping — consistent across fills/borders/centroids. */
export function lonLatToVector3(
  lon: number,
  lat: number,
  r: number,
  target = new Vector3()
) {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  return target.set(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

/** Tangent pointing north on the sphere at [lon, lat] (for camera roll). */
export function northTangent(lon: number, lat: number) {
  const a = lonLatToVector3(lon, Math.min(89.9, lat + 0.2), 1);
  const b = lonLatToVector3(lon, Math.max(-89.9, lat - 0.2), 1);
  return a.sub(b).normalize();
}

/** Approximate degrees between two lon/lat points, lat-corrected. */
function edgeDeg(a: Vector2, b: Vector2) {
  const latMid = ((a.y + b.y) / 2) * DEG;
  const dx = (a.x - b.x) * Math.cos(latMid);
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

/**
 * Conforming adaptive subdivision in lon/lat space. The split criterion is
 * per-edge (symmetric for the two triangles sharing it) and midpoints are
 * cached, so no T-junction cracks appear when vertices are later projected
 * onto the sphere.
 */
function subdivide(verts: Vector2[], indices: number[], maxDeg: number) {
  for (let pass = 0; pass < 10; pass++) {
    const midCache = new Map<string, number>();
    const midpoint = (i: number, j: number) => {
      const key = i < j ? `${i}_${j}` : `${j}_${i}`;
      let idx = midCache.get(key);
      if (idx === undefined) {
        idx = verts.length;
        verts.push(
          new Vector2(
            (verts[i].x + verts[j].x) / 2,
            (verts[i].y + verts[j].y) / 2
          )
        );
        midCache.set(key, idx);
      }
      return idx;
    };

    const next: number[] = [];
    let changed = false;

    for (let t = 0; t < indices.length; t += 3) {
      const i0 = indices[t],
        i1 = indices[t + 1],
        i2 = indices[t + 2];
      const long0 = edgeDeg(verts[i1], verts[i2]) > maxDeg;
      const long1 = edgeDeg(verts[i2], verts[i0]) > maxDeg;
      const long2 = edgeDeg(verts[i0], verts[i1]) > maxDeg;
      const count = (long0 ? 1 : 0) + (long1 ? 1 : 0) + (long2 ? 1 : 0);

      if (count === 0) {
        next.push(i0, i1, i2);
        continue;
      }
      changed = true;

      if (count === 3) {
        const m0 = midpoint(i1, i2);
        const m1 = midpoint(i2, i0);
        const m2 = midpoint(i0, i1);
        next.push(i0, m2, m1, i1, m0, m2, i2, m1, m0, m2, m0, m1);
      } else if (count === 2) {
        // Rotate so the short edge is (i0, i1).
        let a = i0, b = i1, c = i2;
        if (!long0 && long1 && long2) [a, b, c] = [i1, i2, i0];
        else if (long0 && !long1 && long2) [a, b, c] = [i2, i0, i1];
        else [a, b, c] = [i0, i1, i2]; // long0 && long1: short edge is (i0,i1)
        const mBC = midpoint(b, c);
        const mCA = midpoint(c, a);
        next.push(a, b, mBC, a, mBC, mCA, mCA, mBC, c);
      } else {
        // One long edge — rotate so it is (i1, i2).
        let a = i0, b = i1, c = i2;
        if (long1) [a, b, c] = [i1, i2, i0];
        else if (long2) [a, b, c] = [i2, i0, i1];
        const m = midpoint(b, c);
        next.push(a, b, m, a, m, c);
      }
    }

    indices = next;
    if (!changed) break;
  }
  return { verts, indices };
}

function ringToVec2(ring: number[][]) {
  const pts = ring.map((c) => new Vector2(c[0], c[1]));
  // Drop the GeoJSON closing point.
  if (pts.length > 1 && pts[0].equals(pts[pts.length - 1])) pts.pop();
  // Unwrap rings that mix longitudes on both sides of the antimeridian
  // (e.g. Fiji) — otherwise triangulation spans the whole map. The sphere
  // projection is periodic in longitude, so lon > 180 is fine.
  let minLon = Infinity;
  let maxLon = -Infinity;
  for (const p of pts) {
    minLon = Math.min(minLon, p.x);
    maxLon = Math.max(maxLon, p.x);
  }
  if (maxLon - minLon > 180) {
    for (const p of pts) if (p.x < 0) p.x += 360;
  }
  return pts;
}

function polygonRings(feature: WorldFeature): number[][][][] {
  return feature.geometry.type === "Polygon"
    ? [feature.geometry.coordinates]
    : feature.geometry.coordinates;
}

export interface CountryGeom {
  id: string;
  name: string;
  geometry: BufferGeometry;
}

function buildCountryGeometry(
  feature: WorldFeature,
  radius: number,
  maxDeg = 4
) {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const allIndices: number[] = [];
  let offset = 0;
  const v3 = new Vector3();

  for (const polygon of polygonRings(feature)) {
    const contour = ringToVec2(polygon[0]);
    if (contour.length < 3) continue;
    const holes = polygon.slice(1).map(ringToVec2);

    const triangles = ShapeUtils.triangulateShape(contour, holes);
    let verts = contour.concat(...holes);
    let indices = triangles.flat();
    ({ verts, indices } = subdivide(verts, indices, maxDeg));

    for (const v of verts) {
      lonLatToVector3(v.x, v.y, radius, v3);
      positions.push(v3.x, v3.y, v3.z);
      v3.normalize();
      normals.push(v3.x, v3.y, v3.z);
      // Matches SphereGeometry's equirectangular UVs, so the same earth
      // texture lines up between the ocean sphere and the country fills.
      // Unwrapped lons (> 180, e.g. Fiji) give u > 1 — RepeatWrapping.
      uvs.push((v.x + 180) / 360, (v.y + 90) / 180);
    }
    for (const i of indices) allIndices.push(i + offset);
    offset += verts.length;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(allIndices);
  return geometry;
}

let countriesCache: CountryGeom[] | null = null;

export function getCountryGeometries(radius: number): CountryGeom[] {
  if (!countriesCache) {
    countriesCache = requireDetailed().features.map((f) => ({
      id: countryIdOf(f),
      name: f.properties.name,
      geometry: buildCountryGeometry(f, radius),
    }));
  }
  return countriesCache;
}

let bordersCache: BufferGeometry | null = null;

/** All country borders as one LineSegments geometry, segments subdivided to hug the sphere. */
export function getBorderGeometry(radius: number): BufferGeometry {
  if (bordersCache) return bordersCache;

  const positions: number[] = [];
  const a = new Vector3();
  const b = new Vector3();
  const maxDeg = 2;

  for (const line of requireDetailed().borders.coordinates) {
    for (let i = 0; i < line.length - 1; i++) {
      const [lon0, lat0] = line[i];
      let [lon1] = line[i + 1];
      const lat1 = line[i + 1][1];
      // Unwrap antimeridian jumps (projection is periodic in longitude).
      if (lon1 - lon0 > 180) lon1 -= 360;
      else if (lon0 - lon1 > 180) lon1 += 360;
      const steps = Math.max(
        1,
        Math.ceil(
          edgeDeg(new Vector2(lon0, lat0), new Vector2(lon1, lat1)) / maxDeg
        )
      );
      for (let s = 0; s < steps; s++) {
        const t0 = s / steps;
        const t1 = (s + 1) / steps;
        lonLatToVector3(
          lon0 + (lon1 - lon0) * t0,
          lat0 + (lat1 - lat0) * t0,
          radius,
          a
        );
        lonLatToVector3(
          lon0 + (lon1 - lon0) * t1,
          lat0 + (lat1 - lat0) * t1,
          radius,
          b
        );
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
  }

  bordersCache = new BufferGeometry();
  bordersCache.setAttribute(
    "position",
    new Float32BufferAttribute(positions, 3)
  );
  return bordersCache;
}
