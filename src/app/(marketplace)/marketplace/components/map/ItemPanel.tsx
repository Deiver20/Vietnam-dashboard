import Placeholder from "@/components/Placeholder";
import type { MapItem } from "@/interfaces/marketplace/interface";
import { BLUE, GREEN } from "../../marketplaceMapHelpers";
import ItemDetail from "./ItemDetail";

function ItemList({ items, onSelect }: { items: MapItem[]; onSelect: (it: MapItem) => void }) {
  return (
    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-gray-50">
      {items.map((it) => {
        const p = it.product;
        const isOffer = it.kind === "offer";
        const loc = isOffer ? `${it.offer!.flag} ${it.offer!.city}` : `${p.origin.flag} ${p.origin.country}`;
        return (
          <button
            key={it.id}
            onClick={() => onSelect(it)}
            className="group flex gap-3 p-2.5 rounded-lg bg-white border border-gray-200 shadow-sm hover:border-[#0066ff] hover:bg-[#f5f9ff] transition-all text-left"
          >
            <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0 bg-gray-100">
              <Placeholder originalFile={p.images[0]} text={p.name} className="w-full h-full object-cover" />
              <span
                className="absolute top-1 left-1 w-2.5 h-2.5 rounded-full border border-white"
                style={{ background: isOffer ? GREEN : BLUE }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-gray-900 leading-tight truncate">{p.name}</div>
              <div className="text-[11px] text-gray-500 mb-1 truncate">{loc}</div>
              {isOffer ? (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-[#279b00] font-mono">{it.offer!.price}</span>
                  <span className="text-[10px] text-gray-400 font-mono">/ {it.offer!.metric}</span>
                  <span className="ml-auto text-[10px] text-gray-500 font-mono">{it.offer!.quantityAvailable} {it.offer!.metric}</span>
                </div>
              ) : (
                <span className="inline-block text-[10px] font-semibold tracking-[0.06em] uppercase px-2 py-0.5 rounded bg-[#eef4ff] text-[#0066ff]">
                  Product
                </span>
              )}
            </div>
            <svg className="self-center text-gray-300 group-hover:text-[#0066ff] transition-colors shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        );
      })}
    </div>
  );
}

interface ItemPanelProps {
  items: MapItem[];
  activeItem: MapItem | null;
  onSelect: (it: MapItem) => void;
  onBack?: () => void;
  onClose: () => void;
}

export default function ItemPanel({ items, activeItem, onSelect, onBack, onClose }: ItemPanelProps) {
  const showList = !activeItem;
  const heading = showList
    ? `${items.length} listings nearby`
    : activeItem!.kind === "offer"
    ? "Offer detail"
    : "Product detail";

  return (
    <aside
      className="mkt-panel relative z-[110] w-[384px] shrink-0 h-full flex flex-col bg-white border-l border-gray-200 shadow-[-24px_0_50px_-24px_rgba(0,0,0,0.45)] overflow-hidden max-[760px]:absolute max-[760px]:inset-x-0 max-[760px]:bottom-0 max-[760px]:top-auto max-[760px]:w-auto max-[760px]:h-[76%] max-[760px]:z-[110] max-[760px]:border-l-0 max-[760px]:rounded-t-2xl max-[760px]:shadow-[0_-20px_50px_-10px_rgba(0,0,0,0.45)]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back to list"
            className="w-7 h-7 coarse:w-11 coarse:h-11 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#0066ff]">{heading}</span>
        <button
          onClick={onClose}
          aria-label="Close"
          className="ml-auto w-7 h-7 coarse:w-11 coarse:h-11 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {showList ? (
        <ItemList items={items} onSelect={onSelect} />
      ) : (
        <ItemDetail item={activeItem!} />
      )}
    </aside>
  );
}
