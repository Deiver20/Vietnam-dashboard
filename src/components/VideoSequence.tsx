"use client";

import { useEffect, useRef } from "react";

interface VideoSequenceProps {
  progress: number;
  opacity: number;
  className?: string;
}

export function VideoSequence({ progress, opacity, className }: VideoSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    
    const images: HTMLImageElement[] = [];
    for (let i = 1; i <= 72; i++) {
      const img = new Image();
      img.src = `/videos/video2-frames/frame-${String(i).padStart(3, "0")}.webp`;
      images.push(img);
    }
    imagesRef.current = images;
    loadedRef.current = true;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frameIndex = Math.floor(progress * 75);
    const clampedIndex = Math.max(0, Math.min(75, frameIndex));
    const img = imagesRef.current[clampedIndex];

    if (img && img.complete && img.naturalWidth > 0) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
    }
  }, [progress]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ opacity }}
    />
  );
}
