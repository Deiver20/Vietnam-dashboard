import {
  AdditiveBlending,
  BackSide,
  Color,
  DoubleSide,
  LineBasicMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
  type Texture,
} from "three";
import { shaderMaterial } from "@react-three/drei";
import { theme } from "../theme";
// WebP re-encodes of the original JPGs (blue marble downscaled 4096→2048):
// ~1.97 MB → ~0.46 MB total. The originals stay in src/assets (unimported =
// not bundled) in case a progressive 4K upgrade is ever wanted. These same
// URLs are preloaded by experience/warmup.ts so the downloads run in
// parallel with this chunk instead of after it.
import earthMapUrl from "@/assets/earth_blue_marble.webp";
import earthNormalUrl from "@/assets/earth_normal_2048.webp";
import earthSpecularUrl from "@/assets/earth_specular_2048.webp";

// Equirectangular earth textures (Demo0/Demo1 look: real terrain colors +
// normal-map relief). Country UVs are unwrapped past lon 180 (Fiji), so the
// horizontal axis must repeat.
const texLoader = new TextureLoader();

function loadEarth(url: string, srgb = false): Texture {
  const tex = texLoader.load(url);
  tex.wrapS = RepeatWrapping;
  tex.anisotropy = 8;
  if (srgb) tex.colorSpace = SRGBColorSpace;
  return tex;
}

export const earthMap = loadEarth(earthMapUrl.src, true);
export const earthNormalMap = loadEarth(earthNormalUrl.src);
export const earthSpecularMap = loadEarth(earthSpecularUrl.src);

// Progressive detail: the 2048 base above paints the globe fast; once the
// intro has played, scene.tsx swaps in the ORIGINAL full-resolution
// 4096×2048 JPG so zoomed-in terrain is byte-identical to the
// pre-optimization look. A brand-new Texture is loaded and reassigned into
// every slot that referenced the base map (swapping the shared Texture's
// .image in place did not repaint reliably) — map AND emissiveMap on
// land/ocean/flatTop, map on hover/selected.
import earthMapFullUrl from "@/assets/earth_blue_marble.jpg";

let earthUpgradeStarted = false;

export function upgradeEarthTextureTo4k() {
  if (earthUpgradeStarted) return;
  earthUpgradeStarted = true;
  texLoader.load(
    earthMapFullUrl.src,
    (tex) => {
      tex.wrapS = RepeatWrapping;
      tex.anisotropy = 8;
      tex.colorSpace = SRGBColorSpace;
      for (const m of [
        landMaterial,
        hoverMaterial,
        selectedMaterial,
        oceanMaterial,
        flatTopMaterial,
      ]) {
        if (m.map === earthMap) m.map = tex;
        if (m.emissiveMap === earthMap) m.emissiveMap = tex;
        m.needsUpdate = true;
      }
    },
    undefined,
    () => {
      // Network hiccup — allow a retry on the next call.
      earthUpgradeStarted = false;
    }
  );
}

// Module-level singletons: the scene director (scene.tsx) tweens these
// opacities directly during the intro and the level transitions.

export const LAND_OPACITY = 0.96;
export const BORDER_OPACITY = 0.5;

export const landMaterial = new MeshStandardMaterial({
  map: earthMap,
  normalMap: earthNormalMap,
  normalScale: new Vector2(1.7, 1.7),
  color: new Color("#dfe9ff"),
  // Self-lit copy of the terrain keeps the night-side hemisphere readable.
  // Blue-biased tint: it neutralizes warm desert tans (Sahara, Atacama) that
  // otherwise glow yellow at the limb as the globe spins.
  emissive: new Color("#9ec0ff"),
  emissiveMap: earthMap,
  emissiveIntensity: 1.05,
  roughness: 0.85,
  metalness: 0.05,
  transparent: true,
  opacity: 0,
  side: DoubleSide,
  depthWrite: false,
});

// AGM green (--color-green / --color-green-2 in globals.css), not the
// selection blue below — hover and "picked" read as two different states.
export const hoverMaterial = new MeshStandardMaterial({
  map: earthMap,
  normalMap: earthNormalMap,
  normalScale: new Vector2(1.7, 1.7),
  color: new Color("#dcf7dc"),
  emissive: new Color("#1e8a10"),
  emissiveIntensity: 1,
  roughness: 0.6,
  metalness: 0.05,
  transparent: true,
  opacity: LAND_OPACITY,
  side: DoubleSide,
  depthWrite: false,
});

export const selectedMaterial = new MeshStandardMaterial({
  map: earthMap,
  normalMap: earthNormalMap,
  normalScale: new Vector2(1.7, 1.7),
  color: new Color("#e4eeff"),
  emissive: new Color("#2b52b8"),
  emissiveIntensity: 1,
  roughness: 0.55,
  metalness: 0.05,
  transparent: true,
  opacity: LAND_OPACITY,
  side: DoubleSide,
  depthWrite: false,
});

export const borderMaterial = new LineBasicMaterial({
  color: new Color(theme.borderLine),
  transparent: true,
  opacity: 0,
});

export const oceanMaterial = new MeshStandardMaterial({
  map: earthMap,
  normalMap: earthNormalMap,
  normalScale: new Vector2(0.8, 0.8),
  // The specular mask is white over water: used as metalness it gives the
  // seas a directional-light glint while land underlay stays matte.
  metalnessMap: earthSpecularMap,
  metalness: 0,
  // User-tuned warm cream self-glow: under the cyan key lights it settles the
  // open water into the final luminous tone.
  color: new Color("#fff9de"),
  emissive: new Color("#ffe299"),
  emissiveMap: earthMap,
  emissiveIntensity: 0.99,
  roughness: 0.95,
  transparent: true,
  opacity: 0,
  depthWrite: true,
});

