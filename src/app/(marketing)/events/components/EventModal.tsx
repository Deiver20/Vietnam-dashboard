"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Placeholder from "@/components/Placeholder";
import BookmarkButton from "@/components/BookmarkButton";
import EventLocationMap from "./EventLocationMap";
import { EVENTS } from "../eventsData";
import { fmtEventDate as fmtDate } from "../eventsHelpers";
import type { EventBlock, EventSponsor, SponsorTier } from "@/interfaces/events/interface";

/* YIQ: readable ink on top of a solid accent (same rule as the dashboards). */
function inkOn(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 150 ? "#10131a" : "#ffffff";
}

const SectionTitle = ({ children, accent }: { children: React.ReactNode; accent?: string }) => (
  <div className="flex items-center gap-3 mt-9 mb-4">
    <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-gray-400 whitespace-nowrap">{children}</span>
    <span className="flex-1 h-px bg-gray-200" style={accent ? { background: `${accent}40` } : undefined} />
  </div>
);

const TIER_META: Record<SponsorTier, { label: string; color: string }> = {
  platinum: { label: "Platinum", color: "#8ea0b8" },
  gold: { label: "Gold", color: "#FCB514" },
  silver: { label: "Silver", color: "#9ca3af" },
  bronze: { label: "Bronze", color: "#cd7f32" },
};

/* Uniform sponsor tile — logo above name, every tile the same size (a
   small-scale version of the gallery grid). Tinted with the event color
   so tiles read against the modal's white body; the logo keeps a white
   chip because the artwork is drawn for white backgrounds. */
function SponsorTile({ s, accent }: { s: EventSponsor; accent: string }) {
  const body = (
    <span
      className="flex h-[96px] w-full flex-col items-center justify-center gap-2 px-3 rounded-lg border hover:shadow-sm transition-all overflow-hidden"
      style={{ background: `${accent}0a`, borderColor: `${accent}30` }}
    >
      {/* Fixed-size white logo chip: identical box in every tile. */}
      <span className="h-11 w-[112px] rounded-md bg-white flex items-center justify-center px-1.5 shrink-0 overflow-hidden">
        <Placeholder className="max-h-10 max-w-[104px] object-contain" text="logo" originalFile={s.logo} />
      </span>
      <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight w-full overflow-hidden text-ellipsis whitespace-nowrap">{s.name}</span>
    </span>
  );
  return s.url ? (
    <a href={s.url} target="_blank" rel="noopener" className="block">{body}</a>
  ) : (
    body
  );
}

