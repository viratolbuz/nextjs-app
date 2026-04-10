/** "Aug 2026" / "Aug 2026" → "Aug-2026" for report matrix headers */
export function formatReportMonthHeader(label: string): string {
  const t = label.trim().replace(/\s+/g, " ");
  const m = t.match(/^([A-Za-z]{3})\s+(\d{4})$/);
  if (m) {
    const mon = m[1]!.charAt(0).toUpperCase() + m[1]!.slice(1).toLowerCase();
    return `${mon}-${m[2]}`;
  }
  const parts = t.split(" ");
  if (parts.length >= 2) {
    const mon = parts[0]!.charAt(0).toUpperCase() + parts[0]!.slice(1).toLowerCase();
    return `${mon}-${parts[parts.length - 1]}`;
  }
  return t;
}
