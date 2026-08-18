/**
 * Reduce un array a como máximo `limit` elementos preservando los extremos
 * y muestreando de forma uniforme. Útil para charts con muchos puntos.
 */
export function downsampleTo<T>(arr: T[], limit: number): T[] {
  if (arr.length <= limit || limit <= 0) return arr;
  const out: T[] = [arr[0]];
  const step = (arr.length - 1) / (limit - 1);
  for (let i = 1; i < limit - 1; i++) {
    const idx = Math.round(i * step);
    out.push(arr[idx]);
  }
  out.push(arr[arr.length - 1]);
  return out;
}
