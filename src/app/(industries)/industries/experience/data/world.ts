import { feature, mesh } from "topojson-client";
import { geoCentroid } from "d3-geo";
import type { MultiLineStringGeometry, WorldFeature } from "./types";

import worldJson from "@/assets/countries-110m.json";

type Topology = Parameters<typeof feature>[0];
type CountryTopology = Topology & { objects: { countries: never } };

const topology = worldJson as unknown as CountryTopology;

// The roster (which countries exist, their ids/names/slugs/flags/industry
// data) stays pinned to the 110m set everything else in the experience was
// built against. Only the polygon geometry is swapped for the 50m source —
// ~7x more boundary vertices, which is what actually fixes small countries
// looking faceted/pointy on the globe (subdividing edges for sphere
// curvature can't invent coastline detail the 110m source never had). The
// 50m topology has ~60 extra micro-territories (Vatican, Bermuda, etc.)
// with no flag/dossier/mock-data wired up elsewhere, so those are filtered
// back out rather than expanding what's pickable.
//
// The 50m polygons are NOT bundled: they're 739 KB of JSON that used to sit
// inside the experience's JS chunk and parse at module scope. They now live
// in /public and are fetched by loadDetailedWorld() — kicked off by
// experience/warmup.ts at route time, so the download runs in parallel with
// the three.js chunk instead of inflating it. Everything synchronous
// (names, ids, centroids, roster iteration) is served from the 110m set,
// whose keys are identical.
//
// A few disputed territories (Kosovo, Somaliland, N. Cyprus) have no ISO
// numeric id in either source and fall back to their name as the key —
// same fallback `countryIdOf` uses below, so the filter has to match it or
// those three silently lose their geometry. And a few dependent territories
// (Ashmore and Cartier Is.) reuse their sovereign's id (Australia's "036")
// instead of being merged into one MultiPolygon like the 110m source does,
// so a plain id match lets both through under the same key — hence the
// name check, keeping only the geometry that's actually the roster country.
const countryKey = (id: string | number | undefined, name: string) =>
  String(id ?? name);

const roster = feature(topology, topology.objects.countries) as unknown as {
  features: WorldFeature[];
};
const rosterByKey = new Map(
  roster.features.map((f) => [countryKey(f.id, f.properties.name), f])
);

/** Antarctica — rendered but never pickable / never gets a dossier. */
export const ANTARCTICA_ID = "010";

/** Roster features (110m). Same ids/names/keys as the detailed set — safe
 *  for pickers, URL sync, tooltips and centroids; NOT for drawing polygons
 *  (use loadDetailedWorld() for those). */
export const countryFeatures = roster.features;

export const countryIdOf = (f: WorldFeature) =>
  String(f.id ?? f.properties.name);

const byId = new Map(countryFeatures.map((f) => [countryIdOf(f), f]));

export function getCountryName(id: string) {
  return byId.get(id)?.properties.name ?? id;
}

export function getCountryCentroid(id: string): [number, number] {
  const f = byId.get(id);
  if (!f) return [0, 0];
  return geoCentroid(f as never);
}

/* ── Detailed (50m) polygons — fetched at runtime ── */

export interface DetailedWorld {
  features: WorldFeature[];
  /** Every shared border exactly once (the reason the TopoJSON is kept). */
  borders: MultiLineStringGeometry;
}

let detailed: DetailedWorld | null = null;
let detailedById: Map<string, WorldFeature> | null = null;
let detailedPromise: Promise<DetailedWorld> | null = null;

/** Singleton fetch + topojson decode of the 50m polygons. Bump the file's
 *  `.v1` suffix when replacing the data — /public assets cache hard. */
export function loadDetailedWorld(): Promise<DetailedWorld> {
  if (!detailedPromise) {
    detailedPromise = fetch("/data/countries-50m.v1.json")
      .then((res) => {
        if (!res.ok) throw new Error(`countries-50m fetch failed: HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        const detailedTopology = json as unknown as CountryTopology;
        const detailedCountries = {
          type: "GeometryCollection",
          geometries: (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (detailedTopology.objects.countries as any).geometries as any[]
          ).filter((g) => {
            const rosterFeature = rosterByKey.get(
              countryKey(g.id, g.properties?.name)
            );
            return (
              !!rosterFeature &&
              rosterFeature.properties.name === g.properties?.name
            );
          }),
        } as never;
        const collection = feature(
          detailedTopology,
          detailedCountries
        ) as unknown as { features: WorldFeature[] };
        const borders = mesh(
          detailedTopology,
          detailedCountries
        ) as unknown as MultiLineStringGeometry;
        detailed = { features: collection.features, borders };
        detailedById = new Map(
          collection.features.map((f) => [countryIdOf(f), f])
        );
        return detailed;
      })
      .catch((err) => {
        // Allow a retry on the next call instead of caching the failure.
        detailedPromise = null;
        throw err;
      });
  }
  return detailedPromise;
}

/** Sync accessor — null until loadDetailedWorld() has resolved. */
export const getDetailedWorld = () => detailed;

/** Detailed (50m) feature when loaded; falls back to the coarse roster
 *  polygon (only reachable if somehow called before the globe ever
 *  rendered, which itself suspends on the detailed data). */
export function getCountryFeature(id: string) {
  return detailedById?.get(id) ?? byId.get(id);
}
