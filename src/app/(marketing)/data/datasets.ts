import type { CardData, Country, Industry, DataType, IndustryProduct } from "@/interfaces/data/interface";

export const COUNTRIES: Record<string, Country> = {
  us: { emoji: "🇺🇸", name: "United States", region: "north_america", flag: "assets/flags/us.svg" },
  mx: { emoji: "🇲🇽", name: "Mexico", region: "central_america", flag: "assets/flags/mx.svg" },
  ar: { emoji: "🇦🇷", name: "Argentina", region: "south_america", flag: "assets/flags/ar.svg" },
  br: { emoji: "🇧🇷", name: "Brazil", region: "south_america", flag: "assets/flags/br.svg" },
  co: { emoji: "🇨🇴", name: "Colombia", region: "south_america", flag: "assets/flags/co.svg" },
  cl: { emoji: "🇨🇱", name: "Chile", region: "south_america", flag: "assets/flags/cl.svg" },
  pe: { emoji: "🇵🇪", name: "Peru", region: "south_america", flag: "assets/flags/pe.svg" },
  de: { emoji: "🇩🇪", name: "Germany", region: "europe", flag: "assets/flags/de.svg" },
  nl: { emoji: "🇳🇱", name: "Netherlands", region: "europe", flag: "assets/flags/nl.svg" },
  cn: { emoji: "🇨🇳", name: "China", region: "asia", flag: "assets/flags/cn.svg" },
  in: { emoji: "🇮🇳", name: "India", region: "asia", flag: "assets/flags/in.svg" },
  au: { emoji: "🇦🇺", name: "Australia", region: "oceania", flag: "assets/flags/au.svg" },
  za: { emoji: "🇿🇦", name: "South Africa", region: "africa", flag: "assets/flags/za.svg" },
  ng: { emoji: "🇳🇬", name: "Nigeria", region: "africa", flag: "assets/flags/ng.svg" },
};

export const IND: Record<string, Industry> = {
  rendering: { label: "Rendering", color: "#0066FF", emoji: "⚙️", img: "assets/rendering_bg.webp", chips: ["Import volume", "CIF price", "Top origins"], basePrice: 450, desc: "Animal by-product processing: meals, tallow and proteins recovered from slaughter streams — tracked across import volumes, CIF prices and top origins." },
  meat: { label: "Meat", color: "#F35959", emoji: "🥩", img: "assets/chicken_meat_bg.webp", chips: ["Live weight", "Cut imports", "FOB value"], basePrice: 2400, desc: "Beef, pork and poultry trade flows — live weight, cut imports and FOB values across the world's main producing and consuming markets." },
  biofuels: { label: "Biofuels", color: "#FCB514", emoji: "⛽", img: "assets/biofuels.webp", chips: ["Biodiesel vol", "Ethanol ref", "USD/ton"], basePrice: 1100, desc: "Biodiesel, ethanol and renewable feedstocks — production volumes, reference prices and the trade routes moving energy from crops to tanks." },
  feed: { label: "Feed", color: "#67A6FF", emoji: "🌾", img: "assets/marketplace_additives.webp", chips: ["Feed compos.", "Protein pct", "Origin"], basePrice: 380, desc: "Compound feed and protein ingredients — composition, protein content and origin flows feeding the global livestock and aquaculture chains." },
  fertilizers: { label: "Fertilizers", color: "#33CC00", emoji: "🧪", img: "assets/fertilizers.webp", chips: ["Urea CIF", "Phosphate", "Trade flow"], basePrice: 520, desc: "Nitrogen, phosphate and potash markets — urea CIF benchmarks, phosphate flows and the trade volumes behind global crop nutrition." },
  petfood: { label: "Pet Food", color: "#A78BFA", emoji: "🐕", img: "assets/petfood.webp", chips: ["Dry food", "Wet food", "USD/kg"], basePrice: 1500, desc: "Dry and wet pet food trade — retail-grade ingredients, USD/kg benchmarks and the fastest-growing corner of the animal nutrition market." },
  grains: { label: "Grains", color: "#FCB514", emoji: "🌽", img: "assets/marketplace_grain.webp", chips: ["Soy FOB", "Corn CIF", "Trade vol"], basePrice: 260, desc: "Corn, soy, wheat and sorghum — FOB/CIF benchmarks and trade volumes across the world's key export corridors." },
  fats_oils: { label: "Fats & Oils", color: "#F97316", emoji: "🛢️", img: "assets/marketplace_fats.webp", chips: ["Palm oil", "Soy oil", "USD/ton"], basePrice: 950, desc: "Vegetable oils and animal fats — palm, soy and tallow prices in USD/ton, tracked from crushers and renderers to food and fuel buyers." },
  additives: { label: "Additives", color: "#EC4899", emoji: "⚗️", img: "assets/marketplace_additives.webp", chips: ["Preservatives", "Vitamins", "Acidifiers"], basePrice: 1800, desc: "Amino acids, vitamins and preservatives — the specialty ingredients that price feed performance, tracked across global suppliers." },
  livestock: { label: "Livestock", color: "#10B981", emoji: "🐄", img: "assets/chicken_meat_bg.webp", chips: ["Cattle", "Swine", "Sheep"], basePrice: 1900, desc: "Live cattle, swine and poultry markets — herd movements, live-weight prices and cross-border trade in breeding and slaughter animals." },
};

