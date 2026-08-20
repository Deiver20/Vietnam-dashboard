"use client";

import { useEffect, useMemo, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { useInView } from "@/hooks/home/useInView";
import { BAR_ROWS } from "./homeData";

const FEATURES = [
  {
    ico: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 17l5-5 4 4 8-8" />
        <polyline points="14 8 21 8 21 15" />
      </svg>
    ),
    title: "Historical series + projections",
    text: "+5 years of historical data per commodity and market, with YoY/MoM trends ready to present.",
  },
  {
    ico: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20" />
      </svg>
    ),
    title: "70+ countries, real granularity",
    text: "Imports, exports, production, and prices — broken down by origin, destination, tariff code, and exchange rate in USD.",
  },
  {
    ico: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 4v16" />
      </svg>
    ),
    title: "Customizable PowerBI Dashboards",
    text: "We embed your filters, your brand, and your KPIs. Share with your commercial team, board of directors, or trade association.",
  },
  {
    ico: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
    title: "Updated as soon as released",
    text: "Most markets refresh with a <strong>1–12 week</strong> lag depending on customs processes — instant once the data is public.",
  },
];

/* ════════════════════════ PRODUCT ════════════════════════ */
export default function ProductChartSection() {
  const { ref: barsRef, inView: barsInView } = useInView<HTMLDivElement>();
  const chartRef = useRef<ReactECharts | null>(null);
  const barsAnimatedRef = useRef(false);

  const emptyChartOption = useMemo(() => ({
    backgroundColor: "transparent",
    grid: { left: 48, right: 24, top: 10, bottom: 10 },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "rgba(255,255,255,0.98)",
      borderColor: "rgba(0,0,0,0.08)",
      textStyle: { color: "#374151", fontSize: 12 },
    },
    xAxis: {
      type: "value",
      max: 100,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: "rgba(0,0,0,0.06)", type: "dashed" } },
      axisLabel: { color: "#9ca3af", fontSize: 10, formatter: "{value}%" },
    },
    yAxis: {
      type: "category",
      data: BAR_ROWS.map((r) => r.label).reverse(),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#6b7280", fontSize: 11, fontFamily: "var(--font-jetbrains)" },
    },
    animation: true,
    animationDuration: 1400,
    animationEasing: "cubicOut",
    series: [
      {
        name: "2025",
        type: "bar",
        data: BAR_ROWS.map(() => 0),
        itemStyle: { color: "#0066FF", borderRadius: [0, 4, 4, 0] },
        barWidth: 8,
        barGap: "20%",
        animationDelay: (idx: number) => idx * 100,
      },
      {
        name: "2024",
        type: "bar",
        data: BAR_ROWS.map(() => 0),
        itemStyle: { color: "#33CC00", borderRadius: [0, 4, 4, 0] },
        barWidth: 8,
        animationDelay: (idx: number) => idx * 100 + 50,
      },
      {
        name: "2023",
        type: "bar",
        data: BAR_ROWS.map(() => 0),
        itemStyle: { color: "#67A6FF", borderRadius: [0, 4, 4, 0] },
        barWidth: 8,
        animationDelay: (idx: number) => idx * 100 + 100,
      },
    ],
  }), []);

  useEffect(() => {
    if (barsInView && chartRef.current && !barsAnimatedRef.current) {
      barsAnimatedRef.current = true;
      chartRef.current.getEchartsInstance().setOption({
        series: [
          { data: BAR_ROWS.map((r) => parseInt(r.a)).reverse() },
          { data: BAR_ROWS.map((r) => parseInt(r.b)).reverse() },
          { data: BAR_ROWS.map((r) => parseInt(r.c)).reverse() },
        ],
      });
    }
  }, [barsInView]);

  return (
    <section className="py-[100px] max-[720px]:py-14 relative bg-[#F4F6FA]" id="product">
      <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4">
        <div className="text-center max-w-[800px] mx-auto mb-[70px]">
          <span className="kicker">Data Charts · The AGM Product</span>
          <h2 className="text-[clamp(32px,3.6vw,52px)] font-semibold leading-[1.1] tracking-[-0.02em] mb-5 text-gray-900">
            Each chart answers a<br className="max-[720px]:hidden" />{" "} <span className="grad-blue">concrete business decision.</span>
          </h2>
          <p className="text-[17px] leading-[1.6] text-gray-500 max-w-[640px] mx-auto">
            We connect customs, port, and official data into decision-ready charts.
            Filter by country, product, industry, and year. Compare CIF/FOB,
            identify competitors, and project trends — no spreadsheets, no intermediaries.
          </p>
        </div>

        <div className="grid grid-cols-[1fr_1fr] gap-[60px] max-[720px]:gap-8 items-center max-[1100px]:grid-cols-1">
          {/* LEFT: feature list */}
          <ul className="flex flex-col gap-7">
            {FEATURES.map((f) => (
              <li key={f.title} className="grid grid-cols-[48px_1fr] gap-5 items-start">
                <div className="w-12 h-12 rounded-[10px] bg-gradient-to-br from-[rgba(0,102,255,0.12)] to-[rgba(0,102,255,0.03)] border border-[rgba(0,102,255,0.2)] flex items-center justify-center text-[#0066ff]">
                  {f.ico}
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-1.5 tracking-[-0.01em] text-gray-900">{f.title}</h4>
                  <p className="text-sm text-gray-500 leading-[1.55]" dangerouslySetInnerHTML={{ __html: f.text }} />
                </div>
              </li>
            ))}
          </ul>

          {/* RIGHT: ECharts mini bar card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_20px_40px_-12px_rgba(0,0,0,0.10)]">
            <div className="flex justify-between items-start mb-4 gap-4 flex-wrap">
              <div>
                <div className="text-[15px] font-semibold text-gray-900">Comparison · Tallow imports</div>
                <div className="text-[11px] text-gray-400 font-[var(--font-jetbrains)] mt-0.5">Top 5 destinations · 2021–2025 · USD</div>
              </div>
              <div className="flex gap-[14px] text-[11px] text-gray-500">
                <span className="inline-flex items-center gap-[5px]">
                  <i className="w-2 h-2 rounded-sm inline-block bg-[#0066FF]" />
                  2025
                </span>
                <span className="inline-flex items-center gap-[5px]">
                  <i className="w-2 h-2 rounded-sm inline-block bg-[#33CC00]" />
                  2024
                </span>
                <span className="inline-flex items-center gap-[5px]">
                  <i className="w-2 h-2 rounded-sm inline-block bg-[#67A6FF]" />
                  2023
                </span>
              </div>
            </div>
            <div ref={barsRef} className="h-[280px] w-full">
              <ReactECharts
                ref={chartRef}
                option={emptyChartOption}
                style={{ height: "100%", width: "100%" }}
                opts={{ renderer: "canvas" }}
              />
            </div>
            <div className="flex justify-between mt-4 pt-4 border-t border-gray-100 text-[11px] text-gray-400 font-[var(--font-jetbrains)]">
              <span>Source: AGM Data Engine</span>
              <span className="text-[#0066ff] font-medium cursor-pointer hover:opacity-75 transition-opacity">Open chart →</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
