// Guardia de WebGL para el globo. Cursor/webviews de Electron corren Chromium
// con la GPU deshabilitada ("GL_VENDOR = Disabled, Sandboxed = yes"), donde
// THREE.WebGLRenderer lanza "Error creating WebGL context" y tumba el árbol
// React. Detectamos el soporte ANTES de montar <Canvas> y mostramos un mensaje
// en su lugar; el error boundary cubre el caso raro en que la sonda pasa pero
// el contexto real falla igual (p. ej. límite de contextos del navegador).
import { Component, type ReactNode } from "react";
import styled from "styled-components";
import { theme } from "../theme";

// three r163+ eliminó WebGL 1, así que solo webgl2 cuenta como soportado.
export function supportsWebGL(): boolean {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

const FallbackWrapper = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const FallbackCard = styled.div`
  max-width: 26rem;
  padding: 1.5rem 2rem;
  border: 1px solid ${theme.panelBorder};
  border-radius: 12px;
  background: ${theme.panelBg};
  color: ${theme.text};
`;

const FallbackTitle = styled.p`
  margin: 0 0 0.5rem;
  font-size: 1.05rem;
  color: ${theme.bright};
`;

const FallbackBody = styled.p`
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.5;
  color: ${theme.textDim};
`;

export function WebGLFallback() {
  return (
    <FallbackWrapper>
      <FallbackCard>
        <FallbackTitle>This experience requires WebGL</FallbackTitle>
        <FallbackBody>
          Your browser or environment does not support 3D graphics. Please open
          this page in Chrome, Safari or Firefox with hardware acceleration
          enabled.
        </FallbackBody>
      </FallbackCard>
    </FallbackWrapper>
  );
}

export class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <WebGLFallback /> : this.props.children;
  }
}
