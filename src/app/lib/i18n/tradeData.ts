import type { Locale } from "@/app/interfaces";

/* Normaliza un nombre crudo de la BD: quita espacios a los lados y colapsa
   espacios múltiples, para que "ALEMANIA ", "ALEMANIA" y " Alemania " sean la
   misma clave de búsqueda. */
function normalizeKey(raw: string): string {
  return (raw || "").trim().replace(/\s+/g, " ").toLowerCase();
}

/* ---------------------------------------------------------------------------
   PAÍSES
   La BD trae los nombres de país con variaciones: en MAYÚSCULAS (dataset de
   Vietnam, en español, p. ej. "ESTADOS UNIDOS"), en Title Case (dataset de
   México, en inglés, p. ej. "United States"), con espacios al final y con
   acentos. Aquí mapeamos cada variante observada a una clave canónica (el
   nombre oficial en inglés) y luego traducimos esa clave a los 4 idiomas.
--------------------------------------------------------------------------- */
const COUNTRY_VARIANTS: Record<string, string> = {
  alemania: "germany",
  argentina: "argentina",
  aruba: "aruba",
  australia: "australia",
  austria: "austria",
  belice: "belize",
  bolivia: "bolivia",
  brasil: "brazil",
  bulgaria: "bulgaria",
  bélgica: "belgium",
  canadá: "canada",
  canada: "canada",
  chile: "chile",
  china: "china",
  "corea del sur": "south_korea",
  "costa rica": "costa_rica",
  cuba: "cuba",
  curazao: "curacao",
  "czech republic": "czechia",
  czechia: "czechia",
  "república checa": "czechia",
  dinamarca: "denmark",
  ecuador: "ecuador",
  egipto: "egypt",
  "el salvador": "el_salvador",
  eslovaquia: "slovakia",
  eslovenia: "slovenia",
  españa: "spain",
  "estados unidos": "united_states",
  "united states": "united_states",
  "federación rusa": "russia",
  russia: "russia",
  filipinas: "philippines",
  finlandia: "finland",
  francia: "france",
  georgia: "georgia",
  guatemala: "guatemala",
  haití: "haiti",
  honduras: "honduras",
  "hong kong": "hong_kong",
  "hong kong, china": "hong_kong",
  hungary: "hungary",
  india: "india",
  irlanda: "ireland",
  "republic of ireland": "ireland",
  islandia: "iceland",
  israel: "israel",
  italia: "italy",
  japón: "japan",
  jordania: "jordan",
  lituania: "lithuania",
  malasia: "malaysia",
  marruecos: "morocco",
  mauricio: "mauritius",
  mauritania: "mauritania",
  méxico: "mexico",
  mexico: "mexico",
  nicaragua: "nicaragua",
  noruega: "norway",
  "nueva zelanda": "new_zealand",
  omán: "oman",
  "organizaciones internacionales": "international_organizations",
  panamá: "panama",
  paraguay: "paraguay",
  "países bajos": "netherlands",
  "países no declarados": "undeclared",
  perú: "peru",
  polonia: "poland",
  portugal: "portugal",
  "puerto rico": "puerto_rico",
  "reino unido": "united_kingdom",
  "united kingdom": "united_kingdom",
  "república dominicana": "dominican_republic",
  rumanía: "romania",
  singapur: "singapore",
  sudáfrica: "south_africa",
  sudán: "sudan",
  suecia: "sweden",
  suiza: "switzerland",
  tailandia: "thailand",
  "taiwán, provincia de china": "taiwan",
  "taiwan, china": "taiwan",
  turquía: "turkey",
  ucrania: "ukraine",
  uruguay: "uruguay",
  venezuela: "venezuela",
  vietnam: "vietnam",
  "viet nam": "vietnam",
  "american samoa": "american_samoa",
  bangladesh: "bangladesh",
  belgium: "belgium",
  brazil: "brazil",
  cambodia: "cambodia",
  cameroon: "cameroon",
  "ivory coast": "cote_divoire",
  denmark: "denmark",
  egypt: "egypt",
  estonia: "estonia",
  ethiopia: "ethiopia",
  fiji: "fiji",
  france: "france",
  gambia: "gambia",
  germany: "germany",
  greece: "greece",
  guinea: "guinea",
  "guinea-bissau": "guinea_bissau",
  iceland: "iceland",
  indonesia: "indonesia",
  japan: "japan",
  jordan: "jordan",
  kenya: "kenya",
  kyrgyzstan: "kyrgyzstan",
  laos: "laos",
  liechtenstein: "liechtenstein",
  madagascar: "madagascar",
  malawi: "malawi",
  malaysia: "malaysia",
  mauritius: "mauritius",
  mongolia: "mongolia",
  morocco: "morocco",
  myanmar: "myanmar",
  namibia: "namibia",
  nepal: "nepal",
  netherlands: "netherlands",
  "new zealand": "new_zealand",
  nigeria: "nigeria",
  "north korea": "north_korea",
  norway: "norway",
  oman: "oman",
  pakistan: "pakistan",
  panama: "panama",
  "papua new guinea": "papua_new_guinea",
  peru: "peru",
  philippines: "philippines",
  poland: "poland",
  qatar: "qatar",
  romania: "romania",
  samoa: "samoa",
  "saudi arabia": "saudi_arabia",
  senegal: "senegal",
  serbia: "serbia",
  singapore: "singapore",
  "solomon islands": "solomon_islands",
  "south africa": "south_africa",
  "south korea": "south_korea",
  spain: "spain",
  "sri lanka": "sri_lanka",
  sweden: "sweden",
  switzerland: "switzerland",
  taiwan: "taiwan",
  tajikistan: "tajikistan",
  tanzania: "tanzania",
  thailand: "thailand",
  turkey: "turkey",
  ukraine: "ukraine",
  "united arab emirates": "united_arab_emirates",
  yemen: "yemen",
  zambia: "zambia",
  "zfp de bogotá s.a.s.": "free_zone_bogota",
  "zfp intexzona s.a": "free_zone_intexzona",
  "zfp parque central s.a.s": "free_zone_parque_central",
  "zona franca colombia": "free_zone_colombia",
  "zona franca de candelaria": "free_zone_candelaria",
};

