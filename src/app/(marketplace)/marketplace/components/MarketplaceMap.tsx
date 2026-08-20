"use client";

import { useEffect } from "react";
import { useMarketplaceMap } from "@/hooks/marketplace/useMarketplaceMap";
import MarketplaceListView from "./MarketplaceListView";
import MarketplaceMapView from "./MarketplaceMapView";

export default function MarketplaceMap() {
  const ctrl = useMarketplaceMap();

  // The navbar cross-links this page with the /industries experience, whose
  // three.js chunk is heavy (dynamic ssr:false import). Warm it up once the
  // marketplace has settled so pressing Data later mounts near-instantly
  // instead of stalling on the chunk download + geometry triangulation.
  useEffect(() => {
    const id = window.setTimeout(() => {
      import("@/app/(industries)/industries/experience");
      // Also fetch its data/textures (world polygons, earth maps, backdrop)
      // and pre-fill the triangulation caches — the whole /industries mount
      // then costs almost nothing.
      import("@/app/(industries)/industries/experience/warmup").then((m) =>
        m.warmupIndustriesExperience()
      );
    }, 2000);
    return () => window.clearTimeout(id);
  }, []);

  return ctrl.mode === "list" ? (
    <MarketplaceListView ctrl={ctrl} />
  ) : (
    <MarketplaceMapView ctrl={ctrl} />
  );
}
