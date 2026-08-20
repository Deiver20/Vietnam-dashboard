import type { AgmEvent, EventBlock } from "@/interfaces/events/interface";

/* ── Cloudinary media ─────────────────────────────────────
   Real event banners (5, reused across the calendar) and real
   sponsor/client logos used by every sponsors block. */
const CDN = "https://res.cloudinary.com/wcwmpxez/image/upload";
const IMG_REAM = `${CDN}/v1785791283/REAM-2026-Mendoza-argentina_werfyi.webp`;
const IMG_SIAVS = `${CDN}/v1785791283/siavs_bnaigl.webp`;
const IMG_FORO = `${CDN}/v1785791283/Foromascotas2_fqpp6l.webp`;
const IMG_ARA = `${CDN}/v1785791283/Captura_de_pantalla_2026-02-23_105958_lvup2r.webp`;
const IMG_AQUAUK = `${CDN}/v1785791283/aquauk_mwguhz.webp`;

const LOGO_FIMACO = `${CDN}/v1785471361/10_plm1gb.webp`;
const LOGO_AURI = `${CDN}/v1785471361/20_iodcjr.webp`;
const LOGO_SEARA = `${CDN}/v1785254542/36_u0mpsu.png`;
const LOGO_SECAMAQ = `${CDN}/v1785254543/37_coradb.png`;
const LOGO_HF_FOODTECH = `${CDN}/v1785254543/6_rprtj0.png`;
const LOGO_3A_BIOTECH = `${CDN}/v1785254542/35_nl6abh.png`;
const LOGO_MINERVA = `${CDN}/v1785254542/34_fgxysd.png`;
const LOGO_OESTERGAARD = `${CDN}/v1785254542/33_pejdeo.png`;
const LOGO_EUROTEC = `${CDN}/v1785254542/32_zlokog.png`;
const LOGO_DHEYTECNICA = `${CDN}/v1785254542/31_h0g0nj.png`;
const LOGO_INNOVAQUIMICA = `${CDN}/v1785254542/29_lze91z.png`;

