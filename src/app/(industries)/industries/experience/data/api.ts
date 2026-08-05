// The single swap point for a real API. Everything above this module consumes
// only the types in ./types; replace these bodies with fetch calls when a
// backend exists (they are synchronous today because the data is static).

import { industries, getIndustry, getCountryIndustryStats } from "./industries";
import { buildDossier } from "./countryPages";
import type { CountryDossier, Industry } from "./types";

export { getIndustry, getCountryIndustryStats };

export function getIndustries(): Industry[] {
  return industries;
}

const dossierCache = new Map<string, CountryDossier>();

export function getCountryDossier(
  countryId: string,
  industryId: string
): CountryDossier {
  const key = `${countryId}:${industryId}`;
  let dossier = dossierCache.get(key);
  if (!dossier) {
    dossier = buildDossier(countryId, industryId);
    dossierCache.set(key, dossier);
  }
  return dossier;
}
