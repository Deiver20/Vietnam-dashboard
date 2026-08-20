"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import type { Coords, MapItem } from "@/interfaces/marketplace/interface";
import { ITEM_BY_ID } from "@/app/(marketplace)/marketplace/marketplaceData";
import {
  GREEN,
  BLUE,
  GLOBE_VB,
  clamp,
  shortLon,
  easeInOut,
  visibleOnGlobe,
  clusterItems,
  type Cluster,
} from "@/app/(marketplace)/marketplace/marketplaceMapHelpers";
import { useMarketplaceFilters } from "./useMarketplaceFilters";

/** The globe's resting orientation (initial view). */
const GLOBE_HOME: Coords = [-50, 12];
/** Idle time after a manual spin before the globe returns home. */
const IDLE_RESET_MS = 5000;

/* ── Globe zoom — the /industries dolly, transplanted ──
   Same camera constants as the industries scene (fov 45, unit sphere, wheel
   dollies between 2.2 and 3.85 world units, resting at |(0, 0.3, 3.8)|, wheel
   sensitivity 0.0012, exponential 8/s smoothing), converted to an
   orthographic projection scale so both globes render at the SAME apparent
   size and zoom identically. */
const ZOOM_MIN = 2.2; // /industries GLOBE_ZOOM_MIN
const ZOOM_MAX = 3.85; // /industries GLOBE_ZOOM_MAX
const ZOOM_HOME = Math.hypot(0.3, 3.8); // |/industries CAM_HOME|
const FOV_TAN = Math.tan((45 * Math.PI) / 360); // half of the 45° fov
/* A unit sphere seen from distance d fills tan(asin(1/d))/tan(fov/2) of the
   viewport height; the SVG's square viewBox is fit ("meet") to the stage,
   whose height is 95% of the viewport (top-[5%]), hence the /1.9. */
const scaleForDist = (d: number) =>
  ((Math.tan(Math.asin(1 / d)) / FOV_TAN) * GLOBE_VB) / 1.9;

/** Owns all state, refs, effects, derived data and handlers for the
 *  marketplace map (list / globe / flat views). */