/* ── Data ─────────────────────────────────────────────── */
const RAW_EVENTS: AgmEvent[] = [
  {
    id: 100, status: "upcoming" as const, featured: true,
    name: "REAM 2026", sub: "4ª Reunión de las Américas · Agri-Food & Rendering",
    month: "SEP", day: "8–10", year: "2026", displayDate: "Sep 8–10, 2026", monthKey: 9,
    location: "Mendoza, Argentina", coords: [-68.85, -32.89], flag: "🇦🇷", region: "americas",
    startDate: "2026-09-08", endDate: "2026-09-10", country: "Argentina",
    image: IMG_REAM,
    industries: ["rendering", "petfood", "biofuels", "feed", "chicken_meat"],
    accent: "#FCB514",
    website: "https://renderingamerica.com",
    agmOrganized: true, agmFlagship: true, agmPartner: true,
    description: "The largest business convention in the agri-food and rendering industries. 500+ attendees · 30+ countries.",
    about: {
      slogan: "Where the agri-food industry of the Americas does business.",
      description:
        "REAM — Reunión de las Américas — is the flagship business convention for the rendering, pet food, biofuels and feed industries across the continent. Over three days in Mendoza, 500+ executives from 30+ countries meet for keynotes, technical sessions, one-on-one business rounds and plant tours. The 2026 edition focuses on circular-economy trade flows, SAF feedstock demand and the data revolution reshaping how agri-food byproducts are priced and traded. Organized by Agriglobal Market with the support of the region's leading industry associations.",
      url: "https://renderingamerica.com",
      color: "#FCB514",
    },
    blocks: [
      { type: "video", youtubeId: "aqz-KE-bpKQ", title: "REAM 2025 — Official aftermovie" },
      {
        type: "schedule",
        name: "Congress agenda",
        days: [
          {
            dayName: "Day 1 · Tuesday, Sep 8",
            activities: [
              { start: "09:00", end: "10:00", title: "Registration & welcome coffee", location: "Main Hall" },
              { start: "10:00", end: "11:30", title: "Opening keynote: The state of the Americas' agri-food trade", speaker: "Bruno Cappa · Agriglobal Market", location: "Auditorium A" },
              { start: "12:00", end: "13:30", title: "Panel: Rendering as the original circular economy", speaker: "ABRA · NARA · CIRA", location: "Auditorium A" },
              { start: "15:00", end: "18:00", title: "One-on-one business rounds", location: "Business Lounge" },
            ],
          },
          {
            dayName: "Day 2 · Wednesday, Sep 9",
            activities: [
              { start: "09:30", end: "11:00", title: "SAF & biofuels: feedstock demand outlook 2030", speaker: "Argus Media", location: "Auditorium A" },
              { start: "11:30", end: "13:00", title: "Pet food ingredients: quality, traceability and pricing", speaker: "Foro de Mascotas", location: "Auditorium B" },
              { start: "15:00", end: "16:30", title: "Data-driven trading: live AGM platform session", speaker: "AGM Data Team", location: "Auditorium A" },
              { start: "20:00", end: "23:00", title: "Networking dinner & Malbec tasting", location: "Bodega Catena Zapata" },
            ],
          },
          {
            dayName: "Day 3 · Thursday, Sep 10",
            activities: [
              { start: "09:00", end: "12:30", title: "Technical plant tours", location: "Mendoza industrial belt" },
              { start: "13:00", end: "14:30", title: "Closing lunch & REAM 2027 announcement", location: "Main Hall" },
            ],
          },
        ],
      },
      {
        type: "tickets",
        tickets: [
          { name: "Early Bird", price: 390, currency: "USD", expires: "2026-06-30", benefits: ["Full 3-day congress access", "Business rounds seat", "Session recordings"] },
          { name: "Standard", price: 490, currency: "USD", expires: "2026-09-01", benefits: ["Full 3-day congress access", "Business rounds seat"] },
          { name: "VIP", price: 790, currency: "USD", expires: "2026-09-01", benefits: ["Front-row seating", "Networking dinner & tasting", "Plant tour priority", "Speaker meet & greet"] },
        ],
      },
      {
        type: "sponsors",
        tiers: {
          platinum: [
            { name: "Fimaco", logo: LOGO_FIMACO, url: "#" },
            { name: "AURI", logo: LOGO_AURI, url: "#" },
          ],
          gold: [
            { name: "Seara", logo: LOGO_SEARA, url: "#" },
            { name: "Secamaq", logo: LOGO_SECAMAQ },
          ],
          silver: [
            { name: "HF FoodTech Group", logo: LOGO_HF_FOODTECH },
            { name: "3A Biotech", logo: LOGO_3A_BIOTECH },
            { name: "Minerva Ingredients", logo: LOGO_MINERVA },
          ],
          bronze: [
            { name: "Oestergaard", logo: LOGO_OESTERGAARD },
            { name: "Eurotec Group", logo: LOGO_EUROTEC },
            { name: "DheyTécnica", logo: LOGO_DHEYTECNICA },
            { name: "InnovaQuimica", logo: LOGO_INNOVAQUIMICA },
          ],
        },
      },
      {
        type: "gallery",
        images: [
          "assets/ream2026_fondo.png",
          "assets/news_poultry.webp",
          "assets/marketplace_grain.webp",
          "assets/rendering_bg.webp",
          "assets/biofuels.webp",
          "assets/petfood.webp",
        ],
      },
    ],
  },
  {
    id: 1, status: "upcoming" as const, featured: false,
    name: "EFPRA 2026", sub: "European Fat Processors & Renderers Association Congress",
    month: "MAY", day: "27–30", year: "2026", displayDate: "May 27–30", monthKey: 5,
    location: "Tenerife, Spain", coords: [-16.63, 28.29], flag: "🇪🇸", region: "europe",
    startDate: "2026-05-27", endDate: "2026-05-30", country: "Spain",
    image: IMG_AQUAUK,
    industries: ["rendering"], accent: "#0066FF",
    website: "#", agmOrganized: false, agmFlagship: false, agmPartner: false,
    about: {
      slogan: "Europe's fat processors and renderers, together in Tenerife.",
      description:
        "The annual EFPRA Congress gathers Europe's fat processing and rendering industry for four days of technical sessions, regulatory updates and networking. The 2026 edition covers the EU's evolving animal by-product regulations, energy transition in processing plants, and export opportunities toward American and Asian markets.",
      url: "https://efpra.eu",
      color: "#0066FF",
    },
    blocks: [
      {
        type: "tickets",
        tickets: [
          { name: "Member", price: 650, currency: "EUR", expires: "2026-05-15", benefits: ["Full congress access", "Gala dinner"] },
          { name: "Non-member", price: 890, currency: "EUR", expires: "2026-05-15", benefits: ["Full congress access", "Gala dinner"] },
          { name: "Accompanying person", price: 320, currency: "EUR", expires: "2026-05-15" },
        ],
      },
    ],
  },
  {
    id: 2, status: "upcoming" as const, featured: false,
    name: "VICTAM EUROPA", sub: "World's largest animal feed processing event",
    month: "JUN", day: "2–4", year: "2026", displayDate: "Jun 2–4", monthKey: 6,
    location: "Utrecht, Netherlands", coords: [5.12, 52.09], flag: "🇳🇱", region: "europe",
    startDate: "2026-06-02", endDate: "2026-06-04", country: "Netherlands",
    image: IMG_ARA,
    industries: ["feed"], accent: "#33CC00",
    website: "#", agmOrganized: false, agmFlagship: false, agmPartner: false,
  },
  {
    id: 3, status: "upcoming" as const, featured: false,
    name: "Argus Biofuels Conference", sub: "International biofuels & feedstock pricing summit",
    month: "JUN", day: "15–17", year: "2026", displayDate: "Jun 15–17", monthKey: 6,
    location: "São Paulo, Brazil", coords: [-46.63, -23.55], flag: "🇧🇷", region: "americas",
    startDate: "2026-06-15", endDate: "2026-06-17", country: "Brazil",
    image: IMG_AQUAUK,
    industries: ["biofuels"], accent: "#FCB514",
    website: "#", agmOrganized: false, agmFlagship: false, agmPartner: false,
  },
  {
    id: 4, status: "upcoming" as const, featured: false,
    name: "Congreso ANFACA 2026", sub: "Asociación Nacional de Fabricantes de Alimentos para Animales",
    month: "JUN", day: "18–19", year: "2026", displayDate: "Jun 18–19", monthKey: 6,
    location: "Buenos Aires, Argentina", coords: [-58.38, -34.60], flag: "🇦🇷", region: "americas",
    startDate: "2026-06-18", endDate: "2026-06-19", country: "Argentina",
    image: IMG_SIAVS,
    industries: ["rendering", "feed"], accent: "#0066FF",
    website: "#", agmOrganized: false, agmFlagship: false, agmPartner: true,
  },
  {
    id: 5, status: "upcoming" as const, featured: false,
    name: "Foro de Mascotas 2026", sub: "Feria líder de la industria de alimentos para mascotas en LatAm",
    month: "JUN", day: "24–26", year: "2026", displayDate: "Jun 24–26", monthKey: 6,
    location: "Guadalajara, Mexico", coords: [-103.35, 20.66], flag: "🇲🇽", region: "americas",
    startDate: "2026-06-24", endDate: "2026-06-26", country: "Mexico",
    image: IMG_FORO,
    industries: ["petfood"], accent: "#EE8434",
    website: "#", agmOrganized: false, agmFlagship: false, agmPartner: false,
  },
  {
    id: 6, status: "upcoming" as const, featured: false,
    name: "Petfood Forum Americas", sub: "International summit for pet food manufacturers & suppliers",
    month: "JUL", day: "8–10", year: "2026", displayDate: "Jul 8–10", monthKey: 7,
    location: "São Paulo, Brazil", coords: [-46.63, -23.55], flag: "🇧🇷", region: "americas",
    startDate: "2026-07-08", endDate: "2026-07-10", country: "Brazil",
    image: IMG_FORO,
    industries: ["petfood"], accent: "#FCB514",
    website: "#", agmOrganized: false, agmFlagship: false, agmPartner: false,
  },
  {
    id: 7, status: "upcoming" as const, featured: false,
    name: "Bioenergy Americas Summit", sub: "Renewable fuels, SAF feedstocks and biobased materials",
    month: "JUL", day: "22–24", year: "2026", displayDate: "Jul 22–24", monthKey: 7,
    location: "Houston, United States", coords: [-95.37, 29.76], flag: "🇺🇸", region: "americas",
    startDate: "2026-07-22", endDate: "2026-07-24", country: "United States",
    image: IMG_AQUAUK,
    industries: ["biofuels"], accent: "#33CC00",
    website: "#", agmOrganized: false, agmFlagship: false, agmPartner: false,
  },
  {
    id: 8, status: "upcoming" as const, featured: false,
    name: "SIAVS 2026", sub: "Feria Internacional de Proteínas Animales — Avicultura, Porcicultura, Piscicultura",
    month: "AGO", day: "4–6", year: "2026", displayDate: "Aug 4–6", monthKey: 8,
    location: "São Paulo, Brazil", coords: [-46.63, -23.55], flag: "🇧🇷", region: "americas",
    startDate: "2026-08-04", endDate: "2026-08-06", country: "Brazil",
    image: IMG_SIAVS,
    industries: ["chicken_meat", "feed"], accent: "#F35959",
    website: "#", agmOrganized: false, agmFlagship: false, agmPartner: false,
  },
  {
    id: 9, status: "upcoming" as const, featured: false,
    name: "Feed & Grain Expo", sub: "Premier event for feed, grain and agri-processing professionals",
    month: "AGO", day: "12–14", year: "2026", displayDate: "Aug 12–14", monthKey: 8,
    location: "Denver, United States", coords: [-104.99, 39.74], flag: "🇺🇸", region: "americas",
    startDate: "2026-08-12", endDate: "2026-08-14", country: "United States",
    image: IMG_ARA,
    industries: ["feed", "grains"], accent: "#67A6FF",
    website: "#", agmOrganized: false, agmFlagship: false, agmPartner: false,
  },
  {
    id: 10, status: "upcoming" as const, featured: false,
    name: "ARA Symposium 2026", sub: "Australian Renderers Association — International Rendering Congress",
    month: "SEP", day: "15–17", year: "2026", displayDate: "Sep 15–17", monthKey: 9,
    location: "Melbourne, Australia", coords: [144.96, -37.81], flag: "🇦🇺", region: "oceania",
    startDate: "2026-09-15", endDate: "2026-09-17", country: "Australia",
    image: IMG_ARA,
    industries: ["rendering"], accent: "#0066FF",
    website: "#", agmOrganized: false, agmFlagship: false, agmPartner: false,
  },
  {
    id: 11, status: "upcoming" as const, featured: false,
    name: "ABRA Annual Convention", sub: "Associação Brasileira de Reciclagem Animal",
    month: "OCT", day: "7–8", year: "2026", displayDate: "Oct 7–8", monthKey: 10,
    location: "Curitiba, Brazil", coords: [-49.27, -25.43], flag: "🇧🇷", region: "americas",
    startDate: "2026-10-07", endDate: "2026-10-08", country: "Brazil",
    image: IMG_SIAVS,
    industries: ["rendering"], accent: "#0066FF",
    website: "#", agmOrganized: false, agmFlagship: false, agmPartner: true,
  },
  {
    id: 12, status: "upcoming" as const, featured: false,
    name: "AGM LATAM Data Summit", sub: "Annual intelligence conference for the agri-food sector in Latin America",
    month: "NOV", day: "5–6", year: "2026", displayDate: "Nov 5–6", monthKey: 11,
    location: "Bogotá, Colombia", coords: [-74.07, 4.71], flag: "🇨🇴", region: "americas",
    startDate: "2026-11-05", endDate: "2026-11-06", country: "Colombia",
    image: IMG_REAM,
    industries: ["rendering", "petfood", "biofuels", "feed"], accent: "#0066FF",
    website: "#", agmOrganized: true, agmFlagship: false, agmPartner: true,
    about: {
      slogan: "Turning Latin America's agri-food data into decisions.",
      description:
        "A two-day intelligence conference organized by Agriglobal Market: live market briefings by industry, hands-on dashboard workshops, and the launch of the 2027 LatAm agri-food trade outlook. Built for commercial and strategy teams that trade on data.",
      color: "#0066FF",
    },
    blocks: [
      { type: "video", youtubeId: "LXb3EKWsInQ", title: "What is AGM Data — 2 minute tour" },
      {
        type: "schedule",
        name: "Program",
        days: [
          {
            dayName: "Day 1 · Thursday, Nov 5",
            activities: [
              { start: "09:00", end: "10:30", title: "LatAm trade outlook 2027 — launch briefing", speaker: "AGM Research", location: "Main stage" },
              { start: "11:00", end: "13:00", title: "Workshop: building your industry dashboard", speaker: "AGM Data Team", location: "Lab room 1" },
            ],
          },
          {
            dayName: "Day 2 · Friday, Nov 6",
            activities: [
              { start: "09:30", end: "11:00", title: "Panel: pricing intelligence in volatile markets", location: "Main stage" },
              { start: "11:30", end: "13:00", title: "Roundtables by industry", location: "Breakout rooms" },
            ],
          },
        ],
      },
    ],
  },
];

