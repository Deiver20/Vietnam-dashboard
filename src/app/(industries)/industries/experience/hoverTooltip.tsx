"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { getCountryFlag } from "./data/countryFlags";
import { getCountryName } from "./data/world";
import { useIndustriesStore } from "./stores";

const Tip = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 50;
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 13px;
  border-radius: 999px;
  background: rgba(2, 13, 28, 0.85);
  border: 1px solid rgba(51, 204, 0, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 0 16px rgba(51, 204, 0, 0.18);
  font-family: var(--font-poppins), sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #e8eefc;
  white-space: nowrap;
`;

/* Small flag + name tooltip that trails the cursor while a country on the
   3D globe is hovered (Levels 1–2 — globe.tsx only sets hoveredCountryId
   while interactive there). A plain window listener, not a react-three-fiber
   handler: it needs raw screen coordinates, not the design-space ones the
   AutoFit-scaled panel UI uses. */
export default function HoverTooltip() {
  const hoveredId = useIndustriesStore((s) => s.hoveredCountryId);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  if (!hoveredId) return null;

  return (
    <Tip
      data-hover-tooltip="1"
      style={{ transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -140%)` }}
    >
      <span style={{ fontSize: 15, lineHeight: 1 }}>{getCountryFlag(hoveredId)}</span>
      <span>{getCountryName(hoveredId)}</span>
    </Tip>
  );
}
