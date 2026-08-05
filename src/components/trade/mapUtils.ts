/* Shared helpers for the trade-routes map (ported from AGM-Front, minus
   react-simple-maps — this project renders the map as plain SVG with d3-geo). */

export const DETAIL_ZOOM = 2.5;
export const LABEL_ZOOM = 3.5;
export const MAX_ZOOM = 20;

export function formatValueDefault(val: number) {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return `${val}`;
}

/** Convert a #rrggbb hex color to an rgba() string with the given alpha. */
export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Build a smooth, slightly bowed arc between two [lon, lat] points by sampling a
 * quadratic Bézier whose control point is offset perpendicular to the segment.
 * Returns an array of [lon, lat] coordinates suitable for projecting + drawing.
 */
export function arcPoints(
  from: [number, number],
  to: [number, number],
  bend = 0.22,
  steps = 32
): [number, number][] {
  const [x0, y0] = from;
  const [x1, y1] = to;
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.hypot(dx, dy) || 1;

  // Perpendicular unit vector; force it to bow "northward" for visual consistency.
  let nx = -dy / dist;
  let ny = dx / dist;
  if (ny < 0) {
    nx = -nx;
    ny = -ny;
  }

  const cx = mx + nx * dist * bend;
  const cy = my + ny * dist * bend;

  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const omt = 1 - t;
    const x = omt * omt * x0 + 2 * omt * t * cx + t * t * x1;
    const y = omt * omt * y0 + 2 * omt * t * cy + t * t * y1;
    pts.push([x, Math.max(-84, Math.min(84, y))]);
  }
  return pts;
}

// Center / zoom that frames every origin plus the destination (Power BI-style fit).
export function calculateStrategicView(
  points: [number, number][]
): { center: [number, number]; zoom: number } {
  if (points.length === 0) return { center: [0, 20], zoom: 1 };

  const lons = points.map((p) => p[0]);
  const lats = points.map((p) => p[1]);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const centerLon = (minLon + maxLon) / 2;
  const centerLat = (minLat + maxLat) / 2;
  const spreadLon = maxLon - minLon;
  const spreadLat = maxLat - minLat;

  // Web Mercator: longitude is linear in x, latitude is not linear in y, so
  // compute zoom from both axes and keep the tighter (smaller) one so all
  // points stay on screen.
  const lonZoom = Math.log2(360 / Math.max(spreadLon * 1.15, 1e-9));
  const latZoom = Math.log2(180 / Math.max(spreadLat * 1.15, 1e-9));
  const zoom = Math.max(1, Math.min(14, Math.min(lonZoom, latZoom)));

  return { center: [centerLon, centerLat], zoom };
}
