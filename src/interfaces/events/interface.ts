/* ── Event modal content model ──────────────────────────
   ABOUT is a single optional block, always rendered on top. Every other
   block type is optional, repeatable, and rendered in the order the
   author put it in `blocks`. */

export interface EventAbout {
  /** Max 100 characters. */
  slogan?: string;
  /** Max 1500 characters. */
  description?: string;
  /** Official external event website — powers the CTA button. */
  url?: string;
  /** Brand color — used as a soft gradient into white behind the header. */
  color?: string;
}

export interface ScheduleActivity {
  start: string; // "09:00"
  end: string;   // "10:30"
  title: string;
  /** Guest / speaker (optional). */
  speaker?: string;
  location: string;
}

export interface ScheduleDay {
  dayName: string; // "Day 1 · Monday Sep 8"
  activities: ScheduleActivity[];
}

export interface EventTicket {
  name: string;
  price: number;
  currency: string; // "USD"
  /** ISO date the ticket stops being sold. */
  expires: string;
  /** Optional list of what the ticket includes. */
  benefits?: string[];
}

export interface EventSponsor {
  name: string;
  logo: string; // asset path
  url?: string;
}

export type SponsorTier = "platinum" | "gold" | "silver" | "bronze";

export type EventBlock =
  | { type: "video"; /** YouTube video id. */ youtubeId: string; title?: string }
  | { type: "schedule"; name: string; days: ScheduleDay[] }
  | { type: "tickets"; tickets: EventTicket[] }
  | { type: "sponsors"; tiers: Partial<Record<SponsorTier, EventSponsor[]>> }
  | { type: "gallery"; /** Max 15 photos. */ images: string[] };

/* ── The event entity (card + modal) ─────────────────── */
export interface AgmEvent {
  id: number;
  status: "upcoming" | "past";
  featured: boolean;
  name: string;
  sub: string;
  month: string;
  day: string;
  year: string;
  displayDate: string;
  monthKey: number;
  startDate: string; // ISO
  endDate: string;   // ISO
  /** Event image — shown on the card and as the modal banner. */
  image: string;
  location: string;
  /** [lng, lat] of the host city — drives the modal's location map. */
  coords?: [number, number];
  country: string;
  flag: string;
  region: string;
  industries: string[];
  accent: string;
  website: string;
  agmOrganized: boolean;
  agmFlagship: boolean;
  agmPartner: boolean;
  description?: string;
  /** Modal: single ABOUT block, always on top. */
  about?: EventAbout;
  /** Modal: optional repeatable blocks, rendered in array order. */
  blocks?: EventBlock[];
}