const COUNTRIES: Record<string, Record<Locale, string>> = {
  germany: { en: "Germany", es: "Alemania", fr: "Allemagne", pt: "Alemanha" },
  argentina: { en: "Argentina", es: "Argentina", fr: "Argentine", pt: "Argentina" },
  aruba: { en: "Aruba", es: "Aruba", fr: "Aruba", pt: "Aruba" },
  australia: { en: "Australia", es: "Australia", fr: "Australie", pt: "Austrália" },
  austria: { en: "Austria", es: "Austria", fr: "Autriche", pt: "Áustria" },
  belize: { en: "Belize", es: "Belice", fr: "Belize", pt: "Belize" },
  bolivia: { en: "Bolivia", es: "Bolivia", fr: "Bolivie", pt: "Bolívia" },
  brazil: { en: "Brazil", es: "Brasil", fr: "Brésil", pt: "Brasil" },
  bulgaria: { en: "Bulgaria", es: "Bulgaria", fr: "Bulgarie", pt: "Bulgária" },
  belgium: { en: "Belgium", es: "Bélgica", fr: "Belgique", pt: "Bélgica" },
  canada: { en: "Canada", es: "Canadá", fr: "Canada", pt: "Canadá" },
  chile: { en: "Chile", es: "Chile", fr: "Chili", pt: "Chile" },
  china: { en: "China", es: "China", fr: "Chine", pt: "China" },
  south_korea: { en: "South Korea", es: "Corea del Sur", fr: "Corée du Sud", pt: "Coreia do Sul" },
  costa_rica: { en: "Costa Rica", es: "Costa Rica", fr: "Costa Rica", pt: "Costa Rica" },
  cuba: { en: "Cuba", es: "Cuba", fr: "Cuba", pt: "Cuba" },
  curacao: { en: "Curaçao", es: "Curazao", fr: "Curaçao", pt: "Curaçao" },
  czechia: { en: "Czechia", es: "República Checa", fr: "Tchéquie", pt: "Chéquia" },
  denmark: { en: "Denmark", es: "Dinamarca", fr: "Danemark", pt: "Dinamarca" },
  ecuador: { en: "Ecuador", es: "Ecuador", fr: "Équateur", pt: "Equador" },
  egypt: { en: "Egypt", es: "Egipto", fr: "Égypte", pt: "Egito" },
  el_salvador: { en: "El Salvador", es: "El Salvador", fr: "Salvador", pt: "El Salvador" },
  slovakia: { en: "Slovakia", es: "Eslovaquia", fr: "Slovaquie", pt: "Eslováquia" },
  slovenia: { en: "Slovenia", es: "Eslovenia", fr: "Slovénie", pt: "Eslovênia" },
  spain: { en: "Spain", es: "España", fr: "Espagne", pt: "Espanha" },
  united_states: { en: "United States", es: "Estados Unidos", fr: "États-Unis", pt: "Estados Unidos" },
  russia: { en: "Russia", es: "Federación Rusa", fr: "Russie", pt: "Rússia" },
  philippines: { en: "Philippines", es: "Filipinas", fr: "Philippines", pt: "Filipinas" },
  finland: { en: "Finland", es: "Finlandia", fr: "Finlande", pt: "Finlândia" },
  france: { en: "France", es: "Francia", fr: "France", pt: "França" },
  georgia: { en: "Georgia", es: "Georgia", fr: "Géorgie", pt: "Geórgia" },
  guatemala: { en: "Guatemala", es: "Guatemala", fr: "Guatemala", pt: "Guatemala" },
  haiti: { en: "Haiti", es: "Haití", fr: "Haïti", pt: "Haiti" },
  honduras: { en: "Honduras", es: "Honduras", fr: "Honduras", pt: "Honduras" },
  hong_kong: { en: "Hong Kong", es: "Hong Kong", fr: "Hong Kong", pt: "Hong Kong" },
  hungary: { en: "Hungary", es: "Hungría", fr: "Hongrie", pt: "Hungria" },
  india: { en: "India", es: "India", fr: "Inde", pt: "Índia" },
  ireland: { en: "Ireland", es: "Irlanda", fr: "Irlande", pt: "Irlanda" },
  iceland: { en: "Iceland", es: "Islandia", fr: "Islande", pt: "Islândia" },
  israel: { en: "Israel", es: "Israel", fr: "Israël", pt: "Israel" },
  italy: { en: "Italy", es: "Italia", fr: "Italie", pt: "Itália" },
  japan: { en: "Japan", es: "Japón", fr: "Japon", pt: "Japão" },
  jordan: { en: "Jordan", es: "Jordania", fr: "Jordanie", pt: "Jordânia" },
  lithuania: { en: "Lithuania", es: "Lituania", fr: "Lituanie", pt: "Lituânia" },
  malaysia: { en: "Malaysia", es: "Malasia", fr: "Malaisie", pt: "Malásia" },
  morocco: { en: "Morocco", es: "Marruecos", fr: "Maroc", pt: "Marrocos" },
  mauritius: { en: "Mauritius", es: "Mauricio", fr: "Maurice", pt: "Maurício" },
  mauritania: { en: "Mauritania", es: "Mauritania", fr: "Mauritanie", pt: "Mauritânia" },
  mexico: { en: "Mexico", es: "México", fr: "Mexique", pt: "México" },
  nicaragua: { en: "Nicaragua", es: "Nicaragua", fr: "Nicaragua", pt: "Nicarágua" },
  norway: { en: "Norway", es: "Noruega", fr: "Norvège", pt: "Noruega" },
  new_zealand: { en: "New Zealand", es: "Nueva Zelanda", fr: "Nouvelle-Zélande", pt: "Nova Zelândia" },
  oman: { en: "Oman", es: "Omán", fr: "Oman", pt: "Omã" },
  international_organizations: { en: "International Organizations", es: "Organizaciones Internacionales", fr: "Organisations internationales", pt: "Organizações Internacionais" },
  panama: { en: "Panama", es: "Panamá", fr: "Panama", pt: "Panamá" },
  paraguay: { en: "Paraguay", es: "Paraguay", fr: "Paraguay", pt: "Paraguai" },
  netherlands: { en: "Netherlands", es: "Países Bajos", fr: "Pays-Bas", pt: "Países Baixos" },
  undeclared: { en: "Undeclared", es: "Países No Declarados", fr: "Pays non déclarés", pt: "Países Não Declarados" },
  peru: { en: "Peru", es: "Perú", fr: "Pérou", pt: "Peru" },
  poland: { en: "Poland", es: "Polonia", fr: "Pologne", pt: "Polônia" },
  portugal: { en: "Portugal", es: "Portugal", fr: "Portugal", pt: "Portugal" },
  puerto_rico: { en: "Puerto Rico", es: "Puerto Rico", fr: "Porto Rico", pt: "Porto Rico" },
  united_kingdom: { en: "United Kingdom", es: "Reino Unido", fr: "Royaume-Uni", pt: "Reino Unido" },
  dominican_republic: { en: "Dominican Republic", es: "República Dominicana", fr: "République dominicaine", pt: "República Dominicana" },
  romania: { en: "Romania", es: "Rumanía", fr: "Roumanie", pt: "Romênia" },
  singapore: { en: "Singapore", es: "Singapur", fr: "Singapour", pt: "Singapura" },
  south_africa: { en: "South Africa", es: "Sudáfrica", fr: "Afrique du Sud", pt: "África do Sul" },
  sudan: { en: "Sudan", es: "Sudán", fr: "Soudan", pt: "Sudão" },
  sweden: { en: "Sweden", es: "Suecia", fr: "Suède", pt: "Suécia" },
  switzerland: { en: "Switzerland", es: "Suiza", fr: "Suisse", pt: "Suíça" },
  thailand: { en: "Thailand", es: "Tailandia", fr: "Thaïlande", pt: "Tailândia" },
  taiwan: { en: "Taiwan", es: "Taiwán", fr: "Taïwan", pt: "Taiwan" },
  turkey: { en: "Turkey", es: "Turquía", fr: "Turquie", pt: "Turquia" },
  ukraine: { en: "Ukraine", es: "Ucrania", fr: "Ukraine", pt: "Ucrânia" },
  uruguay: { en: "Uruguay", es: "Uruguay", fr: "Uruguay", pt: "Uruguai" },
  venezuela: { en: "Venezuela", es: "Venezuela", fr: "Venezuela", pt: "Venezuela" },
  vietnam: { en: "Vietnam", es: "Vietnam", fr: "Vietnam", pt: "Vietnã" },
  american_samoa: { en: "American Samoa", es: "Samoa Americana", fr: "Samoa américaines", pt: "Samoa Americana" },
  bangladesh: { en: "Bangladesh", es: "Bangladés", fr: "Bangladesh", pt: "Bangladesh" },
  cambodia: { en: "Cambodia", es: "Camboya", fr: "Cambodge", pt: "Camboja" },
  cameroon: { en: "Cameroon", es: "Camerún", fr: "Cameroun", pt: "Camarões" },
  cote_divoire: { en: "Ivory Coast", es: "Costa de Marfil", fr: "Côte d'Ivoire", pt: "Costa do Marfim" },
  estonia: { en: "Estonia", es: "Estonia", fr: "Estonie", pt: "Estônia" },
  ethiopia: { en: "Ethiopia", es: "Etiopía", fr: "Éthiopie", pt: "Etiópia" },
  fiji: { en: "Fiji", es: "Fiyi", fr: "Fidji", pt: "Fiji" },
  gambia: { en: "Gambia", es: "Gambia", fr: "Gambie", pt: "Gâmbia" },
  greece: { en: "Greece", es: "Grecia", fr: "Grèce", pt: "Grécia" },
  guinea: { en: "Guinea", es: "Guinea", fr: "Guinée", pt: "Guiné" },
  guinea_bissau: { en: "Guinea-Bissau", es: "Guinea-Bisáu", fr: "Guinée-Bissau", pt: "Guiné-Bissau" },
  indonesia: { en: "Indonesia", es: "Indonesia", fr: "Indonésie", pt: "Indonésia" },
  kenya: { en: "Kenya", es: "Kenia", fr: "Kenya", pt: "Quênia" },
  kyrgyzstan: { en: "Kyrgyzstan", es: "Kirguistán", fr: "Kirghizistan", pt: "Quirguistão" },
  laos: { en: "Laos", es: "Laos", fr: "Laos", pt: "Laos" },
  liechtenstein: { en: "Liechtenstein", es: "Liechtenstein", fr: "Liechtenstein", pt: "Liechtenstein" },
  madagascar: { en: "Madagascar", es: "Madagascar", fr: "Madagascar", pt: "Madagascar" },
  malawi: { en: "Malawi", es: "Malaui", fr: "Malawi", pt: "Malaui" },
  mongolia: { en: "Mongolia", es: "Mongolia", fr: "Mongolie", pt: "Mongólia" },
  myanmar: { en: "Myanmar", es: "Birmania", fr: "Birmanie", pt: "Mianmar" },
  namibia: { en: "Namibia", es: "Namibia", fr: "Namibie", pt: "Namíbia" },
  nepal: { en: "Nepal", es: "Nepal", fr: "Népal", pt: "Nepal" },
  nigeria: { en: "Nigeria", es: "Nigeria", fr: "Nigeria", pt: "Nigéria" },
  north_korea: { en: "North Korea", es: "Corea del Norte", fr: "Corée du Nord", pt: "Coreia do Norte" },
  pakistan: { en: "Pakistan", es: "Pakistán", fr: "Pakistan", pt: "Paquistão" },
  papua_new_guinea: { en: "Papua New Guinea", es: "Papúa Nueva Guinea", fr: "Papouasie-Nouvelle-Guinée", pt: "Papua-Nova Guiné" },
  qatar: { en: "Qatar", es: "Catar", fr: "Qatar", pt: "Catar" },
  samoa: { en: "Samoa", es: "Samoa", fr: "Samoa", pt: "Samoa" },
  saudi_arabia: { en: "Saudi Arabia", es: "Arabia Saudita", fr: "Arabie saoudite", pt: "Arábia Saudita" },
  senegal: { en: "Senegal", es: "Senegal", fr: "Sénégal", pt: "Senegal" },
  serbia: { en: "Serbia", es: "Serbia", fr: "Serbie", pt: "Sérvia" },
  solomon_islands: { en: "Solomon Islands", es: "Islas Salomón", fr: "Îles Salomon", pt: "Ilhas Salomão" },
  sri_lanka: { en: "Sri Lanka", es: "Sri Lanka", fr: "Sri Lanka", pt: "Sri Lanka" },
  tajikistan: { en: "Tajikistan", es: "Tayikistán", fr: "Tadjikistan", pt: "Tadjiquistão" },
  tanzania: { en: "Tanzania", es: "Tanzania", fr: "Tanzanie", pt: "Tanzânia" },
  united_arab_emirates: { en: "United Arab Emirates", es: "Emiratos Árabes Unidos", fr: "Émirats arabes unis", pt: "Emirados Árabes Unidos" },
  yemen: { en: "Yemen", es: "Yemen", fr: "Yémen", pt: "Iêmen" },
  zambia: { en: "Zambia", es: "Zambia", fr: "Zambie", pt: "Zâmbia" },
  free_zone_bogota: { en: "Free Zone Bogotá", es: "ZFP de Bogotá", fr: "Zone franche de Bogotá", pt: "Zona Franca de Bogotá" },
  free_zone_intexzona: { en: "Free Zone Intexzona", es: "ZFP Intexzona", fr: "Zone franche Intexzona", pt: "Zona Franca Intexzona" },
  free_zone_parque_central: { en: "Free Zone Parque Central", es: "ZFP Parque Central", fr: "Zone franche Parque Central", pt: "Zona Franca Parque Central" },
  free_zone_colombia: { en: "Colombia Free Zone", es: "Zona Franca Colombia", fr: "Zone franche de Colombie", pt: "Zona Franca Colômbia" },
  free_zone_candelaria: { en: "Candelaria Free Zone", es: "Zona Franca de Candelaria", fr: "Zone franche de Candelaria", pt: "Zona Franca de Candelaria" },
};

