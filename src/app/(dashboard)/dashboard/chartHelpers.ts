/* ════════════════════════════════════════════════════════════
   CHART HELPERS
   ════════════════════════════════════════════════════════════ */

const W = 800, H = 280, PAD_L = 30, PAD_R = 20, PAD_T = 20, PAD_B = 30;

interface Point {
  x: number;
  y: number;
  val: number;
}

export function buildPath(values: number[]) {
  const min = Math.min(...values) * 0.88;
  const max = Math.max(...values) * 1.05;
  const span = max - min || 1;
  const n = values.length;
  const points: Point[] = values.map((v, i) => ({
    x: PAD_L + (i / (n - 1)) * (W - PAD_L - PAD_R),
    y: PAD_T + (1 - (v - min) / span) * (H - PAD_T - PAD_B),
    val: v,
  }));
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  const areaD = d + ` L ${points[points.length - 1].x},${H - PAD_B} L ${points[0].x},${H - PAD_B} Z`;
  return { d, areaD, points };
}

export function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export function formatDelta(d: string | undefined) {
  if (!d || d === "—") return null;
  const isNeg = String(d).startsWith("-") || String(d).startsWith("−");
  const isMixed = /[a-zA-Z]/.test(d);
  if (isMixed) {
    return { text: d, up: !isNeg, dn: isNeg };
  }
  return { text: `${isNeg ? "▼" : "▲"} ${String(d).replace(/^[-−]/, "")}% YoY`, up: !isNeg, dn: isNeg };
}
