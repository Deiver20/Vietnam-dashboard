"use client";

import { useCallback, useSyncExternalStore } from "react";

/* Named queries so every consumer agrees on the same hinges.
   - The nav and the dashboard swap at Tailwind's `lg` (1024), matching the
     existing `hidden lg:flex` in Navbar and RightPanel.
   - The /industries experience also treats ANY coarse-pointer device as
     mobile: an iPad in landscape is ≥1024 but still needs the touchable
     globe + bottom sheet (the desktop panels are hover/wheel-driven and
     need ≥1268px anyway). A mouse desktop ≥1024 is untouched.
   - The /dashboard cover 3D loads only at ≥768 (user decision: phones skip
     the three.js download entirely). */
export const MQ_MOBILE_NAV = "(max-width: 1023.98px)";
export const MQ_DASH_MOBILE = "(max-width: 1023.98px)";
export const MQ_COVER_3D = "(min-width: 768px)";
export const MQ_INDUSTRIES_MOBILE =
  "(max-width: 1023.98px), (pointer: coarse)";

/** SSR-safe media-query hook. During SSR (and the first client render
 *  before hydration) it returns `serverDefault` — pass the value that
 *  renders the DESKTOP tree so server and client markup agree; the swap to
 *  the real value happens right after hydration. */
export default function useMediaQuery(
  query: string,
  serverDefault = false
): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query]
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverDefault
  );
}
