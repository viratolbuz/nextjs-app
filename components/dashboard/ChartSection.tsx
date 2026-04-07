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
import InteractiveLegend, { useHiddenSeries } from "@/components/shared/InteractiveLegend";
import { Card, CardContent } from "@/components/ui/card";
import { useDateRange, buildDashboardPerformanceSeries } from "@/contexts/DateRangeContext";

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

  const tooltipStyle = {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 12,
    boxShadow: "0 8px 32px hsl(var(--foreground) / 0.1)",
  };

  const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN")}L`;

  return (
    <Card className="border-border/50 shadow-md">
      <CardContent className="p-6">
        <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-display font-bold">Performance Overview</h3>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-medium text-foreground">{presetLabel}</span>
              <span className="mx-2">·</span>
              {formatRangeSpan()}
            </p>
          </div>
        </div>

        <div className="overflow-hidden">
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey={xKey}
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
                label={{ value: "Period", position: "insideBottom", offset: -4, style: axisMuted }}
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
                contentStyle={tooltipStyle}
                formatter={(value: number, name: string) => {
                  if (name.includes("Spend") || name.includes("Revenue") || name.includes("CPA"))
                    return [formatCurrency(value), name];
                  if (name.includes("Leads")) return [value.toLocaleString("en-IN"), name];
                  return [value, name];
                }}
              />
              <Legend content={<InteractiveLegend hiddenSeries={hiddenSeries} onToggle={toggleSeries} />} />
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
      </CardContent>
    </Card>
  );
};

export default ChartSection;
