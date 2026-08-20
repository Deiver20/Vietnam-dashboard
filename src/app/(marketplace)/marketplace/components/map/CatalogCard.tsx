import Placeholder from "@/components/Placeholder";
import type { MapItem } from "@/interfaces/marketplace/interface";

/* ═══════════════════════════════════════════════════════════
   List-view card — vertical, light mode (product or offer)
   ═══════════════════════════════════════════════════════════ */

export default function CatalogCard({ item, onOpen }: { item: MapItem; onOpen: (it: MapItem) => void }) {
  const p = item.product;
  const isOffer = item.kind === "offer";
  const accent = isOffer ? "#33CC00" : "#2A84FF";
  const loc = isOffer ? `${item.offer!.flag} ${item.offer!.city}` : `${p.origin.flag} ${p.origin.country}`;
  return (
    <button
      onClick={() => onOpen(item)}
      className="group text-left relative flex flex-col rounded-xl overflow-hidden min-h-[340px] shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 transition-all"
    >
      {/* Background image */}
      <div className="absolute inset-0 bg-[#0a2748]">
        <Placeholder originalFile={p.images[0]} text={p.name} className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
      </div>

      {/* Gradient overlay: dark at bottom, transparent at top */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(0deg, rgba(0,23,48,0.90) 40%, rgba(0,23,48,0.2) 100%)" }}
      />

      {/* Top badges */}
      <div className="relative z-10 p-2.5 flex items-start justify-between">
        <span
          className="text-[10px] font-bold tracking-[0.07em] uppercase px-2 py-1 rounded-md text-white shadow-sm backdrop-blur-[6px]"
          style={{ background: accent }}
        >
          {isOffer ? "Live offer" : "Product"}
        </span>
        {isOffer && item.offer!.verified && (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase px-1.5 py-1 rounded-md bg-black/50 backdrop-blur border border-white/[0.12] text-[#33cc00]">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
            Verified
          </span>
        )}
      </div>

      {/* Spacer pushes content to the bottom */}
      <div className="flex-1 relative z-10 pointer-events-none" />

      {/* Bottom content — no background, sits directly on the gradient */}
      <div className="relative z-10 p-3.5 flex flex-col gap-1.5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#67a6ff]">
          {p.subcategory}
        </div>
        <h3 className="text-[14px] font-semibold text-white leading-snug line-clamp-2">{p.name}</h3>
        <div className="text-[12px] text-white/70">{loc}</div>

        <div className="mt-1 min-h-[24px] flex items-baseline gap-1">
          {isOffer ? (
            <>
              <span className="text-[18px] font-bold text-[#33cc00] font-mono tracking-[-0.02em]">{item.offer!.price}</span>
              <span className="text-[11px] text-white/40 font-mono">/ {item.offer!.metric}</span>
            </>
          ) : (
            <span className="text-[12px] text-white/40">Catalog · request pricing</span>
          )}
        </div>

        <div className="pt-2">
          <span
            className="flex items-center justify-center h-9 rounded-lg text-[12px] font-bold uppercase tracking-[0.05em] text-white transition-all group-hover:brightness-110"
            style={{ background: isOffer ? "linear-gradient(90deg,#33cc00,#279b00)" : "#0066ff" }}
          >
            {isOffer ? "View offer →" : "View product →"}
          </span>
        </div>
      </div>
    </button>
  );
}