/* ── Demo filler (review phase) ─────────────────────────
   Every event gets the ABOUT block and ALL five optional block types so
   the whole modal can be reviewed on any card. Hand-authored content
   (REAM, EFPRA, AGM LATAM) is kept; only the missing pieces are filled
   with generic demo data. Delete this mapping to go back to per-event
   authored content only. */
const DEMO_SPONSOR_TIERS = {
  platinum: [
    { name: "Fimaco", logo: LOGO_FIMACO, url: "#" },
    { name: "AURI", logo: LOGO_AURI },
  ],
  gold: [
    { name: "Seara", logo: LOGO_SEARA },
    { name: "Secamaq", logo: LOGO_SECAMAQ },
  ],
  silver: [
    { name: "HF FoodTech Group", logo: LOGO_HF_FOODTECH },
    { name: "Minerva Ingredients", logo: LOGO_MINERVA },
  ],
  bronze: [
    { name: "Eurotec Group", logo: LOGO_EUROTEC },
    { name: "InnovaQuimica", logo: LOGO_INNOVAQUIMICA },
  ],
};

const DEMO_GALLERY = [
  "assets/news_poultry.webp",
  "assets/marketplace_grain.webp",
  "assets/rendering_bg.webp",
  "assets/biofuels.webp",
  "assets/petfood.webp",
  "assets/fertilizers.webp",
];