/* ---------------------------------------------------------------------------
   PRODUCTOS
   La columna producto_final viene en inglés (p. ej. "Yellow grease"). Los
   traducimos a los 4 idiomas. Las claves son el nombre en inglés canónico.
--------------------------------------------------------------------------- */
const PRODUCTS: Record<string, Record<Locale, string>> = {
  "Soybean Meal": { en: "Soybean Meal", es: "Harina de soja", fr: "Tourteau de soja", pt: "Farinha de soja" },
  "Blood meal": { en: "Blood meal", es: "Harina de sangre", fr: "Farine de sang", pt: "Farinha de sangue" },
  "Bones": { en: "Bones", es: "Huesos", fr: "Os", pt: "Ossos" },
  "Bovine Meal": { en: "Bovine meal", es: "Harina bovina", fr: "Farine bovine", pt: "Farinha bovina" },
  "Feather meal": { en: "Feather meal", es: "Harina de plumas", fr: "Farine de plumes", pt: "Farinha de penas" },
  "Fish meal": { en: "Fish meal", es: "Harina de pescado", fr: "Farine de poisson", pt: "Farinha de peixe" },
  "Fish oil": { en: "Fish oil", es: "Aceite de pescado", fr: "Huile de poisson", pt: "Óleo de peixe" },
  "Guts": { en: "Guts", es: "Vísceras", fr: "Viscères", pt: "Vísceras" },
  "MBM, Poultry Meal, Porcine Meal": { en: "MBM, Poultry meal, Porcine meal", es: "HMB, Harina avícola, Harina porcina", fr: "FMV, Farine de volaille, Farine porcine", pt: "FMO, Farinha avícola, Farinha suína" },
  "Other fats": { en: "Other fats", es: "Otras grasas", fr: "Autres graisses", pt: "Outras gorduras" },
  "Porcine Meal": { en: "Porcine meal", es: "Harina porcina", fr: "Farine porcine", pt: "Farinha suína" },
  "Pork fat": { en: "Pork fat", es: "Grasa de cerdo", fr: "Graisse de porc", pt: "Gordura de porco" },
  "Poultry Meal": { en: "Poultry meal", es: "Harina avícola", fr: "Farine de volaille", pt: "Farinha avícola" },
  "Poultry fat": { en: "Poultry fat", es: "Grasa avícola", fr: "Graisse de volaille", pt: "Gordura avícola" },
  "Sheep Meal": { en: "Sheep meal", es: "Harina de ovino", fr: "Farine ovine", pt: "Farinha ovina" },
  "Shrimp Meal": { en: "Shrimp meal", es: "Harina de camarón", fr: "Farine de crevette", pt: "Farinha de camarão" },
  "Tallow": { en: "Tallow", es: "Sebo", fr: "Sulf", pt: "Sebo" },
  "Yellow grease": { en: "Yellow grease", es: "Grasa amarilla", fr: "Graisse jaune", pt: "Gordura amarela" },
};