/* Products per industry for the /data/[industry] price table. Each row is a
   country where the product trades, with its customs office and incoterm;
   prices come from lib/functions/priceSeries (seeded, deterministic). */
export const PRODUCTS: Record<string, IndustryProduct[]> = {
  rendering: [
    { key: "mbm", label: "Meat & Bone Meal", rows: [
      { country: "us", aduana: "Houston Seaport", incoterm: "FOB" },
      { country: "mx", aduana: "Veracruz", incoterm: "CIF" },
      { country: "br", aduana: "Santos", incoterm: "FOB" },
      { country: "ar", aduana: "Rosario", incoterm: "FOB" },
    ] },
    { key: "feather_meal", label: "Feather Meal", rows: [
      { country: "us", aduana: "New Orleans", incoterm: "FOB" },
      { country: "br", aduana: "Paranaguá", incoterm: "CFR" },
      { country: "cl", aduana: "Valparaíso", incoterm: "CIF" },
    ] },
    { key: "poultry_meal", label: "Poultry By-Product Meal", rows: [
      { country: "us", aduana: "Savannah", incoterm: "FOB" },
      { country: "mx", aduana: "Manzanillo", incoterm: "DAP" },
      { country: "co", aduana: "Cartagena", incoterm: "CIF" },
    ] },
    { key: "blood_meal", label: "Blood Meal", rows: [
      { country: "br", aduana: "Santos", incoterm: "FOB" },
      { country: "ar", aduana: "Buenos Aires", incoterm: "CIF" },
    ] },
    { key: "tallow", label: "Tallow", rows: [
      { country: "us", aduana: "Los Angeles", incoterm: "FOB" },
      { country: "au", aduana: "Melbourne", incoterm: "CFR" },
      { country: "br", aduana: "Rio Grande", incoterm: "FOB" },
    ] },
  ],
  meat: [
    { key: "beef_cuts", label: "Beef Cuts", rows: [
      { country: "us", aduana: "Philadelphia", incoterm: "CIF" },
      { country: "br", aduana: "Santos", incoterm: "FOB" },
      { country: "ar", aduana: "Buenos Aires", incoterm: "FOB" },
      { country: "au", aduana: "Brisbane", incoterm: "CFR" },
    ] },
    { key: "chicken_lq", label: "Chicken Leg Quarters", rows: [
      { country: "us", aduana: "Savannah", incoterm: "FOB" },
      { country: "br", aduana: "Itajaí", incoterm: "FOB" },
      { country: "mx", aduana: "Veracruz", incoterm: "CIF" },
    ] },
    { key: "pork_bellies", label: "Pork Bellies", rows: [
      { country: "us", aduana: "Oakland", incoterm: "FOB" },
      { country: "de", aduana: "Hamburg", incoterm: "CIF" },
      { country: "nl", aduana: "Rotterdam", incoterm: "CIF" },
    ] },
    { key: "whole_chicken", label: "Whole Chicken", rows: [
      { country: "br", aduana: "Itajaí", incoterm: "FOB" },
      { country: "cn", aduana: "Qingdao", incoterm: "CIF" },
    ] },
  ],
  biofuels: [
    { key: "biodiesel", label: "Biodiesel B100", rows: [
      { country: "us", aduana: "Houston Seaport", incoterm: "FOB" },
      { country: "ar", aduana: "Rosario", incoterm: "FOB" },
      { country: "de", aduana: "Hamburg", incoterm: "CIF" },
    ] },
    { key: "ethanol", label: "Ethanol", rows: [
      { country: "us", aduana: "New Orleans", incoterm: "FOB" },
      { country: "br", aduana: "Santos", incoterm: "FOB" },
      { country: "in", aduana: "Mundra", incoterm: "CIF" },
    ] },
    { key: "uco", label: "Used Cooking Oil (UCO)", rows: [
      { country: "cn", aduana: "Shanghai", incoterm: "FOB" },
      { country: "nl", aduana: "Rotterdam", incoterm: "CIF" },
    ] },
    { key: "glycerin", label: "Crude Glycerin", rows: [
      { country: "ar", aduana: "Rosario", incoterm: "FOB" },
      { country: "br", aduana: "Paranaguá", incoterm: "FOB" },
    ] },
  ],
  feed: [
    { key: "soybean_meal", label: "Soybean Meal", rows: [
      { country: "ar", aduana: "Rosario", incoterm: "FOB" },
      { country: "br", aduana: "Santos", incoterm: "FOB" },
      { country: "us", aduana: "New Orleans", incoterm: "FOB" },
      { country: "nl", aduana: "Rotterdam", incoterm: "CIF" },
    ] },
    { key: "corn_gluten", label: "Corn Gluten Meal", rows: [
      { country: "us", aduana: "New Orleans", incoterm: "FOB" },
      { country: "cn", aduana: "Qingdao", incoterm: "CIF" },
    ] },
    { key: "fish_meal", label: "Fish Meal", rows: [
      { country: "pe", aduana: "Callao", incoterm: "FOB" },
      { country: "cl", aduana: "Valparaíso", incoterm: "FOB" },
      { country: "cn", aduana: "Shanghai", incoterm: "CIF" },
    ] },
    { key: "ddgs", label: "DDGS", rows: [
      { country: "us", aduana: "New Orleans", incoterm: "FOB" },
      { country: "mx", aduana: "Veracruz", incoterm: "DAP" },
    ] },
  ],
  fertilizers: [
    { key: "urea", label: "Urea 46%", rows: [
      { country: "cn", aduana: "Qingdao", incoterm: "FOB" },
      { country: "ng", aduana: "Lagos Apapa", incoterm: "FOB" },
      { country: "br", aduana: "Paranaguá", incoterm: "CIF" },
      { country: "us", aduana: "New Orleans", incoterm: "CIF" },
    ] },
    { key: "dap", label: "DAP", rows: [
      { country: "cn", aduana: "Shanghai", incoterm: "FOB" },
      { country: "in", aduana: "Mundra", incoterm: "CIF" },
    ] },
    { key: "map", label: "MAP", rows: [
      { country: "br", aduana: "Santos", incoterm: "CIF" },
      { country: "us", aduana: "Tampa", incoterm: "FOB" },
    ] },
    { key: "kcl", label: "Potassium Chloride", rows: [
      { country: "de", aduana: "Hamburg", incoterm: "FOB" },
      { country: "br", aduana: "Paranaguá", incoterm: "CIF" },
    ] },
  ],
  petfood: [
    { key: "dry_dog", label: "Dry Dog Food", rows: [
      { country: "us", aduana: "Los Angeles", incoterm: "FOB" },
      { country: "de", aduana: "Hamburg", incoterm: "EXW" },
      { country: "br", aduana: "Santos", incoterm: "FOB" },
    ] },
    { key: "wet_cat", label: "Wet Cat Food", rows: [
      { country: "de", aduana: "Hamburg", incoterm: "CIF" },
      { country: "cn", aduana: "Shanghai", incoterm: "FOB" },
    ] },
    { key: "treats", label: "Pet Treats & Chews", rows: [
      { country: "cn", aduana: "Qingdao", incoterm: "FOB" },
      { country: "br", aduana: "Itajaí", incoterm: "FOB" },
    ] },
  ],
  grains: [
    { key: "corn", label: "Yellow Corn", rows: [
      { country: "us", aduana: "New Orleans", incoterm: "FOB" },
      { country: "br", aduana: "Santos", incoterm: "FOB" },
      { country: "ar", aduana: "Rosario", incoterm: "FOB" },
      { country: "mx", aduana: "Veracruz", incoterm: "CIF" },
    ] },
    { key: "soybeans", label: "Soybeans", rows: [
      { country: "us", aduana: "New Orleans", incoterm: "FOB" },
      { country: "br", aduana: "Santos", incoterm: "FOB" },
      { country: "cn", aduana: "Qingdao", incoterm: "CIF" },
    ] },
    { key: "wheat", label: "Wheat", rows: [
      { country: "ar", aduana: "Bahía Blanca", incoterm: "FOB" },
      { country: "de", aduana: "Hamburg", incoterm: "FOB" },
      { country: "au", aduana: "Adelaide", incoterm: "FOB" },
    ] },
    { key: "sorghum", label: "Sorghum", rows: [
      { country: "us", aduana: "Houston Seaport", incoterm: "FOB" },
      { country: "au", aduana: "Brisbane", incoterm: "FOB" },
    ] },
  ],
  fats_oils: [
    { key: "palm_oil", label: "Crude Palm Oil", rows: [
      { country: "co", aduana: "Cartagena", incoterm: "FOB" },
      { country: "in", aduana: "Mundra", incoterm: "CIF" },
      { country: "nl", aduana: "Rotterdam", incoterm: "CIF" },
    ] },
    { key: "soy_oil", label: "Soybean Oil", rows: [
      { country: "ar", aduana: "Rosario", incoterm: "FOB" },
      { country: "br", aduana: "Santos", incoterm: "FOB" },
      { country: "in", aduana: "Mundra", incoterm: "CIF" },
    ] },
    { key: "beef_tallow", label: "Beef Tallow", rows: [
      { country: "us", aduana: "Los Angeles", incoterm: "FOB" },
      { country: "au", aduana: "Melbourne", incoterm: "CFR" },
    ] },
    { key: "sunflower_oil", label: "Sunflower Oil", rows: [
      { country: "ar", aduana: "Rosario", incoterm: "FOB" },
      { country: "de", aduana: "Hamburg", incoterm: "CIF" },
    ] },
  ],
  additives: [
    { key: "lysine", label: "L-Lysine HCl", rows: [
      { country: "cn", aduana: "Shanghai", incoterm: "FOB" },
      { country: "us", aduana: "Chicago O'Hare", incoterm: "DAP" },
      { country: "br", aduana: "Santos", incoterm: "CIF" },
    ] },
    { key: "methionine", label: "DL-Methionine", rows: [
      { country: "de", aduana: "Hamburg", incoterm: "FOB" },
      { country: "cn", aduana: "Qingdao", incoterm: "FOB" },
    ] },
    { key: "choline", label: "Choline Chloride 60%", rows: [
      { country: "cn", aduana: "Shanghai", incoterm: "FOB" },
      { country: "mx", aduana: "Manzanillo", incoterm: "CIF" },
    ] },
    { key: "phytase", label: "Phytase", rows: [
      { country: "cn", aduana: "Qingdao", incoterm: "FOB" },
      { country: "nl", aduana: "Rotterdam", incoterm: "CIF" },
    ] },
  ],
  livestock: [
    { key: "live_cattle", label: "Live Cattle", rows: [
      { country: "br", aduana: "Vila do Conde", incoterm: "FOB" },
      { country: "au", aduana: "Darwin", incoterm: "FOB" },
      { country: "co", aduana: "Cartagena", incoterm: "CIF" },
    ] },
    { key: "feeder_pigs", label: "Feeder Pigs", rows: [
      { country: "us", aduana: "Laredo", incoterm: "DAP" },
      { country: "nl", aduana: "Rotterdam", incoterm: "EXW" },
    ] },
    { key: "broiler_chicks", label: "Broiler Chicks", rows: [
      { country: "us", aduana: "Miami Air Cargo", incoterm: "CIF" },
      { country: "de", aduana: "Frankfurt Air Cargo", incoterm: "CIF" },
      { country: "za", aduana: "Durban", incoterm: "CIF" },
    ] },
  ],
};

