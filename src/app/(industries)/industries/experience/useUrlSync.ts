"use client";

// Destino: src/app/(industries)/industries/experience/useUrlSync.ts
// (REEMPLAZA al useUrlSync.ts original, que dependía de react-router).
//
// Adaptación a Next.js App Router. Cambios frente al original y por qué:
//  - react-router (useNavigate/useParams/useLocation) → usePathname de
//    next/navigation + parseo manual de segmentos bajo el prefijo /industries.
//  - navigate(url) → window.history.pushState / replaceState. Next 14.1+
//    sincroniza usePathname tras un push/replace nativo SIN disparar una
//    navegación de ruta, así que la escena nunca se remonta por URLs que
//    empujamos nosotros mismos. El botón atrás/adelante sí navega (popstate),
//    pero solo remonta la page (null) — la escena vive en el layout.
//  - Las URLs llevan el prefijo /industries (en Vite eran hash-routes de
//    primer nivel: /#/rendering → aquí /industries/rendering).
// Toda la lógica de convergencia (driver), disambiguación industry/country y
// el protocolo expectedPathRef son idénticos al original.

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { shallow } from "zustand/shallow";
import { getIndustry } from "./data/industries";
import { ANTARCTICA_ID, countryFeatures, countryIdOf } from "./data/world";
import { VARIABLES } from "./panel/dataCarousel";
import { useIndustriesStore } from "./stores";

// URL scheme, two paths to the same destination:
//   industry-first: /industries → /industries/:industryId
//                   → /industries/:industryId/:countrySlug
//   country-first:  /industries → /industries/:countrySlug (cover asks for
//                   an industry) → /industries/:industryId/:countrySlug
// The segment after /industries is disambiguated against the known industry
// ids; anything else is tried as a country slug.
// Level 4 (the /dashboard data pages) appends the data variable picked on
// the cover carousel: /industries/:industryId/:countrySlug/:variable.

const BASE = "/industries";

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const slugToCountry = new Map<string, string>();
const countryToSlug = new Map<string, string>();
for (const f of countryFeatures) {
  const id = countryIdOf(f);
  if (id === ANTARCTICA_ID) continue;
  const slug = slugify(f.properties.name);
  slugToCountry.set(slug, id);
  countryToSlug.set(id, slug);
}

const VARIABLE_KEYS = new Set<string>(VARIABLES.map((v) => v.key));

function urlOf(
  level: number,
  industryId: string | null,
  countryId: string | null,
  dataType: string | null
) {
  if (level >= 3 && countryId && countryToSlug.has(countryId)) {
    const slug = countryToSlug.get(countryId);
    if (level >= 4 && industryId && dataType)
      return `${BASE}/${industryId}/${slug}/${dataType}`;
    return industryId ? `${BASE}/${industryId}/${slug}` : `${BASE}/${slug}`;
  }
  if (level === 2 && industryId) return `${BASE}/${industryId}`;
  return BASE;
}

/** A path this experience owns (never steer URLs of other pages). */
function ownsPath(path: string) {
  return path === BASE || path.startsWith(`${BASE}/`);
}

// Shallow URL updates: Next syncs usePathname after native History calls
// without remounting the route tree.
const push = (url: string) => window.history.pushState(null, "", url);
const replace = (url: string) => window.history.replaceState(null, "", url);

/**
 * Two-way sync between the store's navigation state and the URL.
 *
 * URL → state: a driver takes one legal store action at a time (each
 * transition keeps its animation and lock ownership) until the state matches
 * the URL — this powers deep links and browser back/forward. While
 * converging, GSAP runs fast-forwarded so deep links don't sit through the
 * full cinematic.
 *
 * State → URL: user-driven navigation pushes the matching URL.
 */
