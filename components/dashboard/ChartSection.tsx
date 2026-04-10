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

const ChartSection = () => {
  const { state, formatRangeSpan: _formatRangeSpan, presetLabel: _presetLabel, adjustLabel: _adjustLabel } = useDateRange();
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
    () => maxFromNumericKeys(chartSeries, ["spend", "revenue", "cpa"], 1, 1.05),
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

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { name: string; value: number; color: string }[];
    label?: string;
  }) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-xl p-3 min-w-[220px]">
        <p className="text-sm font-semibold mb-2">{label}</p>

        <div className="flex flex-col gap-1">
          {payload.map((item, index: number) => (
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
    <Card className="border-border/50 shadow-md overflow-hidden">
      <CardContent className="p-0">
        <div className="px-4 pt-4 pb-2 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-display font-bold">
              Performance Overview
            </h3>
          </div>
        </div>

        <div className="w-full min-w-0">
          <div className="flex items-center justify-between px-4 pb-1">
            <span className="text-[10px] text-muted-foreground">
              Spend & revenue (₹ L)
            </span>
            <span className="text-[10px] text-muted-foreground">
              Leads, ROAS &amp; CPA
            </span>
          </div>
          <DualYAxisScrollableComposedChart
            data={chartSeries}
            dataLength={chartSeries.length}
            granularity={state.adjust}
            heightClassName="h-[260px] sm:h-[320px] md:h-[380px]"
            railWidthClassName="w-[56px] sm:w-[64px]"
            leftMax={leftMax}
            rightMax={rightMax}
            leftGhostDataKeys={["spend", "revenue", "cpa"]}
            rightGhostDataKeys={["leads", "roas"]}
            leftRail={{
              tick: { fontSize: 11 },
              tickFormatter: (v) => formatAmountFromLakhs(Number(v)),
              width: 52,
            }}
            rightRail={{
              tick: { fontSize: 11 },
              width: 52,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
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
          <div className="px-4 pb-3 pt-1">
            <InteractiveLegend
              payload={chartLegendPayload}
              hiddenSeries={hiddenSeries}
              onToggle={toggleSeries}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartSection;
