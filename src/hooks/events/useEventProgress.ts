"use client";

import { useEffect, useState } from "react";
import { eventProgress } from "@/app/(marketing)/events/eventsHelpers";
import type { EventItem } from "@/app/(marketing)/events/eventsData";

/** SSR-safe progress: starts with placeholder values, then hydrates to real countdown. */
export function useEventProgress(ev: EventItem) {
  const [progress, setProgress] = useState({ daysLeft: 0, pct: 5, color: "#94959b" });
  useEffect(() => {
    setProgress(eventProgress(ev));
  }, [ev]);
  return progress;
}
