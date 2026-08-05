import { Suspense, useState } from "react";
import styled from "styled-components";
import { Canvas } from "@react-three/fiber";
import Lights from "./lights";
import Scene from "./scene";
import Stars from "./stars";
import {
  CanvasErrorBoundary,
  supportsWebGL,
  WebGLFallback,
} from "./webglSupport";

const CanvasWrapper = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
`;

export default function Map() {
  // Lazy init: corre una sola vez y solo en cliente (este árbol se monta con
  // ssr:false desde experienceClient.tsx, así que document siempre existe).
  const [webgl] = useState(() => supportsWebGL());

  if (!webgl) {
    return (
      <CanvasWrapper>
        <WebGLFallback />
      </CanvasWrapper>
    );
  }

  return (
    <CanvasWrapper>
      {/* Transparent canvas: the page backdrop image (Wrapper CSS) shows
          through behind the globe and the additive stars. */}
      <CanvasErrorBoundary>
        <Canvas
          camera={{ fov: 45, position: [0, 1.6, 8.6], near: 0.1, far: 100 }}
          dpr={[1, 2]}>
          <Lights />
          <Stars />
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </CanvasWrapper>
  );
}
