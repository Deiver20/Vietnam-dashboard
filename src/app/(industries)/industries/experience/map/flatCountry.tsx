import { useLayoutEffect, useMemo, type RefObject } from "react";
import {
  EdgesGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Path,
  Shape,
  ShapeGeometry,
  Vector2,
  Vector3,
  type Group,
} from "three";
import { useFrame } from "@react-three/fiber";
import { geoCentroid, geoMercator } from "d3-geo";
import {
  earthMap,
  FLAT_DEPTH,
  flatOutlineMaterial,
  flatSideMaterial,
  flatTopMaterial,
} from "./materials";
import { FIT_H, FIT_W, loadCountryTexture } from "./countryTexture";
import { getCountryFeature } from "../data/world";
import { useIndustriesStore } from "../stores";
import Boundary from "./boundary";

// Boundary was ported from a reference project scaled in tens of world
// units (its group hardcodes position-z={1} for "just above the map
// surface" there); this map's own flat country spans roughly FIT_W×FIT_H
// (1.5×1.1) units, so both the wall's height and its base offset need to be
// scaled way down to sit right at THIS map's border instead of floating
// far above it.
const BOUNDARY_DEPTH = 0.16;
const BOUNDARY_BASE_Z = FLAT_DEPTH + 0.002;

const noRaycast = () => null;

function buildFlat(countryId: string) {
  const feature = getCountryFeature(countryId);
  if (!feature) return null;

  // Mercator projects longitude linearly (unlike the sphere), so a country
  // whose outline crosses the antimeridian (Russia: a single ring spans
  // -180 to +179.99) gets its contiguous border thrown to opposite edges of
  // the map, zig-zagging across the whole shape. Centering the projection
  // on the feature's own centroid pushes that +-180 seam to the far side of
  // the globe, off the country entirely; fitExtent's translate cancels the
  // rotation for every other country, so this is a no-op for the rest.
  const [centroidLon] = geoCentroid(feature as never);
  const projection = geoMercator()
    .rotate([-centroidLon, 0])
    .fitExtent(
      [
        [-FIT_W / 2, -FIT_H / 2],
        [FIT_W / 2, FIT_H / 2],
      ],
      feature as never
    );

  const toVec2 = (coord: number[]) => {
    const p = projection(coord as [number, number])!;
    return new Vector2(p[0], -p[1]);
  };

  const polygons =
    feature.geometry.type === "Polygon"
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates;

  const shapes: Shape[] = [];

  for (const polygon of polygons) {
    const outer = polygon[0].map(toVec2);
    const shape = new Shape(outer);
    for (const holeRing of polygon.slice(1)) {
      shape.holes.push(new Path(holeRing.map(toVec2)));
    }
    shapes.push(shape);
  }

  // Demo0 layering: extruded prism gives the side walls, and a separate
  // textured top face sits just above the extrusion cap.
  const top = new ShapeGeometry(shapes);
  const sides = new ExtrudeGeometry(shapes, {
    depth: FLAT_DEPTH,
    bevelEnabled: false,
  });

  // Replace ShapeGeometry's raw-coordinate UVs with equirectangular ones
  // (inverse Mercator), so the flat shape samples the earth texture at the
  // country's real location.
  const pos = top.getAttribute("position");
  const uvs = new Float32Array(pos.count * 2);
  let uMin = Infinity;
  let uMax = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    const inv = projection.invert?.([pos.getX(i), -pos.getY(i)]);
    const u = inv ? (inv[0] + 180) / 360 : 0;
    uvs[i * 2] = u;
    uvs[i * 2 + 1] = inv ? (inv[1] + 90) / 180 : 0;
    uMin = Math.min(uMin, u);
    uMax = Math.max(uMax, u);
  }
  // Antimeridian countries (Fiji): unwrap u so triangles never span the seam
  // — the texture repeats horizontally.
  if (uMax - uMin > 0.5) {
    for (let i = 0; i < pos.count; i++) {
      if (uvs[i * 2] < 0.5) uvs[i * 2] += 1;
    }
  }
  top.setAttribute("uv", new Float32BufferAttribute(uvs, 2));

  // Second UV set for the on-demand high-res country texture: that canvas
  // covers exactly the FIT box, so its UVs come straight from the positions.
  const hiUvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    hiUvs[i * 2] = (pos.getX(i) + FIT_W / 2) / FIT_W;
    hiUvs[i * 2 + 1] = (pos.getY(i) + FIT_H / 2) / FIT_H;
  }

  top.computeBoundingBox();
  const size = top.boundingBox!.getSize(new Vector3());
  const span = Math.max(size.x, size.y);

  const outline = new EdgesGeometry(top);
  return {
    top,
    sides,
    outline,
    shapes,
    span,
    feature,
    projection,
    hiUv: new Float32BufferAttribute(hiUvs, 2),
  };
}

