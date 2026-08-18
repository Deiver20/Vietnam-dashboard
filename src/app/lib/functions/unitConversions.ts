export const CORN_CENTS_TO_USD_MT = 0.393683;

export const SOYMEAL_ST_TO_MT = 1.10231;

export function cornCentsToUsdPerMt(cents: number): number {
  if (cents === null || cents === undefined || Number.isNaN(cents)) return NaN;
  return cents * CORN_CENTS_TO_USD_MT;
}

export function soymealStToUsdPerMt(usdPerSt: number): number {
  if (usdPerSt === null || usdPerSt === undefined || Number.isNaN(usdPerSt)) return NaN;
  return usdPerSt * SOYMEAL_ST_TO_MT;
}