import type { MapItem } from "@/interfaces/marketplace/interface";
import { BLUE, GREEN, truncate } from "../../marketplaceMapHelpers";

interface PillStackProps {
  items: MapItem[]; // up to 3
  total: number;
  s: number;
  rDot: number;
  onHover: (id: string) => void;
  onPick: (it: MapItem) => void;
  onViewAll: () => void;
}

export default function PillStack({
  items,
  total,
  s,
  rDot,
  onHover,
  onPick,
  onViewAll,
}: PillStackProps) {
  const px = (v: number) => v * s;
  const pillH = px(19);
  const gap = px(4);
  const dotGap = rDot + px(6);
  const more = total - items.length;

  type Row = { kind: "item"; it: MapItem } | { kind: "more" };
  const rows: Row[] = items.map((it) => ({ kind: "item", it }));
  if (more > 0) rows.push({ kind: "more" });
  const n = rows.length;

  return (
    <g>
      {rows.map((row, k) => {
        // k = 0 is the top row in reading order; stack upward so the last row
        // sits just above the dot.
        const j = n - 1 - k;
        const yTop = -dotGap - j * (pillH + gap) - pillH;

        if (row.kind === "more") {
          const w = px(108);
          return (
            <g
              key="more"
              transform={`translate(${-w / 2}, ${yTop})`}
              onClick={(e) => {
                e.stopPropagation();
                onViewAll();
              }}
              style={{ cursor: "pointer" }}
            >
              <rect width={w} height={pillH} rx={pillH / 2} fill="#0b2a52" stroke="rgba(120,180,255,0.55)" strokeWidth={px(1)} />
              <text
                x={w / 2}
                y={pillH / 2}
                dominantBaseline="central"
                textAnchor="middle"
                fontSize={px(11)}
                fontWeight={700}
                fill="#cfe0ff"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                {`⤢ View all ${total}`}
              </text>
            </g>
          );
        }

        const it = row.it;
        const isOffer = it.kind === "offer";
        const color = isOffer ? GREEN : BLUE;
        const name = truncate(it.product.name, 20);
        const price = isOffer ? it.offer!.price : "";
        const w = px(16) + name.length * px(6.0) + (price ? price.length * px(6.8) + px(8) : 0) + px(11);

        return (
          <g
            key={it.id}
            transform={`translate(${-w / 2}, ${yTop})`}
            onMouseEnter={() => onHover(it.id)}
            onClick={(e) => {
              e.stopPropagation();
              onPick(it);
            }}
            style={{ cursor: "pointer" }}
          >
            <rect width={w} height={pillH} rx={pillH / 2} fill="rgba(3,12,26,0.92)" stroke="rgba(103,166,255,0.30)" strokeWidth={px(1)} />
            <circle cx={px(9.5)} cy={pillH / 2} r={px(3)} fill={color} style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
            <text x={px(16)} y={pillH / 2} dominantBaseline="central" fontSize={px(11)} fontWeight={600} fill="#eaf1ff" style={{ fontFamily: "var(--font-poppins)" }}>
              {name}
            </text>
            {price && (
              <text x={w - px(9)} y={pillH / 2} dominantBaseline="central" textAnchor="end" fontSize={px(11)} fontWeight={700} fill={GREEN} style={{ fontFamily: "var(--font-jetbrains)" }}>
                {price}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