export const TYPES: Record<string, DataType> = {
  imports: { label: "IMPORTS", cls: "imports", color: "#F35959" },
  exports: { label: "EXPORTS", cls: "exports", color: "#0066FF" },
  pricing: { label: "PRICING", cls: "pricing", color: "#FCB514" },
  production: { label: "PRODUCTION", cls: "production", color: "#33CC00" },
  trade_volumes: { label: "TRADE VOLUMES", cls: "trade_volumes", color: "#A78BFA" },
  event: { label: "EVENT", cls: "event", color: "#EC4899" },
  project: { label: "PROJECT", cls: "project", color: "#94959B" },
};

export const CARDS: CardData[] = [
  { id: "r01", cat: "rendering", type: "imports", country: "us", status: "locked", price: 499, date: "04/2025" },
  { id: "r02", cat: "rendering", type: "imports", country: "mx", status: "locked", price: 499, date: "04/2025" },
  { id: "r03", cat: "rendering", type: "imports", country: "ar", status: "locked", price: 499, originalPrice: 699, discount: true, date: "03/2025" },
  { id: "r04", cat: "rendering", type: "imports", country: "br", status: "locked", price: 499, date: "04/2025" },
  { id: "r05", cat: "rendering", type: "exports", country: "us", status: "bought", price: 499, date: "03/2025" },
  { id: "r06", cat: "rendering", type: "exports", country: "mx", status: "bought", price: 499, date: "03/2025" },
  { id: "r07", cat: "rendering", type: "exports", country: "ar", status: "bought", price: 499, date: "02/2025" },
  { id: "r08", cat: "rendering", type: "exports", country: "br", status: "bought", price: 499, date: "03/2025" },
  { id: "r09", cat: "rendering", type: "pricing", country: "us", status: "locked", price: 499, date: "04/2025" },
  { id: "r10", cat: "rendering", type: "imports", country: "us", status: "locked", price: 499, date: "01 May 2025", title: "IMPORTS RESEARCH", subtitle: "Rendering · Research" },
  { id: "r11", cat: "rendering", type: "event", country: "us", status: "locked", price: 30, date: "Lived: 11 May 2025", title: "REAM 2025 – PARTICIPANTS", subtitle: "Event · May 2025", img: "assets/ream2026_fondo.png" },
  { id: "b01", cat: "biofuels", type: "imports", country: "us", status: "locked", price: 499, date: "04/2025" },
  { id: "b02", cat: "biofuels", type: "imports", country: "mx", status: "locked", price: 499, originalPrice: 599, discount: true, date: "04/2025" },
  { id: "b03", cat: "biofuels", type: "pricing", country: "ar", status: "locked", price: 499, date: "03/2025" },
  { id: "b04", cat: "biofuels", type: "pricing", country: "br", status: "locked", price: 499, date: "04/2025" },
  { id: "b05", cat: "biofuels", type: "exports", country: "co", status: "locked", price: 499, date: "03/2025" },
  { id: "f01", cat: "fertilizers", type: "imports", country: "us", status: "locked", price: 499, date: "04/2025" },
  { id: "f02", cat: "fertilizers", type: "imports", country: "mx", status: "locked", price: 499, date: "03/2025" },
  { id: "f03", cat: "fertilizers", type: "exports", country: "ar", status: "locked", price: 499, originalPrice: 649, discount: true, date: "02/2025" },
  { id: "f04", cat: "fertilizers", type: "exports", country: "br", status: "locked", price: 499, date: "01/2025" },
  { id: "f05", cat: "fertilizers", type: "pricing", country: "de", status: "locked", price: 499, date: "04/2025" },
  { id: "p01", cat: "petfood", type: "imports", country: "us", status: "locked", price: 499, date: "04/2025" },
  { id: "p02", cat: "petfood", type: "imports", country: "br", status: "locked", price: 499, date: "03/2025" },
  { id: "p03", cat: "petfood", type: "exports", country: "ar", status: "locked", price: 499, date: "03/2025" },
  { id: "p04", cat: "petfood", type: "pricing", country: "cn", status: "locked", price: 499, date: "04/2025" },
  { id: "m01", cat: "meat", type: "imports", country: "us", status: "locked", price: 499, date: "04/2025" },
  { id: "m02", cat: "meat", type: "exports", country: "br", status: "locked", price: 499, date: "03/2025" },
  { id: "m03", cat: "meat", type: "imports", country: "ar", status: "locked", price: 499, date: "02/2025" },
  { id: "m04", cat: "meat", type: "pricing", country: "nl", status: "locked", price: 499, originalPrice: 599, discount: true, date: "04/2025" },
  { id: "m05", cat: "meat", type: "trade_volumes", country: "us", status: "locked", price: 499, date: "04/2025" },
  { id: "g01", cat: "grains", type: "imports", country: "us", status: "locked", price: 499, date: "04/2025" },
  { id: "g02", cat: "grains", type: "exports", country: "ar", status: "locked", price: 499, date: "03/2025" },
  { id: "g03", cat: "grains", type: "production", country: "br", status: "locked", price: 499, date: "04/2025" },
  { id: "g04", cat: "grains", type: "pricing", country: "cl", status: "locked", price: 499, date: "03/2025" },
  { id: "g05", cat: "grains", type: "trade_volumes", country: "us", status: "locked", price: 499, date: "04/2025" },
  { id: "o01", cat: "fats_oils", type: "imports", country: "us", status: "locked", price: 499, date: "04/2025" },
  { id: "o02", cat: "fats_oils", type: "pricing", country: "br", status: "locked", price: 499, date: "04/2025" },
  { id: "o03", cat: "fats_oils", type: "exports", country: "in", status: "locked", price: 499, date: "03/2025" },
  { id: "fd01", cat: "feed", type: "imports", country: "us", status: "locked", price: 499, date: "04/2025" },
  { id: "fd02", cat: "feed", type: "imports", country: "mx", status: "locked", price: 499, date: "03/2025" },
  { id: "fd03", cat: "feed", type: "imports", country: "de", status: "locked", price: 499, date: "04/2025" },
  { id: "fd04", cat: "feed", type: "exports", country: "za", status: "locked", price: 499, date: "03/2025" },
  { id: "ad01", cat: "additives", type: "imports", country: "us", status: "locked", price: 499, date: "04/2025" },
  { id: "ad02", cat: "additives", type: "pricing", country: "br", status: "locked", price: 499, date: "03/2025" },
  { id: "lv01", cat: "livestock", type: "imports", country: "ar", status: "locked", price: 499, date: "04/2025" },
  { id: "lv02", cat: "livestock", type: "project", country: "br", status: "locked", price: 499, originalPrice: 799, discount: true, date: "03/2025" },
];

