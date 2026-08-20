"use client";

import React, { useEffect, useRef } from "react";

/**
 * Ambient hero backdrop — a subtle "global trade data-mesh": a faint dot field,
 * a network of hubs across a world-like span, trade arcs, and the occasional
 * data pulse travelling a route. Communicates global reach + live data without
 * stealing attention. One engine, tuned per `variant`.
 *
 * - Canvas 2D (kilobytes, crisp at any resolution).
 * - Respects prefers-reduced-motion (renders a single static frame).
 * - Pauses when scrolled out of view (IntersectionObserver).
 * - DPR capped, ~30fps, subtle pointer parallax.
 */

type Variant = "marketplace" | "data" | "latest" | "events" | "about" | "plans";

interface VariantConfig {
  accents: string[];
  pulse: string;
  arcAlpha: number;
  dotAlpha: number;
  hubAlpha: number;
  pulseEverySec: number;
}

const VARIANTS: Record<Variant, VariantConfig> = {
  // Transactional: green/blue/amber, livelier trade pulses (buyer ↔ seller).
  marketplace: { accents: ["#33CC00", "#67A6FF", "#FCB514"], pulse: "#5BE85B", arcAlpha: 0.16, dotAlpha: 0.085, hubAlpha: 0.5, pulseEverySec: 1.7 },
  data: { accents: ["#67A6FF", "#0066FF"], pulse: "#67A6FF", arcAlpha: 0.14, dotAlpha: 0.08, hubAlpha: 0.5, pulseEverySec: 2.4 },
  latest: { accents: ["#67A6FF"], pulse: "#67A6FF", arcAlpha: 0.1, dotAlpha: 0.06, hubAlpha: 0.4, pulseEverySec: 3.4 },
  events: { accents: ["#33CC00", "#67A6FF"], pulse: "#5BE85B", arcAlpha: 0.16, dotAlpha: 0.08, hubAlpha: 0.6, pulseEverySec: 1.9 },
  about: { accents: ["#67A6FF", "#1ABC9C"], pulse: "#67A6FF", arcAlpha: 0.08, dotAlpha: 0.05, hubAlpha: 0.35, pulseEverySec: 4.5 },
  plans: { accents: ["#67A6FF", "#33CC00"], pulse: "#67A6FF", arcAlpha: 0.12, dotAlpha: 0.07, hubAlpha: 0.45, pulseEverySec: 3 },
};

// Hubs laid out across a world-like span (left = Americas, mid = EU/Africa,
// right = Asia/Oceania) so the arcs read as global trade routes.
const HUBS: [number, number][] = [
  [0.1, 0.52],
  [0.17, 0.74],
  [0.28, 0.36],
  [0.36, 0.58],
  [0.49, 0.4],
  [0.55, 0.66],
  [0.66, 0.48],
  [0.74, 0.66],
  [0.82, 0.4],
  [0.9, 0.6],
];

// Trade routes between hubs (index pairs).
const ROUTES: [number, number][] = [
  [0, 4],
  [2, 8],
  [1, 6],
  [3, 9],
  [4, 8],
  [0, 6],
  [5, 9],
  [2, 4],
  [6, 8],
  [3, 7],
];

