import {
  Geographies,
  Geography,
  Graticule,
  Line,
  Marker,
  Sphere,
} from "react-simple-maps";
import type { MarketplaceController } from "@/hooks/marketplace/useMarketplaceMap";
import { GEO_URL } from "../marketplaceMapHelpers";
import MarketplaceClusters from "./map/MarketplaceClusters";

/* ── Shared SVG layers (markers, routes, geographies) ──
   Must be rendered as a child of <ComposableMap> so it can read the projection
   context from react-simple-maps. */
export default function MarketplaceMarkers({ ctrl }: { ctrl: MarketplaceController }) {
  const {
    mode, s, isVisible,
    routeItem, routeProduct, flowColor,
    activeItemId,
  } = ctrl;

  return (
    <>
      <Sphere
        id="rsm-sphere"
        fill={mode === "globe" ? "url(#mkt-ocean)" : "#020912"}
        stroke={mode === "globe" ? "rgba(145,200,255,0.6)" : "none"}
        strokeWidth={mode === "globe" ? 0.9 : 0}
      />
      <Graticule
        stroke={mode === "globe" ? "rgba(103,166,255,0.07)" : "rgba(125,170,235,0.05)"}
        strokeWidth={0.5}
      />
      <Geographies geography={GEO_URL}>
        {({ geographies }: { geographies: Array<{ rsmKey: string }> }) =>
          geographies.map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill="#1b4274"
              stroke="rgba(135,190,255,0.28)"
              strokeWidth={0.45}
              style={{
                default: { outline: "none" },
                hover: { fill: "#23528d", outline: "none" },
                pressed: { fill: "#23528d", outline: "none" },
              }}
            />
          ))
        }
      </Geographies>

      {/* Export routes for the hovered or active item (colored by kind) */}
      {routeItem &&
        routeProduct &&
        routeProduct.destinations.map((d, i) => (
          <Line
            key={`route-${i}`}
            from={routeItem.coords}
            to={d.coords}
            stroke={flowColor}
            strokeWidth={1.6 * s}
            strokeLinecap="round"
            className="mkt-line"
          />
        ))}

      {/* Destination port markers */}
      {routeItem &&
        routeProduct &&
        routeProduct.destinations
          .filter((d) => isVisible(d.coords))
          .map((d, i) => (
            <Marker key={`port-${i}`} coordinates={d.coords} style={{ default: { pointerEvents: "none" } }}>
              <circle r={3.2 * s} fill="#020d1c" stroke={flowColor} strokeWidth={1.3 * s} />
              <text
                x={7 * s}
                y={3.8 * s}
                fontSize={12.5 * s}
                fontWeight={700}
                fill="#ffffff"
                stroke="#020912"
                strokeWidth={2.6 * s}
                paintOrder="stroke"
                style={{ fontFamily: "var(--font-jetbrains)", strokeLinejoin: "round" }}
              >
                {d.name}
              </text>
            </Marker>
          ))}

      {/* Hovered / active item origin highlight — drawn BEFORE the clusters so a
          cluster's card/pills always paint above this dot (indicator under cards). */}
      {routeItem && isVisible(routeItem.coords) && (
        <Marker coordinates={routeItem.coords} style={{ default: { pointerEvents: "none" } }}>
          <circle
            r={9 * s}
            fill="none"
            stroke={flowColor}
            strokeWidth={1.6 * s}
            opacity={0.9}
            style={{ animation: "mapPulse 1.8s ease-out infinite", transformBox: "fill-box", transformOrigin: "center" }}
          />
          <circle r={4 * s} fill={flowColor} stroke="#ffffff" strokeWidth={1.5 * s} />
          <text
            x={11 * s}
            y={3.8 * s}
            fontSize={12.5 * s}
            fontWeight={700}
            fill="#ffffff"
            stroke="#020912"
            strokeWidth={2.6 * s}
            paintOrder="stroke"
            style={{ fontFamily: "var(--font-jetbrains)", strokeLinejoin: "round" }}
          >
            {routeItem.offer?.city ?? routeItem.product.origin.country}
          </text>
        </Marker>
      )}

      {/* Item clusters — hidden while a single item's detail is open so the map
          stays clean (only the active item's origin + routes remain). */}
      {!activeItemId && <MarketplaceClusters ctrl={ctrl} />}
    </>
  );
}
