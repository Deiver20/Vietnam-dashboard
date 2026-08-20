import Link from "next/link";
import { TRENDING } from "../data";

/* ── Sidebar ────────────────────────────────────────── */
export default function LatestSidebar() {
  return (
    // Below 1200 the rail stacks under the article list (it used to be
    // `hidden`, making its content unreachable on tablet/mobile).
    <aside
      className="w-[296px] shrink-0 flex flex-col gap-3.5 pb-5 max-[1200px]:w-full"
      aria-label="Sidebar"
    >
      {/* Trending */}
      <div className="rounded-[var(--radius-md)] overflow-hidden border border-gray-200 bg-white">
        <div className="px-4 pt-3 pb-2.5 flex items-center justify-between border-b border-gray-100">
          <span className="flex items-center gap-[7px] text-[10px] font-bold tracking-[0.12em] uppercase text-gray-500">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            Trending Topics
          </span>
          <a href="#" className="text-[10px] font-semibold text-blue-600 hover:text-blue-800">See all →</a>
        </div>
        <div className="p-4">
          <div className="flex flex-col gap-0.5">
            {TRENDING.map((t, i) => (
              <div key={t.topic} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <span className="w-4 text-right text-[11px] font-bold text-gray-400 font-[var(--font-jetbrains)] shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{t.topic}</div>
                  <div className="text-[10px] text-gray-500 font-[var(--font-jetbrains)] mt-0.5">{t.count} articles</div>
                </div>
                <span className={`text-[10px] font-bold shrink-0 ${t.up ? "text-green-600" : "text-red-500"}`}>{t.delta}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Promo */}
      <div className="rounded-[var(--radius-md)] overflow-hidden border border-blue-200 bg-white">
        <div className="p-4">
          <div className="inline-block text-[9px] font-bold tracking-[0.1em] uppercase text-blue-600 bg-blue-50 px-2 py-[3px] rounded mb-2.5">AGM Data Platform</div>
          <h4 className="text-[15px] font-semibold text-gray-900 leading-[1.3] mb-2">Access full market intelligence</h4>
          <p className="text-xs text-gray-600 leading-relaxed mb-3.5">2,000+ dashboards on imports, exports, pricing and production across 11 industries and 70+ countries.</p>
          <Link href="/data" className="btn btn--primary text-xs py-2 px-4 w-full justify-center">Explore Data →</Link>
        </div>
      </div>
    </aside>
  );
}
