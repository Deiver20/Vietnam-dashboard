import { Marker } from "react-simple-maps";
import type { MarketplaceController } from "@/hooks/marketplace/useMarketplaceMap";
import { BLUE, GREEN, angularDist, clamp } from "../../marketplaceMapHelpers";
import PillStack from "./PillStack";
import HoverCard from "./HoverCard";

/* Item clusters — two passes so a name label is never hidden behind a
   neighbouring marker's dot: pass 1 paints every anchor dot, pass 2 paints
   every name pill / hover card on top. Rendered inside <ComposableMap>. */
export default function MarketplaceClusters({ ctrl }: { ctrl: MarketplaceController }) {
  const {
    s, mode, rotation, hoverId,
    sortedClusters, handleClusterClick, openItem, setHoverId, hoverRef,
  } = ctrl;

  return (
    <>
      {/* Pass 1 — anchor dots (painted first; no dot can cover a name). */}
      {sortedClusters.map(({ c }) => {
        const hasOffer = c.items.some((i) => i.kind === "offer");
        const hasProduct = c.items.some((i) => i.kind === "product");
        const mixed = hasOffer && hasProduct; // both blue products and green offers
        const dotColor = hasOffer ? GREEN : BLUE;
        const hoveredItem = hoverId ? c.items.find((i) => i.id === hoverId) ?? null : null;
        const count = c.items.length;
        // Multi-item clusters grow so their count reads easily inside the dot.
        const rDot = (count > 1 ? 12 : 6) * s;
        return (
          <Marker
            key={`dot-${c.id}`}
            coordinates={c.coords}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handleClusterClick(c);
            }}
            onMouseEnter={() => {
              hoverRef.current = true;
            }}
            onMouseLeave={() => {
              hoverRef.current = false;
              setHoverId(null);
            }}
            style={{
              default: { cursor: "pointer" },
              hover: { cursor: "pointer" },
              pressed: { cursor: "pointer" },
            }}
          >
            {!!hoveredItem && (
              <circle
                r={rDot * 2.6}
                fill={dotColor}
                opacity={0.2}
                style={{ animation: "mapPulse 1.8s ease-out infinite", transformBox: "fill-box", transformOrigin: "center" }}
              />
            )}
            <circle r={rDot + 1.5 * s} fill="rgba(2,13,28,0.55)" />
            {mixed ? (
              <>
                <path d={`M0 ${-rDot} A ${rDot} ${rDot} 0 0 0 0 ${rDot} Z`} fill={BLUE} />
                <path d={`M0 ${-rDot} A ${rDot} ${rDot} 0 0 1 0 ${rDot} Z`} fill={GREEN} />
                <circle r={rDot} fill="none" stroke="#ffffff" strokeWidth={1.4 * s} />
              </>
            ) : (
              <circle
                r={rDot}
                fill={dotColor}
                stroke="#ffffff"
                strokeWidth={1.4 * s}
                style={{ filter: `drop-shadow(0 0 5px ${dotColor})` }}
              />
            )}
            {/* How many products/offers share this location (only when > 1). */}
            {count > 1 && (
              <text
                textAnchor="middle"
                y={4.5 * s}
                fontSize={13 * s}
                fontWeight={800}
                fill="#ffffff"
                stroke="rgba(2,13,28,0.55)"
                strokeWidth={0.8 * s}
                paintOrder="stroke"
                style={{ fontFamily: "var(--font-jetbrains), monospace", pointerEvents: "none" }}
              >
                {count}
              </text>
            )}
          </Marker>
        );
      })}

      {/* Pass 2 — name pills / hover card, on top of every dot. */}
      {sortedClusters.map(({ c }) => {
        const hoveredItem = hoverId ? c.items.find((i) => i.id === hoverId) ?? null : null;
        // Mirror pass 1's sizing so pills/cards float above the bigger dot.
        const rDot = (c.items.length > 1 ? 12 : 6) * s;

        // Globe: fade labels as the cluster nears the horizon (dot persists).
        const labelOpacity =
          mode === "globe"
            ? clamp((78 - angularDist(c.coords, rotation)) / 16, 0, 1)
            : 1;

        const shown = c.items.slice(0, 3);

        return (
          <Marker
            key={`label-${c.id}`}
            coordinates={c.coords}
            onMouseEnter={() => {
              hoverRef.current = true;
            }}
            onMouseLeave={() => {
              hoverRef.current = false;
              setHoverId(null);
            }}
            style={{
              default: { cursor: "pointer" },
              hover: { cursor: "pointer" },
              pressed: { cursor: "pointer" },
            }}
          >
            {/* Labels: rich card while hovering one item, else the pill stack */}
            <g style={{ opacity: labelOpacity, transition: "opacity .3s", pointerEvents: labelOpacity < 0.05 ? "none" : undefined }}>
              {hoveredItem ? (
                <HoverCard
                  item={hoveredItem}
                  s={s}
                  rDot={rDot}
                  onOpen={() => openItem(hoveredItem, c.items.length > 1 ? c.items : undefined)}
                />
              ) : (
                <PillStack
                  items={shown}
                  total={c.items.length}
                  s={s}
                  rDot={rDot}
                  onHover={(id) => setHoverId(id)}
                  onPick={(it) => openItem(it, c.items.length > 1 ? c.items : undefined)}
                  onViewAll={() => handleClusterClick(c)}
                />
              )}
            </g>
          </Marker>
        );
      })}
    </>
  );
}
