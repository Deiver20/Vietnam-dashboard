import { IND_LABELS, type EventItem } from "./eventsData";

/* ── Helpers ──────────────────────────────────────────── */
export function indLabel(k: string) { return IND_LABELS[k] || k; }

export function parseEventDate(ev: EventItem) {
  const firstDay = parseInt(ev.day.split("–")[0]);
  return new Date(`${ev.year}-${String(ev.monthKey).padStart(2, "0")}-${String(firstDay).padStart(2, "0")}T09:00:00-03:00`);
}

export function daysUntilEvent(ev: EventItem) {
  const target = parseEventDate(ev);
  return Math.ceil((target.getTime() - Date.now()) / 86400000);
}

export function eventProgress(ev: EventItem) {
  const daysLeft = daysUntilEvent(ev);
  const pct = Math.min(100, Math.max(5, (daysLeft / 90) * 100));
  const color = daysLeft > 60 ? "#33cc00" : daysLeft > 30 ? "#FCB514" : "#F35959";
  return { daysLeft, pct, color };
}

export function indChips(inds: string[]) {
  return (inds || []).map((i) => (
    <span key={i} className="px-2 py-[3px] rounded text-[9.5px] font-bold tracking-[0.06em] uppercase bg-gray-50 border border-gray-200 text-gray-600">
      {indLabel(i)}
    </span>
  ));
}

export function pastIndChips(inds: string[]) {
  return (inds || []).map((i) => (
    <span key={i} className="px-[6px] py-[2px] rounded-[3px] text-[8.5px] font-semibold tracking-[0.06em] uppercase bg-gray-100 border border-gray-200 text-gray-400">
      {indLabel(i)}
    </span>
  ));
}

/* "Sep 8, 2026" from an ISO date — shared by cards and the event modal. */
export function fmtEventDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}
