// ISO 3166-1 numérico (id que usa el shell / world-atlas TopoJSON) → código
// IOC de 3 letras (la convención de la columna `pais_codigo` de la MV, ej.
// Vietnam = VIE). Mapa universal y estático: cargar un país nuevo en la BD
// con su código IOC no requiere tocar este archivo.
const ISO_TO_IOC: Record<string, string> = {
  "004": "AFG", "008": "ALB", "012": "ALG", "016": "ASA", "020": "AND", "024": "ANG", "028": "ATG", "031": "AZE",
  "032": "ARG", "036": "AUS", "040": "AUT", "044": "BAH", "048": "BRU", "050": "BAN", "051": "ARM", "052": "BAR",
  "056": "BEL", "060": "BER", "064": "BHU", "068": "BOL", "070": "BIH", "072": "BOT", "076": "BRA", "084": "BIZ",
  "090": "SOL", "092": "IVB", "096": "BRU", "100": "BUL", "104": "MYA", "108": "BDI", "112": "BLR", "116": "CAM",
  "120": "CMR", "124": "CAN", "132": "CPV", "136": "CAY", "140": "CAF", "144": "SRI", "148": "CHA", "152": "CHI",
  "156": "CHN", "158": "TPE", "170": "COL", "178": "CGO", "180": "COD", "188": "CRC", "191": "CRO", "192": "CUB",
  "196": "CYP", "203": "CZE", "204": "BEN", "208": "DEN", "212": "DMA", "214": "DOM", "218": "ECU", "222": "ESA",
  "226": "GEQ", "231": "ETH", "232": "ERI", "233": "EST", "242": "FIJ", "246": "FIN", "250": "FRA", "266": "GAB",
  "268": "GEO", "270": "GAM", "276": "GER", "288": "GHA", "296": "KIR", "300": "GRE", "308": "GRN", "316": "GUM",
  "320": "GUA", "324": "GUI", "328": "GUY", "332": "HAI", "340": "HON", "344": "HKG", "348": "HUN", "352": "ISL",
  "356": "IND", "360": "INA", "364": "IRI", "368": "IRQ", "372": "IRL", "376": "ISR", "380": "ITA", "384": "CIV",
  "388": "JAM", "392": "JPN", "398": "KAZ", "400": "JOR", "404": "KEN", "408": "PRK", "410": "KOR", "414": "KUW",
  "417": "KGZ", "418": "LAO", "422": "LIB", "426": "LES", "428": "LAT", "430": "LBR", "434": "LBA", "440": "LTU",
  "442": "LUX", "446": "MAC", "450": "MAD", "454": "MAW", "458": "MAS", "462": "MDV", "466": "MLI", "470": "MLT",
  "478": "MTN", "484": "MEX", "496": "MGL", "498": "MDA", "499": "MNE", "504": "MAR", "508": "MOZ", "512": "OMA",
  "516": "NAM", "520": "NRU", "524": "NEP", "528": "NED", "548": "VAN", "554": "NZL", "558": "NCA", "562": "NIG",
  "566": "NGR", "578": "NOR", "586": "PAK", "591": "PAN", "598": "PNG", "600": "PAR", "604": "PER", "608": "PHI",
  "616": "POL", "620": "POR", "624": "GBS", "626": "TLS", "630": "PUR", "634": "QAT", "642": "ROU", "643": "RUS",
  "646": "RWA", "682": "KSA", "686": "SEN", "688": "SRB", "690": "SEY", "694": "SLE", "702": "SIN", "703": "SVK",
  "704": "VIE", "705": "SLO", "706": "SOM", "710": "RSA", "716": "ZIM", "724": "ESP", "728": "SSD", "729": "SUD",
  "740": "SUR", "748": "SWZ", "752": "SWE", "756": "SUI", "760": "SYR", "762": "TJK", "764": "THA", "768": "TOG",
  "776": "TGA", "780": "TTO", "784": "UAE", "788": "TUN", "792": "TUR", "795": "TKM", "798": "TUV", "800": "UGA",
  "804": "UKR", "807": "MKD", "818": "EGY", "826": "GBR", "834": "TAN", "840": "USA", "854": "BUR", "858": "URU",
  "860": "UZB", "862": "VEN", "882": "SAM", "887": "YEM", "894": "ZAM",
};

// Industria del shell (id/slug de URL, ej. "rendering") → código `industria`
// de la MV (ej. "Rend").
const INDUSTRY_TO_CODE: Record<string, string> = {
  rendering: "Rend",
};

export function getPaisCode(shellCountryId: string | null | undefined): string | undefined {
  if (!shellCountryId) return undefined;
  return ISO_TO_IOC[shellCountryId] ?? shellCountryId;
}

export function getIndustryCode(shellIndustryId: string | null | undefined): string | undefined {
  if (!shellIndustryId) return undefined;
  return INDUSTRY_TO_CODE[shellIndustryId] ?? shellIndustryId;
}