/* ---------------------------------------------------------------------------
   CATEGORÍAS
--------------------------------------------------------------------------- */
const CATEGORIES: Record<string, Record<Locale, string>> = {
  "Fats & Oils": { en: "Fats & Oils", es: "Grasas y Aceites", fr: "Graisses et Huiles", pt: "Gorduras e Óleos" },
  "Other products": { en: "Other products", es: "Otros productos", fr: "Autres produits", pt: "Outros produtos" },
  "Proteins": { en: "Proteins", es: "Proteínas", fr: "Protéines", pt: "Proteínas" },
};

const EN_FALLBACK: Locale = "en";

/* Código ISO de dos letras para cada clave canónica de país. Usado para las
   banderas (react-country-flag). Las entidades sin código (zonas francas,
   organizaciones internacionales, no declarados) no tienen ISO. */
const CANONICAL_ISO: Record<string, string> = {
  germany: "DE", argentina: "AR", aruba: "AW", australia: "AU", austria: "AT",
  belize: "BZ", bolivia: "BO", brazil: "BR", bulgaria: "BG", belgium: "BE",
  canada: "CA", chile: "CL", china: "CN", south_korea: "KR", costa_rica: "CR",
  cuba: "CU", curacao: "CW", czechia: "CZ", denmark: "DK", ecuador: "EC",
  egypt: "EG", el_salvador: "SV", slovakia: "SK", slovenia: "SI", spain: "ES",
  united_states: "US", russia: "RU", philippines: "PH", finland: "FI",
  france: "FR", georgia: "GE", guatemala: "GT", haiti: "HT", honduras: "HN",
  hong_kong: "HK", hungary: "HU", india: "IN", ireland: "IE", iceland: "IS",
  israel: "IL", italy: "IT", japan: "JP", jordan: "JO", lithuania: "LT",
  malaysia: "MY", morocco: "MA", mauritius: "MU", mauritania: "MR", mexico: "MX",
  nicaragua: "NI", norway: "NO", new_zealand: "NZ", oman: "OM", panama: "PA",
  paraguay: "PY", netherlands: "NL", peru: "PE", poland: "PL", portugal: "PT",
  puerto_rico: "PR", united_kingdom: "GB", dominican_republic: "DO",
  romania: "RO", singapore: "SG", south_africa: "ZA", sudan: "SD",
  sweden: "SE", switzerland: "CH", thailand: "TH", taiwan: "TW", turkey: "TR",
  ukraine: "UA", uruguay: "UY", venezuela: "VE", vietnam: "VN",
  american_samoa: "AS", bangladesh: "BD", cambodia: "KH", cameroon: "CM",
  cote_divoire: "CI", estonia: "EE", ethiopia: "ET", fiji: "FJ", gambia: "GM",
  greece: "GR", guinea: "GN", guinea_bissau: "GW", indonesia: "ID",
  kenya: "KE", kyrgyzstan: "KG", laos: "LA", liechtenstein: "LI",
  madagascar: "MG", malawi: "MW", mongolia: "MN", myanmar: "MM", namibia: "NA",
  nepal: "NP", nigeria: "NG", north_korea: "KP", pakistan: "PK",
  papua_new_guinea: "PG", qatar: "QA", samoa: "WS", saudi_arabia: "SA",
  senegal: "SN", serbia: "RS", solomon_islands: "SB", sri_lanka: "LK",
  tajikistan: "TJ", tanzania: "TZ", united_arab_emirates: "AE", yemen: "YE",
  zambia: "ZM",
};

