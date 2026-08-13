"use client";

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import {
  Map as MapBase,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  MarkerLabel,
  MapArc,
  type MapStyleOption,
} from "@/components/ui/map";
import { useTradeTheme } from "./TradeThemeContext";
import { getTraderCoordinates } from "./traderCoordinates";
import {
  calculateStrategicView,
  formatValueDefault,
  DETAIL_ZOOM,
  LABEL_ZOOM,
  MAX_ZOOM,
} from "./mapUtils";

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

const fontQ = "var(--font-poppins), Poppins, sans-serif";

const EXPORTER_COLOR = "#1D9E75";
const IMPORTER_COLOR = "#2E7CF6";
const MAX_ARCS = 15;

export interface ConnectionRow {
  exportador: string;
  importador: string;
  country: string | null;
  volumenKg: number;
  valorUsd: number;
}

interface TradeConnectionsMapProps {
  connections: ConnectionRow[];
  height?: number;
  unit?: string;
  valueFormatter?: (val: number) => string;
}

type ArcDatum = {
  id: string;
  from: [number, number];
  to: [number, number];
  exportador: string;
  importador: string;
  volumenKg: number;
  valorUsd: number;
  value: number;
};

type NodeType = "exporter" | "importer";

interface TraderNode {
  name: string;
  coordinates: [number, number];
  total: number;
  connections: number;
}

