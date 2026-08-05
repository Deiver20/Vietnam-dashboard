/* Location lookup for the trade-routes map bubbles. Coordinates are the
   approximate country/port origin for exporters and Vietnamese ports for
   importers/customs — seeded from the reference AGM-Front markers, extended
   with the real trader names the Vietnam backend returns. Any unknown name
   returns null so the map can skip the bubble instead of placing a fabricated
   point. */

export interface RouteOrigin {
  name: string;
  coordinates: [number, number];
  value: number;
  color: string;
}

export interface RouteDestination {
  name: string;
  coordinates: [number, number];
  color: string;
}

export const VIETNAM_DESTINATION: RouteDestination = {
  name: "Vietnam",
  coordinates: [106.0, 16.0],
  color: "#F8D227",
};

const KNOWN_COORDS: Record<string, [number, number]> = {
  // ── Importers (Vietnamese ports / provinces) ──
  "Viet Nam Cargo": [106.7, 10.78],
  "DDP Co Ltd": [105.85, 21.02],
  Tcid: [107.08, 10.35],
  Swallow: [107.0, 10.96],
  Agrimax: [106.69, 20.84],
  "An Huy": [106.6, 10.9],
  "Uni President": [106.65, 11.07],
  "Truong Giang Nutrition": [105.78, 10.04],
  "PMT Nutri": [109.19, 12.24],
  "Gifa Two Member": [106.5, 10.85],
  "At Agrico": [106.41, 10.54],
  Nsdi: [105.9, 21.1],
  NHT: [106.35, 10.7],
  "Sheng Long Bio Tech": [105.97, 9.6],
  "Viet My Im Ex": [108.22, 16.06],
  "C And M Imex": [108.22, 16.06],
  "MC Fish Vietnam": [109.22, 13.78],

  // ── Exporters (country of origin) ──
  "Pure Pathway": [83.3, 17.7],
  PSD: [-77.0, -12.0],
  "Galeon Pacific": [-71.6, -33.0],
  "SK-PRO": [127.8, 36.5],
  Grinfield: [-60.0, -34.0],
  Qmodity: [8.2, 46.8],
  "K-pro USA": [-95.0, 30.0],
  "K-pro GmbH": [10.0, 51.0],
  "K-pro GMBH": [10.0, 51.0],
  "The Scoular Company": [-96.0, 41.3],
  "Arowana Exim": [72.9, 19.1],
  Kanematsu: [139.7, 35.7],
  "Blueline Foods": [76.3, 10.0],
  "Swift and Trade Group": [-96.0, 41.3],
  "Nuova Campari": [12.5, 41.9],
  "Ubm Agri Trade": [8.2, 46.8],
  "UBM Agri Trade": [8.2, 46.8],
  "Seara Meats": [-51.0, -14.0],
  "Marine Biotechnology Products": [133.0, -27.0],

  // ── Customs (Vietnamese border gates) ──
  "Hải quan cửa khẩu cảng Sài Gòn khu vực 1": [106.7, 10.78],
  "Hải quan cửa khẩu cảng Sài Gòn khu vực 2": [106.7, 10.75],
  "Hải quan cửa khẩu cảng Hải Phòng khu vực 1": [106.68, 20.84],
  "Hải quan cửa khẩu cảng Hải Phòng khu vực 2": [106.72, 20.86],
  "Hải quan cửa khẩu cảng Hải Phòng khu vực 3": [106.76, 20.88],
  "Hải quan cửa khẩu cảng Đình Vũ": [106.83, 20.9],
  "CCHQ Đức Hòa": [106.5, 10.85],
  "Hải quan Đức Hòa": [106.5, 10.85],
  "Hải quan Khu công nghệ cao": [106.75, 10.85],
  "Hải quan Hưng Yên": [106.05, 20.9],
  "Hải quan Khu chế xuất Long Bình": [106.9, 10.95],
  "Hải quan Bắc Hà Nội": [105.85, 21.1],
  "Hải quan cửa khẩu cảng Mỹ Tho": [106.36, 10.36],
  "CCHQ CK Cảng Mỹ Tho": [106.36, 10.36],
  "Hải quan cửa khẩu cảng Đà Nẵng": [108.22, 16.06],
  "Hải quan CK Cảng Đà Nẵng": [108.22, 16.06],
};

/** Resolve the coordinates for a trader name, or null when there are no known
 *  coordinates (the caller skips the bubble entirely in that case). */
export function getTraderCoordinates(name: string): [number, number] | null {
  const known = KNOWN_COORDS[name] ?? KNOWN_COORDS[name.toUpperCase()];
  if (known) return known;
  return null;
}