/* Resuelve el código ISO de un país a partir de su nombre, tanto si llega
   crudo de la BD (MAYÚSCULAS en español, Title Case en inglés, con acentos o
   espacios) como traducido/capitalizado en cualquiera de los 4 idiomas. */
export function getCountryISO(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const norm = normalizeKey(trimmed);
  const canonical = COUNTRY_VARIANTS[norm];
  if (canonical && CANONICAL_ISO[canonical]) return CANONICAL_ISO[canonical];
  for (const [canon, langs] of Object.entries(COUNTRIES)) {
    for (const name of Object.values(langs)) {
      if (normalizeKey(name) === norm) return CANONICAL_ISO[canon] || null;
    }
  }
  return null;
}

export function translateCountry(raw: string | null | undefined, locale: Locale): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const key = COUNTRY_VARIANTS[normalizeKey(trimmed)];
  const entry = key ? COUNTRIES[key] : undefined;
  if (entry) return entry[locale] || entry[EN_FALLBACK];
  return titleCase(trimmed);
}

export function translateProduct(raw: string | null | undefined, locale: Locale): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const entry = PRODUCTS[trimmed] || PRODUCTS[trimmed.toLowerCase()];
  if (entry) return entry[locale] || entry[EN_FALLBACK];
  return trimmed;
}

export function translateCategory(raw: string | null | undefined, locale: Locale): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const entry = CATEGORIES[trimmed];
  if (entry) return entry[locale] || entry[EN_FALLBACK];
  return trimmed;
}

/* Capitaliza la primera letra de cada palabra (Title Case), preservando
   palabras de enlace en minúscula. */
export function titleCase(input: string): string {
  if (!input) return "";
  const words = input.trim().toLowerCase().split(/\s+/);
  const smallWords = new Set(["de", "del", "y", "la", "los", "las", "el", "of", "and", "the", "et", "le", "des", "da", "do", "dos", "e"]);
  return words
    .map((word, i) => {
      if (!word) return word;
      if (i > 0 && smallWords.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