export default function useUrlSync() {
  const pathname = usePathname() ?? BASE;
  const pathRef = useRef(pathname);
  pathRef.current = pathname;
  // Path we pushed ourselves — its change must not start the driver, or it
  // would treat the user's own navigation as a URL to converge to (and could
  // even revert the action that caused it).
  const expectedPathRef = useRef<string | null>(null);
  const convergingRef = useRef(false);

  // /industries/a/b/c → ["a", "b", "c"]; anything outside BASE → [] (not ours).
  const segments = ownsPath(pathname)
    ? pathname.slice(BASE.length).split("/").filter(Boolean)
    : [];
  const firstParam = segments[0] ?? null; // industry id OR country slug
  const secondParam = segments[1] ?? null; // country slug
  const thirdParam = segments[2] ?? null; // data variable (imports, exports…)

  // URL → state: drive the store toward externally-set URLs (deep links,
  // back/forward, manual edits) one legal action at a time.
  useEffect(() => {
    if (!ownsPath(pathRef.current)) return;
    if (expectedPathRef.current === pathRef.current) {
      expectedPathRef.current = null;
      return;
    }

    const setConverging = (on: boolean) => {
      if (convergingRef.current === on) return;
      convergingRef.current = on;
      gsap.globalTimeline.timeScale(on ? 2.6 : 1);
    };

    const industry = firstParam ? getIndustry(firstParam) : null;
    // First segment that isn't an industry: try it as a country slug
    // (country-first path).
    const soloCountryId =
      firstParam && !industry ? (slugToCountry.get(firstParam) ?? null) : null;
    const countryId = secondParam
      ? (slugToCountry.get(secondParam) ?? null)
      : soloCountryId;

    // Unknown segments: fall back to the nearest valid URL. replaceState
    // updates usePathname, so this effect re-runs with the corrected path.
    if (firstParam && !industry && !soloCountryId) {
      replace(BASE);
      return;
    }
    if (secondParam && (!industry || !slugToCountry.get(secondParam))) {
      replace(industry ? `${BASE}/${firstParam}` : BASE);
      return;
    }
    // The data-variable segment needs the full industry/country pair.
    const wantVariable =
      thirdParam && industry && countryId && VARIABLE_KEYS.has(thirdParam)
        ? thirdParam
        : null;
    if (thirdParam && !wantVariable) {
      replace(`${BASE}/${firstParam}/${secondParam}`);
      return;
    }

    const wantLevel = wantVariable ? 4 : countryId ? 3 : industry ? 2 : 1;
    const wantIndustryId = industry?.id ?? null;
    let active = true;
    let unsub: (() => void) | null = null;

    const step = () => {
      if (!active) return;
      const s = useIndustriesStore.getState();
      const pairMatched =
        s.selectedIndustryId === wantIndustryId &&
        s.selectedCountryId === countryId;
      const matched =
        wantLevel === 1
          ? s.level === 1
          : wantLevel === 2
            ? s.level === 2 && s.selectedIndustryId === wantIndustryId
            : wantLevel === 3
              ? s.level === 3 && pairMatched
              : s.level === 4 && pairMatched && s.dataType === wantVariable;
      if (matched) {
        // Done: stop driving entirely so later user actions are never fought.
        active = false;
        setConverging(false);
        unsub?.();
        return;
      }
      setConverging(true);
      if (s.transitioning || !s.introDone) return;
      if (s.level === 4) {
        if (wantLevel === 4 && pairMatched) {
          // Same dive, different variable: swap the dataset in place.
          useIndustriesStore.setState({ dataType: wantVariable });
        } else {
          s.closePages();
        }
      } else if (s.level === 3) {
        if (wantLevel === 4 && pairMatched) {
          // Right cover — dive into the data pages with the URL's variable.
          // Two separate steps: setState re-enters this subscriber
          // synchronously, so setting dataType and diving in one frame would
          // recurse forever on the (unchanged) dataType write.
          if (s.dataType !== wantVariable) {
            useIndustriesStore.setState({ dataType: wantVariable });
          } else {
            s.goToPage(0);
          }
        } else if (wantLevel >= 3 && s.selectedCountryId === countryId) {
          // Same country, different industry (or none): swap it on the cover
          // in place instead of leaving and re-entering.
          s.selectIndustry(wantIndustryId);
        } else {
          s.retreat();
        }
      } else if (wantLevel === 1) {
        s.selectIndustry(null);
      } else if (wantLevel === 2) {
        s.selectIndustry(wantIndustryId);
      } else if (wantIndustryId) {
        // Industry-first target: pick the industry, then the country.
        if (s.selectedIndustryId === wantIndustryId) s.selectCountry(countryId!);
        else s.selectIndustry(wantIndustryId);
      } else {
        // Country-first target: reach the plain globe, then the country.
        if (s.level === 2) s.selectIndustry(null);
        else s.selectCountry(countryId!);
      }
    };

    unsub = useIndustriesStore.subscribe(step);
    step();
    return () => {
      active = false;
      unsub?.();
      setConverging(false);
    };
  }, [firstParam, secondParam, thirdParam, pathname]);

  // State → URL: user-driven navigation pushes the matching URL.
  useEffect(() => {
    return useIndustriesStore.subscribe(
      (s) =>
        [s.level, s.selectedIndustryId, s.selectedCountryId, s.dataType] as [
          number,
          string | null,
          string | null,
          string | null,
        ],
      ([level, industryId, countryId, dataType]) => {
        // Intermediate states while the driver converges never push URLs.
        if (convergingRef.current) return;
        const url = urlOf(level, industryId, countryId, dataType);
        if (ownsPath(pathRef.current) && pathRef.current !== url) {
          expectedPathRef.current = url;
          push(url);
        }
      },
      { equalityFn: shallow }
    );
  }, []);
}
