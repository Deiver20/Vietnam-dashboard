import { use, useMemo, type RefObject } from "react";
import type { Group, Mesh } from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { getBorderGeometry, getCountryGeometries } from "./countryShapes";
import { loadDetailedWorld } from "../data/world";
import {
  atmosphereMaterial,
  borderMaterial,
  hoverMaterial,
  innerShadowMaterial,
  landMaterial,
  oceanMaterial,
  rimMaterial,
} from "./materials";
import { ANTARCTICA_ID } from "../data/world";
import { useIndustriesStore } from "../stores";

export const GLOBE_RADIUS = 1;

const noRaycast = () => null;

function interactive() {
  const s = useIndustriesStore.getState();
  return s.level <= 2 && !s.transitioning;
}

export default function Globe({
  groupRef,
  onSpinStart,
}: {
  groupRef: RefObject<Group | null>;
  onSpinStart?: (e: ThreeEvent<PointerEvent>) => void;
}) {
  // Suspends (map/index.tsx boundary) until the runtime-fetched 50m polygons
  // land — warmup.ts starts that fetch at route time, so this normally
  // resolves before the three.js chunk has even finished evaluating. The
  // singleton promise identity is stable, which is what use() requires.
  use(loadDetailedWorld());
  const countries = useMemo(() => getCountryGeometries(GLOBE_RADIUS + 0.002), []);
  const borders = useMemo(() => getBorderGeometry(GLOBE_RADIUS + 0.004), []);

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!interactive()) return;
    const mesh = e.object as Mesh;
    if (mesh.material === landMaterial) mesh.material = hoverMaterial;
    useIndustriesStore.setState({ hoveredCountryId: mesh.name });
    // Countries are pickable on both globe levels (industry-first from
    // Level 2, country-first from Level 1).
    document.body.style.cursor = "pointer";
  };

  const handleOut = (e: ThreeEvent<PointerEvent>) => {
    const mesh = e.object as Mesh;
    if (mesh.material === hoverMaterial) mesh.material = landMaterial;
    if (useIndustriesStore.getState().hoveredCountryId === mesh.name) {
      useIndustriesStore.setState({ hoveredCountryId: null });
    }
    document.body.style.cursor = "auto";
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    // A drag that ends over a country is a spin, not a selection.
    if (e.delta > 6) return;
    if (!interactive()) return;
    document.body.style.cursor = "auto";
    useIndustriesStore.getState().selectCountry((e.object as Mesh).name);
  };

  return (
    <group ref={groupRef} onPointerDown={onSpinStart}>
      {/* Ocean: also shields far-side countries from the raycaster. */}
      <mesh
        renderOrder={0}
        material={oceanMaterial}
        onPointerOver={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
      </mesh>

      {countries.map((c) => (
        <mesh
          key={c.id}
          name={c.id}
          geometry={c.geometry}
          material={landMaterial}
          renderOrder={1}
          raycast={c.id === ANTARCTICA_ID ? noRaycast : undefined}
          onPointerOver={handleOver}
          onPointerOut={handleOut}
          onClick={handleClick}
        />
      ))}

      <lineSegments
        geometry={borders}
        material={borderMaterial}
        renderOrder={2}
        raycast={noRaycast}
      />

      {/* Same-tone inner shadow vignette around the whole limb. */}
      <mesh
        renderOrder={3}
        material={innerShadowMaterial}
        scale={1.012}
        raycast={noRaycast}>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
      </mesh>

      {/* Fresnel veil on the limb itself, over the shadow's darkened edge. */}
      <mesh
        renderOrder={4}
        material={rimMaterial}
        scale={1.014}
        raycast={noRaycast}>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
      </mesh>

      <mesh
        renderOrder={5}
        material={atmosphereMaterial}
        scale={1.22}
        raycast={noRaycast}>
        <sphereGeometry args={[GLOBE_RADIUS, 48, 48]} />
      </mesh>
    </group>
  );
}
