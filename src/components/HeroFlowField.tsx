"use client";

import React, { useEffect, useRef } from "react";

/**
 * Ambient hero backdrop — a "flow field": hundreds of faint particles streaming
 * along slowly-evolving currents over the navy, leaving silky fading trails.
 * Reads as the global movement of goods / data. Subtle but alive.
 *
 * - Canvas 2D, trails via translucent fade (no per-frame full clear).
 * - prefers-reduced-motion → a single static streamline render, no animation.
 * - Pauses off-screen (IntersectionObserver), DPR capped, ~30fps.
 * - Gentle pointer swirl so it feels responsive.
 */

type Variant = "marketplace" | "data" | "latest" | "events" | "about" | "plans";

interface ColorStop {
  rgb: [number, number, number];
  weight: number;
  alpha: number;
  width: number;
}

const VARIANTS: Record<Variant, ColorStop[]> = {
  // Transactional: brighter cool blue current with green/teal, an amber spark
  // and an occasional near-white glint so they pop over the image.
  marketplace: [
    { rgb: [170, 208, 255], weight: 0.54, alpha: 0.5, width: 1.1 },
    { rgb: [105, 238, 214], weight: 0.18, alpha: 0.5, width: 1.1 },
    { rgb: [155, 248, 155], weight: 0.16, alpha: 0.52, width: 1.1 },
    { rgb: [255, 212, 125], weight: 0.07, alpha: 0.72, width: 1.55 },
    { rgb: [228, 240, 255], weight: 0.05, alpha: 0.58, width: 1.1 },
  ],
  // All particles a single light blue.
  data: [{ rgb: [170, 208, 255], weight: 1, alpha: 0.5, width: 1.1 }],
  latest: [{ rgb: [130, 175, 255], weight: 1, alpha: 0.11, width: 1 }],
  events: [
    { rgb: [110, 225, 110], weight: 0.5, alpha: 0.16, width: 1 },
    { rgb: [120, 170, 255], weight: 0.5, alpha: 0.14, width: 1 },
  ],
  about: [
    { rgb: [120, 170, 255], weight: 0.7, alpha: 0.09, width: 1 },
    { rgb: [60, 200, 180], weight: 0.3, alpha: 0.09, width: 1 },
  ],
  plans: [
    { rgb: [120, 170, 255], weight: 0.7, alpha: 0.13, width: 1 },
    { rgb: [110, 225, 110], weight: 0.3, alpha: 0.14, width: 1 },
  ],
};

// Length of each particle's comet tail, in trajectory points (≈ frames). The
// canvas is cleared every frame, so this tail is the ONLY thing drawn — no
// lingering trail is left behind.
const TAIL = 26;

// Frames over which a particle fades in (at spawn) and out (at end of life), so
// it never appears/disappears abruptly.
const FADE_FRAMES = 22;

// Global brightness multiplier for every particle (1 = palette as-is).
const BRIGHTNESS = 0.2;

interface HeroFlowFieldProps {
  variant?: Variant;
  className?: string;
  /** Keep steering toward the cursor even when it leaves the container. */
  globalPointer?: boolean;
  /** Particle-count multiplier (1 = default; 0.5 = half as many). */
  density?: number;
}

