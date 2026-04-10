"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  ComposedChart,
  Line,
  ResponsiveContainer,
  YAxis,
} from "recharts";
import type { YAxisProps } from "recharts";
import type { AdjustGranularity } from "@/contexts/DateRangeContext";
import { scrollablePlotAreaInnerStyle } from "@/components/shared/TimeSeriesChartScroll";
import { cn } from "@/lib/utils";

export const DUAL_AXIS_CHART_MARGIN = {
  top: 12,
  right: 0,
  left: 0,
  bottom: 52,
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
 * Fixed left/right Y-axes with a horizontally scrollable center plot (grid, X-axis,
 * series). Matches Highcharts-style scrollable plot + sticky rails for Recharts.
 */
export function DualYAxisScrollableComposedChart({
  data,
  dataLength,
  granularity,
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
  scrollToEnd = true,
  children,
}: {
  data: Record<string, unknown>[];
  dataLength: number;
  granularity: AdjustGranularity;
  heightClassName?: string;
  className?: string;
  /** Optional border/radius on the flex frame (e.g. Status-style card). */
  frameClassName?: string;
  leftMax: number;
  rightMax: number;
  leftGhostDataKeys: string[];
  rightGhostDataKeys: string[];
  leftRail: DualAxisRailConfig;
  rightRail: DualAxisRailConfig;
  railWidthClassName?: string;
  chartMargin?: typeof DUAL_AXIS_CHART_MARGIN;
  scrollToEnd?: boolean;
  children: ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pointCount = Math.max(1, data.length, dataLength);
  const centerInnerStyle = useMemo(
    () => scrollablePlotAreaInnerStyle(pointCount, granularity),
    [pointCount, granularity],
  );

  useLayoutEffect(() => {
    if (!scrollToEnd) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
  }, [scrollToEnd, dataLength, granularity, pointCount]);

  const frame = cn(
    "flex w-full min-w-0 max-w-full overflow-hidden bg-card",
    frameClassName,
  );

  return (
    <div className={cn("w-full min-w-0", className)}>
      <div className={frame}>
        <div
          className={cn(
            "shrink-0 border-r border-border bg-card",
            railWidthClassName,
            heightClassName,
          )}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={chartMargin}>
              <YAxis
                yAxisId="left"
                domain={[0, leftMax]}
                tick={leftRail.tick}
                stroke={leftRail.stroke ?? "hsl(var(--muted-foreground))"}
                tickFormatter={leftRail.tickFormatter}
                label={leftRail.label}
                width={leftRail.width ?? 44}
              />
              <GhostLines yAxisId="left" dataKeys={leftGhostDataKeys} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div
          ref={scrollRef}
          className="min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-themed"
          style={{ WebkitOverflowScrolling: "touch" } as CSSProperties}
        >
          <div className={cn("min-h-0", heightClassName)} style={centerInnerStyle}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{ ...chartMargin, left: 2, right: 2 }}
              >
                <YAxis yAxisId="left" hide domain={[0, leftMax]} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  hide
                  domain={[0, rightMax]}
                />
                {children}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          className={cn(
            "shrink-0 border-l border-border bg-card",
            railWidthClassName,
            heightClassName,
          )}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={chartMargin}>
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, rightMax]}
                tick={rightRail.tick}
                stroke={rightRail.stroke ?? "hsl(var(--muted-foreground))"}
                tickFormatter={rightRail.tickFormatter}
                label={rightRail.label}
                width={rightRail.width ?? 44}
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
  const vals = rows.flatMap((row) =>
    keys.map((k) => Number(row[k]) || 0),
  );
  const m = Math.max(floor, ...vals);
  return m * pad;
}
