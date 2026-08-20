"use client";

/* Shared "reset filters" control used by /data, /marketplace, /latest and /events.
   Shows the reset icon plus a count badge of how many filters are currently
   applied, so the user can tell at a glance that filtering is active. When no
   filter is applied the button is dimmed and inert. */
export default function FilterReset({
  count,
  onReset,
  label,
  className = "",
}: {
  count: number;
  onReset: () => void;
  /** Optional text shown next to the icon (e.g. "Reset"). Icon-only when omitted. */
  label?: string;
  className?: string;
}) {
  const active = count > 0;
  const title = active
    ? `Reset ${count} active filter${count > 1 ? "s" : ""}`
    : "No filters applied";

  return (
    <button
      type="button"
      onClick={onReset}
      disabled={!active}
      aria-label={title}
      title={title}
      className={`relative inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
        active
          ? "text-[#67A6FF] bg-[rgba(0,102,255,0.12)] border border-[rgba(0,102,255,0.45)] hover:bg-[rgba(0,102,255,0.22)] hover:text-white shadow-[0_0_10px_rgba(0,102,255,0.14)]"
          : "text-[#686970] border border-transparent opacity-50 cursor-default"
      } ${className}`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        className="shrink-0"
      >
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
      {label && <span>{label}</span>}
      {active && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#0066ff] text-white text-[10px] font-bold inline-flex items-center justify-center ring-2 ring-black/60 shadow-[0_0_6px_rgba(0,102,255,0.6)]">
          {count}
        </span>
      )}
    </button>
  );
}
