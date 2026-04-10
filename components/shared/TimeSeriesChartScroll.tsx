"use client";

import { type CSSProperties } from "react";
import type { AdjustGranularity } from "@/contexts/DateRangeContext";
import { cn } from "@/lib/utils";

/** @deprecated No longer used for scroll width — kept for compatibility. */
export const TIME_SERIES_VISIBLE_POINTS: Record<AdjustGranularity, number> = {
  daily: 30,
  weekly: 12,
  monthly: 12,
  quarterly: 12,
  yearly: 12,
};

/** @deprecated Returns empty style — scroll removed. Kept for import compatibility. */
export function scrollablePlotAreaInnerStyle(
  _dataLength: number,
  _granularity: AdjustGranularity,
): CSSProperties {
  return {};
}

/**
 * Non-scrollable full-width chart wrapper.
 * Previously scrollable — now renders all data points within the container width.
 */
export function TimeSeriesChartScroll({
  className,
  heightClassName = "h-[280px] sm:h-[340px] md:h-[400px]",
  children,
}: {
  dataLength: number;
  granularity: AdjustGranularity;
  className?: string;
  heightClassName?: string;
  children: React.ReactNode;
  scrollToEnd?: boolean;
}) {
  return (
    <div className={cn("w-full min-w-0", className)}>
      <div className={cn("min-h-0", heightClassName)}>
        {children}
      </div>
    </div>
  );
}
