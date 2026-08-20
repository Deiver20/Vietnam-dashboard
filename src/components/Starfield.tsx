"use client";

import React, { useEffect, useMemo, useState } from "react";

/**
 * Twinkling starfield — faint light-blue dots that blink (the same effect used
 * behind the /data hero). Rendered only on the client to avoid React hydration
 * mismatches caused by differing style serialization between server and client.
 * Relies on the global `starTwinkle` keyframes.
 *
 * Render it inside a `relative` (or absolutely-positioned) container.
 */
interface StarfieldProps {
  count?: number;
  className?: string;
}

export default function Starfield({ count = 120, className = "" }: StarfieldProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stars = useMemo(() => {
    const hash = (i: number, k: number) => {
      const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
      return x - Math.floor(x);
    };
    const out = [];
    for (let i = 0; i < count; i++) {
      const size = hash(i, 3) > 0.7 ? 2 : 1;
      out.push(
        <div
          key={i}
          className="absolute rounded-full bg-[#b3d9ff]"
          style={{
            top: `${(hash(i, 1) * 100).toFixed(3)}%`,
            left: `${(hash(i, 2) * 100).toFixed(3)}%`,
            width: size,
            height: size,
            opacity: 0.3 + hash(i, 4) * 0.7,
            animation: `starTwinkle ${(2 + hash(i, 5) * 3).toFixed(2)}s ease-in-out infinite`,
            animationDelay: `${(hash(i, 6) * 5).toFixed(2)}s`,
          }}
        />
      );
    }
    return out;
  }, [count]);

  return (
    <div className={`pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      {mounted ? stars : null}
    </div>
  );
}
