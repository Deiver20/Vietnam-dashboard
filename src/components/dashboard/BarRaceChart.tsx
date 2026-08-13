"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw } from "lucide-react";
import { RaceYearData } from "@/app/interfaces/trade/interface";
import { Locale } from "@/app/interfaces";
import { formatVolume } from "@/app/lib/functions/formatters";
import { Flag } from "@/components/ui/Flag";
import { CardHeader } from "@/components/trade/CardHeader";

interface BarRaceChartProps {
  data: RaceYearData[];
  title: string;
  subtitle: string;
  dimension: "country" | "importer";
  locale: Locale;
  topN?: number;
  interval?: number;
  /** Cambia cada vez que la pestaña se vuelve activa: fuerza un replay
   *  completo desde el primer año aunque el componente no se remonte. */
  runKey?: number;
}

const ROW_HEIGHT = 34;

function stringToHue(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

interface DisplayItem {
  name: string;
  value: number;
  hue: number;
}

export function BarRaceChart({
  data,
  title,
  subtitle,
  dimension,
  locale,
  topN = 10,
  interval = 1500,
  runKey = 0,
}: BarRaceChartProps) {
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedElapsedRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const isSlidingRef = useRef<boolean>(false);
  const playedRef = useRef<boolean>(false);
  const yearIndexRef = useRef<number>(0);
  const animateFnRef = useRef<((timestamp: number) => void) | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [displayYear, setDisplayYear] = useState<number>(() =>
    data.length > 0 ? data[0].year : 0
  );
  const [displayItems, setDisplayItems] = useState<DisplayItem[]>(() =>
    data.length > 0
      ? data[0].items.slice(0, topN).map((item) => ({
          name: item.name,
          value: item.value,
          hue: stringToHue(item.name),
        }))
      : []
  );
  const [sliderValue, setSliderValue] = useState<number>(0);

  useEffect(() => {
    const totalDuration = data.length * interval;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      if (isPlayingRef.current && !playedRef.current) {
        playedRef.current = true;
        setIsPlaying(true);
      }

      const elapsed = timestamp - startTimeRef.current + pausedElapsedRef.current;

      if (elapsed >= totalDuration) {
        const lastYearIndex = data.length - 1;
        const lastYearData = data[lastYearIndex];

        if (lastYearData) {
          const items = lastYearData.items
            .slice(0, topN)
            .map((item) => ({
              name: item.name,
              value: item.value,
              hue: stringToHue(item.name),
            }));
          setDisplayItems(items);
          setDisplayYear(lastYearData.year);
          setSliderValue(lastYearIndex);
          yearIndexRef.current = lastYearIndex;
        }

        isPlayingRef.current = false;
        playedRef.current = false;
        setIsPlaying(false);
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        return;
      }

      const yearProgress = (elapsed % interval) / interval;
      const rawYearIndex = Math.floor(elapsed / interval);
      const yearIndex = Math.min(rawYearIndex, data.length - 1);
      const nextYearIndex = Math.min(yearIndex + 1, data.length - 1);
      const t = easeInOut(yearProgress);

      if (yearIndex !== yearIndexRef.current) {
        yearIndexRef.current = yearIndex;
        if (!isSlidingRef.current) {
          setSliderValue(yearIndex);
        }
      }

      const currentYearData = data[yearIndex];
      const nextYearData = data[nextYearIndex];

      if (!currentYearData || !nextYearData) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const currentMap = new Map(currentYearData.items.map((i) => [i.name, i]));
      const nextMap = new Map(nextYearData.items.map((i) => [i.name, i]));

      const allNames = new Set([...currentMap.keys(), ...nextMap.keys()]);

      const interpolatedItems: DisplayItem[] = [];

      allNames.forEach((name) => {
        const currentItem = currentMap.get(name);
        const nextItem = nextMap.get(name);
        const currentValue = currentItem?.value ?? 0;
        const nextValue = nextItem?.value ?? currentValue;

        interpolatedItems.push({
          name,
          value: currentValue + (nextValue - currentValue) * t,
          hue: stringToHue(name),
        });
      });

      interpolatedItems.sort((a, b) => b.value - a.value);

      setDisplayItems(interpolatedItems.slice(0, topN));
      setDisplayYear(currentYearData.year);

      if (isPlayingRef.current) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    animateFnRef.current = animate;
  }, [data, interval, topN]);

  useEffect(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    pausedElapsedRef.current = 0;
    isSlidingRef.current = false;
    playedRef.current = false;
    isPlayingRef.current = data.length > 0;
    if (data.length === 0) return;
    // -1 hace que el primer frame del bucle resincronice año y slider a 0.
    yearIndexRef.current = -1;
    startTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(animateFnRef.current!);
  }, [runKey, data, topN]);

  const handlePlay = useCallback(() => {
    if (isPlaying) {
      pausedElapsedRef.current += performance.now() - (startTimeRef.current ?? 0);
      isPlayingRef.current = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setIsPlaying(false);
    } else {
      if (pausedElapsedRef.current >= data.length * interval) {
        pausedElapsedRef.current = 0;
        setSliderValue(0);
        yearIndexRef.current = 0;
      }
      startTimeRef.current = performance.now();
      isPlayingRef.current = true;
      rafRef.current = requestAnimationFrame(animateFnRef.current!);
      setIsPlaying(true);
    }
  }, [isPlaying, data.length, interval]);

  const handleReplay = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    pausedElapsedRef.current = 0;
    startTimeRef.current = performance.now();
    isPlayingRef.current = true;
    setSliderValue(0);
    setIsPlaying(true);
    rafRef.current = requestAnimationFrame(animateFnRef.current!);
  }, []);

  const handleSliderChange = useCallback((value: number) => {
    setSliderValue(value);
    isSlidingRef.current = true;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    isPlayingRef.current = false;
    setIsPlaying(false);

    pausedElapsedRef.current = value * interval;
    startTimeRef.current = performance.now();

    const yearIndex = value;
    const currentYearData = data[yearIndex];
    if (currentYearData) {
      const items = currentYearData.items
        .slice(0, topN)
        .map((item) => ({
          name: item.name,
          value: item.value,
          hue: stringToHue(item.name),
        }));
      setDisplayItems(items);
      setDisplayYear(currentYearData.year);
      yearIndexRef.current = yearIndex;
    }

    setTimeout(() => {
      isSlidingRef.current = false;
    }, 100);
  }, [interval, data, topN]);

  const handleSliderRelease = useCallback(() => {
    isSlidingRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const maxValue = displayItems.length > 0 ? Math.max(...displayItems.map((i) => i.value), 1) : 1;

  if (data.length === 0) {
    return (
      <div className="group relative bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(380px,72vw,560px)] flex flex-col overflow-hidden">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100"
          style={{ backgroundColor: "var(--trade-accent)" }}
        />
        <CardHeader title={title} subtitle={subtitle} />
        <div className="flex-1 flex items-center justify-center text-sm text-gray-4">
          {locale === "es" ? "No hay datos disponibles" : locale === "fr" ? "Aucune donnée disponible" : locale === "pt" ? "Nenhum dado disponível" : "No data available"}
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 h-[clamp(380px,72vw,560px)] flex flex-col overflow-hidden">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100"
        style={{ backgroundColor: "var(--trade-accent)" }}
      />
      <CardHeader
        title={title}
        subtitle={subtitle}
        actions={
          <div className="flex items-center gap-3">
            <motion.div
              key={displayYear}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="text-3xl font-bold text-white tabular-nums leading-none"
            >
              {displayYear}
            </motion.div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePlay}
                className="p-2 rounded-md bg-blue/10 text-blue hover:bg-blue/20 transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={handleReplay}
                className="p-2 rounded-md bg-navy-line text-gray-3 hover:text-white hover:bg-navy-darker transition-colors"
                aria-label="Replay"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        }
      />

      <div className="mb-3 px-1">
        <input
          type="range"
          min={0}
          max={data.length - 1}
          step={1}
          value={sliderValue}
          onChange={(e) => handleSliderChange(Number(e.target.value))}
          onMouseUp={handleSliderRelease}
          onTouchEnd={handleSliderRelease}
          className="w-full h-1.5 bg-navy-line rounded-lg appearance-none cursor-pointer accent-blue"
        />
        <div className="flex justify-between text-[10px] text-gray-4 mt-1">
          <span>{data[0]?.year}</span>
          <span>{data[data.length - 1]?.year}</span>
        </div>
      </div>

      <div className="relative flex-1 min-h-0 overflow-hidden">
        <motion.div className="flex flex-col gap-1">
          {displayItems.map((item, index) => {
            const widthPct = (item.value / maxValue) * 100;

            return (
              <motion.div
                key={item.name}
                layout
                initial={false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
                style={{ height: ROW_HEIGHT }}
                title={`${item.name}: ${formatVolume(item.value)}`}
              >
                <motion.span
                  layout
                  className="w-5 text-xs font-mono text-gray-4 text-right"
                >
                  {index + 1}
                </motion.span>

                {dimension === "country" && (
                  <Flag country={item.name} className="w-6 h-4 rounded flex-shrink-0" />
                )}

                <div className="flex-1 min-w-0 relative h-full flex items-center">
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 rounded-md"
                    animate={{ width: `${widthPct}%` }}
                    transition={{
                      duration: 0.1,
                      ease: "linear",
                    }}
                    style={{
                      background: `linear-gradient(90deg, hsl(${item.hue}, 75%, 55%), hsl(${item.hue}, 75%, 45%))`,
                      opacity: 0.85,
                    }}
                  />
                  <motion.span
                    layout
                    className="relative z-10 ml-3 text-xs font-medium text-white truncate max-w-[55%]"
                  >
                    {item.name}
                  </motion.span>
                </div>

                <motion.span
                  layout
                  className="text-xs font-mono text-gray-3 text-right w-20 flex-shrink-0"
                >
                  {formatVolume(item.value)}
                </motion.span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
