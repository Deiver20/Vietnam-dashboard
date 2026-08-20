import type { PastEventItem } from "../eventsData";
import { pastIndChips } from "../eventsHelpers";

/* ── Render: past event card ────────────────────────── */
export default function PastCard({ ev }: { ev: PastEventItem }) {
  const badge = ev.flagship
    ? <span className="text-[8px] font-bold tracking-[0.08em] uppercase px-[6px] py-[2px] rounded-[3px] bg-yellow-50 text-yellow-600 shrink-0">⭐ Flagship</span>
    : ev.agm
      ? <span className="text-[8px] font-bold tracking-[0.08em] uppercase px-[6px] py-[2px] rounded-[3px] bg-blue-50 text-blue-600 shrink-0">AGM</span>
      : <span className="text-[8px] font-bold tracking-[0.08em] uppercase px-[6px] py-[2px] rounded-[3px] bg-gray-100 text-gray-500 shrink-0">Completed</span>;

  return (
    <div className="p-4 rounded-[var(--radius-md)] border border-gray-200 opacity-[0.78] hover:opacity-100 hover:border-gray-300 transition-all bg-white">
      <div className="flex items-start justify-between gap-2 mb-[9px]">
        <span className="text-[10px] text-gray-400 font-[var(--font-jetbrains)] tracking-[0.03em] whitespace-nowrap">{ev.date}</span>
        {badge}
      </div>
      <div className="text-[13px] font-semibold text-gray-700 leading-[1.3] mb-[7px]">{ev.name}</div>
      <div className="flex items-center gap-[5px] text-[11px] text-gray-400">
        <span>{ev.flag}</span> {ev.location}
      </div>
      <div className="flex flex-wrap gap-1 mt-2">{pastIndChips(ev.industries)}</div>
    </div>
  );
}
