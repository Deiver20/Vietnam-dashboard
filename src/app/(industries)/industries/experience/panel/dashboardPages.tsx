import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { gsap } from "gsap";
import { shallow } from "zustand/shallow";
import Placeholder from "@/components/Placeholder";
import { VARIABLES } from "./dataCarousel";
import { getCountryDossier } from "../data/api";
import { getCountryFlag } from "../data/countryFlags";
import { DATA_PAGE_COUNT, useIndustriesStore } from "../stores";
import { DASHBOARD_TABS } from "@/app/interfaces/trade/interface";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { Locale } from "@/app/interfaces";
import { IndustriesAiPanel } from "../aiPanel/IndustriesAiPanel";
import { hexToRgb } from "@/app/(dashboard)/dashboard/chartHelpers";
import PageIcon from "@/components/dashboard/PageIcon";
import { Flag } from "@/components/ui/Flag";
import { IndustriesTabContent } from "./IndustriesTabContent";

const Wrapper = styled.div`
  position: absolute;
  inset: 0;
  padding: 0 44px;
  display: flex;
  gap: 16px;
  pointer-events: none;
  visibility: hidden;
  font-family: var(--font-poppins), sans-serif;
`;

/* Column 1 — back button on top, the page list filling the rest.
   data-native-wheel: scrolling over the nav must never trigger the snap-wheel
   tab change; the list scrolls natively instead. */
const LeftCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 176px;
  flex-shrink: 0;
  min-height: 0;
  margin: 28px 0 20px;

  &[data-native-wheel] {
    overscroll-behavior: contain;
  }
`;

/* Column 3 — logo on top, the AI panel filling the rest.
   data-native-wheel: scrolling over the AI panel (chat/insights) must never
   trigger the snap-wheel tab change; it scrolls natively instead. The right
   padding strip of the Wrapper would otherwise hit the map canvas behind, so
   the column extends to the viewport edge (negative margin + padding) to keep
   that whole area native too. */
const RightCol = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  min-height: 0;
  pointer-events: auto;
  margin: 28px 0 20px;
  margin-right: -44px;
  padding-right: 44px;

  &[data-native-wheel] {
    overscroll-behavior: contain;
  }
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  font-family: var(--font-poppins), sans-serif;
  pointer-events: auto;
  margin-bottom: 12px;
`;

const InfoItem = styled.span`
  font-size: 14px;
  color: #d8d8d8;
  font-weight: 600;
  white-space: nowrap;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.65));

  b {
    font-weight: inherit;
  }
`;

const InfoLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #686970;
  margin-right: 6px;
`;

const InfoDivider = styled.span`
  width: 1px;
  height: 12px;
  background: rgba(255, 255, 255, 0.16);
