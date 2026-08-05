import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  ShaderMaterial,
} from "three";
import { useFrame, useThree } from "@react-three/fiber";

const COUNT = 2200;
const RADIUS_MIN = 26;
const RADIUS_MAX = 46;

// Twinkling starfield: each point is 1–2 CSS px (dpr-scaled, never larger)
// with its own blink phase and speed.
export default function Stars() {
  const dpr = useThree((s) => s.gl.getPixelRatio());
  const materialRef = useRef<ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const positions: number[] = [];
    const phases: number[] = [];
    const speeds: number[] = [];
    const scales: number[] = [];
    for (let i = 0; i < COUNT; i++) {
      // Uniform direction on the sphere, pushed to a far shell.
      const z = Math.random() * 2 - 1;
      const a = Math.random() * Math.PI * 2;
      const r =
        RADIUS_MIN + (RADIUS_MAX - RADIUS_MIN) * Math.cbrt(Math.random());
      const s = Math.sqrt(1 - z * z);
      positions.push(r * s * Math.cos(a), r * z, r * s * Math.sin(a));
      phases.push(Math.random() * Math.PI * 2);
      speeds.push(0.4 + Math.random() * 1.1);
      scales.push(1 + Math.random());
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(positions, 3));
    g.setAttribute("phase", new Float32BufferAttribute(phases, 1));
    g.setAttribute("speed", new Float32BufferAttribute(speeds, 1));
    g.setAttribute("scale", new Float32BufferAttribute(scales, 1));
    return g;
  }, []);

  useFrame((_, delta) => {
    if (materialRef.current) materialRef.current.uniforms.time.value += delta;
  });

  return (
    <points geometry={geometry} renderOrder={-1} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        uniforms={{
          time: { value: 0 },
          size: { value: dpr },
          color: { value: new Color("#cfe0ff") },
        }}
        vertexShader={`
          attribute float phase;
          attribute float speed;
          attribute float scale;
          varying float vPhase;
          varying float vSpeed;
          varying float vNdcY;
          uniform float size;
          void main() {
            vPhase = phase;
            vSpeed = speed;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vNdcY = gl_Position.y / gl_Position.w;
            gl_PointSize = size * min(scale, 2.0);
          }
        `}
        fragmentShader={`
          uniform float time;
          uniform vec3 color;
          varying float vPhase;
          varying float vSpeed;
          varying float vNdcY;
          void main() {
            // Empty band across the bottom 20% of the screen (NDC y in
            // [-1, -0.6]) — clip space, not world space, so it holds steady
            // regardless of camera zoom/angle.
            if (vNdcY < -0.6) discard;
            float tw = 0.5 + 0.5 * sin(time * vSpeed + vPhase);
            gl_FragColor = vec4(color, 0.12 + 0.75 * tw * tw);
          }
        `}
      />
    </points>
  );
}