export const TRENDING = ["r01", "r02", "r03", "r04", "r05", "r06", "r07", "r08", "r10", "r11"];

export const CATS = [
  { key: "all", label: "ALL IND.", emoji: "🏭" },
  { key: "meat", label: "MEAT", emoji: "🥩" },
  { key: "biofuels", label: "BIOFUELS", emoji: "⛽" },
  { key: "feed", label: "FEED", emoji: "🌾" },
  { key: "fertilizers", label: "FERTILIZERS", emoji: "🧪" },
  { key: "rendering", label: "RENDERING", emoji: "⚙️" },
  { key: "petfood", label: "PET FOOD", emoji: "🐕" },
  { key: "grains", label: "GRAINS", emoji: "🌽" },
  { key: "fats_oils", label: "FATS & OILS", emoji: "🛢️" },
  { key: "additives", label: "ADDITIVES", emoji: "⚗️" },
  { key: "livestock", label: "LIVESTOCK", emoji: "🐄" },
];

export const REGIONS = [
  { key: "all", label: "GLOBAL" },
  { key: "africa", label: "AFRICA" },
  { key: "asia", label: "ASIA" },
  { key: "central_america", label: "CENTRAL-AMERICA" },
  { key: "europe", label: "EUROPE" },
  { key: "north_america", label: "NORTH-AMERICA" },
  { key: "oceania", label: "OCEANIA" },
  { key: "south_america", label: "SOUTH-AMERICA" },
];

export const DATA_TYPES = [
  { key: "all", label: "ALL TYPES" },
  { key: "imports", label: "IMPORTS" },
  { key: "exports", label: "EXPORTS" },
  { key: "pricing", label: "PRICING" },
  { key: "production", label: "PRODUCTION" },
  { key: "trade_volumes", label: "TRADE" },
  { key: "event", label: "EVENTS" },
  { key: "project", label: "PROJECTS" },
];

export const REGION_LABELS: Record<string, string> = {
  africa: "Africa",
  asia: "Asia",
  central_america: "Central America",
  europe: "Europe",
  north_america: "North America",
  oceania: "Oceania",
  south_america: "South America",
};
