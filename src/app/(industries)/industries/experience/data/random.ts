// Deterministic PRNG so every country × industry × filter combination renders
// stable numbers across renders and sessions.

function hashCode(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

export function seededRng(seed: string) {
  let a = hashCode(seed) || 1;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth-ish random walk series of `n` points inside [min, max]. */
export function walk(
  seed: string,
  n: number,
  min: number,
  max: number,
  drift = 0.08
) {
  const rng = seededRng(seed);
  let v = min + rng() * (max - min);
  const step = (max - min) * 0.14;
  return Array.from({ length: n }, () => {
    v += (rng() - 0.5 + drift * (rng() - 0.3)) * step + drift * step * 0.4;
    v = Math.min(max, Math.max(min, v));
    return Math.round(v * 10) / 10;
  });
}
