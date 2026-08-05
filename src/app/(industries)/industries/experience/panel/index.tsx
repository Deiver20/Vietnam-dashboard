import { useEffect } from "react";
import dynamic from "next/dynamic";
import styled from "styled-components";
import IndustryTabs from "./industryTabs";
import CountryPicker from "./countryPicker";
import IndustryPicker from "./industryPicker";
import DataCarousel from "./dataCarousel";
import { useIndustriesStore } from "../stores";

// Level-4 only, but it was the sole first-paint importer of echarts + the
// /dashboard page components (~1.1 MB minified) — splitting it here keeps all
// of that out of the chunk the globe waits on. ssr:false matches the whole
// experience tree (see experienceClient.tsx).
const DashboardPages = dynamic(() => import("./dashboardPages"), {
  ssr: false,
  loading: () => null,
});

// Was AutoFit (autofit.js), which scaled this whole tree against a fixed
// 1920x1080 canvas via transform:scale — on any non-16:9 screen (nearly
// every real laptop) the emulated CSS width stayed pinned at exactly 1920
// regardless of actual viewport width, so nothing ever reflowed. This plain
// wrapper keeps the same stacking/pointer-events contract (above the map
// canvas, transparent to clicks except where children opt back in) without
// the scaling.
const Overlay = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
  display: flex;
  flex-direction: column;
`;

// CoverSummary and BackButton retired: the Level-3 cover title, intro and
// "Back to world view" action now live in the shared hero (IndustryTabs).
// DataPages (the old bento dossier) was replaced by DashboardPages — the
// /dashboard pages rendered over the scene. PageTabs was folded into
// DashboardPages (tabs + filters bar), which now owns every Level-4 lock.
// CornerCards was retired: CountryPicker replaces its two Level-2 KPI tiles
// with a country-by-country carousel. CountryPicker, IndustryPicker and
// DataCarousel all share the same bottom slot across levels 2-3 — mutually
// exclusive on level / whether an industry or country is picked yet.
export default function Panel() {
  // Mounted only from the country cover (Level 3) — rendering it earlier
  // would make next/dynamic start downloading its chunk at mount, competing
  // with the globe's own textures/data on first load. DashboardPages itself
  // returns null below Level 3, so nothing visual changes.
  const level = useIndustriesStore((s) => s.level);

  // Warm the Level-4 chunk during idle, right after the experience has
  // painted — by the time the user drills into a dashboard the code is
  // already resident, so the split above never shows as a wait.
  useEffect(() => {
    const prefetch = () => {
      import("./dashboardPages").catch(() => {});
    };
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(prefetch);
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(prefetch, 2000);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <Overlay>
      <IndustryTabs />
      <CountryPicker />
      <IndustryPicker />
      <DataCarousel />
      {level >= 3 && <DashboardPages />}
    </Overlay>
  );
}
