import type { MapItem } from "@/interfaces/marketplace/interface";
import { BLUE, GREEN } from "../../marketplaceMapHelpers";

interface HoverCardProps {
  item: MapItem;
  s: number;
  rDot: number;
  onOpen: () => void;
}

export default function HoverCard({ item, s, rDot, onOpen }: HoverCardProps) {
  const p = item.product;
  const isOffer = item.kind === "offer";
  const color = isOffer ? GREEN : BLUE;
  const loc = isOffer ? `${item.offer!.flag} ${item.offer!.city}` : `${p.origin.flag} ${p.origin.country}`;
  const locSub = isOffer ? item.offer!.country : "Producing region";
  const addr = isOffer ? item.offer!.address : p.origin.address;

  // Design px — the inner scale(s) group makes 1 css px ≈ 1 screen px.
  const W = 250;
  const Hc = isOffer ? 212 : 206; // approx card content height (incl. address line)
  const gapAbove = rDot / s + 8; // float above the dot (rDot is user units → /s = px)
  const boxH = Hc + gapAbove + 6; // extend past the dot so hover never drops out

  return (
    <g transform={`scale(${s})`}>
      <foreignObject x={-W / 2} y={-(Hc + gapAbove)} width={W} height={boxH} style={{ overflow: "visible" }}>
        {/* The whole box catches the pointer (transparent below the card) so the
            hover never flickers as the cursor moves between pills and the card. */}
        <div style={{ width: `${W}px`, height: `${boxH}px` }}>
          <div
            style={{
              width: `${W}px`,
              fontFamily: "var(--font-poppins), system-ui, sans-serif",
              background: "rgba(4,13,28,0.97)",
              border: "1px solid rgba(103,166,255,0.34)",
              borderRadius: "14px",
              boxShadow: "0 18px 44px -12px rgba(0,0,0,0.85)",
              overflow: "hidden",
              color: "#eaf1ff",
            }}
          >
            <div style={{ padding: "12px 13px 11px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "7px" }}>
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#fff",
                    background: color,
                    borderRadius: "5px",
                    padding: "2px 6px",
                  }}
                >
                  {isOffer ? "Live offer" : "Product"}
                </span>
                {isOffer && item.offer!.verified && (
                  <span style={{ fontSize: "9px", fontWeight: 700, color: "#7be25a", letterSpacing: "0.05em" }}>✓ VERIFIED</span>
                )}
              </div>

              <div style={{ fontSize: "15px", fontWeight: 700, lineHeight: 1.2, color: "#fff" }}>{p.name}</div>
              <div style={{ fontSize: "11px", color: "#8fa9d6", fontFamily: "var(--font-jetbrains), monospace", marginTop: "2px" }}>
                {p.nameEs} · HS {p.hsCodes[0]}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "9px", marginTop: "10px" }}>
                <span
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#fff",
                    background: "linear-gradient(135deg,#0066ff,#33cc00)",
                    flexShrink: 0,
                  }}
                >
                  RG
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>{p.company}</div>
                  <div style={{ fontSize: "10.5px", color: "#8fa9d6" }}>{p.category} · {p.subcategory}</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "8px", marginTop: "10px" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "12px", color: "#d7e3fb" }}>{loc}</div>
                  <div style={{ fontSize: "10px", color: "#7187ad" }}>{locSub}</div>
                  <div
                    style={{
                      fontSize: "9.5px",
                      color: "#5f7494",
                      marginTop: "2px",
                      maxWidth: "150px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {addr}
                  </div>
                </div>
                {isOffer && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "17px", fontWeight: 800, color: "#33cc00", fontFamily: "var(--font-jetbrains), monospace", lineHeight: 1.1 }}>
                      {item.offer!.price}
                    </div>
                    <div style={{ fontSize: "9.5px", color: "#7187ad", fontFamily: "var(--font-jetbrains), monospace" }}>
                      / {item.offer!.metric} · {item.offer!.contracts.map((c) => c.incoterm).join(" · ")}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              style={{
                width: "100%",
                border: "none",
                cursor: "pointer",
                padding: "10px 12px",
                background: isOffer ? "linear-gradient(90deg,#33cc00,#279b00)" : "#0066ff",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.03em",
                fontFamily: "inherit",
              }}
            >
              View more details →
            </button>
          </div>
        </div>
      </foreignObject>
    </g>
  );
}