export function useMarketplaceMap() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"globe" | "flat" | "list">("list");
  const [rotation, setRotation] = useState<Coords>(GLOBE_HOME);
  const [globeScale, setGlobeScale] = useState(() => scaleForDist(ZOOM_HOME));
  // Wheel target and smoothed current dolly distance (world units, as in
  // /industries — the scale is derived from the distance each frame).
  const zoomTargetRef = useRef(ZOOM_HOME);
  const zoomCurRef = useRef(ZOOM_HOME);
  const [panelItems, setPanelItems] = useState<MapItem[] | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  // ── Filters (shared by List, Globe and Map views) ──
  const filters = useMarketplaceFilters();
  const { filteredItems } = filters;

  // refs read inside the rAF loop / pointer handlers (always current)
  const rotationRef = useRef(rotation);
  const draggingRef = useRef(false);
  const hoverRef = useRef(false);
  const panelOpenRef = useRef(false);
  const tweenRef = useRef<{
    fromLon: number;
    fromLat: number;
    toLon: number;
    toLat: number;
    // Optional dolly track — when set, the zoom eases along the same curve
    // as the rotation (used by the idle return-home so both reset together).
    fromDist?: number;
    toDist?: number;
    t: number;
    dur: number;
  } | null>(null);
  const dragRef = useRef<{ x: number; y: number; lon: number; lat: number } | null>(null);
  const movedRef = useRef(false);
  // Armed after a manual spin: when it elapses (and nothing else is going on)
  // the globe tweens back to its resting orientation.
  const idleResetAtRef = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const inViewRef = useRef(true);
  // Horizontal scroll container for the rectangular (flat) map.
  const flatScrollRef = useRef<HTMLDivElement>(null);
  const flatDragRef = useRef<{ x: number; startX: number } | null>(null);

  // The map projects geometry with trig that differs in last-digit precision
  // between the Node SSR pass and the browser, so render it client-only.
  // `?view=globe|flat|list` deep-links straight into a view (used by the
  // navbar's /industries ↔ /marketplace cross-links); read via
  // window.location instead of useSearchParams so no Suspense boundary is
  // needed at prerender time.
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("view");
    if (v === "globe" || v === "flat" || v === "list") setMode(v);
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);
  useEffect(() => {
    panelOpenRef.current = !!panelItems;
  }, [panelItems]);

  const activeItem = activeItemId ? ITEM_BY_ID[activeItemId] : null;

  // Hovering a marker paints that item's dispatch ports/routes; otherwise the
  // selected (active) item's routes stay on the map.
  const hoverItem = hoverId ? ITEM_BY_ID[hoverId] ?? null : null;
  const routeItem = hoverItem ?? activeItem;
  const routeProduct = routeItem ? routeItem.product : null;
  const flowColor = routeItem?.kind === "offer" ? GREEN : BLUE;

  // Map markers cluster the *filtered* items so the filters drive every view.
  const clusters = useMemo(
    () => clusterItems(filteredItems, mode === "flat" ? 4 : 6),
    [filteredItems, mode]
  );

  /* ── Globe animation loop (auto-rotate + selection tween) ── */
  useEffect(() => {
    if (mode !== "globe") return;
    let raf = 0;
    let last: number | undefined;
    const loop = (now: number) => {
      const dt = last === undefined ? 0 : now - last;
      last = now;
      // Smooth dolly toward the wheel target — same 8/s exponential approach
      // as the /industries camera lock.
      const curD = zoomCurRef.current;
      const nextD = curD + (zoomTargetRef.current - curD) * Math.min(1, (dt / 1000) * 8);
      if (Math.abs(nextD - curD) > 1e-4) {
        zoomCurRef.current = nextD;
        setGlobeScale(scaleForDist(nextD));
      }
      const tw = tweenRef.current;
      if (tw) {
        tw.t += dt;
        const k = Math.min(1, tw.t / tw.dur);
        const e = easeInOut(k);
        setRotation([
          tw.fromLon + shortLon(tw.toLon - tw.fromLon) * e,
          tw.fromLat + (tw.toLat - tw.fromLat) * e,
        ]);
        if (tw.fromDist !== undefined && tw.toDist !== undefined) {
          const d = tw.fromDist + (tw.toDist - tw.fromDist) * e;
          // Pin current AND target so the per-frame smoothing above never
          // fights the tween.
          zoomCurRef.current = d;
          zoomTargetRef.current = d;
          setGlobeScale(scaleForDist(d));
        }
        if (k >= 1) tweenRef.current = null;
      } else if (
        inViewRef.current &&
        !draggingRef.current &&
        !hoverRef.current &&
        !panelOpenRef.current
      ) {
        // After a manual spin sat untouched for IDLE_RESET_MS, glide back to
        // the resting orientation, then resume the normal idle rotation.
        if (idleResetAtRef.current !== null && now >= idleResetAtRef.current) {
          idleResetAtRef.current = null;
          const from = rotationRef.current;
          tweenRef.current = {
            fromLon: from[0],
            fromLat: from[1],
            toLon: GLOBE_HOME[0],
            toLat: GLOBE_HOME[1],
            // The reset also undoes any wheel zoom — one glide back to the
            // full resting view.
            fromDist: zoomCurRef.current,
            toDist: ZOOM_HOME,
            t: 0,
            dur: 1200,
          };
        } else {
          // The idle drift fires every frame forever — as an urgent update it
          // starves React's route transitions (nav clicks away from the globe
          // never commit). As a transition it entangles with navigation and
          // both complete.
          startTransition(() => setRotation((r) => [r[0] + dt * 0.004, r[1]]));
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  /* ── Flat-map horizontal scroll helpers (the world is rendered 3× for
        seamless infinite horizontal scrolling) ── */
  function centerFlat() {
    const el = flatScrollRef.current;
    if (!el) return;
    const w = el.scrollWidth / 3; // one world width
    el.scrollLeft = 1.5 * w - el.clientWidth / 2; // middle copy, centered
  }
  function scrollFlatToLon(lon: number, smooth: boolean) {
    const el = flatScrollRef.current;
    if (!el) return;
    const w = el.scrollWidth / 3;
    const frac = (lon + 180) / 360;
    el.scrollTo({ left: (1 + frac) * w - el.clientWidth / 2, behavior: smooth ? "smooth" : "auto" });
  }
  // Wrap by one world width whenever we drift off the centre copy → infinite loop.
  function onFlatScroll() {
    const el = flatScrollRef.current;
    if (!el) return;
    const w = el.scrollWidth / 3;
    if (w <= 0) return;
    if (el.scrollLeft < 0.5 * w) el.scrollLeft += w;
    else if (el.scrollLeft > 1.5 * w) el.scrollLeft -= w;
  }

  // Keep the flat map centered on the active offer; recenter when the sidebar
  // opens/closes (which resizes the map) — runs after layout settles.
  useEffect(() => {
    if (mode !== "flat" || !mounted) return;
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const active = activeItemId ? ITEM_BY_ID[activeItemId] : null;
        if (active) scrollFlatToLon(active.coords[0], true);
        else centerFlat();
      })
    );
    return () => cancelAnimationFrame(id);
  }, [mode, mounted, activeItemId, panelItems]);

  /* ── Focus the map on a given item (globe only; flat is handled above) ── */
  function focusOn(it: MapItem) {
    if (mode !== "globe") return;
    const [lon, lat] = it.coords;
    const from = rotationRef.current;
    tweenRef.current = {
      fromLon: from[0],
      fromLat: from[1],
      toLon: lon + 16,
      toLat: clamp(lat, -72, 72),
      t: 0,
      dur: 750,
    };
  }

  /* Opening a detail unmounts the hovered cluster marker, so its mouseleave
     never fires — clear the hover state by hand or the last hovered card comes
     back stuck when the sidebar closes. */
  function clearHover() {
    setHoverId(null);
    hoverRef.current = false;
  }

  function openItem(it: MapItem, list?: MapItem[]) {
    if (list) setPanelItems(list);
    else if (!panelItems || !panelItems.some((x) => x.id === it.id)) setPanelItems([it]);
    setActiveItemId(it.id);
    clearHover();
    focusOn(it);
  }

  function handleClusterClick(c: Cluster) {
    if (c.items.length === 1) openItem(c.items[0]);
    else {
      setPanelItems(c.items);
      setActiveItemId(null);
      clearHover();
    }
  }

  function closePanel() {
    setPanelItems(null);
    setActiveItemId(null);
    clearHover();
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Pause the globe's idle auto-rotation when the section is off-screen.
  // Re-observe on view change: each view (list / map) mounts its own <section>,
  // so the observed node is swapped when `mode` changes.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mode, mounted]);

  /* ── Pointer drag (globe rotation) + click-to-close tracking ── */
  function onPointerDown(e: React.PointerEvent) {
    movedRef.current = false;
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      lon: rotationRef.current[0],
      lat: rotationRef.current[1],
    };
    if (mode === "globe") {
      draggingRef.current = true;
      tweenRef.current = null;
    }
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) movedRef.current = true;
    if (mode === "globe" && draggingRef.current) {
      setRotation([d.lon - dx * 0.35, clamp(d.lat + dy * 0.35, -82, 82)]);
    }
  }
  function onPointerUp() {
    // A real spin (not just a click) arms the return-home idle timer.
    if (mode === "globe" && draggingRef.current && movedRef.current) {
      idleResetAtRef.current = performance.now() + IDLE_RESET_MS;
    }
    draggingRef.current = false;
    dragRef.current = null;
  }
  function onStageClick() {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    closePanel();
  }

  // Wheel zoom on the globe — same deltaMode scaling and 0.0012 sensitivity
  // as /industries; the rAF loop above eases toward the new target.
  function onStageWheel(e: React.WheelEvent) {
    if (mode !== "globe") return;
    const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 800 : 1;
    zoomTargetRef.current = clamp(
      zoomTargetRef.current + e.deltaY * scale * 0.0012,
      ZOOM_MIN,
      ZOOM_MAX
    );
    // Zooming counts as activity too — arm the same return-home idle timer
    // a drag does, so a zoomed-in globe also glides back after 5s afk.
    idleResetAtRef.current = performance.now() + IDLE_RESET_MS;
  }

  /* ── Flat map: drag-to-scroll horizontally (mouse); touch uses native pan-x.
        Incremental so it plays nicely with the infinite-scroll wrap. ── */
  function onFlatPointerDown(e: React.PointerEvent) {
    movedRef.current = false;
    if (e.pointerType !== "mouse") return;
    flatDragRef.current = { x: e.clientX, startX: e.clientX };
  }
  function onFlatPointerMove(e: React.PointerEvent) {
    const d = flatDragRef.current;
    if (!d || !flatScrollRef.current) return;
    flatScrollRef.current.scrollLeft -= e.clientX - d.x;
    d.x = e.clientX;
    if (Math.abs(e.clientX - d.startX) > 4) movedRef.current = true;
  }
  function onFlatPointerUp() {
    flatDragRef.current = null;
  }

  function switchMode(next: "globe" | "flat" | "list") {
    if (next === mode) return;
    setMode(next);
    // Keep `?view=` in sync so refresh/shared links land on the same view.
    const url = new URL(window.location.href);
    if (next === "list") url.searchParams.delete("view");
    else url.searchParams.set("view", next);
    window.history.replaceState(window.history.state, "", url);
    // Globe re-focuses the active offer via a rotation tween; the flat map is
    // re-centered by the [mode, mounted] effect once it has laid out.
    if (next === "globe" && activeItem) {
      const it = activeItem;
      requestAnimationFrame(() => {
        tweenRef.current = {
          fromLon: rotationRef.current[0],
          fromLat: rotationRef.current[1],
          toLon: it.coords[0] + 16,
          toLat: clamp(it.coords[1], -72, 72),
          t: 0,
          dur: 600,
        };
      });
    }
  }

  // Marker scale: the globe uses a small (560) square viewBox vs the flat 1000,
  // so markers are scaled per mode to look consistent and not oversized.
  const s = mode === "globe" ? 0.6 : 0.45;
  const isVisible = (p: Coords) => mode !== "globe" || visibleOnGlobe(p, rotation);

  // Visible clusters, ordered so a hovered marker paints last (its card on top).
  const sortedClusters = clusters
    .filter((c) => isVisible(c.coords))
    .map((c) => ({ c, rank: hoverId && c.items.some((i) => i.id === hoverId) ? 1 : 0 }))
    .sort((a, b) => a.rank - b.rank);

  return {
    // filters (state, option lists, derived listings, reset)
    ...filters,
    // view state
    mounted, mode, switchMode, rotation, globeScale,
    panelItems, activeItem, activeItemId, setActiveItemId,
    hoverId, setHoverId,
    // refs
    sectionRef, flatScrollRef, hoverRef,
    // derived render data
    sortedClusters, s, isVisible,
    routeItem, routeProduct, flowColor,
    // handlers
    handleClusterClick, openItem, closePanel,
    onPointerDown, onPointerMove, onPointerUp, onStageClick, onStageWheel,
    onFlatScroll, onFlatPointerDown, onFlatPointerMove, onFlatPointerUp,
  };
}

export type MarketplaceController = ReturnType<typeof useMarketplaceMap>;
