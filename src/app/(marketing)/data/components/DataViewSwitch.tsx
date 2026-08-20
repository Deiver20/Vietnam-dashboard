"use client";

import { useRouter } from "next/navigation";

type Mode = "list" | "globe";

const ROUTES: Record<Mode, string> = { list: "/data", globe: "/industries" };

/* List / Globe tab switch (marketplace-style) shared by /data (list active)
   and the /industries globe experience (globe active). */
export default function DataViewSwitch({ active = "list" }: { active?: Mode }) {
  const router = useRouter();
  const mode: Mode = active;

  return (
    <div
      className="inline-flex p-1 rounded-full bg-[#020d1c]/70 border border-white/[0.14] backdrop-blur"
      role="tablist"
      aria-label="Data view"
    >
      {(["list", "globe"] as const).map((v) => (
        <button
          key={v}
          role="tab"
          aria-selected={mode === v}
          onClick={() => {
            if (v !== mode) router.push(ROUTES[v]);
          }}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200 ${
            mode === v ? "bg-blue text-white shadow-[0_4px_14px_rgba(0,102,255,0.45)]" : "text-gray-3 hover:text-white"
          }`}
        >
          {v === "globe" ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          )}
          {v === "globe" ? "Globe" : "List"}
        </button>
      ))}
    </div>
  );
}
