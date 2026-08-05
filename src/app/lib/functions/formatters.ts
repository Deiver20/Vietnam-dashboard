export function formatNumber(value: number, decimals = 0): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatVolume(value: number): string {
  return `${formatNumber(value, 0)} mt`;
}

export function formatCurrency(value: number): string {
  if (!value) return "$-";
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  return `$${formatNumber(value, 0)}`;
}

export function formatYearRange(start?: number, end?: number): string {
  if (!start || !end) return "-";
  return start === end ? String(start) : `${start} - ${end}`;
}

export function formatUSD(value: number, decimals = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "$-";
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatCIFPrice(value: number): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatCorrelation(value: number): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return value.toFixed(2);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "-";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "-";
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi} UTC`;
}
