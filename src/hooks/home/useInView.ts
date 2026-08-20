"use client";

import { useEffect, useRef, useState } from "react";

/** Sets `inView` true the first time the element intersects the viewport. */
export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.25, ...options }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, inView };
}
