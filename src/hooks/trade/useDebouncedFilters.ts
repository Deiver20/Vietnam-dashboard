"use client";

import { useEffect, useState } from "react";

export function useDebouncedFilters<TFilters, TData>(
  filters: TFilters,
  fetcher: (filters: TFilters) => Promise<TData>,
  delay = 350
): {
  datos: TData | null;
  cargando: boolean;
  error: string | null;
} {
  const [datos, setDatos] = useState<TData | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(async () => {
      setCargando(true);
      setError(null);
      try {
        const result = await fetcher(filters);
        if (cancelled) return;
        setDatos(result);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setCargando(false);
      }
    }, delay);

    return () => {
      clearTimeout(handle);
      cancelled = true;
    };
  }, [filterKey, fetcher, delay]);

  return { datos, cargando, error };
}