// Outer halo: soft additive glow just past the limb (back side, pushed out).
const AtmosphereShader = shaderMaterial(
  { color: new Color("#97d6f7"), opacity: 0, strength: 0.36 },
  `varying vec3 vNormal;
   void main() {
     vNormal = normalize(normalMatrix * normal);
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   }`,
  `varying vec3 vNormal;
   uniform vec3 color;
   uniform float opacity;
   uniform float strength;
   void main() {
     float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.4) * strength;
     gl_FragColor = vec4(color, 1.0) * intensity * opacity;
   }`
);

export const atmosphereMaterial = new AtmosphereShader();
atmosphereMaterial.side = BackSide;
atmosphereMaterial.transparent = true;
atmosphereMaterial.blending = AdditiveBlending;
atmosphereMaterial.depthWrite = false;

// Inner rim: fresnel atmosphere veil ON the limb itself (reference-image
// edge glow) — bright light-blue where the surface turns away from view.
const RimShader = shaderMaterial(
  { color: new Color("#a9d2ff"), opacity: 0, strength: 0.85 },
  `varying vec3 vNormal;
   void main() {
     vNormal = normalize(normalMatrix * normal);
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   }`,
  `varying vec3 vNormal;
   uniform vec3 color;
   uniform float opacity;
   uniform float strength;
   void main() {
     vec3 n = normalize(vNormal);
     float f = 1.0 - abs(dot(n, vec3(0.0, 0.0, 1.0)));
     // Directional boost: the light in the reference comes from the upper
     // left, so the rim burns brightest there.
     float tl = 1.0 + 0.55 * max(dot(n, normalize(vec3(-0.6, 0.6, 0.0))), 0.0);
     float intensity = pow(f, 2.6) * strength * tl;
     gl_FragColor = vec4(color, 1.0) * intensity * opacity;
   }`
);

export const rimMaterial = new RimShader();
rimMaterial.transparent = true;
rimMaterial.blending = AdditiveBlending;
rimMaterial.depthWrite = false;

// Inner shadow: uniform vignette around the whole limb (view-space, so
// orbiting the globe never moves it off the edges) — the sphere-shading
// falloff that makes the ball read as 3D. User-tuned to the same light blue
// as the halo. The atmosphere rim draws on top of it, at the silhouette.
const InnerShadowShader = shaderMaterial(
  { color: new Color("#97d6f7"), opacity: 0, strength: 0.7 },
  `varying vec3 vNormal;
   void main() {
     vNormal = normalize(normalMatrix * normal);
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   }`,
  `varying vec3 vNormal;
   uniform vec3 color;
   uniform float opacity;
   uniform float strength;
   void main() {
     vec3 n = normalize(vNormal);
     float limb = 1.0 - n.z;
     float a = pow(smoothstep(0.26, 0.95, limb), 1.3) * strength;
     gl_FragColor = vec4(color, a * opacity);
   }`
);

export const innerShadowMaterial = new InnerShadowShader();
innerShadowMaterial.transparent = true;
innerShadowMaterial.depthWrite = false;

// Flat country used on Levels 3–4, Demo0-style: extruded prism whose top face
// carries the real terrain texture and whose sides run a rising light sweep.
// Both start with depthTest off so the globe→country crossfade can draw them
// over the still-fading globe; the zoom timeline flips depth on once the
// globe is hidden (and back off when reversed).

export const FLAT_DEPTH = 0.05;

export const flatTopMaterial = new MeshStandardMaterial({
  map: earthMap,
  normalMap: earthNormalMap,
  normalScale: new Vector2(1.4, 1.4),
  color: new Color("#e8f0ff"),
  emissive: new Color("#93a9d4"),
  emissiveMap: earthMap,
  emissiveIntensity: 0.5,
  roughness: 0.8,
  metalness: 0.05,
  transparent: true,
  opacity: 0,
  side: DoubleSide,
  depthTest: false,
  depthWrite: false,
});

// Demo0 OutLineAnimated spirit: dark side walls + a light band rising along
// the extrusion axis. Caps (|normal.z| ≈ 1) are masked out of the sweep.
const FlatSideShader = shaderMaterial(
  {
    time: 0,
    opacity: 0,
    depth: FLAT_DEPTH,
    baseColor: new Color("#0b1c3e"),
    sweepColor: new Color(theme.bright),
  },
  `varying float vH;
   varying vec3 vNormalL;
   uniform float depth;
   void main() {
     vH = position.z / max(depth, 0.0001);
     vNormalL = normal;
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   }`,
  `varying float vH;
   varying vec3 vNormalL;
   uniform float time;
   uniform float opacity;
   uniform vec3 baseColor;
   uniform vec3 sweepColor;
   void main() {
     float sideMask = 1.0 - step(0.5, abs(vNormalL.z));
     float p = fract(time * 0.35) * 1.5 - 0.25;
     float sweep = smoothstep(0.35, 0.0, abs(vH - p)) * 0.8 * sideMask;
     vec3 col = baseColor + sweepColor * sweep;
     // Manual sRGB encode: ShaderMaterial skips colorspace_fragment.
     gl_FragColor = vec4(pow(col, vec3(0.4545)), opacity);
   }`
);

export const flatSideMaterial = new FlatSideShader();
flatSideMaterial.transparent = true;
flatSideMaterial.side = DoubleSide;
flatSideMaterial.depthTest = false;
flatSideMaterial.depthWrite = false;

export const flatOutlineMaterial = new LineBasicMaterial({
  color: new Color(theme.bright),
  transparent: true,
  opacity: 0,
  depthTest: false,
  depthWrite: false,
});
