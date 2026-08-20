"use client";

import { useCallback, useEffect, useState } from "react";

const EVT = "agm-bookmarks-changed";

function read(storageKey: string): number[] {
  try {
    const v = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/* Bookmark state for one item (event, news post, …), persisted per
   storageKey in localStorage and kept in sync across every card/modal
   showing the same item (custom event). */
export function useBookmark(id: number, storageKey: string) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(read(storageKey).includes(id));
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [id, storageKey]);

  const toggle = useCallback(() => {
    const cur = read(storageKey);
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    localStorage.setItem(storageKey, JSON.stringify(next));
    window.dispatchEvent(new Event(EVT));
  }, [id, storageKey]);

  return { saved, toggle };
}
