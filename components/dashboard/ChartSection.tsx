"use client";

import { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartData, performanceEntries } from "@/data/mockData";
import InteractiveLegend, {
  useHiddenSeries,
} from "@/components/shared/InteractiveLegend";
import { Card, CardContent } from "@/components/ui/card";
import {
  useDateRange,
  buildDashboardPerformanceSeries,
} from "@/contexts/DateRangeContext";

const axisMuted = { fill: "hsl(var(--muted-foreground))", fontSize: 11 };

const ChartSection = () => {
  const { state, formatRangeSpan, presetLabel } = useDateRange();
  const { hiddenSeries, toggleSeries } = useHiddenSeries();

  const { data: chartSeries, xKey } = useMemo(
    () =>
      buildDashboardPerformanceSeries(
        state.type,
        state.range,
        chartData.performanceTrend,
        performanceEntries,
      ),
    [state.type, state.range],
  );

  const formatCurrency = (value: number) =>
    `₹${value.toLocaleString("en-IN")}L`;

  const formatValue = (value: number, name: string) => {
    if (
      name.includes("Spend") ||
      name.includes("Revenue") ||
      name.includes("CPA")
    ) {
      return `₹${value.toLocaleString("en-IN")}L`;
    }
    if (name.includes("Leads")) {
      return value.toLocaleString("en-IN");
    }
    return value;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-xl p-3 min-w-[220px]">
        {/* Title */}
        <p className="text-sm font-semibold mb-2">{label}</p>

        {/* Content */}
        <div className="flex flex-col gap-1">
          {payload.map((item: any, index: number) => (
            <div
              key={index}
              className="flex justify-between items-center gap-6"
            >
              {/* Label */}
              <span style={{ color: item.color }} className="text-sm">
                {item.name}
              </span>

              {/* Value */}
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
              {formatRangeSpan()}
            </p>
          </div>
        </div>

        <div className="w-full overflow-x-scroll scrollbar-themed lg:scrollbar-none">
          <div className="min-w-[1200px] h-[280px] sm:h-[340px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartSeries}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey={xKey}
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                  label={{
                    value: "Period",
                    position: "insideBottom",
                    offset: -4,
                    style: axisMuted,
                  }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(v) => `₹${v}L`}
                  label={{
                    value: "Spend & revenue (₹ L)",
                    angle: -90,
                    position: "insideLeft",
                    style: axisMuted,
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                  label={{
                    value: "Leads, ROAS & CPA",
                    angle: 90,
                    position: "insideRight",
                    style: axisMuted,
                  }}
                />
                <Tooltip
                  wrapperStyle={{ zIndex: 50 }}
                  content={<CustomTooltip />}
                />
                <Legend
                  content={
                    <InteractiveLegend
                      hiddenSeries={hiddenSeries}
                      onToggle={toggleSeries}
                    />
                  }
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
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartSection;
