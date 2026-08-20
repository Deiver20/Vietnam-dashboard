import type { Coords, Product, Offer, Company, MapItem } from "@/interfaces/marketplace/interface";
/* ═══════════════════════════════════════════════════════════
   Marketplace map data — RenderingGlobal (fictional company)
   Coordinates are [longitude, latitude] to match react-simple-maps.
   ═══════════════════════════════════════════════════════════ */

/* ── Export destinations (shared port pool) ───────────────── */
const PORT = {
  jakarta: { name: "Tanjung Priok", country: "Indonesia", flag: "🇮🇩", coords: [106.85, -6.1] as Coords },
  hochiminh: { name: "Cai Mep", country: "Vietnam", flag: "🇻🇳", coords: [107.0, 10.5] as Coords },
  bangkok: { name: "Laem Chabang", country: "Thailand", flag: "🇹🇭", coords: [100.9, 13.08] as Coords },
  colombo: { name: "Colombo", country: "Sri Lanka", flag: "🇱🇰", coords: [79.85, 6.93] as Coords },
  manila: { name: "Manila", country: "Philippines", flag: "🇵🇭", coords: [120.98, 14.6] as Coords },
  shanghai: { name: "Shanghai", country: "China", flag: "🇨🇳", coords: [121.8, 31.0] as Coords },
  rotterdam: { name: "Rotterdam", country: "Netherlands", flag: "🇳🇱", coords: [4.1, 51.95] as Coords },
  karachi: { name: "Karachi", country: "Pakistan", flag: "🇵🇰", coords: [67.0, 24.86] as Coords },
  dakar: { name: "Dakar", country: "Senegal", flag: "🇸🇳", coords: [-17.45, 14.69] as Coords },
};

/* ── Country flags (emoji) for the export-country chips ────── */
export const COUNTRY_FLAG: Record<string, string> = {
  Austria: "🇦🇹", Australia: "🇦🇺", Bangladesh: "🇧🇩", Belgium: "🇧🇪", Brazil: "🇧🇷",
  Cambodia: "🇰🇭", Canada: "🇨🇦", Chile: "🇨🇱", China: "🇨🇳", Czechia: "🇨🇿",
  Ecuador: "🇪🇨", France: "🇫🇷", Germany: "🇩🇪", India: "🇮🇳", Indonesia: "🇮🇩",
  Japan: "🇯🇵", Kenya: "🇰🇪", Laos: "🇱🇦", Malaysia: "🇲🇾", Mexico: "🇲🇽",
  Morocco: "🇲🇦", Myanmar: "🇲🇲", Netherlands: "🇳🇱", Nigeria: "🇳🇬", Norway: "🇳🇴",
  Pakistan: "🇵🇰", Peru: "🇵🇪", Philippines: "🇵🇭", Poland: "🇵🇱", Portugal: "🇵🇹",
  Senegal: "🇸🇳", Singapore: "🇸🇬", "South Africa": "🇿🇦", "South Korea": "🇰🇷",
  Spain: "🇪🇸", "Sri Lanka": "🇱🇰", Thailand: "🇹🇭", Ukraine: "🇺🇦",
  "United States": "🇺🇸", Vietnam: "🇻🇳",
};

export const flagOf = (country: string) => COUNTRY_FLAG[country] ?? "🌐";

/* ── Company (store) information ──────────────────────────── */
export const COMPANY: Company = {
  name: "RenderingGlobal",
  banner: "assets/company_banner_renderingglobal.webp", // 1476×300
  logo: "assets/company_logo_renderingglobal.webp", // 213×120
  industrySegment: "Rendering",
  country: "United States",
  flag: "🇺🇸",
  description:
    "Global supplier of rendered animal proteins, fats & oils with processing facilities on four continents. RenderingGlobal connects certified category-3 rendering plants with feed, pet food, aquaculture and biofuel buyers worldwide.",
  dateRegistered: "2016-03-14",
  badges: {
    certifiedCompany: true,
    verifiedBuyer: true,
    verifiedSeller: true,
    completedTransactions: 312,
    accumulatedTransactionValue: "$48.2M",
  },
};