`;

/* Column 2 — THE scroll container. The shell chrome (info line, title) and
   the Vietnam tab content scroll together. The Vietnam views keep their own
   light styling exactly as in the dashboard — the sun/moon toggle only
   affects the shell chrome around them. */
const Body = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  pointer-events: auto;
  padding-top: 28px;
  padding-bottom: 20px;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

/* Sun/moon switch — flips the shell chrome (sidebar, backdrop, AI panel)
   between light (default) and dark. The Vietnam tab views stay light. */
function ThemeToggle({
  dark,
  onToggle,
}: {
  dark: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
      className="pointer-events-auto relative shrink-0 w-[52px] h-[28px] rounded-full border backdrop-blur-md transition-colors cursor-pointer"
      style={{
        background: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.75)",
        borderColor: dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.10)",
      }}
    >
      <span
        className="absolute top-[3px] left-[3px] w-[22px] h-[22px] rounded-full flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transform: dark ? "translateX(24px)" : "translateX(0)",
          background: dark ? "#0a1830" : "#FCB514",
          boxShadow: dark
            ? "0 0 8px rgba(103,166,255,0.5)"
            : "0 0 8px rgba(252,181,20,0.55)",
        }}
      >
        {dark ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.4"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="4" fill="#fff" stroke="none" />
            <line x1="12" y1="1.5" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="22.5" />
            <line x1="1.5" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="22.5" y2="12" />
            <line x1="4.9" y1="4.9" x2="6.6" y2="6.6" />
            <line x1="17.4" y1="17.4" x2="19.1" y2="19.1" />
            <line x1="4.9" y1="19.1" x2="6.6" y2="17.4" />
            <line x1="17.4" y1="6.6" x2="19.1" y2="4.9" />
          </svg>
        )}
      </span>
    </button>
  );
}

/* Language selector — a real control wired to useDashboard.setLocale(). The
   flag renders as an SVG image (react-country-flag) like the REAM dashboard. */
const LOCALES: { value: Locale; label: string; country: string }[] = [
  { value: "en", label: "English", country: "United States" },
  { value: "es", label: "Español", country: "Spain" },
  { value: "fr", label: "Français", country: "France" },
  { value: "pt", label: "Português", country: "Brazil" },
];

function LanguageSelector({ dark }: { dark: boolean }) {
  const locale = useDashboard((s) => s.locale);
  const setLocale = useDashboard((s) => s.setLocale);
  const [open, setOpen] = useState(false);
  const current = LOCALES.find((l) => l.value === locale) ?? LOCALES[0];

  return (
    <div className="pointer-events-auto relative">
      <button
        aria-label="Language selector"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-full border pl-2 pr-2.5 py-1 text-xs font-semibold backdrop-blur-md transition-all cursor-pointer ${
          dark
            ? "bg-white/[0.07] border-white/[0.12] text-white hover:bg-white/[0.12]"
            : "bg-white/85 border-black/[0.10] text-gray-800 shadow-sm hover:bg-white"
        }`}
      >
        <Flag country={current.country} className="w-5 h-3.5 rounded" />
        <span>{current.label}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}
        >
          <polygon points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="Language"
          className={`absolute right-0 top-full mt-1.5 min-w-[140px] rounded-lg border backdrop-blur-md overflow-hidden z-50 ${
            dark
              ? "bg-[#030f1c] border-white/[0.12] shadow-[0_8px_28px_rgba(0,0,0,0.5)]"
              : "bg-white border-black/[0.08] shadow-[0_8px_28px_rgba(0,0,0,0.15)]"
          }`}
        >
          {LOCALES.map((l) => (
            <button
              key={l.value}
              role="option"
              aria-selected={locale === l.value}
              onClick={() => {
                setLocale(l.value);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-left transition-colors cursor-pointer ${
                locale === l.value
                  ? "bg-[#227BFF] text-white"
                  : dark
                    ? "text-gray-3 hover:bg-white/[0.06] hover:text-white"
                    : "text-gray-600 hover:bg-black/[0.04] hover:text-gray-900"
              }`}
            >
              <Flag country={l.country} className="w-5 h-3.5 rounded" />
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Book-open icon for the Cover tab — same stroke language as PageIcon. */
function CoverIcon() {
  return (
    <svg
      className="w-[18px] h-[18px] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

/* ── Cover (page 0) — presentation front page of the dive. ── */
function CoverPage({
  countryId,
  dossier,
  variable,
  dark,
  pages,
}: {
  countryId: string;
  dossier: NonNullable<ReturnType<typeof getCountryDossier>>;
  variable: { label: string; color: string };
  dark: boolean;
  pages: { slug: string; label: string }[];
}) {
  const lightHalo = {
    filter:
      "drop-shadow(0 0 1px rgba(8, 36, 90, 0.85)) drop-shadow(0 0 5px rgba(8, 36, 90, 0.6))",
  };
  const haloStyle = dark ? undefined : lightHalo;
  const label = `text-[11px] font-bold tracking-[0.14em] uppercase mb-2 ${
    dark ? "text-[#686970]" : "text-white"
  }`;
  const body = dark
    ? "text-[#d8d8d8] drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]"
    : "text-white";
  const [r, g, b] = hexToRgb(variable.color).split(",").map(Number);
  const badgeInk =
    (r * 299 + g * 587 + b * 114) / 1000 >= 150 ? "#10131a" : "#ffffff";
  return (
    <div className="flex flex-col gap-7 max-w-[980px] pt-2">
      <div>
        <div className={label} style={haloStyle}>
          Country
        </div>
        <div
          className={`font-semibold ${
            dark ? "drop-shadow-[0_2px_18px_rgba(0,0,0,0.65)]" : ""
          }`}
          style={{
            fontSize: "clamp(40px, 4.2vw, 68px)",
            lineHeight: 1.02,
            ...(dark ? {} : lightHalo),
          }}
        >
          <span style={{ marginRight: 14 }}>{getCountryFlag(countryId)}</span>
          <span
            className={dark ? "grad-blue" : undefined}
            style={
              dark
                ? undefined
                : {
                    background:
                      "linear-gradient(135deg, #FFFFFF 0%, #ECEEF2 55%, #D9DDE4 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }
            }
          >
            {dossier.countryName}
          </span>
        </div>
      </div>
      <div>
        <div className={label} style={haloStyle}>
          Industry
        </div>
        <div
          className={`font-semibold ${
            dark
              ? "text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.7)]"
              : "text-white"
          }`}
          style={{
            fontSize: "clamp(24px, 2.2vw, 36px)",
            lineHeight: 1.1,
            ...(dark ? {} : lightHalo),
          }}
        >
          {dossier.industryName}
        </div>
      </div>
      <div>
        <div className={label} style={haloStyle}>
          Type of data
        </div>
        <span
          className="inline-block text-[13px] font-bold tracking-[0.09em] uppercase px-3.5 py-[7px] rounded backdrop-blur-[6px]"
          style={
            dark
              ? {
                  background: `${variable.color}15`,
                  border: `1px solid ${variable.color}50`,
                  color: variable.color,
                  boxShadow: `0 0 12px ${variable.color}15`,
                }
              : {
                  background: variable.color,
                  border: `1px solid ${variable.color}`,
                  color: badgeInk,
                }
          }
        >
          {variable.label}
        </span>
      </div>
      <div>
        <div className={label} style={haloStyle}>
          Updated
        </div>
        <div className={`text-[16px] font-medium ${body}`} style={haloStyle}>
          {dossier.updatedAt}
        </div>
      </div>
      <div className="max-w-[480px]">
        <div className={label} style={haloStyle}>
          About this dashboard
        </div>
        <p className={`m-0 text-[16px] leading-relaxed ${body}`} style={haloStyle}>
          {dossier.cover.intro}
        </p>
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {pages.map((p) => (
            <span
              key={p.slug}
              className={`text-[11px] font-medium px-2.5 py-[4px] rounded backdrop-blur-md border ${
                dark
                  ? "bg-white/[0.07] border-white/[0.12] text-white/70"
                  : "bg-white/[0.65] border-black/[0.10] text-[#22252c]"
              }`}
            >
              {p.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const clearLock = () => useIndustriesStore.setState({ transitioning: false });

// The store keeps DATA_PAGE_COUNT as a literal so it doesn't have to import
// this chunk's dashboard data — catch any drift between the two here.
if (
  process.env.NODE_ENV !== "production" &&
  DASHBOARD_TABS.length + 1 !== DATA_PAGE_COUNT
) {
  throw new Error(
    `stores DATA_PAGE_COUNT (${DATA_PAGE_COUNT}) is out of sync with DASHBOARD_TABS.length + 1 (${
      DASHBOARD_TABS.length + 1
    })`
  );
}

/* Level 4: the Vietnam dashboard tabs rendered over the experience
   background. Owns every Level-4 lock: 3→4 enter, 4→3 exit and page↔page
   swaps. */
export default function DashboardPages() {
  const level = useIndustriesStore((s) => s.level);
  const countryId = useIndustriesStore((s) => s.selectedCountryId);
  const industryId = useIndustriesStore((s) => s.selectedIndustryId);
  const dataType = useIndustriesStore((s) => s.dataType);
  const pageIndex = useIndustriesStore((s) => s.pageIndex);
  const goToPage = useIndustriesStore((s) => s.goToPage);
  const [displayIndex, setDisplayIndex] = useState(0);
  const dark = useIndustriesStore((s) => s.dashboardDark);
  const toggleDashboardDark = useIndustriesStore((s) => s.toggleDashboardDark);
  const locale = useDashboard((s) => s.locale);
  const t = getTranslation(locale);
  const wrapRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Tab list: Cover + the 11 Vietnam dashboard tabs (translated labels).
  const pages = useMemo(
    () => [
      { slug: "cover", label: "Cover" },
      ...DASHBOARD_TABS.map((tab) => ({
        slug: tab.id,
        label: t.nav[tab.labelKey],
      })),
    ],
    [locale] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const dossier = useMemo(
    () =>
      countryId && industryId ? getCountryDossier(countryId, industryId) : null,
    [countryId, industryId]
  );

  useEffect(() => {
    const s = useIndustriesStore.getState();
    if (s.level !== 4) return;
    const wrap = wrapRef.current;
    const body = bodyRef.current;
    if (!wrap || !body) return;
    setDisplayIndex(s.pageIndex);
    body.scrollTop = 0;
    gsap.fromTo(
      wrap,
      { autoAlpha: 0, y: 70 },
      { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", onComplete: clearLock }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsub = useIndustriesStore.subscribe(
      (s) => [s.level, s.pageIndex] as const,
      ([lvl, idx], [prevLvl, prevIdx]) => {
        const wrap = wrapRef.current;
        const body = bodyRef.current;
        if (!wrap || !body) return;

        if (prevLvl === 3 && lvl === 4) {
          setDisplayIndex(idx);
          body.scrollTop = 0;
          gsap.fromTo(
            wrap,
            { autoAlpha: 0, y: 70 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              delay: 0.25,
              ease: "power3.out",
              onComplete: clearLock,
            }
          );
        } else if (prevLvl === 4 && lvl === 3) {
          gsap.to(wrap, {
            autoAlpha: 0,
            y: 70,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => gsap.delayedCall(0.45, clearLock),
          });
        } else if (lvl === 4 && prevLvl === 4 && idx !== prevIdx) {
          const dir = idx > prevIdx ? 1 : -1;
          tlRef.current?.kill();
          const tl = gsap.timeline({ onComplete: clearLock });
          tl.to(body, {
            autoAlpha: 0,
            y: -20 * dir,
            duration: 0.28,
            ease: "power2.in",
          });
          tl.add(() => {
            setDisplayIndex(idx);
            body.scrollTop = 0;
          });
          tl.fromTo(
            body,
            { autoAlpha: 0, y: 26 * dir },
            { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" },
            "+=0.05"
          );
          tlRef.current = tl;
        }
      },
      { equalityFn: shallow }
    );
    return () => {
      unsub();
      tlRef.current?.kill();
    };
  }, []);

  if (!dossier || level < 3) return null;

  const variable =
    VARIABLES.find((v) => v.key === (dataType ?? "imports")) ?? VARIABLES[0];
  const isCover = displayIndex === 0;
  const tab = DASHBOARD_TABS[Math.min(Math.max(displayIndex - 1, 0), DASHBOARD_TABS.length - 1)];
  const accent = variable.color;
  const accentRgb = hexToRgb(accent);

  return (
    <Wrapper ref={wrapRef}>
      {/* ── Column 1: back button + page list ── */}
      <LeftCol data-native-wheel>
        <button
          className={`pointer-events-auto w-full rounded-[14px] backdrop-blur-[18px] flex items-center gap-2.5 py-2.5 px-3 text-[11px] font-medium text-left transition-all cursor-pointer ${
            dark ? "text-[#c5c6cc] hover:text-white" : "text-gray-600 hover:text-gray-900"
          }`}
          style={
            dark
              ? {
                  background: "rgba(0, 12, 26, 0.72)",
                  border: "1px solid rgba(102, 166, 255, 0.18)",
                  boxShadow: "0 0 32px rgba(0, 40, 90, 0.30)",
                }
              : {
                  background: "rgba(255, 255, 255, 0.82)",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  boxShadow: "0 4px 28px rgba(0, 0, 0, 0.12)",
                }
          }
          onClick={() => useIndustriesStore.getState().closePages()}
        >
          <span aria-hidden="true">←</span>
          Back
        </button>
        <div
          className="pointer-events-auto flex-1 min-h-0 w-full rounded-[14px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden backdrop-blur-[18px] flex flex-col"
          style={
            dark
              ? {
                  background: "rgba(0, 12, 26, 0.72)",
                  border: "1px solid rgba(102, 166, 255, 0.18)",
                  boxShadow: "0 0 32px rgba(0, 40, 90, 0.30)",
                }
              : {
                  background: "rgba(255, 255, 255, 0.82)",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  boxShadow: "0 4px 28px rgba(0, 0, 0, 0.12)",
                }
          }
        >
          <div
            className="flex flex-col w-full"
            role="tablist"
            aria-label="Data pages"
            aria-orientation="vertical"
          >
            {pages.map((p, i) => {
              const isActive = level === 4 && pageIndex === i;
              return (
                <Fragment key={p.slug}>
                  {i > 0 && (
                    <div
                      className={`h-px w-full self-stretch shrink-0 ${dark ? "bg-white/[0.06]" : "bg-black/[0.06]"}`}
                      aria-hidden="true"
                    />
                  )}
                  <button
                    className={`relative flex flex-row items-center gap-2.5 w-full py-2.5 px-3 text-[11px] font-medium transition-all cursor-pointer text-left ${
                      isActive
                        ? dark
                          ? "text-white"
                          : "text-gray-900"
                        : dark
                          ? "text-[#94959b] hover:text-[#c5c6cc] hover:bg-white/[0.03]"
                          : "text-gray-500 hover:text-gray-800 hover:bg-black/[0.03]"
                    }`}
                    style={
                      isActive
                        ? {
                            background: `${accent}22`,
                            boxShadow: `inset 0 0 0 1px ${accent}55, 0 0 12px ${accent}22`,
                          }
                        : {}
                    }
                    onClick={() => goToPage(i)}
                    role="tab"
                    aria-selected={isActive}
                  >
                    <span className="shrink-0" style={{ color: isActive ? accent : undefined }}>
                      {i === 0 ? (
                        <CoverIcon />
                      ) : (
                        <PageIcon index={i - 1} />
                      )}
                    </span>
                    <span className="leading-tight text-left whitespace-normal flex-1 min-w-0">
                      {p.label}
                    </span>
                    {isActive && (
                      <span
                        className="absolute top-1.5 bottom-1.5 right-0 w-[2px] rounded-full"
                        style={{ background: accent }}
                      />
                    )}
                  </button>
                </Fragment>
              );
            })}
          </div>

          <div className="mt-auto w-full shrink-0 px-6 pb-6 [@media(max-height:720px)]:hidden">
            <img
              src="https://res.cloudinary.com/wcwmpxez/image/upload/v1784647437/ezgif.com-optimize_n4r1ym.gif"
              alt=""
              aria-hidden="true"
              className="block w-full h-auto"
              style={{
                opacity: 0.75,
                boxShadow: "-4px -4px 16px 0 rgba(209, 247, 255, 0.75)",
                borderRadius: 1000,
              }}
            />
          </div>
        </div>
      </LeftCol>

      {/* ── Column 2: ONE scroll container — the shell chrome and the tab
          content scroll together. ── */}
      <Body ref={bodyRef} data-native-wheel>
        {!isCover && (
          <InfoRow>
            <InfoItem>
              <span style={{ fontSize: "clamp(18px, 2vw, 28px)", lineHeight: 1.25 }}>
                <span style={{ marginRight: 8 }}>{getCountryFlag(countryId!)}</span>
                <span className="grad-blue">{dossier.countryName}</span>
              </span>
            </InfoItem>
            <InfoDivider />
            <InfoItem>
              <span
                style={{
                  fontSize: "clamp(13.2px, 1.54vw, 22px)",
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 500,
                }}
              >
                {dossier.industryName}
              </span>
            </InfoItem>
            <InfoDivider />
            <InfoItem
              style={{
                color: accent,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                filter: `drop-shadow(0 0 10px ${accent}55)`,
              }}
            >
              {variable.label}
            </InfoItem>
            <InfoDivider />
            <InfoItem>
              <InfoLabel>Updated</InfoLabel>
              {dossier.updatedAt}
            </InfoItem>
          </InfoRow>
        )}

        <div className="pointer-events-auto w-full flex items-center justify-end gap-3 mb-3">
          <div className="flex items-center gap-2 shrink-0">
            <LanguageSelector dark={dark} />
            <ThemeToggle dark={dark} onToggle={toggleDashboardDark} />
          </div>
        </div>

        {isCover && (
          <CoverPage
            countryId={countryId!}
            dossier={dossier}
            variable={variable}
            dark={dark}
            pages={pages}
          />
        )}

        {!isCover && (
          <div className="mb-5 flex items-end justify-between gap-6 border-b border-white/[0.12] pb-3">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="shrink-0 text-[10px] font-semibold tabular-nums tracking-[0.18em] text-[#7d9ac7]"
                aria-hidden="true"
              >
                {String(displayIndex).padStart(2, "0")}
              </span>
              <span className="h-4 w-px shrink-0 bg-white/[0.2]" aria-hidden="true" />
              <h3 className="m-0 truncate text-[19px] font-medium tracking-[-0.015em] text-white">
                {t.nav[tab.labelKey]}
              </h3>
            </div>
            <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.16em] text-[#7d8492]">
              {t.nav.dashboardPages}
            </span>
          </div>
        )}

        {!isCover && <IndustriesTabContent tabId={tab.id} />}
      </Body>

      {/* ── Column 3: logo + AI panel ── */}
      <RightCol data-native-wheel>
        <Placeholder
          className="h-7 w-auto min-w-[62px] shrink-0 absolute top-0 right-0"
          text="AGM"
          originalFile="assets/logoAGMLightShort.svg"
        />
        <div className="flex-1 min-h-0 w-full flex justify-end mt-10">
          <IndustriesAiPanel />
        </div>
      </RightCol>
    </Wrapper>
  );
}
