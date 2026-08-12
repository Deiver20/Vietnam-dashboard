"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoNaturalEarth1 } from "d3-geo";
import { ResponsiveChoropleth } from "@nivo/geo";
import { useTradeTheme } from "./TradeThemeContext";
import {
  buildWorldCountries,
  normalizeCountryName,
} from "@/app/lib/trade/countryGeo";

const fontQ = "var(--font-poppins), Poppins, sans-serif";

function fmtMt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toFixed(0);
}

export function CountryChoroplethMap({
  data,
  unit = "mt",
  height = 540,
}: {
  data: Array<{ country: string; volumenMt: number }>;
  unit?: string;
  height?: number;
}) {
  const T = useTradeTheme();
  const dark = T.mode === "dark";

  const maxVol = useMemo(() => Math.max(1, ...data.map(d => d.volumenMt)), [data]);
  const totalVol = useMemo(() => data.reduce((s, d) => s + d.volumenMt, 0), [data]);

  const noDataColor = dark ? "#333f59" : "#e5eaf1";
  const highColor = dark ? "#67a6ff" : "#03488D";

  const gradient = useMemo(() => {
    const a = dark ? [84, 122, 172] : [185, 212, 240];
    const b = dark ? [103, 166, 255] : [3, 72, 141];
    return Array.from({ length: 9 }, (_, i) => {
      const t = i / 8;
      const r = Math.round(a[0] + (b[0] - a[0]) * t);
      const g = Math.round(a[1] + (b[1] - a[1]) * t);
      const bl = Math.round(a[2] + (b[2] - a[2]) * t);
      return `rgb(${r}, ${g}, ${bl})`;
    });
  }, [dark]);

  const features = useMemo(() => buildWorldCountries().features, []);
  const chartData = useMemo(
    () =>
      data
        .filter(d => d.volumenMt > 0)
        .map(d => ({ id: d.country, value: d.volumenMt })),
    [data],
  );

  const match = useMemo(
    () =>
      (feature: { properties?: { name?: string } }, datum: { id: string }) =>
        normalizeCountryName(datum.id) === (feature.properties?.name ?? ""),
    [],
  );

  const mapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const el = mapRef.current;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const projection = useMemo(() => {
    if (!size || size.w <= 0 || size.h <= 0 || features.length === 0) return null;
    const proj = geoNaturalEarth1();
    proj.fitExtent(
      [
        [8, 8],
        [size.w - 8, size.h - 8],
      ],
      { type: "FeatureCollection", features } as never,
    );
    return {
      scale: proj.scale(),
      translation: [
        proj.translate()[0] / size.w,
        proj.translate()[1] / size.h,
      ] as [number, number],
    };
  }, [size, features]);

  return (
    <div
      className="relative overflow-hidden rounded-lg border"
      ref={mapRef}
      style={{
        height,
        borderColor: dark ? "rgba(102,166,255,0.18)" : "#e5e7eb",
        background: dark ? "#0a1830" : "#e6eef7",
      }}
    >
      <ResponsiveChoropleth
        features={features as never}
        data={chartData}
        match={match as never}
        domain={[0, maxVol]}
        valueFormat={(v: number) => `${fmtMt(v)} ${unit}`}
        projectionType="naturalEarth1"
        projectionScale={projection?.scale}
        projectionTranslation={projection?.translation}
        enableGraticule={false}
        borderWidth={0.6}
        borderColor={dark ? "#0a1830" : "#ffffff"}
        colors={gradient}
        unknownColor={noDataColor}
        margin={{ top: 6, right: 6, bottom: 6, left: 6 }}
        theme={{
          tooltip: {
            container: {
              background: dark ? "rgba(8,20,40,0.97)" : "#ffffff",
              color: dark ? "#e8eefc" : "#1f2937",
              fontFamily: fontQ,
              fontSize: 12,
              borderRadius: 8,
              boxShadow: dark
                ? "0 14px 36px rgba(0,0,0,0.5)"
                : "0 14px 36px rgba(6,37,75,0.12)",
            },
          },
        }}
        tooltip={({ feature }) => (
          <div
            style={{
              background: dark ? "rgba(8,20,40,0.97)" : "#ffffff",
              border: `1px solid ${dark ? "rgba(102,166,255,0.25)" : "#e5e7eb"}`,
              borderRadius: 8,
              padding: "6px 10px",
              boxShadow: dark
                ? "0 14px 36px rgba(0,0,0,0.5)"
                : "0 14px 36px rgba(6,37,75,0.12)",
              fontFamily: fontQ,
            }}
          >
            <div
              className="text-[11px] font-bold leading-tight"
              style={{ color: dark ? "#e8eefc" : "#1f2937" }}
            >
              {(
                feature as unknown as {
                  properties?: { name?: string };
                }
              ).properties?.name ?? feature.label}
            </div>
            {feature.value != null && (
              <div className="text-[11px] font-bold leading-tight" style={{ color: feature.color }}>
                {feature.formattedValue}
              </div>
            )}
          </div>
        )}
      />

      <div
        className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-lg border px-3 py-2 shadow-sm backdrop-blur-sm"
        style={{
          background: dark ? "rgba(10,22,44,0.85)" : "rgba(255,255,255,0.9)",
          borderColor: dark ? "rgba(102,166,255,0.22)" : "#e5e7eb",
          fontFamily: fontQ,
        }}
      >
        <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: dark ? "#9fb0c9" : "#6b7280" }}>
          Volumen por país
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div
            className="h-2.5 w-28 rounded-sm"
            style={{
              background: `linear-gradient(90deg, ${noDataColor}, ${highColor})`,
              border: `1px solid ${dark ? "rgba(102,166,255,0.25)" : "rgba(6,37,75,0.15)"}`,
            }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[9px]" style={{ color: dark ? "#9aa7bd" : "#5a6478" }}>
          <span>0</span>
          <span>{fmtMt(maxVol)} {unit}</span>
        </div>
        <div className="mt-1 border-t pt-1 text-[10px] font-semibold" style={{ borderColor: dark ? "rgba(102,166,255,0.15)" : "rgba(6,37,75,0.10)", color: dark ? "#e8eefc" : "#1f2937" }}>
          {data.length} países · {fmtMt(totalVol)} {unit}
        </div>
      </div>
    </div>
  );
}
