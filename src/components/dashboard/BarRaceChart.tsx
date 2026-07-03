"use client";

import { useEffect, useMemo, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { RaceYearData } from "@/app/interfaces/trade/interface";
import { Locale } from "@/app/interfaces";
import { formatVolume } from "@/app/lib/functions/formatters";
import { Flag } from "@/components/ui/Flag";

interface BarRaceChartProps {
  data: RaceYearData[];
  title: string;
  subtitle: string;
  dimension: "country" | "importer";
  locale: Locale;
  topN?: number;
  interval?: number;
}

const ROW_HEIGHT = 34;
const GAP = 4;

function stringToHue(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

export function BarRaceChart({
  data,
  title,
  subtitle,
  dimension,
  locale,
  topN = 10,
  interval = 1500,
}: BarRaceChartProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const isAtEnd = currentIndex >= data.length - 1;

  useEffect(() => {
    if (!playing || data.length === 0) return;

    const id = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= data.length - 1) {
          return prev;
        }
        return prev + 1;
      });
    }, interval);

    return () => clearInterval(id);
  }, [playing, data.length, interval]);

  useEffect(() => {
    if (currentIndex >= data.length && data.length > 0) {
      setCurrentIndex(data.length - 1);
    }
  }, [data.length, currentIndex]);

  useEffect(() => {
    if (playing && currentIndex >= data.length - 1 && data.length > 0) {
      setPlaying(false);
    }
  }, [currentIndex, data.length, playing]);

  const currentYear = data[currentIndex]?.year ?? null;

  const currentItems = useMemo(() => {
    if (!data[currentIndex]) return [];
    return [...data[currentIndex].items]
      .sort((a, b) => b.value - a.value)
      .slice(0, topN);
  }, [data, currentIndex, topN]);

  const maxValue = useMemo(() => {
    if (currentItems.length === 0) return 1;
    return Math.max(...currentItems.map((i) => i.value), 1);
  }, [currentItems]);

  const handleToggle = () => {
    if (isAtEnd) {
      setCurrentIndex(0);
      setPlaying(true);
      return;
    }
    setPlaying((p) => !p);
  };

  const handleReplay = () => {
    setCurrentIndex(0);
    setPlaying(true);
  };

  if (data.length === 0) {
    return (
      <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[560px] flex flex-col">
        <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
        <p className="text-xs text-gray-4 mb-6">{subtitle}</p>
        <div className="flex-1 flex items-center justify-center text-sm text-gray-4">
          {locale === "es" ? "No hay datos disponibles" : locale === "fr" ? "Aucune donnée disponible" : locale === "pt" ? "Nenhum dado disponível" : "No data available"}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-navy-card border border-navy-line rounded-lg p-5 h-[560px] flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
          <p className="text-xs text-gray-4">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold text-white tabular-nums leading-none">
            {currentYear}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleToggle}
              className="p-2 rounded-md bg-blue/10 text-blue hover:bg-blue/20 transition-colors"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
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
      </div>

      <div className="mb-3 px-1">
        <input
          type="range"
          min={0}
          max={data.length - 1}
          step={1}
          value={currentIndex}
          onChange={(e) => {
            setCurrentIndex(Number(e.target.value));
            setPlaying(false);
          }}
          className="w-full h-1.5 bg-navy-line rounded-lg appearance-none cursor-pointer accent-blue"
        />
        <div className="flex justify-between text-[10px] text-gray-4 mt-1">
          <span>{data[0]?.year}</span>
          <span>{data[data.length - 1]?.year}</span>
        </div>
      </div>

      <div className="relative flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-1">
          {currentItems.map((item, index) => {
            const hue = stringToHue(item.name);
            const widthPct = (item.value / maxValue) * 100;

            return (
              <div
                key={item.name}
                className="flex items-center gap-3"
                style={{ height: ROW_HEIGHT }}
                title={`${item.name}: ${formatVolume(item.value)}`}
              >
                <span className="w-5 text-xs font-mono text-gray-4 text-right">
                  {index + 1}
                </span>

                {dimension === "country" && (
                  <Flag country={item.name} className="w-6 h-4 rounded flex-shrink-0" />
                )}

                <div className="flex-1 min-w-0 relative h-full flex items-center">
                  <div
                    className="absolute left-0 top-0 bottom-0 rounded-md"
                    style={{
                      width: `${widthPct}%`,
                      background: `linear-gradient(90deg, hsl(${hue}, 75%, 55%), hsl(${hue}, 75%, 45%))`,
                      opacity: 0.85,
                      transition: "width 650ms cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                  <span className="relative z-10 ml-3 text-xs font-medium text-white truncate max-w-[55%]">
                    {item.name}
                  </span>
                </div>

                <span className="text-xs font-mono text-gray-3 text-right w-20 flex-shrink-0">
                  {formatVolume(item.value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
