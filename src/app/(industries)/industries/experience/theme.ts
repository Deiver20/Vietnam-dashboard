// Dark tech-blue palette shared by the 3D scene and the DOM overlays.
export const theme = {
  bg: "#030F1C",
  // Cloudinary-hosted page backdrop. Drawn behind the transparent canvas, so
  // the globe and the additive star field render on top of it.
  bgImage:
    "https://res.cloudinary.com/wcwmpxez/image/upload/v1784568972/new-background-image-agm-globe_uho6xv.webp",
  ocean: "#050d1e",
  land: "#0f2447",
  landHover: "#2653b4",
  landSelected: "#3061db",
  borderLine: "#8fc2ff",

  primary: "#3061DB",
  soft: "#789eff",
  bright: "#8fc2ff",

  text: "#e8efff",
  textDim: "rgba(219, 231, 255, 0.65)",
  textMuted: "rgba(169, 191, 232, 0.55)",

  panelBg: "rgba(10, 22, 48, 0.38)",
  panelBorder: "rgba(120, 158, 255, 0.22)",

  // Categorical chart series, validated (CVD + contrast) against the dark card
  // surface. Fixed slot order — never cycled, max 4 series per chart.
  series: ["#3987e5", "#199e70", "#c98500", "#d55181"],

  chartAxis: "rgba(120, 158, 255, 0.35)",
  chartSplit: "rgba(120, 158, 255, 0.12)",
  chartLabel: "#a9bfe8",
} as const;