export function TradeConnectionsMap({
  connections,
  height = 540,
  unit = "",
  valueFormatter,
}: TradeConnectionsMapProps) {
  const T = useTradeTheme();
  const dark = T.mode === "dark";
  const responsiveMinHeight = Math.max(300, height - 180);

  const formatValue = useCallback(
    (v: number) =>
      valueFormatter ? valueFormatter(v) : `${formatValueDefault(v)}${unit ? ` ${unit}` : ""}`,
    [valueFormatter, unit]
  );

  // Agregar por par exportador|importador y descartar cualquier conexión en la
  // que un extremo no tenga coordenadas conocidas (sin fallbacks).
  const aggregated = useMemo(() => {
    const map = new Map<string, ConnectionRow>();
    for (const c of connections) {
      if (!c.exportador || !c.importador || c.volumenKg <= 0) continue;
      const expCoords = getTraderCoordinates(c.exportador);
      const impCoords = getTraderCoordinates(c.importador);
      if (!expCoords || !impCoords) continue;
      const key = `${c.exportador}|${c.importador}`;
      const prev = map.get(key);
      if (prev) {
        prev.volumenKg += c.volumenKg;
        prev.valorUsd += c.valorUsd;
      } else {
        map.set(key, { ...c });
      }
    }
    return Array.from(map.values());
  }, [connections]);

  const maxVol = useMemo(
    () => Math.max(...aggregated.map((c) => c.volumenKg), 1),
    [aggregated]
  );

  const allArcs = useMemo<ArcDatum[]>(() => {
    const exporterCoords = new Map<string, [number, number]>();
    const importerCoords = new Map<string, [number, number]>();
    for (const c of aggregated) {
      const ec = getTraderCoordinates(c.exportador);
      const ic = getTraderCoordinates(c.importador);
      if (ec) exporterCoords.set(c.exportador, ec);
      if (ic) importerCoords.set(c.importador, ic);
    }
    const out: ArcDatum[] = [];
    for (const c of aggregated) {
      const from = exporterCoords.get(c.exportador);
      const to = importerCoords.get(c.importador);
      if (!from || !to || c.volumenKg <= 0) continue;
      out.push({
        id: `${c.exportador}|${c.importador}`,
        from,
        to,
        exportador: c.exportador,
        importador: c.importador,
        volumenKg: c.volumenKg,
        valorUsd: c.valorUsd,
        value: c.volumenKg / maxVol,
      });
    }
    return out.sort((a, b) => b.volumenKg - a.volumenKg);
  }, [aggregated, maxVol]);

  const arcs = useMemo(() => allArcs.slice(0, MAX_ARCS), [allArcs]);
  const totalVolume = useMemo(() => arcs.reduce((s, a) => s + a.volumenKg, 0), [arcs]);
  const sidebarRows = arcs;

  // Marcadores = solo las empresas que participan en las conexiones visibles.
  const nodes = useMemo(() => {
    const exporterMap = new Map<string, TraderNode>();
    const importerMap = new Map<string, TraderNode>();
    for (const a of arcs) {
      const exp = exporterMap.get(a.exportador);
      if (exp) {
        exp.total += a.volumenKg;
        exp.connections += 1;
      } else {
        exporterMap.set(a.exportador, {
          name: a.exportador,
          coordinates: a.from,
          total: a.volumenKg,
          connections: 1,
        });
      }
      const imp = importerMap.get(a.importador);
      if (imp) {
        imp.total += a.volumenKg;
        imp.connections += 1;
      } else {
        importerMap.set(a.importador, {
          name: a.importador,
          coordinates: a.to,
          total: a.volumenKg,
          connections: 1,
        });
      }
    }
    return {
      exporters: Array.from(exporterMap.values()).sort((a, b) => b.total - a.total),
      importers: Array.from(importerMap.values()).sort((a, b) => b.total - a.total),
    };
  }, [arcs]);

  const allPoints = useMemo<[number, number][]>(
    () => [
      ...nodes.exporters.map((n) => n.coordinates),
      ...nodes.importers.map((n) => n.coordinates),
    ],
    [nodes]
  );

  const initialView = useMemo(() => calculateStrategicView(allPoints), [allPoints]);
  const [zoom, setZoom] = useState(initialView.zoom);
  const [center, setCenter] = useState<[number, number]>([
    initialView.center[0],
    initialView.center[1],
  ]);
  const [resetTick, setResetTick] = useState(0);
  const lastPointsRef = useRef<string | null>(null);

  useEffect(() => {
    const key = allPoints.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("|");
    if (key === lastPointsRef.current) return;
    lastPointsRef.current = key;
    const strategic = calculateStrategicView(allPoints);
    setZoom(strategic.zoom);
    setCenter([strategic.center[0], strategic.center[1]]);
    setResetTick((t) => t + 1);
  }, [allPoints]);

  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<{ type: NodeType; name: string } | null>(null);
  const anyActive = hoveredKey !== null;
  const activeArc = useMemo(
    () => arcs.find((a) => a.id === hoveredKey) ?? null,
    [arcs, hoveredKey]
  );

  const isNodeActive = useCallback(
    (type: NodeType, name: string) =>
      activeArc ? (type === "exporter" ? activeArc.exportador === name : activeArc.importador === name) : false,
    [activeArc]
  );

  const isNodeHovered = useCallback(
    (type: NodeType, name: string) =>
      hoveredNode ? hoveredNode.type === type && hoveredNode.name === name : false,
    [hoveredNode]
  );

  const lowColor = dark ? "#3a5a86" : "#93c5fd";
  const highColor = dark ? "#67a6ff" : "#03488d";

  const baseArcPaint = useMemo(
    () =>
      ({
        "line-color": [
          "interpolate",
          ["linear"],
          ["get", "value"],
          0,
          lowColor,
          1,
          highColor,
        ],
        "line-width": [
          "interpolate",
          ["linear"],
          ["get", "value"],
          0,
          0.4,
          1,
          3,
        ],
        "line-opacity": anyActive || hoveredNode ? 0.1 : 0.5,
      }) as never,
    [anyActive, hoveredNode, lowColor, highColor]
  );

  const overlayArcPaint = useMemo(
    () =>
      ({
        "line-color": highColor,
        "line-width": 3.2,
        "line-opacity": 1,
      }) as never,
    [highColor]
  );

  const maxExporterTotal = useMemo(
    () => Math.max(...nodes.exporters.map((n) => n.total), 1),
    [nodes]
  );
  const maxImporterTotal = useMemo(
    () => Math.max(...nodes.importers.map((n) => n.total), 1),
    [nodes]
  );

  const getMarkerSize = useCallback((value: number, max: number) => {
    const minR = 14;
    const maxR = 52;
    const ratio = Math.sqrt(value / max);
    return minR + ratio * (maxR - minR);
  }, []);

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

  // Dark-mode trick usado también por el mapa de Traders: se invierte el
  // canvas del basemap OSM con CSS en vez de cargar tiles oscuros.
  const mapWrapRef = useRef<HTMLDivElement>(null);
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

  const detailLabel = zoom > LABEL_ZOOM ? "Country Detail" : zoom > DETAIL_ZOOM ? "High Resolution" : "Global";

  const markerReadableColor = useCallback(
    (color: string) => {
      if (!dark) return color;
      const hex = color.startsWith("#") ? color.slice(1) : color;
      if (!/^[0-9a-fA-F]{6}$/.test(hex)) return color;
      const mix = (c: number) => Math.round(c * 0.55 + 255 * 0.45);
      return `rgb(${mix(parseInt(hex.slice(0, 2), 16))}, ${mix(parseInt(hex.slice(2, 4), 16))}, ${mix(parseInt(hex.slice(4, 6), 16))})`;
    },
    [dark]
  );

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
          borderRight: `1px solid ${dark ? "rgba(102,166,255,0.10)" : "#e5e7eb"}`,
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
            Conexiones
          </div>
          <div
            className="mt-0.5 text-[10px]"
            style={{ color: dark ? "#7d8aa0" : "#9ca3af" }}
          >
            {allArcs.length} flujos · {formatValue(totalVolume)} total
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {sidebarRows.map((a) => {
            const isActive = hoveredKey === a.id;
            const dimmed = anyActive && !isActive;
            return (
              <div
                key={a.id}
                className="flex cursor-pointer items-center gap-3 border-l-[3px] px-4 py-2 transition-all"
                style={{
                  borderColor: isActive
                    ? dark ? "rgba(102,166,255,0.9)" : "#2563eb"
                    : "transparent",
                  background: isActive
                    ? dark ? "rgba(83,140,255,0.28)" : "rgba(219,234,254,0.95)"
                    : "transparent",
                  opacity: dimmed ? 0.4 : 1,
                }}
                onMouseEnter={() => setHoveredKey(a.id)}
                onMouseLeave={() => setHoveredKey(null)}
              >
                <div
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: highColor }}
                />
                <div className="min-w-0 flex-1">
                  <div
                    className="truncate text-[12px] font-medium leading-tight"
                    style={{ color: dark ? "#c5c6cc" : "#374151" }}
                  >
                    {a.exportador}
                    <span style={{ color: dark ? "#7d8aa0" : "#9ca3af" }}> → </span>
                    {a.importador}
                  </div>
                  <div
                    className="text-[11px] font-semibold leading-tight"
                    style={{ color: highColor }}
                  >
                    {formatValue(a.volumenKg)}
                  </div>
                </div>
              </div>
            );
          })}
          {sidebarRows.length === 0 && (
            <div
              className="px-4 py-3 text-[11px]"
              style={{ color: dark ? "#7d8aa0" : "#9ca3af" }}
            >
              Sin conexiones para los filtros actuales.
            </div>
          )}
        </div>
      </div>

      <div
        className="relative flex-1"
        style={{ background: dark ? "#04101f" : "#dde6f0" }}
      >
        <div ref={mapWrapRef} className="h-full w-full">
          <MapBase
            theme={dark ? "dark" : "light"}
            styles={{ light: osmStyle, dark: osmStyle }}
            viewport={{ center, zoom }}
            onViewportChange={onViewportChange}
            minZoom={1}
            maxZoom={MAX_ZOOM}
            attributionControl={{ compact: true }}
          >
            <MapArc
              data={arcs}
              id="conn-arcs"
              curvature={0.22}
              paint={baseArcPaint}
              onHover={(e) => setHoveredKey(e ? e.arc.id : null)}
            />

            {activeArc && (
              <MapArc
                data={[activeArc]}
                id="conn-active"
                curvature={0.22}
                paint={overlayArcPaint}
                interactive={false}
              />
            )}

            {nodes.exporters.map((n) => {
              const active = isNodeActive("exporter", n.name);
              const hovered = isNodeHovered("exporter", n.name);
              const dimmed = (anyActive && !active) || (hoveredNode && !hovered);
              const size = getMarkerSize(n.total, maxExporterTotal);
              return (
                <MapMarker
                  key={`e-${n.name}`}
                  longitude={n.coordinates[0]}
                  latitude={n.coordinates[1]}
                  onMouseEnter={() => setHoveredNode({ type: "exporter", name: n.name })}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <MarkerContent>
                    <div
                      className="relative cursor-pointer transition-all"
                      style={{
                        width: size,
                        height: size,
                        transform: active || hovered ? "scale(1.3)" : "scale(1)",
                        transformOrigin: "center",
                        opacity: dimmed ? 0.18 : 1,
                      }}
                    >
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: EXPORTER_COLOR, opacity: 0.18 }}
                      />
                      <div
                        className="absolute rounded-full border-2 border-white"
                        style={{
                          inset: size * 0.18,
                          backgroundColor: EXPORTER_COLOR,
                          boxShadow:
                            active || hovered
                              ? `0 0 0 3px ${dark ? "#fff" : "#1f2937"}, 0 0 18px ${EXPORTER_COLOR}`
                              : `0 2px 6px ${EXPORTER_COLOR}99`,
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
                    <div className="max-w-[220px] text-left" style={{ fontFamily: fontQ }}>
                      <div
                        className="truncate text-[11px] font-bold leading-tight"
                        style={{ color: dark ? "#e8eefc" : "#1f2937" }}
                      >
                        {n.name}
                      </div>
                      <div className="mt-0.5 text-[11px] font-bold leading-tight" style={{ color: markerReadableColor(EXPORTER_COLOR) }}>
                        {formatValue(n.total)}
                      </div>
                      <div
                        className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider"
                        style={{ color: dark ? "#9aa7bd" : "#5a6478" }}
                      >
                        Exportador · {n.connections} flujos
                      </div>
                    </div>
                  </MarkerTooltip>
                  {(active || hovered) && (
                    <MarkerLabel position="top">
                      <div
                        className="rounded-md border px-2 py-1 text-[10px] font-bold shadow-md"
                        style={{
                          background: dark ? "rgba(8,20,40,0.95)" : "rgba(255,255,255,0.97)",
                          borderColor: EXPORTER_COLOR,
                          color: dark ? "#e8eefc" : "#1f2937",
                          fontFamily: fontQ,
                        }}
                      >
                        {n.name}
                      </div>
                    </MarkerLabel>
                  )}
                </MapMarker>
              );
            })}

            {nodes.importers.map((n) => {
              const active = isNodeActive("importer", n.name);
              const hovered = isNodeHovered("importer", n.name);
              const dimmed = (anyActive && !active) || (hoveredNode && !hovered);
              const size = getMarkerSize(n.total, maxImporterTotal);
              return (
                <MapMarker
                  key={`i-${n.name}`}
                  longitude={n.coordinates[0]}
                  latitude={n.coordinates[1]}
                  onMouseEnter={() => setHoveredNode({ type: "importer", name: n.name })}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <MarkerContent>
                    <div
                      className="relative cursor-pointer transition-all"
                      style={{
                        width: size,
                        height: size,
                        transform: active || hovered ? "scale(1.3)" : "scale(1)",
                        transformOrigin: "center",
                        opacity: dimmed ? 0.18 : 1,
                      }}
                    >
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: IMPORTER_COLOR, opacity: 0.18 }}
                      />
                      <div
                        className="absolute rounded-full border-2 border-white"
                        style={{
                          inset: size * 0.18,
                          backgroundColor: IMPORTER_COLOR,
                          boxShadow:
                            active || hovered
                              ? `0 0 0 3px ${dark ? "#fff" : "#1f2937"}, 0 0 18px ${IMPORTER_COLOR}`
                              : `0 2px 6px ${IMPORTER_COLOR}99`,
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
                    <div className="max-w-[220px] text-left" style={{ fontFamily: fontQ }}>
                      <div
                        className="truncate text-[11px] font-bold leading-tight"
                        style={{ color: dark ? "#e8eefc" : "#1f2937" }}
                      >
                        {n.name}
                      </div>
                      <div className="mt-0.5 text-[11px] font-bold leading-tight" style={{ color: markerReadableColor(IMPORTER_COLOR) }}>
                        {formatValue(n.total)}
                      </div>
                      <div
                        className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider"
                        style={{ color: dark ? "#9aa7bd" : "#5a6478" }}
                      >
                        Importador · {n.connections} flujos
                      </div>
                    </div>
                  </MarkerTooltip>
                  {(active || hovered) && (
                    <MarkerLabel position="bottom">
                      <div
                        className="rounded-md border px-2 py-1 text-[10px] font-bold shadow-md"
                        style={{
                          background: dark ? "rgba(8,20,40,0.95)" : "rgba(255,255,255,0.97)",
                          borderColor: IMPORTER_COLOR,
                          color: dark ? "#e8eefc" : "#1f2937",
                          fontFamily: fontQ,
                        }}
                      >
                        {n.name}
                      </div>
                    </MarkerLabel>
                  )}
                </MapMarker>
              );
            })}
          </MapBase>
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
          className="absolute bottom-3 right-3 z-10 rounded-lg border px-3 py-2 shadow-sm backdrop-blur-sm"
          style={{
            background: dark ? "rgba(10,22,44,0.85)" : "rgba(255,255,255,0.9)",
            borderColor: dark ? "rgba(102,166,255,0.22)" : "#e5e7eb",
            fontFamily: fontQ,
          }}
        >
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ background: EXPORTER_COLOR }} />
            <span
              className="text-[10px] font-medium"
              style={{ color: dark ? "#9fb0c9" : "#6b7280" }}
            >
              Exportador
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ background: IMPORTER_COLOR }} />
            <span
              className="text-[10px] font-medium"
              style={{ color: dark ? "#9fb0c9" : "#6b7280" }}
            >
              Importador
            </span>
          </div>
          <div className="mt-2 border-t pt-1.5" style={{ borderColor: dark ? "rgba(102,166,255,0.15)" : "rgba(6,37,75,0.10)" }}>
            <div
              className="text-[9px] font-semibold uppercase tracking-wider"
              style={{ color: dark ? "#9aa7bd" : "#5a6478" }}
            >
              Volumen por flujo
            </div>
            <div
              className="mt-1 h-2 w-28 rounded-sm"
              style={{
                background: `linear-gradient(90deg, ${lowColor}, ${highColor})`,
                border: `1px solid ${dark ? "rgba(102,166,255,0.25)" : "rgba(6,37,75,0.15)"}`,
              }}
            />
            <div className="mt-0.5 flex justify-between text-[9px]" style={{ color: dark ? "#9aa7bd" : "#5a6478" }}>
              <span>0</span>
              <span>{formatValue(maxVol)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
