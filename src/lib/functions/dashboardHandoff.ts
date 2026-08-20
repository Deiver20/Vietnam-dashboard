/* sessionStorage keys for the /industries ↔ /dashboard hand-off.
   Kept in a leaf module so the dashboard route can read them without
   importing anything from the 3D experience bundle (and vice versa). */

/** Set by the experience's dive right before navigating: the
 *  /industries/:industry/:countrySlug cover the dashboard's Back button
 *  should return to. The dashboard consumes (and clears) it on mount. */
export const DASH_RETURN_KEY = "agmDashboardReturn";

/** Set by the dashboard's Back button right before navigating: tells the
 *  experience to compose the country cover instantly (no camera intro, no
 *  zoom cinematic) and fade in. Consumed on experience mount. */
export const FAST_RESUME_KEY = "agmFastResume";