/* ── Products (the rendering world) ───────────────────────── */
export const PRODUCTS: Product[] = [
  {
    id: "mbm",
    name: "Meat & Bone Meal 50%",
    nameEs: "Harina de Carne y Hueso 50%",
    company: "RenderingGlobal",
    category: "Rendering",
    subcategory: "Animal Proteins",
    productType: "Meat & Bone Meal",
    hsCodes: ["2301.10", "0506.90"],
    images: ["assets/marketplace_byproducts.webp", "assets/marketplace_meat.webp", "assets/marketplace_additives.webp"],
    accent: "green",
    tagline: "High-protein rendered animal protein for animal feed.",
    description:
      "Premium meat & bone meal produced from selected category-3 animal by-products under strict thermal processing. A cost-efficient source of protein, energy, calcium and phosphorus for poultry, swine and aquafeed formulations.",
    origin: { country: "India", flag: "🇮🇳", address: "Plot 47, MIDC Bhosari Industrial Estate, Pune, Maharashtra 411026", coords: [73.86, 18.62] },
    exportCountries: ["Indonesia", "Vietnam", "Thailand", "Sri Lanka", "Philippines"],
    exportCountriesOpenMarket: ["Bangladesh", "Malaysia", "Myanmar"],
    destinations: [PORT.jakarta, PORT.hochiminh, PORT.bangkok, PORT.colombo, PORT.manila],
  },
  {
    id: "pm",
    name: "Poultry Meal — Pet Food Grade",
    nameEs: "Harina de Ave — Grado Pet Food",
    company: "RenderingGlobal",
    category: "Rendering",
    subcategory: "Animal Proteins",
    productType: "Poultry Meal",
    hsCodes: ["2301.10"],
    images: ["assets/marketplace_meat.webp", "assets/marketplace_byproducts.webp"],
    accent: "blue",
    tagline: "Low-ash, highly digestible poultry protein for premium pet food.",
    description:
      "Spray-dried poultry meal rendered exclusively from clean poultry tissue. Low-ash, high-digestibility profile designed for premium pet food and aquafeed where palatability and amino-acid quality matter.",
    origin: { country: "Thailand", flag: "🇹🇭", address: "88/12 Amata City Industrial Estate, Mueang Chonburi 20000", coords: [100.98, 13.36] },
    exportCountries: ["Indonesia", "Vietnam", "China", "Philippines"],
    exportCountriesOpenMarket: ["Japan", "South Korea"],
    destinations: [PORT.jakarta, PORT.hochiminh, PORT.shanghai, PORT.manila],
  },
  {
    id: "bm",
    name: "Spray-Dried Blood Meal 90%",
    nameEs: "Harina de Sangre Spray 90%",
    company: "RenderingGlobal",
    category: "Rendering",
    subcategory: "Animal Proteins",
    productType: "Blood Meal",
    hsCodes: ["0511.99", "2301.10"],
    images: ["assets/marketplace_byproducts.webp", "assets/marketplace_meat.webp"],
    accent: "red",
    tagline: "Ultra-high-protein, lysine-rich spray-dried blood meal.",
    description:
      "Spray-dried bovine blood meal with one of the highest protein concentrations available and an excellent lysine profile. Ideal as a targeted amino-acid booster in monogastric and aquaculture diets.",
    origin: { country: "China", flag: "🇨🇳", address: "No. 215 Heping Avenue, Qingshan District, Wuhan, Hubei 430080", coords: [114.36, 30.63] },
    exportCountries: ["Netherlands", "China", "Thailand"],
    exportCountriesOpenMarket: ["Germany", "Belgium"],
    destinations: [PORT.rotterdam, PORT.shanghai, PORT.bangkok],
  },
  {
    id: "tallow",
    name: "Bleachable Fancy Tallow",
    nameEs: "Sebo Bovino Refinable",
    company: "RenderingGlobal",
    category: "Rendering",
    subcategory: "Fats & Oils",
    productType: "Beef Tallow",
    hsCodes: ["1502.10", "1502.90"],
    images: ["assets/marketplace_fats.webp", "assets/marketplace_byproducts.webp"],
    accent: "yellow",
    tagline: "Technical-grade bovine tallow for feed, oleochemicals & biofuel.",
    description:
      "Bleachable fancy tallow with controlled free-fatty-acid content, suitable for animal feed energy, soap and oleochemical manufacturing, and as a feedstock for renewable diesel and biodiesel.",
    origin: { country: "Australia", flag: "🇦🇺", address: "24 Carrington Road, Torrington, Toowoomba QLD 4350", coords: [151.93, -27.56] },
    exportCountries: ["Netherlands", "China", "Pakistan", "Senegal"],
    exportCountriesOpenMarket: ["Singapore", "United States"],
    destinations: [PORT.rotterdam, PORT.shanghai, PORT.karachi, PORT.dakar],
  },
  {
    id: "fm",
    name: "Hydrolyzed Feather Meal",
    nameEs: "Harina de Pluma Hidrolizada",
    company: "RenderingGlobal",
    category: "Rendering",
    subcategory: "Animal Proteins",
    productType: "Feather Meal",
    hsCodes: ["2301.10", "0505.90"],
    images: ["assets/marketplace_byproducts.webp", "assets/marketplace_meat.webp"],
    accent: "blue",
    tagline: "Hydrolyzed keratin protein, a sustainable feed amino-acid source.",
    description:
      "Steam-hydrolyzed feather meal delivering highly available keratin protein. A sustainable, traceable amino-acid source for ruminant, poultry and aqua diets with consistent digestibility.",
    origin: { country: "Vietnam", flag: "🇻🇳", address: "Lot C3, Bien Hoa II Industrial Zone, Bien Hoa, Dong Nai 76000", coords: [106.91, 10.95] },
    exportCountries: ["Vietnam", "Indonesia", "Sri Lanka"],
    exportCountriesOpenMarket: ["Cambodia", "Laos"],
    destinations: [PORT.hochiminh, PORT.jakarta, PORT.colombo],
  },

  // ── Catalog (additional commodities — listed, no live offers yet) ──
  { id: "fishmeal", name: "Fish Meal 65%", nameEs: "Harina de Pescado 65%", company: "RenderingGlobal", category: "Rendering", subcategory: "Animal Proteins", productType: "Fish Meal", hsCodes: ["2301.20"], images: ["assets/marketplace_byproducts.webp", "assets/marketplace_meat.webp"], accent: "blue", tagline: "High-protein marine meal for aquafeed.", description: "Premium fish meal with high digestibility for aquaculture and premium animal nutrition.", origin: { country: "Peru", flag: "🇵🇪", address: "Av. Los Pescadores 320, Zona Industrial 27 de Octubre, Chimbote 02804", coords: [-78.59, -9.08] }, exportCountries: ["China", "Indonesia", "Thailand"], exportCountriesOpenMarket: ["Ecuador", "Chile"], destinations: [PORT.shanghai, PORT.jakarta, PORT.bangkok] },
  { id: "porkmeal", name: "Porcine Meat Meal", nameEs: "Harina de Cerdo", company: "RenderingGlobal", category: "Rendering", subcategory: "Animal Proteins", productType: "Meat Meal", hsCodes: ["2301.10"], images: ["assets/marketplace_meat.webp", "assets/marketplace_byproducts.webp"], accent: "blue", tagline: "Rendered porcine protein for monogastric feed.", description: "Rendered porcine meat meal, a cost-efficient protein and energy source for swine and poultry diets.", origin: { country: "Spain", flag: "🇪🇸", address: "Polígon Industrial El Segre, Carrer B 14, 25191 Lleida", coords: [0.62, 41.62] }, exportCountries: ["China", "Philippines", "Vietnam"], exportCountriesOpenMarket: ["Portugal", "France"], destinations: [PORT.shanghai, PORT.manila, PORT.hochiminh] },
  { id: "greaves", name: "Protein Greaves", nameEs: "Chicharrón Proteico", company: "RenderingGlobal", category: "Rendering", subcategory: "Animal Proteins", productType: "Greaves Meal", hsCodes: ["2301.10"], images: ["assets/marketplace_byproducts.webp"], accent: "blue", tagline: "Concentrated protein cracklings for pet food.", description: "Protein-rich greaves for premium pet food and feed formulations.", origin: { country: "Germany", flag: "🇩🇪", address: "Industriestraße 22, 85551 Kirchheim bei München", coords: [11.74, 48.16] }, exportCountries: ["Netherlands", "China"], exportCountriesOpenMarket: ["Austria", "Poland"], destinations: [PORT.rotterdam, PORT.shanghai] },
  { id: "fishoil", name: "Crude Fish Oil", nameEs: "Aceite de Pescado", company: "RenderingGlobal", category: "Rendering", subcategory: "Fats & Oils", productType: "Fish Oil", hsCodes: ["1504.20"], images: ["assets/marketplace_fats.webp"], accent: "blue", tagline: "Omega-rich marine oil for aquafeed and energy.", description: "Crude fish oil, a high-energy omega-3 source for aquaculture and animal nutrition.", origin: { country: "Chile", flag: "🇨🇱", address: "Av. Gran Bretaña 1450, Talcahuano, Biobío 4270000", coords: [-73.12, -36.72] }, exportCountries: ["China", "Netherlands", "Philippines"], exportCountriesOpenMarket: ["Peru", "Norway"], destinations: [PORT.shanghai, PORT.rotterdam, PORT.manila] },
  { id: "uco", name: "Used Cooking Oil (UCO)", nameEs: "Aceite de Cocina Usado", company: "RenderingGlobal", category: "Rendering", subcategory: "Fats & Oils", productType: "Used Cooking Oil", hsCodes: ["1518.00"], images: ["assets/marketplace_fats.webp"], accent: "blue", tagline: "Biofuel feedstock with low FFA.", description: "Collected and filtered used cooking oil, a feedstock for biodiesel and renewable diesel.", origin: { country: "Malaysia", flag: "🇲🇾", address: "Lot 8, Jalan Sungai Pinang, Pelabuhan Klang, 42000 Selangor", coords: [101.39, 3.00] }, exportCountries: ["Netherlands", "China"], exportCountriesOpenMarket: ["Singapore", "Spain"], destinations: [PORT.rotterdam, PORT.shanghai] },
  { id: "yellowgrease", name: "Yellow Grease", nameEs: "Grasa Amarilla", company: "RenderingGlobal", category: "Rendering", subcategory: "Fats & Oils", productType: "Yellow Grease", hsCodes: ["1518.00"], images: ["assets/marketplace_fats.webp"], accent: "blue", tagline: "Technical fat for feed energy and oleochemicals.", description: "Yellow grease with controlled FFA for feed energy, oleochemicals and biofuel.", origin: { country: "Canada", flag: "🇨🇦", address: "1240 Dugald Road, Winnipeg, MB R2J 0H3", coords: [-97.10, 49.86] }, exportCountries: ["Netherlands", "China"], exportCountriesOpenMarket: ["United States", "Mexico"], destinations: [PORT.rotterdam, PORT.shanghai] },
  { id: "poultryfat", name: "Poultry Fat", nameEs: "Grasa de Ave", company: "RenderingGlobal", category: "Rendering", subcategory: "Fats & Oils", productType: "Poultry Fat", hsCodes: ["1501.90"], images: ["assets/marketplace_fats.webp", "assets/marketplace_meat.webp"], accent: "blue", tagline: "Palatable energy fat for pet food and feed.", description: "Rendered poultry fat, a palatable energy source for pet food and animal feed.", origin: { country: "France", flag: "🇫🇷", address: "ZA de la Brohinière, 12 Rue des Ajoncs, 35360 Montauban-de-Bretagne", coords: [-1.97, 48.20] }, exportCountries: ["Netherlands", "Indonesia"], exportCountriesOpenMarket: ["Belgium", "Morocco"], destinations: [PORT.rotterdam, PORT.jakarta] },
  { id: "lard", name: "Refined Lard", nameEs: "Manteca de Cerdo", company: "RenderingGlobal", category: "Rendering", subcategory: "Fats & Oils", productType: "Lard", hsCodes: ["1501.10"], images: ["assets/marketplace_fats.webp"], accent: "blue", tagline: "Refined porcine fat for food and feed.", description: "Refined lard for food manufacturing, feed energy and oleochemical use.", origin: { country: "Poland", flag: "🇵🇱", address: "ul. Gnieźnieńska 67, 61-021 Poznań", coords: [16.93, 52.41] }, exportCountries: ["China", "Philippines"], exportCountriesOpenMarket: ["Czechia", "Ukraine"], destinations: [PORT.shanghai, PORT.manila] },
  { id: "dcp", name: "Dicalcium Phosphate", nameEs: "Fosfato Dicálcico", company: "RenderingGlobal", category: "Rendering", subcategory: "Minerals", productType: "Dicalcium Phosphate", hsCodes: ["2835.25"], images: ["assets/marketplace_additives.webp"], accent: "blue", tagline: "Bone-derived phosphorus & calcium source.", description: "Feed-grade dicalcium phosphate from rendered bone, a key phosphorus and calcium source.", origin: { country: "South Africa", flag: "🇿🇦", address: "15 Isando Road, Kempton Park, Johannesburg 1601", coords: [28.19, -26.10] }, exportCountries: ["Indonesia", "Sri Lanka", "Pakistan"], exportCountriesOpenMarket: ["Kenya", "Nigeria"], destinations: [PORT.jakarta, PORT.colombo, PORT.karachi] },
];

