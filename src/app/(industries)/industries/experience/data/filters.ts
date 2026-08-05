import type { FilterDef, FilterState } from "./types";

/** Effective filter state: stored values over each definition's default. */
export function resolveFilters(
  defs: FilterDef[],
  stored: FilterState | undefined
): FilterState {
  const out: FilterState = {};
  for (const def of defs) out[def.id] = stored?.[def.id] ?? def.defaultValue;
  return out;
}
