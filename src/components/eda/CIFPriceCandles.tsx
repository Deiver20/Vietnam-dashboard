"use client";

import { memo, useMemo } from "react";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { EDACandle } from "@/app/interfaces/trade/projection";
import { formatCIFPrice, formatVolume } from "@/app/lib/functions/formatters";
import { useScopeLight, chartPalette } from "@/app/lib/functions/chartPalette";
import { HintIcon } from "@/components/ui/HintIcon";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
} from "recharts";
import { Loader2 } from "lucide-react";

interface CIFPriceCandlesProps {
  data: EDACandle[];
  loading: boolean;
}

const UP_COLOR = "#00C2A8";
const DOWN_COLOR = "#FF5C5C";

interface CandleRow {
  date: string;
  o: number;
  h: number;
  l: number;
  c: number;
  vol: number;
  ma_s: number | null;
  ma_m: number | null;
  ma_l: number | null;
  domainMin: number;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

interface CandleShapeProps {
  x?: number;
  width?: number;
  y?: number;
  height?: number;
  payload?: CandleRow;
}

const CandleShape = memo(function CandleShape({ x = 0, width = 0, y = 0, height = 0, payload }: CandleShapeProps) {
  if (!payload || !width || !height) return null;
  const cx = x + width / 2;
  const span = (payload.c - payload.domainMin) || 1;
  const yFor = (v: number) => y + (payload.c - v) * (height / span);
  const color = payload.c >= payload.o ? UP_COLOR : DOWN_COLOR;
  const bodyTop = Math.min(yFor(payload.o), yFor(payload.c));
  const bodyHeight = Math.max(Math.abs(yFor(payload.o) - yFor(payload.c)), 1.5);
  return (
    <g>
      <line x1={cx} x2={cx} y1={yFor(payload.h)} y2={yFor(payload.l)} stroke={color} strokeWidth={1} />
      <rect
        x={x + 1}
        y={bodyTop}
        width={Math.max(width - 3, 2)}
        height={bodyHeight}
        fill={color}
      />
    </g>
  );
});

function useCandleData(data: EDACandle[]) {
  return useMemo(() => {
    const currentYear = new Date().getUTCFullYear();
    const minYear = currentYear - 2;
    const rows = data
      .filter((c) => c.close_price !== null && c.open_price !== null && c.low_price !== null && c.high_price !== null)
      .filter((c) => c.year >= minYear)
      .map((c) => ({
        date: `${c.year}-${String(c.month).padStart(2, "0")}`,
        o: Number(c.open_price),
        h: Number(c.high_price),
        l: Number(c.low_price),
        c: Number(c.close_price),
        vol: Number(c.volume_mt ?? 0),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    if (rows.length === 0) return null;

    const closes = rows.map((r) => r.c);
    const ma = (win: number): (number | null)[] =>
      closes.map((_, i) => (i >= win - 1 ? mean(closes.slice(i - win + 1, i + 1)) : null));

    const maS = ma(3);
    const maM = ma(6);
    const maL = ma(12);

    const lows = rows.map((d) => d.l);
    const highs = rows.map((d) => d.h);
    const rawMin = Math.min(...lows);
    const rawMax = Math.max(...highs);
    const pad = (rawMax - rawMin) * 0.06 || 1;
    const domainMin = rawMin - pad;
    const domainMax = rawMax + pad;
    const maxVol = Math.max(...rows.map((d) => d.vol), 1);

    const chartData: CandleRow[] = rows.map((r, i) => ({
      ...r,
      ma_s: maS[i],
      ma_m: maM[i],
      ma_l: maL[i],
      domainMin,
    }));

    return { chartData, domainMin, domainMax, maxVol };
  }, [data]);
}

export const CIFPriceCandles = memo(function CIFPriceCandles({ data, loading }: CIFPriceCandlesProps) {
  const locale = useDashboard((s) => s.locale);
  const t = getTranslation(locale);
  const { ref: cardRef, light } = useScopeLight();
  const pal = chartPalette(light);

  const candle = useCandleData(data);

  if (loading && data.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(420px,64vw,600px)] flex items-center justify-center text-gray-4">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  if (!candle) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(420px,64vw,600px)] flex items-center justify-center text-gray-4 text-sm">
        {t.eda.noData}
      </div>
    );
  }

  const { chartData, domainMin, domainMax, maxVol } = candle;

  const renderCandleTooltip = ({ active, payload, label }: { active?: boolean; payload?: ReadonlyArray<{ payload?: CandleRow }>; label?: string | number }) => {
    if (!active || !payload || payload.length === 0) return null;
    const row = payload[0]?.payload;
    if (!row) return null;
    const color = row.c >= row.o ? UP_COLOR : DOWN_COLOR;
    const maValue = (v: number | null | undefined) => (v == null ? "—" : formatCIFPrice(v));
    return (
      <div
        style={{
          background: pal.tooltipBg,
          border: `1px solid ${pal.tooltipBorder}`,
          borderRadius: 6,
          fontSize: 12,
          padding: "8px 10px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ color: pal.tooltipLabel, fontWeight: 600, marginBottom: 4 }}>{label}</div>
        <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "2px 12px", color: pal.tooltipLabel }}>
          <span>{t.eda.candleOpen}</span>
          <span style={{ fontWeight: 600 }}>{formatCIFPrice(row.o)}</span>
          <span>{t.eda.candleHigh}</span>
          <span style={{ fontWeight: 600 }}>{formatCIFPrice(row.h)}</span>
          <span>{t.eda.candleLow}</span>
          <span style={{ fontWeight: 600 }}>{formatCIFPrice(row.l)}</span>
          <span>{t.eda.candleClose}</span>
          <span style={{ fontWeight: 700, color }}>{formatCIFPrice(row.c)}</span>
          <span>{t.eda.volume}</span>
          <span style={{ fontWeight: 600 }}>{formatVolume(row.vol)}</span>
        </div>
        <div
          style={{
            marginTop: 6,
            paddingTop: 6,
            borderTop: `1px solid ${pal.tooltipBorder}`,
            display: "grid",
            gridTemplateColumns: "auto auto",
            gap: "2px 12px",
            color: pal.tooltipLabel,
          }}
        >
          <span style={{ color: "#F5C518" }}>{t.eda.rollingShort}</span>
          <span style={{ fontWeight: 600 }}>{maValue(row.ma_s)}</span>
          <span style={{ color: "#60A5FA" }}>{t.eda.rollingMedium}</span>
          <span style={{ fontWeight: 600 }}>{maValue(row.ma_m)}</span>
          <span style={{ color: "#A78BFA" }}>{t.eda.rollingLong}</span>
          <span style={{ fontWeight: 600 }}>{maValue(row.ma_l)}</span>
        </div>
      </div>
    );
  };

  return (
    <div ref={cardRef} className="bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 flex flex-col h-[clamp(420px,64vw,600px)]">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
          {t.eda.cifPriceCandles}
          <HintIcon text={t.eda.candleHint} />
        </h3>
        <p className="text-[10px] text-gray-5">{chartData[0].date} — {chartData[chartData.length - 1].date}</p>
      </div>
      <div className="flex-[7] min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              stroke={pal.axis}
              fontSize={10}
              minTickGap={28}
              tickLine={false}
            />
            <YAxis
              yAxisId="price"
              domain={[domainMin, domainMax]}
              stroke={pal.axis}
              fontSize={10}
              width={48}
              tickFormatter={(v: number) => formatCIFPrice(v)}
            />
            <Tooltip content={renderCandleTooltip} cursor={{ stroke: pal.axis, strokeDasharray: "3 3" }} />
            <Legend wrapperStyle={{ fontSize: 10, color: pal.legend }} />
            <Bar
              yAxisId="price"
              dataKey="c"
              name="OHLC"
              legendType="none"
              shape={<CandleShape />}
              isAnimationActive={false}
            />
            <Line yAxisId="price" type="monotone" dataKey="ma_s" name={t.eda.rollingShort} stroke="#F5C518" strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} />
            <Line yAxisId="price" type="monotone" dataKey="ma_m" name={t.eda.rollingMedium} stroke="#60A5FA" strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} />
            <Line yAxisId="price" type="monotone" dataKey="ma_l" name={t.eda.rollingLong} stroke="#A78BFA" strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-[3] min-h-0 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              stroke={pal.axis}
              fontSize={10}
              minTickGap={28}
              tickLine={false}
            />
            <YAxis
              yAxisId="vol"
              domain={[0, maxVol]}
              stroke={pal.axis}
              fontSize={10}
              width={48}
              tickFormatter={(v: number) => formatVolume(v)}
            />
            <Tooltip
              contentStyle={{ background: pal.tooltipBg, border: `1px solid ${pal.tooltipBorder}`, borderRadius: 6, fontSize: 12 }}
              labelStyle={{ color: pal.tooltipLabel }}
              formatter={(v) => [formatVolume(v as number), t.eda.volume]}
            />
            <Bar yAxisId="vol" dataKey="vol" name={t.eda.volume} fill="#0066FF" fillOpacity={0.55} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
