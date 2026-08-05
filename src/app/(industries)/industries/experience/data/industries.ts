import type { CornerCardData, Industry } from "./types";
import { seededRng } from "./random";

function stat(
  seed: string,
  title: string,
  value: number,
  unit: string,
  delta: number
): CornerCardData {
  const rng = seededRng(seed);
  let level = 40 + rng() * 30;
  const spark = Array.from({ length: 12 }, () => {
    level += (rng() - 0.42) * 12;
    level = Math.min(95, Math.max(15, level));
    return Math.round(level);
  });
  return { title, kpi: { value, unit, delta }, spark };
}

// Same catalog as the INDUSTRY filter on /data (datasets.ts CATS) so both
// views of the section speak the same language. Ids double as URL slugs.
// Each industry carries exactly two KPIs: Global Production and Global Price.
export const industries: Industry[] = [
  {
    id: "meat",
    name: "Meat",
    emoji: "🥩",
    description:
      "Beef, pork and poultry flows across 24,000+ processing plants worldwide — production, slaughter capacity and export benchmarks for every major protein.",
    globalStats: [
      stat("meat-0", "Global Production", 361, "M t", 1.8),
      stat("meat-p", "Global Price", 5240, "USD/t", 3.1),
    ],
  },
  {
    id: "biofuels",
    name: "Biofuels",
    emoji: "⛽",
    description:
      "Ethanol, biodiesel and renewable diesel markets driven by feedstock supply, blend mandates and energy policy across 68 producing countries.",
    globalStats: [
      stat("biof-0", "Global Production", 192, "B L", 6.1),
      stat("biof-p", "Global Price", 921, "USD/m³", -1.8),
    ],
  },
  {
    id: "feed",
    name: "Feed",
    emoji: "🌾",
    description:
      "Compound feed and premix output from nearly 30,000 mills — the backbone linking grain markets to animal protein economics.",
    globalStats: [
      stat("feed-0", "Global Production", 1.26, "B t", 2.2),
      stat("feed-p", "Global Price", 412, "USD/t", 1.9),
    ],
  },
  {
    id: "fertilizers",
    name: "Fertilizers",
    emoji: "🧪",
    description:
      "Nitrogen, phosphate and potash fundamentals — plant capacity, application rates and the price cycles that move planting decisions.",
    globalStats: [
      stat("fert-0", "Global Production", 201, "M t", 1.4),
      stat("fert-p", "Global Price", 348, "USD/t", -6.2),
    ],
  },
  {
    id: "rendering",
    name: "Rendering",
    emoji: "⚙️",
    description:
      "Tallow, protein meals and hides recovered by 5,800 facilities — the circular layer of the animal-protein economy.",
    globalStats: [
      stat("rend-0", "Global Production", 18.9, "M t", 2.1),
      stat("rend-p", "Global Price", 1120, "USD/t", 2.9),
    ],
  },
  {
    id: "petfood",
    name: "Pet Food",
    emoji: "🐕",
    description:
      "A 151 B USD market premiumizing fast — dry, wet and veterinary diets tracked from ingredient sourcing to retail shelf.",
    globalStats: [
      stat("petf-0", "Global Production", 34.8, "M t", 3.9),
      stat("petf-p", "Global Price", 2350, "USD/t", 4.1),
    ],
  },
  {
    id: "grains",
    name: "Grains",
    emoji: "🌽",
    description:
      "Wheat, maize and rice balances — production, stocks-to-use and trade flows that set the tone for every downstream feed and food market.",
    globalStats: [
      stat("grai-0", "Global Production", 2.84, "B t", 1.9),
      stat("grai-p", "Global Price", 228, "USD/t", -3.5),
    ],
  },
  {
    id: "fats_oils",
    name: "Fats & Oils",
    emoji: "🛢️",
    description:
      "Vegetable oils and animal fats from crush to biodiesel — palm, soy and rapeseed supply against fast-growing fuel demand.",
    globalStats: [
      stat("fats-0", "Global Production", 268, "M t", 2.6),
      stat("fats-p", "Global Price", 1040, "USD/t", 5.6),
    ],
  },
  {
    id: "additives",
    name: "Additives",
    emoji: "⚗️",
    description:
      "Enzymes, amino acids and probiotics powering feed efficiency — a 48 B USD specialty market tracked by registration and inclusion rates.",
    globalStats: [
      stat("addi-0", "Global Production", 26.4, "M t", 3.2),
      stat("addi-p", "Global Price", 3880, "USD/t", 2.2),
    ],
  },
  {
    id: "livestock",
    name: "Livestock",
    emoji: "🐄",
    description:
      "Herd inventories, output value and feed conversion across cattle, swine and poultry — the live side of the protein supply chain.",
    globalStats: [
      stat("live-0", "Global Production", 141, "M t", 1.1),
      stat("live-p", "Global Price", 2860, "USD/t", 2.6),
    ],
  },
];

export function getIndustry(id: string) {
  return industries.find((i) => i.id === id);
}

/** The same two KPIs scoped to one country: production as a country slice of
 *  the global figure, price drifting around the global benchmark. Seeded, so
 *  every (country, industry) pair is stable. */
export function getCountryIndustryStats(
  countryId: string,
  industryId: string
): CornerCardData[] {
  const industry = getIndustry(industryId);
  if (!industry) return [];
  const rng = seededRng(`${countryId}:${industryId}:kpi`);
  return industry.globalStats.map((g, i) => {
    const isProduction = i === 0;
    const factor = isProduction ? 0.02 + rng() * 0.14 : 0.82 + rng() * 0.36;
    const raw = g.kpi.value * factor;
    const value =
      raw >= 100 ? Math.round(raw) : Math.round(raw * 10) / 10;
    const delta = Math.round((rng() * 9 - 3) * 10) / 10;
    return stat(
      `${countryId}:${industryId}:${i}`,
      isProduction ? "Production" : "Price",
      value,
      g.kpi.unit,
      delta
    );
  });
}
