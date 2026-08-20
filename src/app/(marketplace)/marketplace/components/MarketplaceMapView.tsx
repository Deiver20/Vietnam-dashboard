import { ComposableMap } from "react-simple-maps";
import Starfield from "@/components/Starfield";
import { theme as industriesTheme } from "@/app/(industries)/industries/experience/theme";
import type { MarketplaceController } from "@/hooks/marketplace/useMarketplaceMap";
import {
  GLOBE_VB,
  MAP_W,
  MAP_H_FLAT,
  MAP_VB_FLAT_H,
  FLAT_SCALE,
} from "../marketplaceMapHelpers";
import MarketplaceHeroText from "./MarketplaceHeroText";
import MarketplaceViewSwitch from "./MarketplaceViewSwitch";
import MarketplaceFilters from "./MarketplaceFilters";
import MarketplaceMarkers from "./MarketplaceMarkers";
import ItemPanel from "./map/ItemPanel";

/* ════════════════════════ GLOBE / FLAT MAP VIEW ════════════════════════ */
export default function MarketplaceMapView({ ctrl }: { ctrl: MarketplaceController }) {
  const {
    sectionRef, mode, switchMode, rotation, globeScale, mounted,
    filteredItems, flatScrollRef,
    onPointerDown, onPointerMove, onPointerUp, onStageClick, onStageWheel,
    onFlatScroll, onFlatPointerDown, onFlatPointerMove, onFlatPointerUp,
    panelItems, activeItem, openItem, setActiveItemId, closePanel,
  } = ctrl;

  const oceanCx = mode === "globe" ? GLOBE_VB / 2 : MAP_W / 2;
  const oceanCy = mode === "globe" ? GLOBE_VB / 2 : MAP_H_FLAT / 2;
  const oceanR = mode === "globe" ? globeScale : MAP_W / 2;
  const defs = (
    <defs>
      <radialGradient id="mkt-ocean" gradientUnits="userSpaceOnUse" cx={oceanCx} cy={oceanCy} r={oceanR}>
        <stop offset="0%" stopColor="#0b3460" />
        <stop offset="60%" stopColor="#062745" />
        <stop offset="100%" stopColor="#03152b" />
      </radialGradient>
    </defs>
  );

  return (
    <section
      ref={sectionRef}
      id="marketplace-map"
      className="relative h-[100dvh] w-full overflow-hidden bg-[#020912]"
      data-screen-label="Marketplace"
    >
      <div className="absolute inset-0 flex">
        {/* ── Left region: map + overlays (shrinks when the sidebar opens) ── */}
        <div
          className="relative flex-1 min-w-0"
          style={
            mode === "globe"
              ? {
                  // Same backdrop as the /industries experience so the two
                  // immersive views read as one continuous world. Longhands,
                  // not the `background` shorthand — the shorthand would reset
                  // size/position (see SceneBackdrop).
                  backgroundColor: industriesTheme.bg,
                  backgroundImage: `url("${industriesTheme.bgImage}")`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : { backgroundColor: "#020912" }
          }
        >
          {/* Blinking stars over the backdrop image (globe view only) */}
          {mode === "globe" && <Starfield className="absolute inset-0 z-0" />}

          {/* Hero overlay — text on the left, controls on the right */}
          <div className="absolute top-[110px] left-0 right-0 z-10 pointer-events-none">
            <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4 flex items-start justify-between gap-8 max-[860px]:flex-col max-[860px]:gap-4">
              <MarketplaceHeroText stacked />
              <div className="flex flex-col items-end gap-3 shrink-0 pointer-events-auto max-[860px]:flex-row max-[860px]:items-center max-[860px]:flex-wrap">
                <MarketplaceViewSwitch mode={mode} switchMode={switchMode} />
              </div>
            </div>
          </div>

          {/* Vertical filter panel (left) — aligned to the content max-width.
              Top clears the stacked two-line hero headline + description with
              breathing room instead of crowding the text. */}
          {/* Below 980 the side panel becomes a bottom sheet (the ItemPanel
              pattern) instead of disappearing with no replacement. */}
          <div className="absolute left-0 right-0 top-[410px] z-[11] pointer-events-none max-[980px]:fixed max-[980px]:top-auto max-[980px]:bottom-0 max-[980px]:z-[105]">
            <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4 max-[980px]:px-0 max-[980px]:max-w-none">
              <div className="w-[248px] flex flex-col gap-2.5 rounded-xl bg-[#020d1c]/85 backdrop-blur border border-white/[0.12] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)] p-3 pointer-events-auto max-[980px]:w-full max-[980px]:rounded-b-none max-[980px]:rounded-t-2xl max-[980px]:border-b-0 max-[980px]:max-h-[42dvh] max-[980px]:overflow-y-auto max-[980px]:pb-[calc(12px+env(safe-area-inset-bottom))] mkt-panel">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-blue-soft">Filters</span>
                  <span className="text-[10px] font-mono text-gray-4">{filteredItems.length} shown</span>
                </div>
                <MarketplaceFilters ctrl={ctrl} vertical={true} />
              </div>
            </div>
          </div>

          {!mounted && (
            <div className="absolute inset-0 grid place-items-center">
              <div className="flex flex-col items-center gap-3 text-gray-5">
                <span className="w-8 h-8 rounded-full border-2 border-white/15 border-t-blue-soft animate-spin" />
                <span className="text-[12px] font-mono">Loading world map…</span>
              </div>
            </div>
          )}
          {mounted && (
            <>
              {mode === "globe" ? (
                <div
                  className="absolute inset-x-0 bottom-0 top-[5%] z-0 mkt-grab select-none touch-pan-y"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerLeave={onPointerUp}
                  onClick={onStageClick}
                  onWheel={onStageWheel}
                >
                  {/* overflow visible: zoomed in, the sphere grows past the
                      square viewBox — the stage's own bounds do the clipping */}
                  <ComposableMap
                    width={GLOBE_VB}
                    height={GLOBE_VB}
                    projection="geoOrthographic"
                    projectionConfig={{ scale: globeScale, rotate: [-rotation[0], -rotation[1], 0] }}
                    preserveAspectRatio="xMidYMid meet"
                    style={{ width: "100%", height: "100%", display: "block", overflow: "visible" }}
                  >
                    {defs}
                    <MarketplaceMarkers ctrl={ctrl} />
                  </ComposableMap>
                </div>
              ) : (
                // Rectangular map: 100% height, infinite horizontal scroll (world rendered 3×)
                <div
                  ref={flatScrollRef}
                  className="absolute inset-x-0 bottom-0 top-[5%] z-0 overflow-x-auto overflow-y-hidden no-scrollbar mkt-grab select-none touch-pan-x"
                  onScroll={onFlatScroll}
                  onPointerDown={onFlatPointerDown}
                  onPointerMove={onFlatPointerMove}
                  onPointerUp={onFlatPointerUp}
                  onPointerLeave={onFlatPointerUp}
                  onClick={onStageClick}
                >
                  <div className="flex h-full w-max">
                    {[0, 1, 2].map((i) => (
                      <ComposableMap
                        key={i}
                        width={MAP_W}
                        height={MAP_H_FLAT}
                        projection="geoEquirectangular"
                        projectionConfig={{ scale: FLAT_SCALE, center: [0, 0] }}
                        viewBox={`0 0 ${MAP_W} ${MAP_VB_FLAT_H}`}
                        className="shrink-0"
                        style={{ height: "100%", width: "auto", display: "block" }}
                      >
                        <MarketplaceMarkers ctrl={ctrl} />
                      </ComposableMap>
                    ))}
                  </div>
                </div>
              )}

              {/* Top scrim for navbar + hero legibility */}
              <div className="absolute inset-x-0 top-0 h-[340px] z-[5] pointer-events-none bg-gradient-to-b from-[#020912]/85 via-[#020912]/35 to-transparent" />

              {/* Hint (bottom-right) */}
              <div className={`absolute right-4 bottom-4 z-10 text-[11px] text-gray-4 font-mono bg-[#020d1c]/70 backdrop-blur border border-white/[0.08] rounded-lg px-3 py-1.5 pointer-events-none ${panelItems ? "hidden" : ""}`}>
                {mode === "globe" ? "Drag to spin the globe" : "Scroll sideways to explore"}
              </div>
            </>
          )}
        </div>

        {/* ── Sidebar: product / offer detail (resizes the map, not a modal) ── */}
        {mounted && panelItems && (
          <ItemPanel
            items={panelItems}
            activeItem={activeItem}
            onSelect={(it) => openItem(it)}
            onBack={panelItems.length > 1 && activeItem ? () => setActiveItemId(null) : undefined}
            onClose={closePanel}
          />
        )}
      </div>
    </section>
  );
}