/* ── Offers (RenderingGlobal listings) ─ */
export const OFFERS: Offer[] = [
  // ── United States cluster (3) ──
  {
    id: "us-1", productId: "mbm",
    quantityAvailable: "500", metric: "MT", load: "Container 20′ · 25 MT", price: "$640",
    specs: [
      { label: "Crude protein", value: "50% min" },
      { label: "Crude fat", value: "10–12%" },
      { label: "Moisture", value: "6% max" },
      { label: "Ash", value: "30% max" },
      { label: "Pepsin digestibility", value: "86% min" },
      { label: "Calcium", value: "8–10%" },
      { label: "Phosphorus", value: "4–5%" },
      { label: "TVN", value: "≤ 150 mg/100g" },
    ],
    facilityName: "RenderingGlobal Americas LLC — Sioux City Plant", businessId: "US-EIN 47-2381906",
    country: "United States", flag: "🇺🇸", city: "Sioux City, IA", address: "2105 Cunningham Drive", postalCode: "51111",
    coords: [-96.4, 42.5],
    contracts: [
      { incoterm: "EXW" },
      { incoterm: "FOB", port: "Port of Houston", freightCostUsd: "$1,850" },
      { incoterm: "CIF", port: "Port of Houston", freightCostUsd: "$1,850" },
    ],
    paymentMethods: ["Letter of credit", "Cash against documents", "Prepayment"],
    availability: "Available now", verified: true,
  },
  {
    id: "us-2", productId: "pm",
    quantityAvailable: "300", metric: "MT", load: "Container 40′ · 26 MT", price: "$720",
    specs: [
      { label: "Crude protein", value: "65% min" },
      { label: "Crude fat", value: "12% max" },
      { label: "Moisture", value: "8% max" },
      { label: "Ash", value: "14% max" },
      { label: "Pepsin digestibility", value: "90% min" },
      { label: "Antioxidant", value: "Ethoxyquin-free" },
    ],
    facilityName: "RenderingGlobal Americas LLC — Omaha Plant", businessId: "US-EIN 47-2381906",
    country: "United States", flag: "🇺🇸", city: "Omaha, NE", address: "4848 South 33rd Street", postalCode: "68107",
    coords: [-95.9, 41.25],
    contracts: [
      { incoterm: "EXW" },
      { incoterm: "FOB", port: "Port of Oakland", freightCostUsd: "$2,300" },
    ],
    paymentMethods: ["Letter of credit", "Part now & part later"],
    availability: "Available now", verified: true,
  },
  {
    id: "us-3", productId: "bm",
    quantityAvailable: "120", metric: "MT", load: "Container 20′ · 22 MT", price: "$980",
    specs: [
      { label: "Crude protein", value: "90% min" },
      { label: "Lysine", value: "8% min" },
      { label: "Moisture", value: "8% max" },
      { label: "Ash", value: "4% max" },
      { label: "Solubility", value: "85% min" },
    ],
    facilityName: "RenderingGlobal Americas LLC — Kansas City Plant", businessId: "US-EIN 47-2381906",
    country: "United States", flag: "🇺🇸", city: "Kansas City, MO", address: "1601 Genessee Street", postalCode: "64102",
    coords: [-94.6, 39.1],
    contracts: [
      { incoterm: "EXW" },
      { incoterm: "FOB", port: "Port of New Orleans", freightCostUsd: "$1,650" },
      { incoterm: "CFR", port: "Port of destination (quoted)", freightCostUsd: "$1,650" },
    ],
    paymentMethods: ["Cash against documents", "Prepayment"],
    availability: "2-week lead", verified: true,
  },

  // ── Singles (different continents) ──
  {
    id: "br-1", productId: "mbm",
    quantityAvailable: "800", metric: "MT", load: "Bulk · 1 MT big-bags", price: "$560",
    specs: [
      { label: "Crude protein", value: "48% min" },
      { label: "Crude fat", value: "10% max" },
      { label: "Moisture", value: "7% max" },
      { label: "Ash", value: "32% max" },
      { label: "Pepsin digestibility", value: "84% min" },
    ],
    facilityName: "RenderingGlobal Brasil Ltda — Guarulhos Plant", businessId: "BR-CNPJ 12.345.678/0001-90",
    country: "Brazil", flag: "🇧🇷", city: "São Paulo, SP", address: "Av. das Indústrias 1820, Distrito Industrial, Guarulhos", postalCode: "07221-000",
    coords: [-46.63, -23.55],
    contracts: [
      { incoterm: "EXW" },
      { incoterm: "FOB", port: "Port of Santos", freightCostUsd: "$980" },
      { incoterm: "CIF", port: "Port of Santos", freightCostUsd: "$980" },
    ],
    paymentMethods: ["Letter of credit", "Cash against documents", "Part now & part later", "Prepayment"],
    availability: "Available now", verified: true,
  },
  {
    id: "nl-1", productId: "tallow",
    quantityAvailable: "700", metric: "MT", load: "Flexitank · 21 MT", price: "$850",
    specs: [
      { label: "FFA (as oleic)", value: "3% max" },
      { label: "Moisture & impurities", value: "1% max" },
      { label: "Titre", value: "42°C min" },
      { label: "Color (FAC)", value: "≤ 11" },
      { label: "Energy", value: "≈ 8,900 kcal/kg" },
    ],
    facilityName: "RenderingGlobal Europe B.V. — Botlek Terminal", businessId: "NL-KVK 68204917",
    country: "Netherlands", flag: "🇳🇱", city: "Rotterdam", address: "Botlekweg 175, Rotterdam-Botlek", postalCode: "3197 KA",
    coords: [4.43, 51.92],
    contracts: [
      { incoterm: "EXW" },
      { incoterm: "FOB", port: "Port of Rotterdam", freightCostUsd: "$240" },
      { incoterm: "CIF", port: "Port of Rotterdam", freightCostUsd: "$240" },
      { incoterm: "CFR", port: "Port of destination (quoted)", freightCostUsd: "$240" },
    ],
    paymentMethods: ["Letter of credit", "Prepayment"],
    availability: "Available now", verified: true,
  },
];

export const PRODUCT_BY_ID: Record<string, Product> = Object.fromEntries(
  PRODUCTS.map((p) => [p.id, p])
);

export const OFFER_BY_ID: Record<string, Offer> = Object.fromEntries(
  OFFERS.map((o) => [o.id, o])
);

/* ── Unified map items: every product (blue) + every live offer (green) ── */
export const MAP_ITEMS: MapItem[] = [
  ...PRODUCTS.map((p): MapItem => ({ id: "p-" + p.id, kind: "product", coords: p.origin.coords, product: p })),
  ...OFFERS.map((o): MapItem => ({
    id: "o-" + o.id,
    kind: "offer",
    coords: o.coords,
    product: PRODUCT_BY_ID[o.productId],
    offer: o,
  })),
];

export const ITEM_BY_ID: Record<string, MapItem> = Object.fromEntries(
  MAP_ITEMS.map((i) => [i.id, i])
);