function withDemoContent(ev: AgmEvent): AgmEvent {
  const has = (t: EventBlock["type"]) => ev.blocks?.some((b) => b.type === t);
  const blocks: EventBlock[] = [...(ev.blocks ?? [])];
  if (!has("video"))
    blocks.push({ type: "video", youtubeId: "aqz-KE-bpKQ", title: `${ev.name} — highlights` });
  if (!has("schedule"))
    blocks.push({
      type: "schedule",
      name: "Program",
      days: [
        {
          dayName: "Day 1 · Opening day",
          activities: [
            { start: "09:00", end: "10:00", title: "Registration & welcome coffee", location: "Main hall" },
            { start: "10:00", end: "11:30", title: "Opening keynote", speaker: "To be announced", location: "Main stage" },
            { start: "12:00", end: "13:30", title: "Industry panel", location: "Main stage" },
          ],
        },
        {
          dayName: "Day 2 · Closing day",
          activities: [
            { start: "09:30", end: "11:00", title: "Technical sessions", location: "Breakout rooms" },
            { start: "11:30", end: "13:00", title: "Networking & closing remarks", location: "Main hall" },
          ],
        },
      ],
    });
  if (!has("tickets"))
    blocks.push({
      type: "tickets",
      tickets: [
        { name: "Early Bird", price: 290, currency: "USD", expires: ev.startDate, benefits: ["Full event access", "Session recordings"] },
        { name: "Standard", price: 390, currency: "USD", expires: ev.startDate, benefits: ["Full event access"] },
        { name: "VIP", price: 690, currency: "USD", expires: ev.startDate, benefits: ["Front-row seating", "Networking dinner", "Speaker meet & greet"] },
      ],
    });
  if (!has("sponsors")) blocks.push({ type: "sponsors", tiers: DEMO_SPONSOR_TIERS });
  if (!has("gallery")) blocks.push({ type: "gallery", images: DEMO_GALLERY });

  return {
    ...ev,
    about: {
      slogan: ev.about?.slogan ?? ev.sub.slice(0, 100),
      description:
        ev.about?.description ??
        `${ev.name} brings the ${ev.industries.map((i) => IND_LABELS[i] ?? i).join(", ").toLowerCase()} community together in ${ev.location}. Join industry leaders for keynotes, technical sessions and networking — full program and speakers to be announced.`,
      url: ev.about?.url ?? (ev.website !== "#" ? ev.website : "https://agriglobalmarket.com"),
      color: ev.about?.color ?? ev.accent,
    },
    blocks,
  };
}

