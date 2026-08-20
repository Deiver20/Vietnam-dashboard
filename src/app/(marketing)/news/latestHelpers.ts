/* ── Tag helper ───────────────────────────────────────── */
export function tagClass(t: string) {
  if (t === "Big Data") return "bg-blue-50 text-blue-600 border-blue-200";
  if (/Innovation|AI/.test(t)) return "bg-green-50 text-green-600 border-green-200";
  if (/Commodit|Trade/.test(t)) return "bg-amber-50 text-amber-600 border-amber-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}
