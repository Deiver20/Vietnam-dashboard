import { OFFERS, PRODUCTS } from "../marketplaceData";

/* Hero copy + live counts (two eyebrow pills). Shared by the list and map
   views. `stacked` breaks the headline into two lines ("traded live." under
   "Commodities,") and narrows the whole block — used over the globe so the
   copy covers as little of the world as possible. */
export default function MarketplaceHeroText({ stacked = false }: { stacked?: boolean }) {
  return (
    <div className={`${stacked ? "max-w-[380px]" : "max-w-[600px]"} drop-shadow-[0_2px_18px_rgba(0,0,0,0.92)]`}>
      <div className="flex flex-wrap items-center gap-2 mb-7 drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
        <span
          className="eyebrow"
          style={{ marginBottom: 0, borderColor: "rgba(51,204,0,0.40)", boxShadow: "0 0 18px rgba(51,204,0,0.22)" }}
        >
          <span className="dot dot--green" />
          <span className="whitespace-nowrap">
            <b className="text-white font-semibold">{OFFERS.length}</b> live offers
          </span>
        </span>
        <span
          className="eyebrow"
          style={{ marginBottom: 0, borderColor: "rgba(103,166,255,0.40)", boxShadow: "0 0 18px rgba(103,166,255,0.22)" }}
        >
          <span className="dot dot--blue" />
          <span className="whitespace-nowrap">
            <b className="text-white font-semibold">{PRODUCTS.length}</b> products
          </span>
        </span>
      </div>
      <h1 className="text-[clamp(28px,3.4vw,48px)] font-semibold leading-[1.08] tracking-[-0.02em] whitespace-nowrap">
        Commodities,{stacked ? <br /> : " "}
        <span className="grad-green">traded live.</span>
      </h1>
      <p className={`text-[15px] text-gray-2 leading-[1.6] mt-3 ${stacked ? "max-w-[340px]" : "max-w-[480px]"} max-[720px]:hidden`}>
        Explore <b className="text-white">RenderingGlobal</b> offers across the planet. Tap a location
        to open the product and view its dispatch ports.
      </p>
    </div>
  );
}
