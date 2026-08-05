import { useEffect, useRef } from "react";

export interface SnapWheelOptions {
  onNext: () => void;
  onPrev: () => void;
  /** Read live (never a stale value) — gestures are dropped while it's true. */
  locked?: () => boolean;
  /** Accumulated |deltaY| needed to fire. */
  threshold?: number;
  /** Milliseconds after firing before another gesture may fire. */
  cooldown?: number;
}

/**
 * Fullpage-style snap gestures: one wheel flick / touch swipe = exactly one
 * onNext/onPrev call. After firing, events are swallowed until the cooldown
 * elapses AND the wheel deltas go quiet, so trackpad inertia can't fire twice.
 */
export default function useSnapWheel(options: SnapWheelOptions) {
  const cbRef = useRef(options);
  cbRef.current = options;

  useEffect(() => {
    const threshold = cbRef.current.threshold ?? 40;
    const cooldown = cbRef.current.cooldown ?? 700;

    let acc = 0;
    let lockUntil = 0;
    let lastEventAt = 0;
    let swallowing = false;

    const fire = (dir: 1 | -1) => {
      lockUntil = performance.now() + cooldown;
      lastEventAt = performance.now();
      swallowing = true;
      acc = 0;
      if (dir === 1) cbRef.current.onNext();
      else cbRef.current.onPrev();
    };

    const handleWheel = (e: WheelEvent) => {
      // Overlay panels (e.g. the Leva editor) and any region marked
      // data-native-wheel keep native wheel scrolling.
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("[class*='leva-']")) return;
      if (target?.closest?.("[data-native-wheel]")) return;
      e.preventDefault();
      const now = performance.now();
      const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      const delta = e.deltaY * scale;

      if (swallowing) {
        if (now < lockUntil || now - lastEventAt < 150) {
          lastEventAt = now;
          return;
        }
        swallowing = false;
      }
      lastEventAt = now;

      if (cbRef.current.locked?.()) {
        acc = 0;
        return;
      }

      acc += delta;
      if (Math.abs(acc) >= threshold) fire(acc > 0 ? 1 : -1);
    };

    let touchStartY: number | null = null;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? null;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartY === null) return;
      const dy = touchStartY - (e.changedTouches[0]?.clientY ?? touchStartY);
      touchStartY = null;
      if (Math.abs(dy) < 60) return;
      if (performance.now() < lockUntil) return;
      if (cbRef.current.locked?.()) return;
      fire(dy > 0 ? 1 : -1);
    };

    window.addEventListener("wheel", handleWheel, {
      passive: false,
      capture: true,
    });
    window.addEventListener("touchstart", handleTouchStart, { capture: true });
    window.addEventListener("touchend", handleTouchEnd, { capture: true });

    return () => {
      window.removeEventListener("wheel", handleWheel, { capture: true });
      window.removeEventListener("touchstart", handleTouchStart, {
        capture: true,
      });
      window.removeEventListener("touchend", handleTouchEnd, {
        capture: true,
      });
    };
  }, []);
}
