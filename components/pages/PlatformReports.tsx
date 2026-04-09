"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  platforms,
  chartData,
  platformChartData,
  projects,
  performanceEntries,
} from "@/services/appData.service";
import {
  Download,
  Eye,
  Globe,
  DollarSign,
  TrendingUp,
  Target,
  Layers,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
  Area,
  Legend,
} from "recharts";
import ReportFilters from "@/components/shared/ReportFilters";
// PremiumKpiCard intentionally not used for Platform KPI cards (uses existing Card layout)
import AdvancedPagination from "@/components/shared/AdvancedPagination";
import InteractiveLegend, {
  useHiddenSeries,
} from "@/components/shared/InteractiveLegend";
import {
  DateRangePicker,
  useDateRange,
  createTimeBuckets,
  getBucketKey,
  getGranularityFromPreset,
  parsePerformanceEntryDate,
} from "@/contexts/DateRangeContext";
import { parse, parseISO } from "date-fns";
import { formatAmountFromLakhs, formatAmountFromRupees } from "@/lib/amount";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];
const SOFT_COLORS = [
  "hsl(var(--chart-1-soft))",
  "hsl(var(--chart-2-soft))",
  "hsl(var(--chart-3-soft))",
  "hsl(var(--chart-4-soft))",
];
const KPI_ACCENTS = [
  {
    gradient:
      "from-blue-500/8 to-blue-500/2 dark:from-blue-500/15 dark:to-blue-500/5",
    iconBg: "bg-blue-100 dark:bg-blue-500/20",
    iconText: "text-blue-600 dark:text-blue-400",
    bar: "from-blue-400 to-blue-600",
    highlight: "text-blue-600 dark:text-blue-400",
  },
  {
    gradient:
      "from-emerald-500/8 to-emerald-500/2 dark:from-emerald-500/15 dark:to-emerald-500/5",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
    iconText: "text-emerald-600 dark:text-emerald-400",
    bar: "from-emerald-400 to-emerald-600",
    highlight: "text-emerald-600 dark:text-emerald-400",
  },
  {
    gradient:
      "from-purple-500/8 to-purple-500/2 dark:from-purple-500/15 dark:to-purple-500/5",
    iconBg: "bg-purple-100 dark:bg-purple-500/20",
    iconText: "text-purple-600 dark:text-purple-400",
    bar: "from-purple-400 to-purple-600",
    highlight: "text-purple-600 dark:text-purple-400",
  },
  {
    gradient:
      "from-orange-500/8 to-orange-500/2 dark:from-orange-500/15 dark:to-orange-500/5",
    iconBg: "bg-orange-100 dark:bg-orange-500/20",
    iconText: "text-orange-600 dark:text-orange-400",
    bar: "from-orange-400 to-orange-600",
    highlight: "text-orange-600 dark:text-orange-400",
  },
];

const months = [
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
  "jan",
  "feb",
  "mar",
] as const;
const monthLabels = [
  "Apr 2025",
  "May 2025",
  "Jun 2025",
  "Jul 2025",
  "Aug 2025",
  "Sep 2025",
  "Oct 2025",
  "Nov 2025",
  "Dec 2025",
  "Jan 2026",
  "Feb 2026",
  "Mar 2026",
];

type PlatformSortKey =
  | "name"
  | "projects"
  | "spend"
  | "revenue"
  | "roas"
  | "status"
  | "share";

