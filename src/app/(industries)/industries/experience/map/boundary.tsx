import { useRef } from "react";
import { Color, DoubleSide, Shape } from "three";
import { extend, useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { flatOutlineMaterial } from "./materials";

const BoundaryMaterial = extend(
  shaderMaterial(
    { uColor: new Color("#8fc2ff"), uOpacity: 1, uDepth: 1 },
    `varying vec2 vUv;
     varying vec3 vNormal;
     varying float vHeight;
     void main() {
         vUv = uv;
         vNormal = normal;
         vHeight = position.z;
         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
     }`,
    `uniform vec3 uColor;
     uniform float uOpacity;
     uniform float uDepth;
     varying vec2 vUv;
     varying vec3 vNormal;
     varying float vHeight;
     void main() {
         if (vNormal.z == 1.0 || vNormal.z == -1.0 || vUv.y == 0.0) {
             discard;
         } else {
             float h = mix(1.0, 0.0, vHeight / uDepth);
             gl_FragColor = vec4(uColor, h * uOpacity);
         }
     }`
  )
);

export interface BoundaryProps {
  data: Shape[];
  depth?: number;
}

// The wall has no visibility state of its own, so it has to mirror
// flatOutlineMaterial's opacity every frame — that's the one signal every
// zoom-in/zoom-out/data-background GSAP timeline in scene.tsx already drives
// correctly (0 on the bare globe, fading in only once the flat country
// starts settling into place, back to 0 on the way out). Without this the
// wall stays at its flat hardcoded opacity regardless of what the country is
// actually doing: still visible on the globe after a previous visit (the
// selection itself is never cleared, only faded out), and popping in at full
// strength before the country has even started moving into position.
// Scaled so the wall keeps its original ~0.2 intensity at the outline's own
// peak opacity (0.9).
const OPACITY_SCALE = 0.2 / 0.9;

export default function Boundary({ data, depth = 3 }: BoundaryProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const materialRef = useRef<any>(null);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uOpacity = flatOutlineMaterial.opacity * OPACITY_SCALE;
    }
  });

  return (
    <group renderOrder={11} position-z={1}>
      <mesh>
        <extrudeGeometry args={[data, { depth, bevelEnabled: false }]} />
        <BoundaryMaterial
          ref={materialRef}
          transparent
          depthTest={false}
          side={DoubleSide}
          uOpacity={0.2}
          uDepth={depth}
        />
      </mesh>
    </group>
  );
}
