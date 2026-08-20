"use client";

import Link from "next/link";
import { useEffect } from "react";

export function MarketingMobileMenu({
  links,
  isActive,
  onClose,
}: {
  links: { href: string; label: string }[];
  isActive: (href: string) => boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div id="mobile-menu" className="fixed inset-0 z-[120] lg:hidden">
      <button
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] cursor-default"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div
        className="absolute right-0 top-0 h-full w-[85vw] max-w-[360px] bg-[rgba(2,16,34,0.97)] backdrop-blur-[20px] border-l border-white/[0.08] flex flex-col"
        style={{
          height: "100dvh",
          animation: "panelInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex items-center justify-between h-[68px] px-5 border-b border-white/[0.08] shrink-0">
          <span className="text-[12px] font-semibold tracking-[0.14em] uppercase text-white/50">
            Menu
          </span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="w-11 h-11 -mr-2 flex items-center justify-center rounded-full text-white/80 hover:text-white cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={onClose}
              className={`flex items-center min-h-12 px-5 text-[14px] font-medium tracking-[0.08em] uppercase transition-colors ${
                isActive(l.href)
                  ? "text-white border-l-2 border-[#0066ff] bg-white/[0.04]"
                  : "text-white/75 hover:text-white border-l-2 border-transparent"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="px-5 pt-4 pb-5 border-t border-white/[0.08] flex flex-col gap-2.5 shrink-0">
          <a href="#" className="btn btn--ghost-sm w-full justify-center min-h-11">
            Log In
          </a>
          <a href="#cta" onClick={onClose} className="btn btn--primary-sm w-full justify-center min-h-11">
            Sign Up Free
          </a>
        </div>
      </div>
    </div>
  );
}
