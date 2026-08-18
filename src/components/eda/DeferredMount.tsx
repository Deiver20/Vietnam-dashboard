"use client";

import { useEffect, useState, ReactNode } from "react";

interface DeferredMountProps {
  children: ReactNode;
  fallback: ReactNode;
  delay?: number;
}

export function DeferredMount({ children, fallback, delay = 0 }: DeferredMountProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), delay);
    return () => window.clearTimeout(id);
  }, [delay]);

  if (!ready) return fallback;
  return children;
}
