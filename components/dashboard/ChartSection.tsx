"use client";

import { useMemo } from "react";
import { Area, CartesianGrid, Line, Tooltip, XAxis } from "recharts";
import { chartData, performanceEntries } from "@/services/appData.service";
import InteractiveLegend, {
  useHiddenSeries,
} from "@/components/shared/InteractiveLegend";
import {
  DualYAxisScrollableComposedChart,
  maxFromNumericKeys,
} from "@/components/shared/DualYAxisScrollableComposedChart";
import { Card, CardContent } from "@/components/ui/card";
import {
  useDateRange,
  buildDashboardPerformanceSeries,
} from "@/contexts/DateRangeContext";
import { formatAmountFromLakhs } from "@/lib/amount";

const axisMuted = { fill: "hsl(var(--muted-foreground))", fontSize: 11 };

const ChartSection = () => {
  const { state, formatRangeSpan, presetLabel, adjustLabel } = useDateRange();
  const { hiddenSeries, toggleSeries } = useHiddenSeries();

  const { data: chartSeries, xKey } = useMemo(
    () =>
      buildDashboardPerformanceSeries(
        state.adjust,
        state.range,
        chartData.performanceTrend,
        performanceEntries,
      ),
    [state.adjust, state.range],
  );

  const leftMax = useMemo(
    () =>
      maxFromNumericKeys(chartSeries, ["spend", "revenue", "cpa"], 1, 1.05),
    [chartSeries],
  );
  const rightMax = useMemo(
    () => maxFromNumericKeys(chartSeries, ["leads", "roas"], 1, 1.08),
    [chartSeries],
  );

  const formatValue = (value: number, name: string) => {
    if (
      name.includes("Spend") ||
      name.includes("Revenue") ||
      name.includes("CPA")
    ) {
      return formatAmountFromLakhs(value);
    }
    if (name.includes("Leads")) {
      return value.toLocaleString("en-IN");
    }
    return value;
  };

  const chartLegendPayload = useMemo(
    () => [
      { value: "Spend (₹)", color: "hsl(var(--metric-spend))" },
      { value: "Revenue (₹)", color: "hsl(var(--metric-revenue))" },
      { value: "Leads/Conversion", color: "hsl(var(--metric-leads))" },
      { value: "ROAS Ratio", color: "hsl(var(--metric-roas))" },
      { value: "CPA (₹)", color: "hsl(var(--metric-cpa))" },
    ],
    [],
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-xl p-3 min-w-[220px]">
        <p className="text-sm font-semibold mb-2">{label}</p>

        <div className="flex flex-col gap-1">
          {payload.map((item: any, index: number) => (
            <div
              key={index}
              className="flex justify-between items-center gap-6"
            >
              <span style={{ color: item.color }} className="text-sm">
                {item.name}
              </span>

              <span className="text-sm font-medium text-right">
                {formatValue(item.value, item.name)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="border-border/50 shadow-md">
      <CardContent className="p-6">
        <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-display font-bold">
              Performance Overview
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-medium text-foreground">{presetLabel}</span>
              <span className="mx-2">·</span>
              {adjustLabel}
              <span className="mx-2">·</span>
              {formatRangeSpan()}
            </p>
          </div>
        </div>

        <div className="w-full min-w-0 space-y-0">
          <DualYAxisScrollableComposedChart
            data={chartSeries}
            dataLength={chartSeries.length}
            granularity={state.adjust}
            heightClassName="h-[280px] sm:h-[340px] md:h-[400px]"
            railWidthClassName="w-[56px] sm:w-[64px]"
            leftMax={leftMax}
            rightMax={rightMax}
            leftGhostDataKeys={["spend", "revenue", "cpa"]}
            rightGhostDataKeys={["leads", "roas"]}
            leftRail={{
              tick: { fontSize: 12 },
              tickFormatter: (v) => formatAmountFromLakhs(Number(v)),
              label: {
                value: "Spend & revenue (₹ L)",
                angle: -90,
                position: "insideLeft",
                style: axisMuted,
              },
            }}
            rightRail={{
              tick: { fontSize: 12 },
              label: {
                value: "Leads, ROAS & CPA",
                angle: 90,
                position: "insideRight",
                style: axisMuted,
              },
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
              label={{
                value: "Period",
                position: "insideBottom",
                offset: -4,
                style: axisMuted,
              }}
            />
            <Tooltip
              wrapperStyle={{ zIndex: 50 }}
              content={<CustomTooltip />}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="spend"
              stroke="hsl(var(--metric-spend))"
              strokeWidth={2.5}
              dot={{ r: 4 }}
              name="Spend (₹)"
              hide={hiddenSeries.has("Spend (₹)")}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--metric-revenue))"
              fill="hsl(var(--metric-revenue) / 0.15)"
              strokeWidth={2}
              name="Revenue (₹)"
              hide={hiddenSeries.has("Revenue (₹)")}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="leads"
              stroke="hsl(var(--metric-leads))"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Leads/Conversion"
              hide={hiddenSeries.has("Leads/Conversion")}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="roas"
              stroke="hsl(var(--metric-roas))"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="ROAS Ratio"
              hide={hiddenSeries.has("ROAS Ratio")}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="cpa"
              stroke="hsl(var(--metric-cpa))"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={{ r: 2 }}
              name="CPA (₹)"
              hide={hiddenSeries.has("CPA (₹)")}
            />
          </DualYAxisScrollableComposedChart>
          <InteractiveLegend
            payload={chartLegendPayload}
            hiddenSeries={hiddenSeries}
            onToggle={toggleSeries}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartSection;
