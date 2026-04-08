"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { projects, notifications, chartData } from "@/data/mockData";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { TrendingUp, AlertTriangle, Split } from "lucide-react";
import { useDateRange } from "@/contexts/DateRangeContext";
import { useMemo, useState } from "react";
import { parseISO, startOfDay, endOfDay, isBefore, isAfter } from "date-fns";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
];

const InfoGrids = () => {
  const { state } = useDateRange();
  const [activeBarIndex, setActiveBarIndex] = useState(null);

  const projectsForRange = useMemo(() => {
    const from = state.range.from;
    const to = state.range.to;
    if (!from || !to) return projects;
    return projects.filter((p) => {
      try {
        const u = parseISO(p.updatedAt);
        return !isBefore(u, startOfDay(from)) && !isAfter(u, endOfDay(to));
      } catch {
        return true;
      }
    });
  }, [state.range]);

  const topSpendProjects = useMemo(
    () =>
      [...projectsForRange]
        .sort(
          (a, b) =>
            parseFloat(b.spend.replace(/[₹L,]/g, "")) -
            parseFloat(a.spend.replace(/[₹L,]/g, "")),
        )
        .slice(0, 6),
    [projectsForRange],
  );

  const platformSpendShare = chartData.platformSpendShare;

  const systemAlerts = notifications
    .filter((n) => !n.read || n.type === "warning" || n.type === "error")
    .slice(0, 6);
  const budgetWarnings = projectsForRange
    .filter((p) => p.budgetUsed > 85)
    .slice(0, 4);

  const topSpendChart = topSpendProjects.map((p) => ({
    name: p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name,
    spend: parseFloat(p.spend.replace(/[₹L,]/g, "")),
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="border-border/50 shadow-md">
        <CardContent className="p-5 h-full">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h4 className="text-lg font-display font-bold">Top Spenders</h4>
          </div>
          <ResponsiveContainer width="100%" height="90%" maxHeight={340}>
            <BarChart data={topSpendChart} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                horizontal={false}
              />

              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(v) => `₹${v}L`}
                label={{
                  value: "Spend (₹ L)",
                  position: "insideBottom",
                  offset: -4,
                  style: { fill: "hsl(var(--muted-foreground))", fontSize: 16 },
                }}
              />

              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
                width={90}
                label={{
                  value: "Project",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "hsl(var(--muted-foreground))", fontSize: 16 },
                }}
              />

              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(v) => [`₹${v}L`, "Spend"]}
              />

              <Bar
                dataKey="spend"
                radius={[0, 4, 4, 0]}
                isAnimationActive
                animationDuration={800}
                onMouseLeave={() => setActiveBarIndex(null)}
              >
                {topSpendChart.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    fillOpacity={activeBarIndex === index ? 1 : 0.6}
                    style={{
                      transition: "all 0.3s ease",
                      filter:
                        activeBarIndex === index
                          ? "brightness(1.2)"
                          : "brightness(1)",
                      cursor: "pointer",
                    }}
                    onMouseEnter={() => setActiveBarIndex(index as any)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md ">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Split className="w-4 h-4 text-primary" />
            <h4 className="text-lg font-display font-bold">
              Platform Spend Split
            </h4>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={platformSpendShare}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                dataKey="value"
                // paddingAngle={2}
                label={({ value }) => `${value}%`}
                labelLine={{ strokeWidth: 1 }}
                stroke="none"
              >
                {platformSpendShare.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {platformSpendShare.map((p, i) => (
              <div
                key={p.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-xs font-medium">{p.name}</span>
                </div>
                <span className="text-xs font-bold">{p.spend}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* <Card className="border-border/50 shadow-md">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-primary" />
            <h4 className="text-lg font-display font-bold">System Alerts</h4>
          </div>
          <div className="space-y-2 h-auto overflow-y-auto scrollbar-themed pr-1">
            {budgetWarnings.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-warning/5 border border-warning/20"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Budget: {p.budget}
                  </p>
                </div>
                <Badge variant="destructive" className="text-[10px] shrink-0">
                  {p.budgetUsed}% used
                </Badge>
              </div>
            ))}
            {systemAlerts.map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30"
              >
                <div
                  className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${n.type === "warning" ? "bg-warning" : n.type === "error" ? "bg-destructive" : n.type === "success" ? "bg-emerald-500" : "bg-blue-500"}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-snug">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {n.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default InfoGrids;
