"use client";

import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

/* Same country base map as the dashboard's "Exporters Map Location"
   (react-simple-maps + world-atlas), locked to the dashboard's DARK
   palette and framed on the host city. Static — no zoom/pan. */
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

/* The SVG viewBox must match the banner's own shape (wide + short).
   With the library's default 800×600 box the whole scene was letterboxed
   into the banner, rendering everything at ~43% of its authored size. */
const VB_W = 880;
const VB_H = 300;
/* Continental framing: ~130° of longitude across the banner, so the host
   country sits inside a readable slice of the world rather than a
   street-level crop. */
const PROJ_SCALE = 400;

/* world-atlas country names differ from the display names used in the
   event data — only the mismatches need an entry. */
const GEO_NAME: Record<string, string> = {
  "United States": "United States of America",
};

export default function EventLocationMap({
  coords,
  city,
  country,
  accent,
}: {
  coords: [number, number];
  city: string;
  country: string;
  accent: string;
}) {
  const hostName = GEO_NAME[country] ?? country;

  return (
    <div className="absolute inset-0 bg-[#04101f]" aria-label={`Map of ${city}, ${country}`}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: coords, scale: PROJ_SCALE }}
        width={VB_W}
        height={VB_H}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo: any) => {
              // The host country is tinted with the event color so the
              // location stays obvious at this wider zoom.
              const isHost = geo.properties?.name === hostName;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isHost ? `${accent}59` : "rgba(120, 158, 255, 0.10)"}
                  stroke={isHost ? accent : "rgba(140, 170, 220, 0.35)"}
                  strokeWidth={isHost ? 0.9 : 0.5}
                  style={{
                    default: { outline: "none", pointerEvents: "none" },
                    hover: { outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>

        {/* Host city marker — sized to read at a glance on the banner */}
        <Marker coordinates={coords}>
          <circle r={24} fill={accent} opacity={0.2}>
            <animate attributeName="r" values="16;32;16" dur="2.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.32;0.06;0.32" dur="2.6s" repeatCount="indefinite" />
          </circle>
          <circle r={9} fill={accent} stroke="#ffffff" strokeWidth={3} />
          <text
            textAnchor="middle"
            y={-22}
            style={{
              fill: "#ffffff",
              fontSize: 23,
              fontWeight: 800,
              letterSpacing: "0.01em",
              paintOrder: "stroke",
              stroke: "rgba(4, 16, 31, 0.9)",
              strokeWidth: 6,
            }}
          >
            {city}
          </text>
        </Marker>
      </ComposableMap>
    </div>
  );
}