export default function HeroFlowField({
  variant = "marketplace",
  className = "",
  globalPointer = false,
  density = 1,
}: HeroFlowFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const palette = VARIANTS[variant] ?? VARIANTS.marketplace;
    const cum: number[] = [];
    palette.reduce((acc, c, i) => (cum[i] = acc + c.weight), 0);
    const pickColor = () => {
      const r = Math.random() * cum[cum.length - 1];
      const idx = cum.findIndex((c) => r <= c);
      const c = palette[idx < 0 ? 0 : idx];
      return { rgb: c.rgb, alpha: c.alpha, width: c.width };
    };

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
      // Setting the size clears the canvas to transparent (the look we want).
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Smooth, slowly-evolving angle field.
    const field = (x: number, y: number, t: number) =>
      (Math.sin(x * 0.0016 + t * 0.00018) +
        Math.cos(y * 0.00176 - t * 0.00014) +
        Math.sin((x + y) * 0.0011 + t * 0.00026)) *
      1.5;

    let mx = -9999;
    let my = -9999;
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
    };
    const onLeave = () => {
      mx = -9999;
      my = -9999;
    };

    interface P {
      x: number;
      y: number;
      speed: number;
      life: number;
      maxLife: number;
      rgb: [number, number, number];
      alpha: number;
      width: number;
      hist: number[]; // recent trajectory, flat [x0,y0,x1,y1,...]
    }
    const count = Math.round(Math.min(800, (w * h) / 1000) * density);
    const spawn = (p: P) => {
      p.x = Math.random() * w;
      p.y = Math.random() * h;
      p.speed = 0.5 + Math.random() * 0.9;
      p.life = 90 + Math.random() * 200;
      p.maxLife = p.life;
      const col = pickColor();
      p.rgb = col.rgb;
      p.alpha = col.alpha;
      p.width = col.width;
      p.hist = [p.x, p.y];
    };
    const particles: P[] = Array.from({ length: count }, () => {
      const p = { x: 0, y: 0, speed: 1, life: 1, maxLife: 1, rgb: [0, 0, 0], alpha: 1, width: 1, hist: [] } as P;
      spawn(p);
      return p;
    });

    // Move each particle and record its recent trajectory (no drawing here).
    const advance = (time: number, animate: boolean) => {
      // With globalPointer, keep steering toward the cursor even when it is
      // outside the container (as long as it is somewhere in the window).
      const inside = mx >= 0 && mx <= w && my >= 0 && my <= h;
      const attract = mx > -9000 && (globalPointer || inside);
      for (const p of particles) {
        let a = field(p.x, p.y, time);
        if (attract) {
          // Steer toward the pointer: blend the current's angle with the
          // direction to the cursor, so particles flow toward it.
          const dxp = mx - p.x;
          const dyp = my - p.y;
          const dist = Math.hypot(dxp, dyp);
          if (animate && dist < 16) {
            spawn(p); // arrived — recycle so streams keep feeding the cursor
            continue;
          }
          const toP = Math.atan2(dyp, dxp);
          const k = 1.2;
          a = Math.atan2(Math.sin(a) + Math.sin(toP) * k, Math.cos(a) + Math.cos(toP) * k);
        }
        p.x += Math.cos(a) * p.speed;
        p.y += Math.sin(a) * p.speed;
        if (animate) p.life -= 1;
        if (p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10 || p.life <= 0) {
          spawn(p);
          continue;
        }
        p.hist.push(p.x, p.y);
        if (p.hist.length > TAIL * 2) p.hist.splice(0, p.hist.length - TAIL * 2);
      }
    };

    // Draw each particle as a comet: a tail fading from transparent (oldest) to
    // its colour (head). Nothing persists between frames — no leftover trail.
    const drawAll = (fade: boolean) => {
      const usePointer =
        fade && mx > -9000 && (globalPointer || (mx >= 0 && mx <= w && my >= 0 && my <= h));
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const p of particles) {
        const hgt = p.hist;
        const n = hgt.length;
        if (n < 6) continue;
        const hx = hgt[n - 2];
        const hy = hgt[n - 1];
        // Smooth fade in at spawn / out at end of life (and as it nears the
        // pointer), so particles never appear or vanish abruptly.
        let env = 1;
        if (fade) {
          const age = p.maxLife - p.life;
          env = Math.min(1, age / FADE_FRAMES, p.life / FADE_FRAMES);
          if (usePointer) {
            const d = Math.hypot(mx - hx, my - hy);
            if (d < 60) env *= Math.max(0, (d - 16) / 44);
          }
        }
        const eff = p.alpha * env * BRIGHTNESS;
        if (eff <= 0.004) continue;
        const [r, g, b] = p.rgb;
        const grad = ctx.createLinearGradient(hgt[0], hgt[1], hx, hy);
        grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},${eff})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = p.width;
        ctx.beginPath();
        ctx.moveTo(hgt[0], hgt[1]);
        for (let i = 2; i < n; i += 2) ctx.lineTo(hgt[i], hgt[i + 1]);
        ctx.stroke();
        // bright comet head
        ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(1, eff + 0.22)})`;
        ctx.beginPath();
        ctx.arc(hx, hy, p.width * 1.15, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    if (reduced) {
      // Build up each comet's tail once, then draw a single static frame.
      for (let i = 0; i < TAIL; i++) advance(0, false);
      drawAll(false);
      return () => ro.disconnect();
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    let raf = 0;
    let last = 0;
    let running = true;
    const frameMs = 1000 / 30;
    const loop = (time: number) => {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      if (time - last < frameMs) return;
      last = time;
      // Clear fully each frame: particles leave NO lingering trail — only their
      // attached comet tail, which moves with them.
      ctx.clearRect(0, 0, w, h);
      advance(time, true);
      drawAll(true);
    };
    raf = requestAnimationFrame(loop);

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
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [variant, globalPointer, density]);

  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 28%, transparent 46%, rgba(2,9,18,0.42) 100%)",
        }}
      />
    </div>
  );
}
