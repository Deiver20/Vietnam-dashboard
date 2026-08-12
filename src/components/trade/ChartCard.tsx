"use client";

import type { ReactNode } from "react";
import { useTradeTheme } from "./TradeThemeContext";
import { CardHeader } from "./CardHeader";

export function ChartCard({
  eyebrow,
  title,
  subtitle,
  acciones,
  children,
}: {
  eyebrow?: string;
  title?: ReactNode;
  subtitle?: string;
  acciones?: ReactNode;
  children?: ReactNode;
}) {
  const T = useTradeTheme();
  return (
    <div
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-lg border p-3 transition-all duration-300 ease-out hover:-translate-y-0.5 sm:p-4"
      style={{
        backgroundColor: T.surface,
        borderColor: T.border,
        backdropFilter: "blur(14px)",
        boxShadow: T.mode === "dark" ? "0 0 24px rgba(0, 40, 90, 0.25)" : "0 1px 2px rgba(6,37,75,0.06)",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100"
        style={{ backgroundColor: T.accent }}
      />
      {eyebrow || title ? (
        <CardHeader theme={T} title={title} subtitle={subtitle} actions={acciones} />
      ) : null}
      {children ? <div className="relative min-h-[200px] flex-1">{children}</div> : null}
    </div>
  );
}
