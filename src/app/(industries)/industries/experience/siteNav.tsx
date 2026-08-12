"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useIndustriesStore } from "./stores";

/* Site chrome over the experience. The navbar belongs to the browsing levels
   (globe 1–2 and the country cover 3); the data pages (4) are immersive and
   own the full viewport, so the header fades away there. */
export default function SiteNav() {
  const level = useIndustriesStore((s) => s.level);
  const visible = level <= 3;
  return (
    <div
      style={{
        maxHeight: visible ? 64 : 0,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "max-height 0.5s ease, opacity 0.5s ease",
      }}
    >
      <Navbar />
    </div>
  );
}