export default function FlatCountry({
  groupRef,
  tiltRef,
  spinRef,
}: {
  groupRef: RefObject<Group | null>;
  tiltRef: RefObject<Group | null>;
  spinRef: RefObject<Group | null>;
}) {
  const countryId = useIndustriesStore((s) => s.selectedCountryId);

  const built = useMemo(
    () => (countryId ? buildFlat(countryId) : null),
    [countryId]
  );

  useLayoutEffect(() => {
    if (!built) return;
    // The zoom timeline reads this to size-match the crossfade with the
    // country's on-globe footprint.
    if (groupRef.current) groupRef.current.userData.span = built.span;

    // Start from the global earth texture (equirect UVs), then swap in the
    // country's own high-res tile composite once it has loaded.
    flatTopMaterial.map = earthMap;
    flatTopMaterial.emissiveMap = earthMap;
    flatTopMaterial.needsUpdate = true;
    let stale = false;
    if (countryId) {
      loadCountryTexture(countryId, built.feature, built.projection)
        .then((tex) => {
          if (stale || !tex) return;
          built.top.setAttribute("uv", built.hiUv);
          flatTopMaterial.map = tex;
          flatTopMaterial.emissiveMap = tex;
          flatTopMaterial.needsUpdate = true;
        })
        .catch(() => {});
    }

    return () => {
      stale = true;
      built.top.dispose();
      built.sides.dispose();
      built.outline.dispose();
    };
  }, [built, countryId, groupRef]);

  useFrame((_, delta) => {
    flatSideMaterial.time += delta;
  });

  // The group always mounts (even with no selection) so the scene director
  // can capture its ref before the first zoom timeline is built.
  return (
    <group ref={groupRef} position={[0.28, -0.04, 0]}>
      {/* User drag rotation lives on its own group (outer group: timeline
          position/scale; tilt: timeline lie-down) so the transitions never
          fight it — and its rotation-free parents keep world-axis math valid
          in the scene director's drag handler. */}
      <group ref={spinRef}>
        <group ref={tiltRef}>
        {built && (
          <>
            <mesh
              geometry={built.sides}
              material={flatSideMaterial}
              renderOrder={9}
              raycast={noRaycast}
            />
            <mesh
              geometry={built.top}
              material={flatTopMaterial}
              position={[0, 0, FLAT_DEPTH + 0.002]}
              renderOrder={10}
              raycast={noRaycast}
            />
            <lineSegments
              geometry={built.outline}
              material={flatOutlineMaterial}
              position={[0, 0, FLAT_DEPTH + 0.004]}
              renderOrder={11}
              raycast={noRaycast}
            />
            {/* Light-wall effect: the country outline extruded into a thin
                vertical wall, opaque at the border and fading to transparent
                going up — traced from the same projected shapes as the top
                face, so it always follows the real coastline/frontier. */}
            <group position-z={BOUNDARY_BASE_Z - 1}>
              <Boundary data={built.shapes} depth={BOUNDARY_DEPTH} />
            </group>
          </>
        )}
        </group>
      </group>
    </group>
  );
}
