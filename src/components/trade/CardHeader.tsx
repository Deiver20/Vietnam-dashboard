"use client";

import type { ReactNode } from "react";
import { useScopeLight } from "@/app/lib/functions/chartPalette";
import { darkTheme, lightTheme, type TradeTheme } from "./TradeThemeContext";

const fontQ = "var(--font-poppins), Poppins, sans-serif";

/* Una única receta de encabezado para todos los gráficos: título de 16px
   semibold + subtítulo gris opcional + controles a la derecha. Los colores
   se toman del tema trade cuando la tarjeta es temática (ChartCard) o del
   scope cuando la tarjeta es navy (race, total imports, proyección), para
   que en el shell light/dark y en el dashboard standalone luzca igual. */
export function CardHeader({
  title,
  subtitle,
  subtitleColor,
  actions,
  theme,
}: {
  title?: ReactNode;
  subtitle?: string;
  subtitleColor?: string;
  actions?: ReactNode;
  theme?: TradeTheme;
}) {
  const { ref, light } = useScopeLight();
  const T = theme ?? (light ? lightTheme : darkTheme);

  return (
    <div
      ref={ref}
      className="mb-3 flex shrink-0 flex-wrap items-start justify-between gap-3 max-[639px]:flex-col max-[639px]:items-stretch"
    >
      <div className="min-w-0 flex-1">
        {title ? (
          <h3
            className="text-base font-semibold leading-snug"
            style={{ fontFamily: fontQ, letterSpacing: "-0.01em", color: T.textPrimary }}
          >
            {title}
          </h3>
        ) : null}
        {subtitle ? (
          <p
            className="mt-1 text-xs leading-relaxed"
            style={{ fontFamily: fontQ, color: subtitleColor ?? T.textMuted }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="shrink-0 max-[639px]:self-end">{actions}</div>
      ) : null}
    </div>
  );
}
