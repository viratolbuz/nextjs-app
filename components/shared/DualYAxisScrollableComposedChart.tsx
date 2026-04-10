"use client";

import {
  useMemo,
  type ReactNode,
} from "react";
import { ComposedChart, Line, ResponsiveContainer, YAxis } from "recharts";
import type { YAxisProps } from "recharts";
import type { AdjustGranularity } from "@/contexts/DateRangeContext";
import { cn } from "@/lib/utils";

export const DUAL_AXIS_CHART_MARGIN = {
  top: 8,
  right: 0,
  left: 0,
  bottom: 36,
} as const;

export type DualAxisRailConfig = {
  tick?: YAxisProps["tick"];
  stroke?: string;
  tickFormatter?: YAxisProps["tickFormatter"];
  label?: YAxisProps["label"];
  width?: number;
};

function GhostLines({
  yAxisId,
  dataKeys,
}: {
  yAxisId: "left" | "right";
  dataKeys: string[];
}) {
  return (
    <>
      {dataKeys.map((key) => (
        <Line
          key={`${yAxisId}-${key}`}
          yAxisId={yAxisId}
          type="monotone"
          dataKey={key}
          stroke="transparent"
          dot={false}
          isAnimationActive={false}
          legendType="none"
        />
      ))}
    </>
  );
}

/**
 * Full-width non-scrollable dual Y-axis chart.
 * When dataLength > 40, the X-axis shows only the first and last tick labels.
 * All data points are still rendered — only the axis labels are thinned.
 */
export function DualYAxisScrollableComposedChart({
  data,
  dataLength,
  granularity: _granularity,
  heightClassName = "h-[400px]",
  className,
  frameClassName,
  leftMax,
  rightMax,
  leftGhostDataKeys,
  rightGhostDataKeys,
  leftRail,
  rightRail,
  railWidthClassName = "w-[52px] sm:w-[60px]",
  chartMargin = DUAL_AXIS_CHART_MARGIN,
  children,
}: {
  data: Record<string, unknown>[];
  dataLength: number;
  granularity: AdjustGranularity;
  heightClassName?: string;
  className?: string;
  frameClassName?: string;
  leftMax: number;
  rightMax: number;
  leftGhostDataKeys: string[];
  rightGhostDataKeys: string[];
  leftRail: DualAxisRailConfig;
  rightRail: DualAxisRailConfig;
  railWidthClassName?: string;
  chartMargin?: { top: number; right: number; left: number; bottom: number };
  /** @deprecated no longer used — kept for API compatibility */
  scrollToEnd?: boolean;
  children: ReactNode;
}) {
  const pointCount = Math.max(1, data.length, dataLength);

  const frame = cn(
    "flex w-full min-w-0 max-w-full overflow-hidden bg-card",
    frameClassName,
  );

  return (
    <div className={cn("w-full min-w-0", className)}>
      <div className={frame}>
        {/* Left Y-axis rail */}
        <div className={cn("shrink-0 bg-card", railWidthClassName, heightClassName)}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ ...chartMargin, left: 0, right: 0 }}>
              <YAxis
                yAxisId="left"
                domain={[0, leftMax]}
                tick={leftRail.tick}
                stroke={leftRail.stroke ?? "hsl(var(--muted-foreground))"}
                tickFormatter={leftRail.tickFormatter}
                label={leftRail.label}
                width={58}
              />
              <GhostLines yAxisId="left" dataKeys={leftGhostDataKeys} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Center plot — full width, no scroll */}
        <div className={cn("min-h-0 min-w-0 flex-1", heightClassName)}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 6 }}>
              <YAxis yAxisId="left" hide domain={[0, leftMax]} />
              <YAxis yAxisId="right" orientation="right" hide domain={[0, rightMax]} />
              {children}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Right Y-axis rail */}
        <div className={cn("shrink-0 bg-card", railWidthClassName, heightClassName)}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ ...chartMargin, left: 0, right: 0 }}>
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, rightMax]}
                tick={rightRail.tick}
                stroke={rightRail.stroke ?? "hsl(var(--muted-foreground))"}
                tickFormatter={rightRail.tickFormatter}
                label={rightRail.label}
                width={58}
              />
              <GhostLines yAxisId="right" dataKeys={rightGhostDataKeys} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function maxFromNumericKeys(
  rows: Record<string, unknown>[],
  keys: string[],
  floor = 1,
  pad = 1.08,
): number {
  const vals = rows.flatMap((row) => keys.map((k) => Number(row[k]) || 0));
  const m = Math.max(floor, ...vals);
  return m * pad;
}

/**
 * Returns XAxis props that show all labels when data ≤ threshold,
 * or ONLY the first and last label when data > threshold.
 *
 * For the sparse case we pass an explicit `ticks` array with just the
 * first and last value so Recharts renders exactly two tick marks —
 * no intermediate dots, no intermediate lines.
 */
export function sparseXAxisTicks(
  data: Record<string, unknown>[],
  xKey: string,
  threshold = 40,
): { interval: number; ticks?: (string | number)[] } {
  if (data.length <= threshold) {
    return { interval: 0 };
  }
  const first = data[0]?.[xKey] as string | number;
  const last  = data[data.length - 1]?.[xKey] as string | number;
  // interval={0} with an explicit 2-item ticks array = exactly 2 ticks rendered
  return { interval: 0, ticks: [first, last] };
}