function hexToRgba(hex: string, a: number) {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

interface HeroBackdropProps {
  variant?: Variant;
  className?: string;
}

export default function HeroBackdrop({ variant = "marketplace", className = "" }: HeroBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cfg = VARIANTS[variant] ?? VARIANTS.marketplace;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const hubsPx = () => HUBS.map(([x, y]) => [x * w, y * h] as [number, number]);

    const arcPoint = (a: [number, number], b: [number, number], t: number) => {
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const dist = Math.hypot(dx, dy);
      const cx = (a[0] + b[0]) / 2;
      const cy = (a[1] + b[1]) / 2 - dist * 0.22;
      const omt = 1 - t;
      return [
        omt * omt * a[0] + 2 * omt * t * cx + t * t * b[0],
        omt * omt * a[1] + 2 * omt * t * cy + t * t * b[1],
      ] as [number, number];
    };

    // Pointer parallax (lerped).
    let pointerX = 0.5;
    let pointerY = 0.5;
    let px = 0;
    let py = 0;
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = (e.clientX - rect.left) / Math.max(1, rect.width);
      pointerY = (e.clientY - rect.top) / Math.max(1, rect.height);
    };
    if (!reduced) window.addEventListener("pointermove", onMove, { passive: true });

    interface Pulse {
      route: number;
      t: number;
      speed: number;
      color: string;
    }
    const pulses: Pulse[] = [];
    const accent = () => cfg.accents[Math.floor(Math.random() * cfg.accents.length)];

    const drawDots = (ox: number, oy: number) => {
      const gap = 46;
      ctx.fillStyle = hexToRgba("#9FC4FF", cfg.dotAlpha);
      for (let x = (gap / 2 + ox) % gap; x < w; x += gap) {
        for (let y = (gap / 2 + oy) % gap; y < h; y += gap) {
          ctx.beginPath();
          ctx.arc(x, y, 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const draw = (time: number) => {
      const hubs = hubsPx();
      ctx.clearRect(0, 0, w, h);

      // parallax target
      px += ((pointerX - 0.5) * 16 - px) * 0.06;
      py += ((pointerY - 0.5) * 12 - py) * 0.06;

      ctx.save();
      ctx.translate(px, py);

      drawDots(px * 0.5, py * 0.5);

      // arcs
      ctx.lineWidth = 1;
      ROUTES.forEach(([ai, bi]) => {
        const a = hubs[ai];
        const b = hubs[bi];
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        const cx = (a[0] + b[0]) / 2;
        const cy = (a[1] + b[1]) / 2 - Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.22;
        ctx.quadraticCurveTo(cx, cy, b[0], b[1]);
        ctx.strokeStyle = hexToRgba("#67A6FF", cfg.arcAlpha);
        ctx.stroke();
      });

      // hubs (breathing glow)
      hubs.forEach((p, i) => {
        const breathe = 0.5 + 0.5 * Math.sin(time * 0.0011 + i * 1.7);
        const col = cfg.accents[i % cfg.accents.length];
        const r = 8 + breathe * 6;
        const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], r);
        g.addColorStop(0, hexToRgba(col, cfg.hubAlpha * (0.5 + breathe * 0.5)));
        g.addColorStop(1, hexToRgba(col, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = hexToRgba(col, 0.55);
        ctx.beginPath();
        ctx.arc(p[0], p[1], 1.7, 0, Math.PI * 2);
        ctx.fill();
      });

      // travelling pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pu = pulses[i];
        const [ai, bi] = ROUTES[pu.route];
        const pos = arcPoint(hubs[ai], hubs[bi], pu.t);
        // short trail
        const tail = arcPoint(hubs[ai], hubs[bi], Math.max(0, pu.t - 0.06));
        const grad = ctx.createLinearGradient(tail[0], tail[1], pos[0], pos[1]);
        grad.addColorStop(0, hexToRgba(pu.color, 0));
        grad.addColorStop(1, hexToRgba(pu.color, 0.55));
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(tail[0], tail[1]);
        ctx.lineTo(pos[0], pos[1]);
        ctx.stroke();
        // head
        const hg = ctx.createRadialGradient(pos[0], pos[1], 0, pos[0], pos[1], 5);
        hg.addColorStop(0, hexToRgba(pu.color, 0.9));
        hg.addColorStop(1, hexToRgba(pu.color, 0));
        ctx.fillStyle = hg;
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], 5, 0, Math.PI * 2);
        ctx.fill();
        if (!reduced) pu.t += pu.speed;
        if (pu.t >= 1) pulses.splice(i, 1);
      }

      ctx.restore();
    };

    if (reduced) {
      // a couple of static pulses mid-route for a sense of activity, no motion
      pulses.push({ route: 0, t: 0.45, speed: 0, color: cfg.pulse });
      pulses.push({ route: 4, t: 0.6, speed: 0, color: cfg.pulse });
      draw(0);
      return () => {
        ro.disconnect();
      };
    }

    let raf = 0;
    let last = 0;
    let lastSpawn = 0;
    let running = true;
    const frameMs = 1000 / 30;

    const loop = (time: number) => {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      if (time - last < frameMs) return;
      last = time;
      if (time - lastSpawn > cfg.pulseEverySec * 1000 && pulses.length < 5) {
        lastSpawn = time;
        pulses.push({
          route: Math.floor(Math.random() * ROUTES.length),
          t: 0,
          speed: 0.006 + Math.random() * 0.006,
          color: Math.random() < 0.6 ? cfg.pulse : accent(),
        });
      }
      draw(time);
    };
    raf = requestAnimationFrame(loop);

    // Pause when off-screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(loop);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [variant]);

  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* edge vignette keeps hero text legible */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 30%, transparent 40%, rgba(2,9,18,0.55) 100%)",
        }}
      />
    </div>
  );
}
