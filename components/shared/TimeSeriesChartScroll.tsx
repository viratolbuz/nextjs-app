"use client";

import { useLayoutEffect, useMemo, useRef, type CSSProperties } from "react";
import type { AdjustGranularity } from "@/contexts/DateRangeContext";
import { cn } from "@/lib/utils";

/** Default number of periods visible without scrolling (approx. one viewport). */
export const TIME_SERIES_VISIBLE_POINTS: Record<AdjustGranularity, number> = {
  daily: 30,
  weekly: 12,
  monthly: 12,
  quarterly: 12,
  yearly: 12,
};

const VIEWPORT_TARGET_PX = 900;

/**
 * Minimum pixel width for the plot when all points are laid out (Highcharts
 * `scrollablePlotArea.minWidth` style). Wider than the container → horizontal scroll.
 */
export function timeSeriesChartMinWidth(
  dataLength: number,
  granularity: AdjustGranularity,
): number {
  const n = Math.max(dataLength, 1);
  const visible = TIME_SERIES_VISIBLE_POINTS[granularity];
  const perPoint = VIEWPORT_TARGET_PX / visible;
  return n * perPoint;
}

/**
 * Inner wrapper style: at least full width of the scrollport, and at least the
 * ideal plot min width — same idea as Highcharts scrollable plot + native overflow scroll.
 */
export function scrollablePlotAreaInnerStyle(
  dataLength: number,
  granularity: AdjustGranularity,
): CSSProperties {
  const px = timeSeriesChartMinWidth(dataLength, granularity);
  return { minWidth: `max(100%, ${px}px)` };
}

export function TimeSeriesChartScroll({
  dataLength,
  granularity,
  className,
  heightClassName = "h-[280px] sm:h-[340px] md:h-[400px]",
  children,
  scrollToEnd = true,
}: {
  dataLength: number;
  granularity: AdjustGranularity;
  className?: string;
  heightClassName?: string;
  children: React.ReactNode;
  /** When true, align with Highcharts `scrollPositionX: 1` (end / latest). */
  scrollToEnd?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerStyle = useMemo(
    () => scrollablePlotAreaInnerStyle(dataLength, granularity),
    [dataLength, granularity],
  );

  useLayoutEffect(() => {
    if (!scrollToEnd) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
  }, [scrollToEnd, dataLength, granularity]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "w-full min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-themed",
        className,
      )}
      style={
        {
          WebkitOverflowScrolling: "touch",
        } as CSSProperties
      }
    >
      <div className={cn("min-h-0", heightClassName)} style={innerStyle}>
        {children}
      </div>
    </div>
  );
}
