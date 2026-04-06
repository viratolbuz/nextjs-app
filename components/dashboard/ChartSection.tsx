"use client";

import { useMemo } from 'react';
import { Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { chartData } from '@/data/mockData';
import InteractiveLegend, { useHiddenSeries } from '@/components/shared/InteractiveLegend';
import { Card, CardContent } from '@/components/ui/card';
import { useDateRange } from '@/contexts/DateRangeContext';

const ChartSection = () => {
  const { filterPerformanceTrend, state: { type } } = useDateRange();
  const { hiddenSeries, toggleSeries } = useHiddenSeries();

  const filteredData = useMemo(() => filterPerformanceTrend(chartData.performanceTrend), [filterPerformanceTrend]);

  const tooltipStyle = {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 12,
    boxShadow: '0 8px 32px hsl(var(--foreground) / 0.1)',
  };

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}L`;

  return (
    <Card className="border-border/50 shadow-md">
      <CardContent className="p-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h3 className="text-lg font-display font-bold">Performance Overview</h3>
          <div className="text-sm text-muted-foreground">
            Filtered by: {type}
          </div>
        </div>

        <div className="overflow-hidden">
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `₹${v}L`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                wrapperStyle={{ zIndex: 50 }}
                contentStyle={tooltipStyle}
                formatter={(value: number, name: string) => {
                  if (name.includes('Spend') || name.includes('Revenue') || name.includes('CPA')) return [formatCurrency(value), name];
                  if (name.includes('Leads')) return [value.toLocaleString('en-IN'), name];
                  return [value, name];
                }}
              />
              <Legend content={<InteractiveLegend hiddenSeries={hiddenSeries} onToggle={toggleSeries} />} />
              <Line yAxisId="left" type="monotone" dataKey="spend" stroke="hsl(var(--metric-spend))" strokeWidth={2.5} dot={{ r: 4 }} name="Spend (₹)" hide={hiddenSeries.has('Spend (₹)')} />
              <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(var(--metric-revenue))" fill="hsl(var(--metric-revenue) / 0.15)" strokeWidth={2} name="Revenue (₹)" hide={hiddenSeries.has('Revenue (₹)')} />
              <Line yAxisId="right" type="monotone" dataKey="leads" stroke="hsl(var(--metric-leads))" strokeWidth={2} dot={{ r: 3 }} name="Leads/Conversion" hide={hiddenSeries.has('Leads/Conversion')} />
              <Line yAxisId="right" type="monotone" dataKey="roas" stroke="hsl(var(--metric-roas))" strokeWidth={2} dot={{ r: 3 }} name="ROAS Ratio" hide={hiddenSeries.has('ROAS Ratio')} />
              <Line yAxisId="left" type="monotone" dataKey="cpa" stroke="hsl(var(--metric-cpa))" strokeWidth={1.5} strokeDasharray="5 5" dot={{ r: 2 }} name="CPA (₹)" hide={hiddenSeries.has('CPA (₹)')} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartSection;