export const PAST_EVENTS = [
  { name: "FENAGRA 2026", date: "May 12–14, 2026", location: "São Paulo, Brazil", coords: [-46.63, -23.55], flag: "🇧🇷", industries: ["feed","petfood"], flagship: false, agm: false },
  { name: "EXPOPESCA del Pacífico", date: "May 6–8, 2026", location: "Manta, Ecuador", flag: "🇪🇨", industries: ["aquaculture"], flagship: false, agm: false },
  { name: "Congreso Int. Rendering", date: "Apr 15–17, 2026", location: "Guadalajara, Mexico", coords: [-103.35, 20.66], flag: "🇲🇽", industries: ["rendering"], flagship: false, agm: false },
  { name: "SUPERPET 2026", date: "Apr 14–16, 2026", location: "São Paulo, Brazil", coords: [-46.63, -23.55], flag: "🇧🇷", industries: ["petfood"], flagship: false, agm: false },
  { name: "17th Biofuels Intl. Conf.", date: "Apr 14–15, 2026", location: "Brussels, Belgium", flag: "🇧🇪", industries: ["biofuels"], flagship: false, agm: false },
  { name: "AQUASUR 2026", date: "Mar 24–26, 2026", location: "Puerto Varas, Chile", flag: "🇨🇱", industries: ["aquaculture"], flagship: false, agm: false },
  { name: "VICTAM ASIA 2026", date: "Mar 10–12, 2026", location: "Bangkok, Thailand", flag: "🇹🇭", industries: ["feed"], flagship: false, agm: false },
  { name: "CIPEU 2025", date: "Oct 1–2, 2025", location: "Zaragoza, Spain", flag: "🇪🇸", industries: ["rendering"], flagship: false, agm: false },
  { name: "REAM 2025 ⭐", date: "Sep 2–4, 2025", location: "Guadalajara, Mexico", coords: [-103.35, 20.66], flag: "🇲🇽", industries: ["rendering","petfood","biofuels"], flagship: true, agm: true },
  { name: "Foro Mascotas 2025", date: "Jun 25–27, 2025", location: "Guadalajara, Mexico", coords: [-103.35, 20.66], flag: "🇲🇽", industries: ["petfood"], flagship: false, agm: false },
  { name: "EFPRA RIGA 2025", date: "Jun 4–7, 2025", location: "Riga, Latvia", flag: "🇱🇻", industries: ["rendering"], flagship: false, agm: false },
  { name: "FENAGRA 2025", date: "May 13–15, 2025", location: "São Paulo, Brazil", coords: [-46.63, -23.55], flag: "🇧🇷", industries: ["feed","petfood"], flagship: false, agm: false },
  { name: "CONAAL 2025", date: "Apr 2–3, 2025", location: "Guadalajara, Mexico", coords: [-103.35, 20.66], flag: "🇲🇽", industries: ["feed"], flagship: false, agm: false },
  { name: "V Congreso Nac. Cámara Subproductos", date: "Mar 5–7, 2025", location: "Buenos Aires, Argentina", coords: [-58.38, -34.60], flag: "🇦🇷", industries: ["rendering"], flagship: false, agm: false },
  { name: "NARA Symposium 2025", date: "Jan 30, 2025", location: "Atlanta, United States", flag: "🇺🇸", industries: ["rendering"], flagship: false, agm: true },
  { name: "IPPE EXPO 2025", date: "Jan 28–30, 2025", location: "Atlanta, United States", flag: "🇺🇸", industries: ["chicken_meat","feed"], flagship: false, agm: false },
];

export const IND_LABELS: Record<string, string> = {
  rendering: "Rendering", petfood: "Pet Food", biofuels: "Biofuels", feed: "Feed",
  chicken_meat: "Meat", grains: "Grains", fertilizers: "Fertilizers", veg_oils: "Veg. Oils",
  aquaculture: "Aquaculture",
};

export const REGION_LABELS: Record<string, string> = {
  all: "Global", americas: "Americas", europe: "Europe",
  asia: "Asia", africa: "Africa", oceania: "Oceania",
};

/* Runs at module init — must sit AFTER IND_LABELS (withDemoContent reads it). */
export const EVENTS: AgmEvent[] = RAW_EVENTS.map(withDemoContent);

export type EventItem = AgmEvent;
export type PastEventItem = (typeof PAST_EVENTS)[number];