/* One optional, repeatable content block — rendered in author order. */
function Block({ block, accent }: { block: EventBlock; accent: string }) {
  switch (block.type) {
    case "video":
      return (
        <div className="px-9 max-[560px]:px-5">
          <SectionTitle accent={accent}>Video{block.title ? ` · ${block.title}` : ""}</SectionTitle>
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border bg-black" style={{ borderColor: `${accent}30` }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${block.youtubeId}`}
              title={block.title ?? "Event video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      );

    case "schedule":
      // Days scroll horizontally; each day is a card with an accent
      // header and a vertical timeline of its activities.
      return (
        <div className="px-9 max-[560px]:px-5">
          <SectionTitle accent={accent}>Schedule · {block.name}</SectionTitle>
          <div className="modal-scroll flex gap-4 overflow-x-auto pb-4">
            {block.days.map((d, di) => (
              <div
                key={d.dayName}
                className="w-[320px] max-[560px]:w-[270px] shrink-0 flex flex-col rounded-2xl border overflow-hidden bg-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-18px_rgba(0,0,0,0.4)]"
                style={{ borderColor: `${accent}33` }}
              >
                {/* Day header — solid accent band */}
                <div className="flex items-center gap-2.5 px-4 py-3" style={{ background: accent, color: inkOn(accent) }}>
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-extrabold tabular-nums shrink-0"
                    style={{ background: inkOn(accent) === "#ffffff" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)" }}
                  >
                    {di + 1}
                  </span>
                  <span className="text-[12.5px] font-bold leading-tight">{d.dayName}</span>
                </div>

                {/* Timeline of activities */}
                <div className="flex flex-col flex-1 px-4 py-4 gap-0" style={{ background: `${accent}08` }}>
                  {d.activities.map((a, i) => (
                    <div key={i} className="relative pl-5 pb-4 last:pb-0">
                      {/* Rail + node */}
                      {i < d.activities.length - 1 && (
                        <span className="absolute left-[4px] top-[13px] bottom-0 w-px" style={{ background: `${accent}38` }} />
                      )}
                      <span
                        className="absolute left-0 top-[6px] w-[9px] h-[9px] rounded-full border-2 border-white"
                        style={{ background: accent }}
                      />
                      <span
                        className="inline-block text-[10.5px] font-bold tabular-nums font-[var(--font-jetbrains)] px-2 py-[2px] rounded-md mb-1"
                        style={{ background: `${accent}1f`, color: accent }}
                      >
                        {a.start}–{a.end}
                      </span>
                      <div className="text-[13px] font-semibold text-gray-900 leading-snug">{a.title}</div>
                      <div className="flex flex-col gap-0.5 mt-1 text-[11.5px] text-gray-500">
                        {a.speaker && <span>🎤 {a.speaker}</span>}
                        <span>📍 {a.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "tickets":
      // Cards keep the event color; the section itself sits on the
      // modal's plain white body.
      return (
        <div className="px-9 max-[560px]:px-5">
          <SectionTitle accent={accent}>Tickets</SectionTitle>
          <div className="grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
            {block.tickets.map((t) => (
              <div
                key={t.name}
                className="flex flex-col rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-16px_rgba(0,0,0,0.35)]"
                style={{ background: `${accent}0f`, borderColor: `${accent}45` }}
              >
                <div className="text-[11px] font-bold tracking-[0.1em] uppercase mb-1.5" style={{ color: accent }}>{t.name}</div>
                <div className="text-[26px] font-bold tracking-[-0.02em] text-gray-900 leading-none mb-1 tabular-nums">
                  ${t.price.toLocaleString("en-US")}
                  <span className="text-[12px] font-semibold text-gray-400 ml-1.5">{t.currency}</span>
                </div>
                <div className="text-[10.5px] text-gray-500 font-[var(--font-jetbrains)] mb-3">On sale until {fmtDate(t.expires)}</div>
                {t.benefits && (
                  <ul className="flex flex-col gap-1.5 mt-auto">
                    {t.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-1.5 text-[12px] text-gray-600 leading-snug">
                        <span className="font-bold shrink-0" style={{ color: accent }}>✓</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case "sponsors":
      return (
        <div className="px-9 max-[560px]:px-5">
          <SectionTitle accent={accent}>Sponsors</SectionTitle>
          <div className="flex flex-col gap-4">
            {(Object.keys(TIER_META) as SponsorTier[]).map((tier) => {
              const list = block.tiers[tier];
              if (!list?.length) return null;
              const meta = TIER_META[tier];
              return (
                <div key={tier}>
                  <div className="text-[10px] font-bold tracking-[0.14em] uppercase mb-2" style={{ color: meta.color }}>
                    {meta.label}
                  </div>
                  {/* Same-size tiles, gallery-style grid — just smaller. */}
                  <div className="grid grid-cols-4 gap-2 max-[720px]:grid-cols-3 max-[480px]:grid-cols-2">
                    {list.map((s) => <SponsorTile key={s.name} s={s} accent={accent} />)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );

    case "gallery":
      return (
        <div className="px-9 max-[560px]:px-5">
          <SectionTitle accent={accent}>Gallery</SectionTitle>
          <div className="grid grid-cols-3 gap-2 max-[560px]:grid-cols-2">
            {block.images.slice(0, 15).map((img) => (
              <div key={img} className="aspect-[4/3] rounded-lg overflow-hidden border" style={{ borderColor: `${accent}30` }}>
                <Placeholder className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" text="Event photo" originalFile={img} />
              </div>
            ))}
          </div>
        </div>
      );
  }
}

/* ── Event modal ─────────────────────────────────────────
   Opens OVER the /events page (own URL via the intercepted
   /events/event/:id route). ABOUT always on top; every other block is
   optional and rendered in the order defined in the event's data. ── */
export default function EventModal({
  id,
  intercepted = false,
}: {
  id: string;
  intercepted?: boolean;
}) {
  const router = useRouter();
  const ev = EVENTS.find((e) => String(e.id) === id);
  const [shown, setShown] = useState(false);

  const close = () => {
    if (intercepted) router.back();
    else router.push("/events");
  };

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accent = ev?.about?.color ?? ev?.accent ?? "#0066FF";

  return (
    // The OVERLAY scrolls, not the card: the card hugs its content at full
    // height and the whole thing moves as you scroll, so no section is
    // ever clipped inside an inner scroll box.
    <div
      className="modal-scroll fixed inset-0 z-[200] overflow-y-auto overscroll-contain p-6 max-[560px]:p-3"
      role="dialog"
      aria-modal="true"
      aria-label={ev ? ev.name : "Event not found"}
    >
      {/* Fixed so the backdrop covers the viewport however far the card
          scrolls. */}
      <div
        className={`fixed inset-0 bg-[#001730]/70 backdrop-blur-sm transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"}`}
        onClick={close}
        aria-hidden="true"
      />

      <div
        className={`relative w-full max-w-[860px] mx-auto rounded-2xl overflow-hidden bg-white shadow-[0_32px_80px_-20px_rgba(0,0,0,0.5)] transition-all duration-300 ${
          shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {!ev ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4 opacity-40">🌍</div>
            <h1 className="text-lg font-semibold text-gray-900 mb-2">Event not found</h1>
            <p className="text-sm text-gray-500 mb-6">This event doesn&apos;t exist or was removed.</p>
            <Link href="/events" className="btn btn--primary text-sm py-2.5 px-5">← Back to Events</Link>
          </div>
        ) : (
          <>
            {/* ── Header: dark location map as the full-width top banner —
                same placement/height as the news article image. Same dark
                base map as the dashboard's "Exporters Map Location",
                framed on the host city. ── */}
            <div className="relative">
              {/* Height set inline (clamp) so the banner scales with the
                  viewport without depending on a generated utility. */}
              <div className="relative w-full overflow-hidden bg-[#04101f]" style={{ height: "clamp(200px, 26vw, 300px)" }}>
                {ev.coords ? (
                  <EventLocationMap coords={ev.coords} city={ev.location.split(",")[0]} country={ev.country} accent={accent} />
                ) : (
                  <Placeholder className="absolute inset-0 w-full h-full object-cover" text={ev.name} originalFile={ev.image} />
                )}
              </div>

              {/* ABOUT EVENT — always under the map. Event image on the
                  left, the event's facts on the right. The event color
                  fades into white behind the whole block. */}
              <div
                className="relative flex gap-7 max-[720px]:flex-col max-[720px]:gap-5 px-9 pt-7 pb-7 max-[560px]:px-5"
                style={{ background: `linear-gradient(180deg, ${accent}2e 0%, ${accent}10 55%, #ffffff 100%)` }}
              >
                {/* Event image */}
                <div
                  className="relative w-[260px] max-[720px]:w-full shrink-0 self-start aspect-[16/9] rounded-xl overflow-hidden border shadow-[0_10px_28px_-12px_rgba(0,0,0,0.3)]"
                  style={{ borderColor: `${accent}40` }}
                >
                  <Placeholder className="absolute inset-0 w-full h-full object-cover" text={ev.name} originalFile={ev.image} />
                </div>

                <div className="min-w-0 flex-1">
                  <h1 className="text-[30px] max-[560px]:text-[24px] font-bold text-gray-900 leading-[1.15] tracking-[-0.01em] mb-2 pr-10">
                    {ev.name}
                  </h1>
                  {ev.about?.slogan && (
                    <p className="text-[15.5px] font-medium text-gray-700 mb-4">{ev.about.slogan.slice(0, 100)}</p>
                  )}

                  {/* Dates + country — same facts as the card */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-semibold text-gray-700 mb-4">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold tracking-[0.12em] uppercase text-gray-500">Starts</span>
                      <span className="tabular-nums">{fmtDate(ev.startDate)}</span>
                    </span>
                    <span className="text-gray-300">→</span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold tracking-[0.12em] uppercase text-gray-500">Ends</span>
                      <span className="tabular-nums">{fmtDate(ev.endDate)}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-base leading-none">{ev.flag}</span>
                      {ev.country}
                    </span>
                  </div>

                  {ev.about?.description && (
                    <p className="text-[14px] text-gray-600 leading-[1.7]">
                      {ev.about.description.slice(0, 1500)}
                    </p>
                  )}

                  {ev.about?.url && (
                    <a
                      href={ev.about.url}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-lg text-[13px] font-bold tracking-[0.02em] shadow-md hover:brightness-105 hover:-translate-y-px transition-all"
                      style={{ background: accent, color: inkOn(accent) }}
                    >
                      Visit official website
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                    </a>
                  )}
                </div>
              </div>

              {/* Bookmark + close — pinned to the header's top-right */}
              <BookmarkButton
                storageKey="agm-event-bookmarks"
                id={ev.id}
                accent={accent}
                iconSize={15}
                className="absolute top-3.5 right-[60px] w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.08] shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-all"
              />
              <button
                onClick={close}
                aria-label="Close event"
                className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.08] shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {/* ── Optional blocks, in the author's order — except sponsors,
                which always render at the very end. ── */}
            {ev.blocks && ev.blocks.length > 0 && (
              <div className="pb-9">
                {[...ev.blocks.filter((b) => b.type !== "sponsors"), ...ev.blocks.filter((b) => b.type === "sponsors")]
                  .map((b, i) => <Block key={i} block={b} accent={accent} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
