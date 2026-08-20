"use client";

import { useState } from "react";
import Placeholder from "@/components/Placeholder";
import type { MapItem, Offer } from "@/interfaces/marketplace/interface";
import { COMPANY, OFFERS, flagOf } from "../../marketplaceData";
import { BLUE, GREEN } from "../../marketplaceMapHelpers";

function SectionTitle({ children, color = "#0066ff" }: { children: React.ReactNode; color?: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color }}>
      {children}
      <span className="inline-block flex-1 border-t border-dashed border-gray-200" />
    </div>
  );
}

function Field({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <div className="text-[10px] uppercase tracking-[0.08em] text-gray-400">{label}</div>
      <div className="text-[12px] text-gray-900 font-medium">{value}</div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-gray-700 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1">
      {children}
    </span>
  );
}

const CHECK = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* One offer's full commercial dossier: price/quantities, specs, registered
   facility, available contracts, payment methods and its own purchase CTA.
   Shared by the offer detail view and the per-offer list on a product (a
   product can carry several offers, each with different terms). */
function OfferBody({ offer }: { offer: Offer }) {
  return (
    /* The offer dossier CONTENT only — the collapsible OfferSection wrapper
       below supplies the green container, so nothing is double-boxed. */
    <div className="flex flex-col gap-3.5">
      {/* Price + quantities */}
      <div>
        <div className="flex items-end justify-between gap-2 mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.1em] text-gray-500 mb-0.5">Price / {offer.metric}</div>
            <div className="flex items-baseline gap-1">
              <span className="text-[28px] font-bold text-gray-900 tracking-[-0.02em] font-mono">{offer.price}</span>
              <span className="text-[12px] text-gray-500 font-mono">/ {offer.metric}</span>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-white text-[#279b00] border border-[#cce6bd]">
            {offer.availability}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] max-[560px]:grid-cols-1">
          <Field label="Quantity available" value={`${offer.quantityAvailable} ${offer.metric}`} />
          <Field label="Load" value={offer.load} />
        </div>
      </div>

      {/* Registered facility */}
      <div>
        <div className="text-[10px] uppercase tracking-[0.08em] text-gray-500 mb-1.5">Registered facility</div>
        <div className="rounded-lg border border-[#cce6bd] bg-white p-3 flex flex-col gap-2.5">
          <Field label="Facility name as registered" value={offer.facilityName} />
          <Field label="Business ID number" value={offer.businessId} />
          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 max-[560px]:grid-cols-1">
            <Field label="Country" value={`${offer.flag} ${offer.country}`} />
            <Field label="City" value={offer.city} />
            <Field label="Address" value={offer.address} className="col-span-2" />
            <Field label="Postal code" value={offer.postalCode} />
          </div>
        </div>
      </div>

      {/* Available contracts */}
      <div>
        <div className="text-[10px] uppercase tracking-[0.08em] text-gray-500 mb-1.5">Available contracts</div>
        <div className="rounded-lg border border-[#cce6bd] overflow-hidden">
          {offer.contracts.map((c, i) => (
            <div key={c.incoterm} className={`px-3 py-2 ${i % 2 ? "bg-[#f7fcf3]" : "bg-white"}`}>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#e7f0ff] text-[#0066ff] border border-[#bcd4ff]">
                  {c.incoterm}
                </span>
                <span className="text-[11px] text-gray-500">
                  {c.incoterm === "EXW" && "Ex Works — pickup at facility"}
                  {c.incoterm === "FOB" && "Free on board"}
                  {c.incoterm === "CIF" && "Cost, insurance & freight"}
                  {c.incoterm === "CFR" && "Cost & freight"}
                </span>
              </div>
              {c.port && (
                <div className="mt-1.5 grid grid-cols-2 gap-x-3 text-[11px] max-[560px]:grid-cols-1">
                  <Field
                    label={c.incoterm === "CFR" ? "Port of destination" : "Port of origin"}
                    value={c.port}
                  />
                  {c.freightCostUsd && (
                    <Field label="Freight cost (facility → port)" value={`${c.freightCostUsd} USD`} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payment methods */}
      <div>
        <div className="text-[10px] uppercase tracking-[0.08em] text-gray-500 mb-1.5">Payment methods</div>
        <div className="flex flex-wrap gap-1.5">
          {offer.paymentMethods.map((m) => (
            <Chip key={m}>
              <span className="text-[#279b00]">{CHECK}</span> {m}
            </Chip>
          ))}
        </div>
      </div>

      {/* Purchase CTA — one per offer (each offer has its own terms). Same
          button anatomy as the "Request quote" primary CTA, in green. */}
      <a
        href="#"
        className="btn btn--primary btn--block hover:brightness-110"
        style={{
          background: "linear-gradient(90deg,#33cc00,#279b00)",
          boxShadow: "0 4px 14px rgba(51,204,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        Send purchase intention
      </a>
    </div>
  );
}

/* Collapsible green wrapper for ONE offer: the header (facility + price +
   chevron) toggles the full dossier. Used both for a product's offer list
   and for the single-offer detail, so long content stays folded away. */
function OfferSection({ offer, open, onToggle }: { offer: Offer; open: boolean; onToggle: () => void }) {
  return (
    <div className="rounded-lg border border-[#cce6bd] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2.5 bg-[#f1f9ec] text-left cursor-pointer"
        aria-expanded={open}
      >
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: GREEN }} />
        <span className="text-[12px] font-semibold text-gray-900 truncate">
          {offer.flag} {offer.city}
        </span>
        <span className="ml-auto text-[13px] font-bold text-[#279b00] font-mono whitespace-nowrap">
          {offer.price} <span className="text-[10px] text-gray-500 font-normal">/ {offer.metric}</span>
        </span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          className={`shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="p-3.5 bg-[#f1f9ec] border-t border-[#cce6bd]">
          <OfferBody offer={offer} />
        </div>
      )}
    </div>
  );
}

export default function ItemDetail({ item }: { item: MapItem }) {
  const p = item.product;
  const offer = item.offer;
  const isOffer = item.kind === "offer";
  const [imgIdx, setImgIdx] = useState(0);
  // A product can have several live offers (different facilities/terms) —
  // list them all on its detail, first one expanded.
  const productOffers = isOffer ? [] : OFFERS.filter((o) => o.productId === p.id);
  // Specs describe the goods, so they render under the product description.
  // On a product view they come from its first offer that declares any.
  const specs = isOffer ? offer!.specs : (productOffers.find((o) => o.specs.length > 0)?.specs ?? []);
  const [openOfferId, setOpenOfferId] = useState<string | null>(productOffers[0]?.id ?? null);
  // Single-offer view starts open (it's what was clicked); company info starts
  // folded — both collapsible to keep the sidebar's vertical scroll short.
  const [offerOpen, setOfferOpen] = useState(true);
  const [companyOpen, setCompanyOpen] = useState(false);
  const registered = new Date(COMPANY.dateRegistered).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      {/* ── Images (gallery) ── */}
      <div className="relative h-[176px] w-full bg-gray-100">
        <Placeholder
          key={imgIdx}
          originalFile={p.images[imgIdx] ?? p.images[0]}
          text={p.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className="text-[10px] font-bold tracking-[0.08em] uppercase px-2 py-1 rounded-md text-white shadow-sm"
            style={{ background: isOffer ? GREEN : BLUE }}
          >
            {isOffer ? "Live offer" : "Product"}
          </span>
          {isOffer && offer!.verified && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.06em] uppercase px-2 py-1 rounded-md bg-white/90 backdrop-blur text-[#279b00] border border-[rgba(51,204,0,0.45)]">
              {CHECK}
              Verified
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-[19px] font-bold tracking-[-0.01em] text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            {p.name}
          </h3>
          <p className="text-[12px] text-white/80 font-mono">{p.nameEs}</p>
        </div>
      </div>
      {p.images.length > 1 && (
        <div className="flex gap-1.5 px-3 py-2 border-b border-gray-100 bg-gray-50/60">
          {p.images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setImgIdx(i)}
              aria-label={`Image ${i + 1}`}
              className={`relative w-14 h-10 rounded-md overflow-hidden shrink-0 transition-all ${
                i === imgIdx ? "ring-2 ring-[#0066ff]" : "ring-1 ring-gray-200 opacity-70 hover:opacity-100"
              }`}
            >
              <Placeholder originalFile={img} text={`${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="p-4 flex flex-col gap-5">
        {/* ══ PRODUCT DETAILS ══ */}
        <div className="flex flex-col gap-3">
          <SectionTitle>Product details</SectionTitle>

          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 max-[560px]:grid-cols-1">
            <Field label="Category" value={p.category} />
            <Field label="Subcategory" value={p.subcategory} />
            <Field label="Product" value={p.productType} />
            <Field label="Country of origin" value={`${p.origin.flag} ${p.origin.country}`} />
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-gray-400 mb-1">Suggested HS codes</div>
            <div className="flex flex-wrap gap-1.5">
              {p.hsCodes.map((hs) => (
                <span key={hs} className="text-[11px] font-mono font-semibold text-[#0066ff] bg-[#eef4ff] border border-[#cfe0ff] rounded-md px-2 py-0.5">
                  HS {hs}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-gray-400 mb-1">Description</div>
            <p className="text-[12.5px] text-gray-600 leading-[1.6]">{p.description}</p>
          </div>

          {/* Specs — a property of the goods, so they sit with the product
              description rather than inside an offer's commercial terms. */}
          {specs.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.08em] text-gray-400 mb-1">Specs</div>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                {specs.map((sp, i) => (
                  <div
                    key={sp.label}
                    className={`flex items-center justify-between px-3 py-2 text-[12px] ${i % 2 ? "bg-gray-50" : "bg-white"}`}
                  >
                    <span className="text-gray-500">{sp.label}</span>
                    <span className="text-gray-900 font-mono font-medium">{sp.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-gray-400 mb-1">Export countries</div>
            <div className="flex flex-wrap gap-1.5">
              {p.exportCountries.map((c) => (
                <Chip key={c}>
                  <span>{flagOf(c)}</span> {c}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-gray-400 mb-1">Export countries (open market)</div>
            <div className="flex flex-wrap gap-1.5">
              {p.exportCountriesOpenMarket.map((c) => (
                <Chip key={c}>
                  <span>{flagOf(c)}</span> {c}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        {/* ══ COMPANY INFORMATION ══ (above the offer terms — who you're
            dealing with comes before the deal itself) */}
        <div className="flex flex-col gap-3">
          <SectionTitle>Company information</SectionTitle>

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            {/* Collapsible header — company name + certified badge; the full
                dossier (banner, badges, stats) unfolds on demand to keep the
                sidebar scroll short. */}
            <button
              onClick={() => setCompanyOpen((o) => !o)}
              className="w-full flex items-center gap-2 px-3 py-2.5 bg-gray-50 text-left cursor-pointer"
              aria-expanded={companyOpen}
            >
              <span className="text-[12px] font-bold text-gray-900 truncate">{COMPANY.name}</span>
              {COMPANY.badges.certifiedCompany && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-[0.04em] uppercase px-2 py-0.5 rounded-full bg-[#e7f0ff] text-[#0066ff] border border-[#bcd4ff] shrink-0">
                  {CHECK} Certified
                </span>
              )}
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                className={`ml-auto shrink-0 text-gray-500 transition-transform ${companyOpen ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {companyOpen && (
            <div className="border-t border-gray-200">
            {/* Store banner (1476×300) with the logo (213×120) overlapping */}
            <div className="relative">
              <div className="h-[72px] bg-gray-100">
                <Placeholder originalFile={COMPANY.banner} text={`${COMPANY.name} banner`} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-5 left-3 w-[71px] h-10 rounded-md overflow-hidden bg-white border border-gray-200 shadow-sm">
                <Placeholder originalFile={COMPANY.logo} text="Logo" className="w-full h-full object-contain" />
              </div>
            </div>

            <div className="pt-7 px-3 pb-3 flex flex-col gap-2.5">
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 max-[560px]:grid-cols-1">
                <Field label="Industry segment" value={COMPANY.industrySegment} />
                <Field label="Country" value={`${COMPANY.flag} ${COMPANY.country}`} />
                <Field label="Date registered" value={registered} />
              </div>

              <p className="text-[12px] text-gray-600 leading-[1.55]">{COMPANY.description}</p>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                {COMPANY.badges.verifiedBuyer && (
                  <Chip>
                    <span className="text-[#279b00]">{CHECK}</span> Verified buyer
                  </Chip>
                )}
                {COMPANY.badges.verifiedSeller && (
                  <Chip>
                    <span className="text-[#279b00]">{CHECK}</span> Verified seller
                  </Chip>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 max-[560px]:grid-cols-1">
                <div className="rounded-md bg-gray-50 border border-gray-200 px-2.5 py-2">
                  <div className="text-[16px] font-bold text-gray-900 font-mono leading-tight">
                    {COMPANY.badges.completedTransactions}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.06em] text-gray-400">Completed transactions</div>
                </div>
                <div className="rounded-md bg-gray-50 border border-gray-200 px-2.5 py-2">
                  <div className="text-[16px] font-bold text-gray-900 font-mono leading-tight">
                    {COMPANY.badges.accumulatedTransactionValue}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.06em] text-gray-400">Accumulated value</div>
                </div>
              </div>
            </div>
            </div>
            )}
          </div>
        </div>

        {/* ══ OFFER DETAILS ══ */}
        {isOffer ? (
          /* Single offer — same collapsible wrapper, open by default. */
          <div className="flex flex-col gap-3">
            <SectionTitle color="#279b00">Offer details</SectionTitle>
            <OfferSection offer={offer!} open={offerOpen} onToggle={() => setOfferOpen((o) => !o)} />
          </div>
        ) : productOffers.length > 0 ? (
          /* The product's live offers — each a collapsible wrapper. */
          <div className="flex flex-col gap-3">
            <SectionTitle color="#279b00">
              Live offers ({productOffers.length})
            </SectionTitle>
            {productOffers.map((o) => (
              <OfferSection
                key={o.id}
                offer={o}
                open={openOfferId === o.id}
                onToggle={() => setOpenOfferId(openOfferId === o.id ? null : o.id)}
              />
            ))}
          </div>
        ) : (
          /* Product with no live offer yet */
          <div className="rounded-lg bg-[#eef4ff] border border-[#cfe0ff] p-3.5 flex items-start gap-3">
            <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0066ff] shrink-0 border border-[#cfe0ff]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7L12 3 4 7v10l8 4 8-4z" /><path d="M4 7l8 4 8-4M12 11v10" /></svg>
            </span>
            <div>
              <div className="text-[12px] font-semibold text-gray-900">Catalog product</div>
              <div className="text-[11px] text-gray-500 leading-snug">No live offer yet — request current availability and pricing.</div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-2 pt-1">
          <a href="#" className="btn btn--primary btn--block" style={{ flex: 1 }}>
            {isOffer ? "Request quote" : "Request availability"}
          </a>
          <a
            href="#"
            aria-label="Save listing"
            className="inline-flex items-center justify-center px-3.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
          </a>
        </div>
      </div>
    </div>
  );
}
