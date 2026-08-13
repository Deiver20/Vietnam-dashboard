"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MarkerTooltip,
  type MapStyleOption,
} from "@/components/ui/map";
import type { RouteDestination } from "./traderCoordinates";
import {
  calculateStrategicView,
  formatValueDefault,
  DETAIL_ZOOM,
  LABEL_ZOOM,
  MAX_ZOOM,
} from "./mapUtils";
import { useTradeTheme } from "./TradeThemeContext";

const osmStyle: MapStyleOption = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

export interface RouteOrigin {
  name: string;
  coordinates: [number, number];
  value: number;
  color: string;
  productos?: string[];
}

interface TradeRoutesMapProps {
  origins: RouteOrigin[];
  destination: RouteDestination;
  height?: number;
  unit?: string;
  valueFormatter?: (val: number) => string;
}

export function TradeRoutesMap({
  origins,
  destination,
  height = 460,
  unit = "",
  valueFormatter,
}: TradeRoutesMapProps) {
  const T = useTradeTheme();
  const dark = T.mode === "dark";

  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const allPoints = useMemo<[number, number][]>(
    () => [...origins.map((o) => o.coordinates), destination.coordinates],
    [origins, destination]
  );

  const initialView = useMemo(() => calculateStrategicView(allPoints), [allPoints]);
  const [zoom, setZoom] = useState(initialView.zoom);
  const [center, setCenter] = useState<[number, number]>([
    initialView.center[0],
    initialView.center[1],
  ]);
  const [resetTick, setResetTick] = useState(0);

  // Auto-fit (Power BI-style): re-frame every time the underlying points change
  // so the new bubbles are always fully visible.
  const lastPointsRef = useRef<[number, number][] | null>(null);
  useEffect(() => {
    const key = allPoints.map((p) => `${p[0]},${p[1]}`).join("|");
    const prevKey = lastPointsRef.current
      ? lastPointsRef.current.map((p) => `${p[0]},${p[1]}`).join("|")
      : null;
    lastPointsRef.current = allPoints;
    if (key === prevKey) return;
    const strategic = calculateStrategicView(allPoints);
    setZoom(strategic.zoom);
    setCenter([strategic.center[0], strategic.center[1]]);
    setResetTick((t) => t + 1);
  }, [allPoints]);

  const mapWrapRef = useRef<HTMLDivElement>(null);

  const formatValue = useCallback(
    (val: number) =>
      valueFormatter
        ? valueFormatter(val)
        : `${formatValueDefault(val)}${unit ? ` ${unit}` : ""}`,
    [valueFormatter, unit]
  );

  // Aclara un color de marker para que el número se lea sobre el fondo oscuro
  // del tooltip en dark mode (el azul #03488D casi no contrasta).
  const markerReadableColor = useCallback(
    (color: string) => {
      if (!dark) return color;
      const hex = color.startsWith("#") ? color.slice(1) : color;
      if (!/^[0-9a-fA-F]{6}$/.test(hex)) return color;
      const mix = (c: number) =>
        Math.round(c * 0.55 + 255 * 0.45);
      const r = mix(parseInt(hex.slice(0, 2), 16));
      const g = mix(parseInt(hex.slice(2, 4), 16));
      const b = mix(parseInt(hex.slice(4, 6), 16));
      return `rgb(${r}, ${g}, ${b})`;
    },
    [dark]
  );

  const maxValue = useMemo(
    () => Math.max(...origins.map((m) => m.value), 1),
    [origins]
  );
  const totalValue = useMemo(
    () => origins.reduce((s, m) => s + m.value, 0),
    [origins]
  );

  const sortedOrigins = useMemo(
    () => [...origins].sort((a, b) => b.value - a.value),
    [origins]
  );

  const getMarkerSize = useCallback(
    (value: number) => {
      const minR = 14;
      const maxR = 52;
      const ratio = Math.sqrt(value / maxValue);
      return minR + ratio * (maxR - minR);
    },
    [maxValue]
  );

  const detailLabel = useMemo(() => {
    if (zoom > LABEL_ZOOM) return "Country Detail";
    if (zoom > DETAIL_ZOOM) return "High Resolution";
    return "Global";
  }, [zoom]);

  const showAllLabels = zoom >= LABEL_ZOOM;

  const onViewportChange = useCallback(
    (v: { center: [number, number]; zoom: number }) => {
      setZoom(v.zoom);
      setCenter(v.center);
    },
    []
  );

  const handleReset = useCallback(() => {
    const strategic = calculateStrategicView(allPoints);
    setZoom(strategic.zoom);
    setCenter([strategic.center[0], strategic.center[1]]);
    setResetTick((t) => t + 1);
  }, [allPoints]);

  // Click a company on the sidebar → select + focus its location (Power BI-style).
  const handleFocusOrigin = useCallback(
    (name: string, coords: [number, number]) => {
      setSelectedName((prev) => (prev === name ? null : name));
      setCenter([coords[0], coords[1]]);
      setZoom(8);
      setResetTick((t) => t + 1);
    },
    []
  );

  // A filter/selection is active when hovering a sidebar item, an arc, or a
  // marker, or when a company was clicked on the sidebar.
  const activeName = hoveredName ?? selectedName;
  const anyActive = activeName !== null;

  useEffect(() => {
    const canvas = mapWrapRef.current?.querySelector(
      ".maplibregl-canvas"
    ) as HTMLCanvasElement | null;
    if (!canvas) return;
    if (dark) {
      canvas.style.filter =
        "invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.9)";
    } else {
      canvas.style.filter = "";
    }
  }, [dark, resetTick, zoom]);

  const fontQ = "var(--font-poppins), Poppins, sans-serif";
  const responsiveMinHeight = Math.max(300, height - 180);

  return (
    <div
      className="flex overflow-hidden rounded-[14px] border"
      style={{
        height: `clamp(${responsiveMinHeight}px, 70vw, ${height}px)`,
        borderColor: dark ? "rgba(102,166,255,0.18)" : "#e5e7eb",
      }}
    >
      <div
        className="hidden w-[220px] flex-shrink-0 flex-col md:flex md:w-[180px] lg:w-[220px]"
        style={{
          borderRight: `1px solid ${
            dark ? "rgba(102,166,255,0.10)" : "#e5e7eb"
          }`,
        }}
      >
        <div
          className="border-b px-4 py-3"
          style={{
            borderColor: dark ? "rgba(102,166,255,0.10)" : "#e5e7eb",
            background: dark ? "rgba(102,166,255,0.05)" : "rgba(249,250,251,0.5)",
          }}
        >
          <div
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: dark ? "#9fb0c9" : "#6b7280" }}
          >
            Trade Routes
          </div>
          <div
            className="mt-0.5 text-[10px]"
            style={{ color: dark ? "#7d8aa0" : "#9ca3af" }}
          >
            {origins.length} origins · {formatValue(totalValue)} total
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {sortedOrigins.map((m) => {
            const isHovered = hoveredName === m.name;
            const isSelected = selectedName === m.name;
            const dimmed = anyActive && !isHovered && !isSelected;
            return (
              <div
                key={m.name}
                className="flex cursor-pointer items-center gap-3 border-l-[3px] px-4 py-2.5 transition-all"
                style={{
                  borderColor: isSelected
                    ? dark
                      ? "rgba(102,166,255,0.9)"
                      : "#2563eb"
                    : isHovered
                      ? dark
                        ? "rgba(102,166,255,0.6)"
                        : "#60a5fa"
                      : "transparent",
                  background: isSelected
                    ? dark
                      ? "rgba(83,140,255,0.28)"
                      : "rgba(219,234,254,0.95)"
                    : isHovered
                      ? dark
                        ? "rgba(83,140,255,0.16)"
                        : "rgba(239,246,255,0.8)"
                      : "transparent",
                  opacity: dimmed ? 0.4 : 1,
                  transition: "all 0.2s",
                }}
                onMouseEnter={() => setHoveredName(m.name)}
                onMouseLeave={() => setHoveredName(null)}
                onClick={() => handleFocusOrigin(m.name, m.coordinates)}
              >
                <div
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{
                    backgroundColor: m.color,
                    boxShadow: isHovered ? `0 0 8px ${m.color}` : "none",
                    transition: "box-shadow 0.2s",
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div
                    className="truncate text-[12px] font-medium leading-tight"
                    style={{ color: dark ? "#c5c6cc" : "#374151" }}
                  >
                    {m.name}
                  </div>
                  <div
                    className="text-[11px] font-semibold leading-tight"
                    style={{ color: m.color }}
                  >
                    {formatValue(m.value)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="relative flex-1"
        style={{ background: dark ? "#04101f" : "#dde6f0" }}
      >
        <div ref={mapWrapRef} className="h-full w-full">
          <Map
            theme={dark ? "dark" : "light"}
            styles={{ light: osmStyle, dark: osmStyle }}
            viewport={{ center, zoom }}
            onViewportChange={onViewportChange}
            minZoom={1}
            maxZoom={MAX_ZOOM}
            attributionControl={{ compact: true }}
          >
            {origins.map((m) => {
              const isHovered = hoveredName === m.name;
              const isSelected = selectedName === m.name;
              const dimmed = anyActive && !isHovered && !isSelected;
              const showLabel = isHovered || isSelected || showAllLabels;
              const size = getMarkerSize(m.value);
              return (
                <MapMarker
                  key={`o-${m.name}`}
                  longitude={m.coordinates[0]}
                  latitude={m.coordinates[1]}
                  onMouseEnter={() => setHoveredName(m.name)}
                  onMouseLeave={() => setHoveredName(null)}
                >
                  <MarkerContent>
                    <div
                      className="relative cursor-pointer transition-all"
                      style={{
                        width: size,
                        height: size,
                        transform: isSelected || isHovered ? "scale(1.3)" : "scale(1)",
                        transformOrigin: "center",
                        opacity: dimmed ? 0.18 : 1,
                      }}
                    >
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: m.color, opacity: 0.18 }}
                      />
                      <div
                        className="absolute rounded-full border-2 border-white"
                        style={{
                          inset: size * 0.18,
                          backgroundColor: m.color,
                          boxShadow: isSelected
                            ? `0 0 0 3px ${dark ? "#fff" : "#1f2937"}, 0 0 18px ${m.color}`
                            : `0 2px 6px ${m.color}99`,
                        }}
                      />
                    </div>
                  </MarkerContent>
                  <MarkerTooltip
                    style={{
                      background: dark ? "rgba(8, 20, 40, 0.97)" : "rgba(255, 255, 255, 0.98)",
                      color: dark ? "#e8eefc" : "#1f2937",
                      border: `1px solid ${dark ? "rgba(102, 166, 255, 0.25)" : "rgba(6, 37, 75, 0.15)"}`,
                      boxShadow: dark
                        ? "0 14px 36px rgba(0, 0, 0, 0.5)"
                        : "0 14px 36px rgba(6, 37, 75, 0.12)",
                    }}
                  >
                    <div
                      className="max-w-[220px] text-left"
                      style={{ fontFamily: fontQ }}
                    >
                      <div
                        className="truncate text-[11px] font-bold leading-tight"
                        style={{ color: dark ? "#e8eefc" : "#1f2937" }}
                      >
                        {m.name}
                      </div>
                      <div
                        className="mt-0.5 text-[11px] font-bold leading-tight"
                        style={{ color: markerReadableColor(m.color) }}
                      >
                        {formatValue(m.value)}
                      </div>
                      {Array.isArray(m.productos) && m.productos.length > 0 && (
                        <div
                          className="mt-1 border-t pt-1"
                          style={{ borderColor: dark ? "rgba(102, 166, 255, 0.2)" : "rgba(6, 37, 75, 0.12)" }}
                        >
                          <div
                            className="text-[9px] font-semibold uppercase tracking-wider"
                            style={{ color: dark ? "#9aa7bd" : "#5a6478" }}
                          >
                            Productos
                          </div>
                          <div className="mt-0.5 flex flex-wrap gap-1">
                            {m.productos.slice(0, 6).map((p) => (
                              <span
                                key={p}
                                className="rounded px-1.5 py-0.5 text-[9px] font-medium"
                                style={{
                                  background: dark
                                    ? "rgba(102, 166, 255, 0.14)"
                                    : "rgba(6, 37, 75, 0.08)",
                                  color: dark ? "#c5c6cc" : "#334155",
                                }}
                              >
                                {p}
                              </span>
                            ))}
                            {m.productos.length > 6 && (
                              <span className="text-[9px] font-medium opacity-70">
                                +{m.productos.length - 6} más
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </MarkerTooltip>
                  {showLabel && (
                    <MarkerLabel position="top">
                      <div
                        className="rounded-md border px-2 py-1 shadow-md"
                        style={{
                          background: dark
                            ? "rgba(8,20,40,0.95)"
                            : "rgba(255,255,255,0.97)",
                          borderColor: m.color,
                          fontFamily: fontQ,
                          minWidth: 90,
                          textAlign: "center",
                        }}
                      >
                        <div
                          className="text-[11px] font-bold leading-tight"
                          style={{ color: dark ? "#e8eefc" : "#1f2937" }}
                        >
                          {m.name}
                        </div>
                        <div
                          className="text-[10px] font-semibold leading-tight"
                          style={{ color: m.color }}
                        >
                          {formatValue(m.value)}
                        </div>
                      </div>
                    </MarkerLabel>
                  )}
                </MapMarker>
              );
            })}

          </Map>
        </div>

        <div className="absolute right-3 top-3 z-10 flex flex-col gap-1">
          <button
            onClick={handleReset}
            className="flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm backdrop-blur-sm transition-all"
            style={{
              fontFamily: fontQ,
              fontSize: 12,
              fontWeight: 600,
              background: dark ? "rgba(10,22,44,0.85)" : "rgba(255,255,255,0.9)",
              borderColor: dark ? "rgba(102,166,255,0.22)" : "#e5e7eb",
              color: dark ? "#c3cbe0" : "#4b5563",
            }}
            title="Reset view"
          >
            ⌖
          </button>
        </div>

        <div
          className="absolute left-3 top-3 z-10 rounded-lg border px-2.5 py-1 shadow-sm backdrop-blur-sm"
          style={{
            background: dark ? "rgba(10,22,44,0.85)" : "rgba(255,255,255,0.9)",
            borderColor: dark ? "rgba(102,166,255,0.22)" : "#e5e7eb",
          }}
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: dark ? "#9fb0c9" : "#6b7280" }}
          >
            {detailLabel}
          </span>
        </div>

        <div
          className="absolute bottom-3 right-3 rounded-lg border px-3 py-2 shadow-sm backdrop-blur-sm"
          style={{
            background: dark ? "rgba(10,22,44,0.85)" : "rgba(255,255,255,0.9)",
            borderColor: dark ? "rgba(102,166,255,0.22)" : "#e5e7eb",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ background: dark ? "#4b5b7a" : "#d1d5db" }}
            />
            <span
              className="text-[10px] font-medium"
              style={{ color: dark ? "#9fb0c9" : "#6b7280" }}
            >
              Origin (by volume)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
