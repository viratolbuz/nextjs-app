"use client";

import { useMemo, type CSSProperties } from "react";
import {
  Area,
  CartesianGrid,
  Line,
  Tooltip,
  XAxis,
} from "recharts";
import type { AdjustGranularity } from "@/contexts/DateRangeContext";
import InteractiveLegend from "@/components/shared/InteractiveLegend";
import { DualYAxisScrollableComposedChart, sparseXAxisTicks } from "@/components/shared/DualYAxisScrollableComposedChart";
import { cn } from "@/lib/utils";

export type StatusOverviewRow = {
  period: string;
  Active: number;
  Inactive: number;
  Hold: number;
};

const CHART_MARGIN = { top: 12, right: 0, left: 0, bottom: 52 } as const;
const AXIS_TICK = { fontSize: 10 };
const AXIS_STROKE = "hsl(var(--muted-foreground))";

type TooltipStyle = CSSProperties;

export function StatusOverviewSplitChart({
  data,
  dataLength,
  granularity,
  heightClassName = "h-[400px]",
  hiddenSeries,
  toggleSeries,
  tooltipStyle,
  className,
}: {
  data: StatusOverviewRow[];
  dataLength: number;
  granularity: AdjustGranularity;
  heightClassName?: string;
  hiddenSeries: Set<string>;
  toggleSeries: (name: string) => void;
  tooltipStyle: TooltipStyle;
  className?: string;
}) {
  const pointCount = Math.max(1, data.length, dataLength);

  const leftMax = useMemo(() => {
    const vals = data.flatMap((d) => [Number(d.Active) || 0, Number(d.Hold) || 0]);
    const m = Math.max(1, ...vals);
    return m * 1.08;
  }, [data]);

  const rightMax = useMemo(() => {
    const vals = data.map((d) => Number(d.Inactive) || 0);
    const m = Math.max(1, ...vals);
    return m * 1.08;
  }, [data]);

  const legendPayload = useMemo(
    () => [
      { value: "Active", color: "hsl(var(--metric-spend))" },
      { value: "Hold", color: "hsl(var(--metric-revenue))" },
      { value: "Inactive", color: "hsl(var(--metric-leads))" },
    ],
    [],
  );

  const xAxisProps = useMemo(() => sparseXAxisTicks(data as Record<string, unknown>[], "period", 40), [data]);

  return (
    <div className={cn("w-full min-w-0", className)}>
      <DualYAxisScrollableComposedChart
        data={data}
        dataLength={pointCount}
        granularity={granularity}
        heightClassName={heightClassName}
        frameClassName="rounded-lg border border-border/70 bg-card"
        railWidthClassName="w-[52px] sm:w-[58px]"
        leftMax={leftMax}
        rightMax={rightMax}
        leftGhostDataKeys={["Active", "Hold"]}
        rightGhostDataKeys={["Inactive"]}
        leftRail={{
          tick: AXIS_TICK,
          stroke: AXIS_STROKE,
          width: 40,
        }}
        rightRail={{
          tick: AXIS_TICK,
          stroke: AXIS_STROKE,
          width: 40,
        }}
        chartMargin={CHART_MARGIN}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
        />
        <XAxis
          dataKey="period"
          tick={AXIS_TICK}
          stroke={AXIS_STROKE}
          {...xAxisProps}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="Active"
          stroke="hsl(var(--metric-spend))"
          strokeWidth={2}
          dot={{ r: 3 }}
          name="Active"
          hide={hiddenSeries.has("Active")}
        />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="Hold"
          stroke="hsl(var(--metric-revenue))"
          fill="hsl(var(--metric-revenue) / 0.15)"
          strokeWidth={2}
          name="Hold"
          hide={hiddenSeries.has("Hold")}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="Inactive"
          stroke="hsl(var(--metric-leads))"
          strokeWidth={2}
          dot={{ r: 3 }}
          name="Inactive"
          hide={hiddenSeries.has("Inactive")}
        />
      </DualYAxisScrollableComposedChart>

      <InteractiveLegend
        payload={legendPayload}
        hiddenSeries={hiddenSeries}
        onToggle={toggleSeries}
      />
    </div>
  );
}
