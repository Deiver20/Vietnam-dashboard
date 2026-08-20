export type Coords = [number, number];

export interface ExportDestination {
  name: string; // port / destination name
  country: string;
  flag: string;
  coords: Coords;
}

/** One spec line — label + quantity or quality (an offer can have any number). */
export interface Spec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  /** 1. Product name */
  name: string;
  nameEs: string;
  company: string;
  /** 2. Images — first entry is the cover (paths under /assets). */
  images: string[];
  /** 3. Category (e.g. "Rendering") */
  category: string;
  /** 4. Subcategory (e.g. "Animal Proteins") */
  subcategory: string;
  /** 5. Product — the base commodity this listing is a grade/variant of. */
  productType: string;
  /** 6. Suggested HS codes */
  hsCodes: string[];
  /** 7. Description */
  description: string;
  /** 8. Country of origin (also the listing's pin on the map). */
  origin: { country: string; flag: string; address: string; coords: Coords };
  /** 9. Export countries */
  exportCountries: string[];
  /** 10. Export countries (open market) */
  exportCountriesOpenMarket: string[];
  accent: "blue" | "green" | "yellow" | "red";
  tagline: string;
  /** Dispatch ports drawn as routes on the map. */
  destinations: ExportDestination[];
}

/** 11. Available contract (incoterm) — port/freight depend on the term:
 *  EXW: nothing · FOB/CIF: port of origin + freight (facility → port) ·
 *  CFR: port of destination + freight (facility → port). */
export interface ContractTerm {
  incoterm: "EXW" | "FOB" | "CIF" | "CFR";
  port?: string;
  freightCostUsd?: string;
}

/** 12. Payment methods */
export type PaymentMethod =
  | "Letter of credit"
  | "Cash against documents"
  | "Part now & part later"
  | "Prepayment";

export interface Offer {
  id: string;
  productId: string;
  /** 1. Quantity available + metric (e.g. "500" + "MT") */
  quantityAvailable: string;
  metric: string;
  /** 2. Load + quantity (e.g. "Container 20′ · 25 MT") */
  load: string;
  /** 3. Price per metric (e.g. "$640") */
  price: string;
  /** 4. Specs — quantity or quality lines, as many as needed. */
  specs: Spec[];
  /** 5. Facility name as registered */
  facilityName: string;
  /** 6. Business ID number */
  businessId: string;
  /** 7–10. Registered facility location */
  country: string;
  flag: string;
  city: string;
  address: string;
  postalCode: string;
  coords: Coords; // origin [lon, lat]
  /** 11. Available contracts */
  contracts: ContractTerm[];
  /** 12. Payment methods */
  paymentMethods: PaymentMethod[];
  availability: string;
  verified: boolean;
}

export interface CompanyBadges {
  certifiedCompany: boolean;
  verifiedBuyer: boolean;
  verifiedSeller: boolean;
  completedTransactions: number;
  /** Accumulated transaction value (e.g. "$48.2M") */
  accumulatedTransactionValue: string;
}

export interface Company {
  name: string;
  /** Store banner (recommended size 1476×300) */
  banner: string;
  /** Company logo (recommended size 213×120) */
  logo: string;
  /** Industry segment — same as the product category. */
  industrySegment: string;
  country: string;
  flag: string;
  description: string;
  dateRegistered: string;
  badges: CompanyBadges;
}

export interface MapItem {
  id: string;
  kind: "product" | "offer";
  coords: Coords;
  product: Product;
  offer?: Offer; // present only when kind === "offer" (has quantity + price)
}
