import { MarketingFooter as Footer } from "@/components/marketing/MarketingFooter";
import SatelliteHeroBackdrop from "@/components/SatelliteHeroBackdrop";
import type { MarketplaceController } from "@/hooks/marketplace/useMarketplaceMap";
import MarketplaceHeroText from "./MarketplaceHeroText";
import MarketplaceViewSwitch from "./MarketplaceViewSwitch";
import MarketplaceFilters from "./MarketplaceFilters";
import CatalogCard from "./map/CatalogCard";
import ItemPanel from "./map/ItemPanel";

/* ════════════════════════ LIST VIEW (cards, /data-style) ════════════ */
export default function MarketplaceListView({ ctrl }: { ctrl: MarketplaceController }) {
  const {
    sectionRef, mode, switchMode,
    filteredItems, openItem,
    panelItems, activeItem, setActiveItemId, closePanel,
  } = ctrl;

  return (
    <section ref={sectionRef} id="marketplace-map" className="relative w-full bg-[#020912]" data-screen-label="Marketplace">
      {/* Hero */}
      <div className="relative pt-[110px] pb-7 min-h-[400px] overflow-hidden">
        {/* Same animated backdrop as the /data hero (image + starfield +
            particles + satellites) — the site-wide hero background. */}
        <SatelliteHeroBackdrop />
        <div className="relative z-[3] max-w-[1400px] mx-auto px-8 max-[720px]:px-4 flex items-start justify-between gap-8 max-[860px]:flex-col max-[860px]:gap-4">
          <MarketplaceHeroText />
          <div className="flex flex-col items-end gap-3 shrink-0 max-[860px]:flex-row max-[860px]:items-center max-[860px]:flex-wrap">
            <MarketplaceViewSwitch mode={mode} switchMode={switchMode} />
          </div>
        </div>
      </div>

      {/* Sticky filters */}
      <div className="sticky top-[68px] z-[80] border-y border-white/[0.08]" style={{ background: "rgb(2,9,18)" }}>
        <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4 py-3 flex items-center gap-3 flex-wrap">
          <MarketplaceFilters ctrl={ctrl} vertical={false} />
        </div>
      </div>

      {/* Products grid (light mode background, image-first cards) */}
      <div className="bg-[#F4F6FA] border-t border-gray-200">
        <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4 pt-7 pb-16">
          <div className="text-[11px] text-gray-500 font-mono tracking-[0.05em] mb-4">
            {filteredItems.length} {filteredItems.length === 1 ? "listing" : "listings"}
          </div>
          {filteredItems.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-4xl mb-3 opacity-50">📦</div>
              <p className="text-sm text-gray-500">No listings match these filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-3 max-[860px]:grid-cols-2 max-[560px]:grid-cols-1">
              {filteredItems.map((it) => (
                <CatalogCard key={it.id} item={it} onOpen={openItem} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Detail drawer */}
      {panelItems && activeItem && (
        <div className="fixed inset-0 z-[120] flex justify-end" onClick={closePanel}>
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
          <ItemPanel
            items={panelItems}
            activeItem={activeItem}
            onSelect={(it) => openItem(it)}
            onBack={panelItems.length > 1 && activeItem ? () => setActiveItemId(null) : undefined}
            onClose={closePanel}
          />
        </div>
      )}
    </section>
  );
}
