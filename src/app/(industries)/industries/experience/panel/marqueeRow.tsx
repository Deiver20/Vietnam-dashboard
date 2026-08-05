import { cloneElement, isValidElement, useEffect, useRef, type ReactElement } from "react";
import styled from "styled-components";

// Perpetual horizontal ticker shared by the three bottom carousels (data
// variables, industry picker, country picker). Content plays forever at a
// constant speed, but the user can freely pan it either direction (wheel /
// trackpad) at any time — three seconds after the last manual input, the
// autoplay picks back up from wherever the row was left. Cards fade in/out
// at the edges (mask-image) rather than being sliced by the container
// boundary, and vertical padding + an equal negative margin give hover
// lift (-translate-y) room to breathe without the overflow clip cutting
// into the card (the padding enlarges the clipping box; the negative
// margin cancels it back out of the parent's layout, so nothing shifts).
const CLIP_PAD = 12;
const IDLE_MS = 3000;
const DRAG_THRESHOLD = 6;

const Viewport = styled.div`
  position: relative;
  width: 100%;
  padding: ${CLIP_PAD}px 0;
  margin: -${CLIP_PAD}px 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  pointer-events: auto;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  &::-webkit-scrollbar {
    display: none;
  }
  -webkit-mask-image: linear-gradient(
    90deg,
    transparent 0,
    #000 56px,
    #000 calc(100% - 56px),
    transparent 100%
  );
  mask-image: linear-gradient(
    90deg,
    transparent 0,
    #000 56px,
    #000 calc(100% - 56px),
    transparent 100%
  );
`;

const Track = styled.div<{ $gap: number }>`
  display: flex;
  width: max-content;
  gap: ${(p) => p.$gap}px;
`;

const Set = styled.div<{ $gap: number }>`
  display: flex;
  gap: ${(p) => p.$gap}px;
  flex-shrink: 0;
`;

export default function MarqueeRow({
  children,
  pxPerSec = 45,
  gap = 14,
}: {
  /** Already-keyed card elements — duplicated once to form the seamless loop. */
  children: ReactElement[];
  pxPerSec?: number;
  gap?: number;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  // 0 (not "just now") so autoplay is already due on mount.
  const lastInputRef = useRef(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    // Content is doubled (Set + an identical duplicate); position s and
    // s ± one set's width show identical pixels, so any target can be
    // normalized into [0, loopWidth) BEFORE assigning. Wrapping after the
    // fact doesn't work leftward: the browser clamps scrollLeft at 0, so it
    // never goes negative and the row would stick at the left end.
    const normalize = (target: number) => {
      const loopWidth = track.scrollWidth / 2;
      if (loopWidth <= 0) return target;
      while (target < 0) target += loopWidth;
      while (target >= loopWidth) target -= loopWidth;
      return target;
    };

    const onWheel = (e: WheelEvent) => {
      // The scene owns vertical wheel elsewhere; over the carousel both
      // wheel axes pan the row so a plain mouse wheel works same as a
      // trackpad's horizontal swipe.
      viewport.scrollLeft = normalize(viewport.scrollLeft + e.deltaY + e.deltaX);
      lastInputRef.current = Date.now();
    };
    viewport.addEventListener("wheel", onWheel, { passive: true });

    // Native touch scroll clamps at the real edges too — teleport by one
    // set's width when it lands there so a swipe can keep going either way.
    let teleporting = false;
    const onScroll = () => {
      if (teleporting) {
        teleporting = false;
        return;
      }
      const loopWidth = track.scrollWidth / 2;
      if (loopWidth <= 0) return;
      if (viewport.scrollLeft <= 0) {
        teleporting = true;
        viewport.scrollLeft += loopWidth;
      } else if (viewport.scrollLeft >= loopWidth) {
        teleporting = true;
        viewport.scrollLeft -= loopWidth;
      }
    };
    viewport.addEventListener("scroll", onScroll, { passive: true });

    // Click-and-drag panning — mouse only; touch already gets native scroll
    // from overflow-x:auto, and duplicating that in JS would fight it.
    let drag: {
      startX: number;
      startScroll: number;
      moved: boolean;
      pointerId: number;
    } | null = null;

    const suppressNextClick = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = {
        startX: e.clientX,
        startScroll: viewport.scrollLeft,
        moved: false,
        pointerId: e.pointerId,
      };
      lastInputRef.current = Date.now();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.pointerId) return;
      const dx = e.clientX - drag.startX;
      if (!drag.moved && Math.abs(dx) > DRAG_THRESHOLD) {
        drag.moved = true;
        // Capture only once a real drag is confirmed — capturing on every
        // press (even a plain click) redirects the click's target to this
        // element instead of the card underneath, silently swallowing card
        // clicks (industry/country selection, view-data buttons, …).
        viewport.setPointerCapture(drag.pointerId);
        viewport.style.cursor = "grabbing";
      }
      if (drag.moved) {
        // Wrap the DESIRED position (and shift the drag origin with it) so a
        // long leftward drag crosses the seam instead of clamping at 0.
        const loopWidth = track.scrollWidth / 2;
        let target = drag.startScroll - dx;
        if (loopWidth > 0) {
          while (target < 0) {
            target += loopWidth;
            drag.startScroll += loopWidth;
          }
          while (target >= loopWidth) {
            target -= loopWidth;
            drag.startScroll -= loopWidth;
          }
        }
        viewport.scrollLeft = target;
      }
      lastInputRef.current = Date.now();
    };

    const endDrag = (e: PointerEvent) => {
      if (!drag) return;
      if (viewport.hasPointerCapture(e.pointerId)) viewport.releasePointerCapture(e.pointerId);
      viewport.style.cursor = "grab";
      if (drag.moved) {
        // A real drag shouldn't also fire the click a card listens for
        // (selecting an industry/country, opening a data page, …).
        viewport.addEventListener("click", suppressNextClick, { capture: true, once: true });
      }
      drag = null;
      lastInputRef.current = Date.now();
    };

    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);

    let raf: number;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      if (Date.now() - lastInputRef.current > IDLE_MS) {
        viewport.scrollLeft = normalize(viewport.scrollLeft + pxPerSec * dt);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("scroll", onScroll);
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", endDrag);
      viewport.removeEventListener("pointercancel", endDrag);
      viewport.removeEventListener("click", suppressNextClick, { capture: true });
      cancelAnimationFrame(raf);
    };
  }, [pxPerSec]);

  return (
    <Viewport ref={viewportRef}>
      <Track ref={trackRef} $gap={gap}>
        <Set $gap={gap}>{children}</Set>
        <Set $gap={gap} aria-hidden="true">
          {children.map((el) =>
            isValidElement(el) ? cloneElement(el, { key: `dup-${el.key}` }) : el
          )}
        </Set>
      </Track>
    </Viewport>
  );
}
