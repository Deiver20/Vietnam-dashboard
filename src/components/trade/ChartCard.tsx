"use client";

import type { ReactNode } from "react";
import { useTradeTheme } from "./TradeThemeContext";

const fontQ = "var(--font-poppins), Poppins, sans-serif";

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
        <div className="mb-2 flex shrink-0 items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow ? (
              <span
                className="mb-1.5 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em]"
                style={{ fontFamily: fontQ, color: T.accentNavy }}
              >
                <span className="inline-block h-px w-8 shrink-0" style={{ backgroundColor: T.accent }} />
                {eyebrow}
              </span>
            ) : null}
            {title ? (
              <h3
                className="text-base leading-tight sm:text-lg"
                style={{ fontFamily: fontQ, fontWeight: 600, letterSpacing: "-0.01em", color: T.textPrimary }}
              >
                {title}
              </h3>
            ) : null}
            {subtitle ? (
              <p
                className="mt-1 hidden text-xs sm:block"
                style={{ fontFamily: fontQ, color: T.textMuted }}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
          {acciones ? <div className="shrink-0">{acciones}</div> : null}
        </div>
      ) : null}
      {children ? <div className="relative min-h-[200px] flex-1">{children}</div> : null}
    </div>
  );
}