const PlatformReports = () => {
  const { inRange, filterEntries, state } = useDateRange("reports-platform");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<PlatformSortKey>("spend");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [detailPlatform, setDetailPlatform] = useState<string | null>(null);
  const [tablePage, setTablePage] = useState(1);
  const [tablePerPage, setTablePerPage] = useState(10);
  const { hiddenSeries, toggleSeries } = useHiddenSeries();
  const togglePlatform = (name: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name],
    );
  };

  const togglePlatformSort = (k: PlatformSortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir(k === "name" || k === "status" ? "asc" : "desc");
    }
  };

  const platformSortIndicator = (k: PlatformSortKey) =>
    sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  const filteredPlatforms = useMemo(() => {
    let list =
      selectedPlatforms.length > 0
        ? platforms.filter((p) => selectedPlatforms.includes(p.name))
        : platforms;
    const mul = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const share = (n: string) =>
        chartData.platformSpendShare.find(
          (s) => s.name === n || s.name === n.replace(" Ads", ""),
        )?.value ?? 0;
      switch (sortKey) {
        case "name":
          return mul * a.name.localeCompare(b.name);
        case "projects":
          return mul * (a.projects - b.projects);
        case "status":
          return mul * a.status.localeCompare(b.status);
        case "spend":
          return (
            mul *
            (parseFloat(a.spendMTD.replace(/[₹L]/g, "")) -
              parseFloat(b.spendMTD.replace(/[₹L]/g, "")))
          );
        case "revenue":
          return (
            mul *
            (parseFloat(a.spendMTD.replace(/[₹L]/g, "")) *
              parseFloat(a.avgROAS) -
              parseFloat(b.spendMTD.replace(/[₹L]/g, "")) *
                parseFloat(b.avgROAS))
          );
        case "roas":
          return (
            mul *
            (parseFloat(a.avgROAS.replace("x", "")) -
              parseFloat(b.avgROAS.replace("x", "")))
          );
        case "share":
          return mul * (share(a.name) - share(b.name));
        default:
          return 0;
      }
    });
  }, [selectedPlatforms, sortKey, sortDir]);

  const platformKpiCards = useMemo(() => {
    const entriesInRange = filterEntries(performanceEntries);
    const byPlatform = new Map<
      string,
      { spend: number; leads: number; revenue: number }
    >();

    entriesInRange.forEach((e) => {
      const key = e.platform;
      const cur = byPlatform.get(key) ?? { spend: 0, leads: 0, revenue: 0 };
      cur.spend += e.spend;
      cur.leads += e.leads;
      cur.revenue += e.revenue;
      byPlatform.set(key, cur);
    });

    const formatL = (amount: number) => formatAmountFromRupees(amount);

    return filteredPlatforms.map((p) => {
      const agg = byPlatform.get(p.name) ?? { spend: 0, leads: 0, revenue: 0 };
      const spendL = formatL(agg.spend);
      const leads = agg.leads;
      const revenueL = formatL(agg.revenue);
      const roas = agg.spend > 0 ? (agg.revenue / agg.spend).toFixed(2) : "0.00";
      const cpl = agg.leads > 0 ? Math.round(agg.spend / agg.leads) : 0;

      return {
        id: p.id,
        name: p.name,
        icon: p.icon,
        spendL,
        leads,
        revenueL,
        roas: `${Number(roas).toFixed(2)}x`,
        cpl: cpl > 0 ? formatAmountFromRupees(cpl, 0) : formatAmountFromRupees(0, 0),
      };
    });
  }, [filteredPlatforms, filterEntries]);

  const visibleMonthIndexes = useMemo(
    () =>
      monthLabels
        .map((m, i) => ({ i, d: parse(m, "MMM yyyy", new Date()) }))
        .filter((x) => inRange(x.d))
        .map((x) => x.i),
    [inRange],
  );

  const filteredPlatformNames = filteredPlatforms.map((p) => p.name);
  const filteredPlatformDetails =
    platformChartData.platformMonthlyDetails.filter((p) =>
      filteredPlatformNames.includes(p.name),
    );

  const monthlyAgg = useMemo(() => {
    const granularity = getGranularityFromPreset(state.preset);
    const buckets = createTimeBuckets(granularity, state.range);
    const rows = buckets.map((bucket) => ({
      period: bucket.label,
      total: 0,
      ...Object.fromEntries(filteredPlatformDetails.map((p) => [p.name, 0])),
    }));
    const index = new Map(buckets.map((bucket, idx) => [bucket.key, idx]));

    filterEntries(performanceEntries).forEach((entry) => {
      const parsed = parsePerformanceEntryDate(entry.date);
      if (!parsed) return;
      const bucketKey = getBucketKey(parsed, granularity);
      const rowIdx = index.get(bucketKey);
      if (rowIdx === undefined) return;
      const platformName = entry.platform;
      if (platformName in rows[rowIdx]) {
        const valueInLakhs =
          granularity === "hourly" ? entry.spend / 100000 / 24 : entry.spend / 100000;
        const current = Number((rows[rowIdx] as any)[platformName] ?? 0);
        (rows[rowIdx] as any)[platformName] = current + valueInLakhs;
        rows[rowIdx].total += valueInLakhs;
      }
    });

    return rows.map((row) => ({
      ...row,
      total: Number(row.total.toFixed(2)),
      ...Object.fromEntries(
        filteredPlatformDetails.map((p) => [
          p.name,
          Number((Number((row as any)[p.name] ?? 0)).toFixed(2)),
        ]),
      ),
    }));
  }, [state.preset, state.range, filteredPlatformDetails, filterEntries]);

  const quarterlyGrouped = useMemo(() => {
    const quarters = [
      { label: "Q1 (Apr-Jun 2025)", keys: ["apr", "may", "jun"] as const },
      { label: "Q2 (Jul-Sep 2025)", keys: ["jul", "aug", "sep"] as const },
      { label: "Q3 (Oct-Dec 2025)", keys: ["oct", "nov", "dec"] as const },
      { label: "Q4 (Jan-Mar 2026)", keys: ["jan", "feb", "mar"] as const },
    ];
    return quarters.map((q) => {
      const entry: Record<string, any> = { quarter: q.label };
      let total = 0;
      filteredPlatformDetails.forEach((p) => {
        const val = q.keys.reduce((sum, k) => sum + (p[k] as number), 0);
        entry[p.name] = parseFloat(val.toFixed(2));
        total += val;
      });
      entry.total = parseFloat(total.toFixed(2));
      return entry;
    });
  }, [filteredPlatformDetails]);

  const tooltipStyle = {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 12,
    boxShadow: "0 8px 32px hsl(var(--foreground) / 0.1)",
  };
  const formatCurrency = (val: number) => formatAmountFromLakhs(val);

  const budgetData = filteredPlatforms.map((p) => ({
    name: p.name.replace(" Ads", ""),
    budget: parseFloat(p.spendMTD.replace(/[₹L]/g, "")) * 1.15,
    actual: parseFloat(p.spendMTD.replace(/[₹L]/g, "")),
  }));

  const detailData = useMemo(() => {
    if (!detailPlatform) return null;
    const p = platforms.find((pl) => pl.name === detailPlatform);
    const pProjects = projects.filter((pr) =>
      pr.platforms.includes(detailPlatform),
    );
    return { platform: p, projects: pProjects };
  }, [detailPlatform]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-display font-bold">
            Platform Reports
          </h1>
          <p className="text-[15px] text-muted-foreground">
            Cross-platform performance comparison
          </p>
        </div>
        <DateRangePicker scope="reports-platform" className="w-auto" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {platformKpiCards.map((c, i) => {
          const accent = KPI_ACCENTS[i % KPI_ACCENTS.length]!;
          return (
          <Card
            key={c.id}
            className={`relative overflow-hidden border-border/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 bg-gradient-to-br ${accent.gradient}`}
          >
            <div
              className={`absolute right-0 top-2 bottom-2 w-1 rounded-l-full bg-gradient-to-b opacity-60 ${accent.bar}`}
            />
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${accent.iconBg} ${accent.iconText}`}
                >
                  {c.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{c.name}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-2xl font-display font-bold">{c.spendL}</p>
                <p className="text-[13px] text-muted-foreground">Spend MTD</p>
              </div>

              <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[13px] text-muted-foreground">Leads</p>
                  <p className="font-bold">{c.leads.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground">CPL</p>
                  <p className={`font-bold ${accent.highlight}`}>{c.cpl}</p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground">Revenue</p>
                  <p className="font-bold">{c.revenueL}</p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground">ROAS</p>
                  <p className={`font-bold ${accent.highlight}`}>{c.roas}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        })}
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Budget Allocation vs Actual</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={budgetData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="budget"
                  fill="hsl(var(--muted))"
                  name="Budget (₹L)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="actual"
                  fill="hsl(var(--primary))"
                  name="Actual (₹L)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Spend Share</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={chartData.platformSpendShare}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                >
                  {chartData.platformSpendShare.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div> */}

      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h3 className="font-display font-semibold text-lg">
              Platform Reports - 2026
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <ReportFilters
                items={platforms.map((p) => ({ id: p.name, label: p.name }))}
                selectedItems={selectedPlatforms}
                onToggleItem={togglePlatform}
                onSelectAll={() => setSelectedPlatforms([])}
                selectLabel="Platforms"
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Platform Spend Trend (Monthly)
            </h4>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={monthlyAgg}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(v) => formatAmountFromLakhs(Number(v))}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(v) => formatAmountFromLakhs(Number(v))}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(val: any, name: string) => [
                    formatCurrency(val),
                    name,
                  ]}
                />
                <Legend
                  content={
                    <InteractiveLegend
                      hiddenSeries={hiddenSeries}
                      onToggle={toggleSeries}
                    />
                  }
                />
                {filteredPlatformDetails.map((p, idx) => (
                  <Area
                    key={p.name}
                    yAxisId="left"
                    type="monotone"
                    dataKey={p.name}
                    stroke={COLORS[idx % COLORS.length]}
                    fill={SOFT_COLORS[idx % SOFT_COLORS.length]}
                    fillOpacity={0.25}
                    strokeWidth={2}
                    name={p.name}
                    hide={hiddenSeries.has(p.name)}
                  />
                ))}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                  name="Total"
                  hide={hiddenSeries.has("Total")}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-semibold sticky left-0 z-20 bg-card min-w-[220px]">
                    Platform
                  </th>
                  {visibleMonthIndexes.map((idx) => (
                    <th
                      key={monthLabels[idx]}
                      className="text-right py-2 px-2 font-medium text-xs"
                    >
                      {monthLabels[idx].split(" ")[0]}
                    </th>
                  ))}
                  <th className="text-right py-2 px-3 font-semibold sticky right-0 z-20 bg-card min-w-[120px]">
                    Total (₹L)
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPlatformDetails.map((item) => (
                  <tr
                    key={item.name}
                    className="border-b border-border/50 hover:bg-muted/30"
                  >
                    <td className="py-2 px-3 text-primary font-medium sticky left-0 z-10 bg-card min-w-[220px]">
                      {item.name}
                    </td>
                    {visibleMonthIndexes.map((idx) => {
                      const k = months[idx];
                      return (
                      <td key={k} className="text-right py-2 px-2 text-xs">
                        {(item[k] as number).toFixed(2)}
                      </td>
                      );
                    })}
                    <td className="text-right py-2 px-3 font-bold text-primary sticky right-0 z-10 bg-card min-w-[120px]">
                      {item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4">Platform Details</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => togglePlatformSort("name")}
                >
                  Platform{platformSortIndicator("name")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => togglePlatformSort("projects")}
                >
                  Projects{platformSortIndicator("projects")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => togglePlatformSort("spend")}
                >
                  Spend MTD{platformSortIndicator("spend")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => togglePlatformSort("revenue")}
                >
                  Revenue{platformSortIndicator("revenue")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => togglePlatformSort("roas")}
                >
                  Avg ROAS{platformSortIndicator("roas")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => togglePlatformSort("status")}
                >
                  Status{platformSortIndicator("status")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => togglePlatformSort("share")}
                >
                  Share{platformSortIndicator("share")}
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                const paginatedPlatforms = filteredPlatforms.slice(
                  (tablePage - 1) * tablePerPage,
                  tablePage * tablePerPage,
                );
                return paginatedPlatforms.map((p) => {
                  const share = chartData.platformSpendShare.find(
                    (s) =>
                      s.name === p.name ||
                      s.name === p.name.replace(" Ads", ""),
                  );
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                            {p.icon}
                          </div>
                          <span className="font-medium">{p.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{p.projects}</TableCell>
                      <TableCell className="font-semibold">
                        {p.spendMTD}
                      </TableCell>
                      <TableCell>
                        ₹
                        {(
                          parseFloat(p.spendMTD.replace(/[₹L]/g, "")) *
                          parseFloat(p.avgROAS)
                        ).toFixed(1)}
                        L
                      </TableCell>
                      <TableCell className="font-semibold">
                        {p.avgROAS}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            p.status === "Connected" ? "default" : "destructive"
                          }
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{share?.value || 0}%</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setDetailPlatform(p.name)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                });
              })()}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AdvancedPagination
        page={tablePage}
        totalPages={Math.max(
          1,
          Math.ceil(filteredPlatforms.length / tablePerPage),
        )}
        totalItems={filteredPlatforms.length}
        perPage={tablePerPage}
        onPageChange={setTablePage}
        onPerPageChange={setTablePerPage}
      />

      <Dialog
        open={!!detailPlatform}
        onOpenChange={() => setDetailPlatform(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detailPlatform} — Detailed Report</DialogTitle>
          </DialogHeader>
          {detailData && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-lg font-bold">
                    {detailData.platform?.spendMTD}
                  </p>
                  <p className="text-[13px] text-muted-foreground">Spend MTD</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-lg font-bold">
                    {detailData.platform?.avgROAS}
                  </p>
                  <p className="text-[13px] text-muted-foreground">Avg ROAS</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-lg font-bold">
                    {detailData.platform?.projects}
                  </p>
                  <p className="text-[13px] text-muted-foreground">Projects</p>
                </div>
              </div>
              <h4 className="font-semibold text-sm">
                Projects on {detailPlatform}
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Spend</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>ROAS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailData.projects.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.client}</TableCell>
                      <TableCell>{p.spend}</TableCell>
                      <TableCell>{p.revenue}</TableCell>
                      <TableCell>{p.roas}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlatformReports;