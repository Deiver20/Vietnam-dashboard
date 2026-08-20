import FilterChipSelect from "@/components/FilterChipSelect";
import FilterReset from "@/components/FilterReset";
import type { MarketplaceController } from "@/hooks/marketplace/useMarketplaceMap";

interface MarketplaceFiltersProps {
  ctrl: MarketplaceController;
  /** Lay out as a column (map panel) instead of a row (list bar). */
  vertical: boolean;
}

/* Shared filter controls — laid out as a row (list bar) or a column (map
   panel). Every slicer follows the /dashboard structure:
   <name> <selected> <chevron>. */
export default function MarketplaceFilters({ ctrl, vertical }: MarketplaceFiltersProps) {
  const {
    fSearch, setFSearch,
    fKind, setFKind,
    fCategory, setFCategory,
    fDestCountry, setFDestCountry,
    fPort, setFPort,
    CATEGORIES, DEST_COUNTRIES, PORTS,
    activeFilterCount, resetFilters,
  } = ctrl;
  const w = vertical ? "w-full justify-between" : "";

  return (
    <>
      {/* Search (raised to the top) with the reset button on its right */}
      <div className={`flex items-center gap-2 ${vertical ? "w-full" : "flex-1 max-w-[340px]"}`}>
        <div className={`flex items-center gap-2.5 border rounded-lg px-3.5 transition-colors flex-1 ${
          fSearch.trim()
            ? "bg-[rgba(0,102,255,0.10)] border-[rgba(0,102,255,0.55)] shadow-[0_0_10px_rgba(0,102,255,0.12)]"
            : "bg-white/[0.05] border-white/[0.1] focus-within:border-[rgba(102,166,255,0.35)]"
        }`}>
          <svg className={`shrink-0 ${fSearch.trim() ? "text-blue-soft" : "text-gray-5"}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={fSearch}
            onChange={(e) => setFSearch(e.target.value)}
            placeholder="Search products, countries…"
            autoComplete="off"
            className="bg-transparent border-none outline-none text-white/90 text-[13px] w-full py-2 placeholder:text-gray-5"
          />
        </div>
        <FilterReset count={activeFilterCount} onReset={resetFilters} className="shrink-0" />
      </div>

      {/* Kind */}
      <FilterChipSelect
        label="Show"
        value={fKind}
        options={[
          { value: "all", label: "All" },
          { value: "product", label: "Products" },
          { value: "offer", label: "Live offers" },
        ]}
        onChange={(v) => setFKind(v as typeof fKind)}
        active={fKind !== "all"}
        className={w}
      />

      {/* Category */}
      <FilterChipSelect
        label="Category"
        value={fCategory}
        options={CATEGORIES.map((c) => ({ value: c, label: c === "all" ? "All categories" : c }))}
        onChange={setFCategory}
        active={fCategory !== "all"}
        className={w}
      />

      {/* Country of destination */}
      <FilterChipSelect
        label="Destination"
        value={fDestCountry}
        options={DEST_COUNTRIES.map((c) => ({ value: c, label: c === "all" ? "All countries" : c }))}
        onChange={setFDestCountry}
        active={fDestCountry !== "all"}
        className={w}
      />

      {/* Dispatch port */}
      <FilterChipSelect
        label="Port"
        value={fPort}
        options={PORTS.map((c) => ({ value: c, label: c === "all" ? "All ports" : c }))}
        onChange={setFPort}
        active={fPort !== "all"}
        className={w}
      />
    </>
  );
}
