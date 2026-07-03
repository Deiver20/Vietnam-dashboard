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
