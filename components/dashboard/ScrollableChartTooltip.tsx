"use client";

interface ScrollableChartTooltipItem {
  color?: string;
  name?: string;
  value?: number | string;
}

interface ScrollableChartTooltipProps {
  active?: boolean;
  label?: string;
  payload?: ScrollableChartTooltipItem[];
  valueFormatter?: (value: number, name: string) => string;
}

/**
 * Scrollable chart tooltip - NOT sticky.
 * Uses position: relative (default) so it flows with the chart cursor.
 * Fixed max-height with scrollbar for large datasets.
 */
const ScrollableChartTooltip = ({
  active,
  label,
  payload,
  valueFormatter,
}: ScrollableChartTooltipProps) => {
  if (!active || !payload?.length) return null;

  const items = [...payload]
    .filter((item) => typeof item.value === 'number' && Number(item.value) > 0)
    .sort((a, b) => Number(b.value) - Number(a.value));

  if (!items.length) return null;

  return (
    <div className="w-[280px] overflow-hidden rounded-xl border border-border bg-card/95 shadow-xl backdrop-blur-sm pointer-events-auto">
      <div className="border-b border-border/60 px-3 py-2">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{items.length} visible values</p>
      </div>

      <div className="max-h-48 overflow-y-auto scrollbar-themed px-3 py-2">
        <div className="space-y-1.5">
          {items.map((item, index) => {
            const rawValue = typeof item.value === 'number' ? item.value : Number(item.value ?? 0);
            const name = item.name ?? 'Series';

            return (
              <div key={`${name}-${index}`} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: item.color || 'hsl(var(--primary))' }}
                  />
                  <span className="truncate text-muted-foreground" title={name}>
                    {name}
                  </span>
                </div>
                <span className="shrink-0 font-medium text-foreground">
                  {valueFormatter ? valueFormatter(rawValue, name) : rawValue.toLocaleString('en-IN')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScrollableChartTooltip;
