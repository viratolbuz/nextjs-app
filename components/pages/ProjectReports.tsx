"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { projects, projectChartData } from "@/services/appData.service";
import {
  Eye,
  CheckCircle,
  PauseCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Legend,
} from "recharts";
import ReportFilters from "@/components/shared/ReportFilters";
import { GroupedFiltersPopover } from "@/components/shared/GroupedFiltersPopover";
import PremiumKpiCard from "@/components/shared/PremiumKpiCard";
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
} from "@/contexts/DateRangeContext";
import { endOfMonth, parse, parseISO, startOfMonth } from "date-fns";

const EXTENDED_HUES = [
  22, 177, 45, 192, 350, 280, 30, 160, 120, 250, 10, 200, 60, 310, 80, 140,
];
const COLORS = EXTENDED_HUES.map(
  (h, i) => `hsl(${h}, ${70 + (i % 3) * 10}%, ${50 + (i % 2) * 8}%)`,
);
const SOFT_COLORS = EXTENDED_HUES.map(
  (h, i) => `hsl(${h}, ${50 + (i % 3) * 10}%, ${72 + (i % 2) * 5}%)`,
);

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

type ProjectSortKey =
  | "name"
  | "client"
  | "type"
  | "spend"
  | "revenue"
  | "leads"
  | "cpl"
  | "roas"
  | "status";

const ProjectReports = () => {
  const router = useRouter();
  const { inRange, state } = useDateRange("reports-project");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<ProjectSortKey>("spend");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [tablePage, setTablePage] = useState(1);
  const [tablePerPage, setTablePerPage] = useState(10);
  const { hiddenSeries, toggleSeries } = useHiddenSeries();

  const toggleProject = (id: string) => {
    setSelectedProjects((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  const toggleProjectSort = (k: ProjectSortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir(
        k === "name" || k === "client" || k === "type" || k === "status"
          ? "asc"
          : "desc",
      );
    }
  };

  const sortIndicator = (k: ProjectSortKey) =>
    sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  const filteredProjects = useMemo(() => {
    let list =
      selectedProjects.length > 0
        ? projects.filter((p) => selectedProjects.includes(p.id))
        : projects;
    list = list.filter((p) => {
      try {
        return inRange(parseISO(p.updatedAt || p.createdAt));
      } catch {
        return true;
      }
    });
    if (selectedStatuses.length > 0) {
      list = list.filter((p) => selectedStatuses.includes(p.status));
    }
    const mul = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      switch (sortKey) {
        case "name":
          return mul * a.name.localeCompare(b.name);
        case "client":
          return mul * a.client.localeCompare(b.client);
        case "type":
          return mul * a.type.localeCompare(b.type);
        case "status":
          return mul * a.status.localeCompare(b.status);
        case "spend":
          return (
            mul *
            (parseFloat(a.spend.replace(/[₹L]/g, "")) -
              parseFloat(b.spend.replace(/[₹L]/g, "")))
          );
        case "revenue":
          return (
            mul *
            (parseFloat(a.revenue.replace(/[₹L]/g, "")) -
              parseFloat(b.revenue.replace(/[₹L]/g, "")))
          );
        case "leads":
          return mul * (a.leads - b.leads);
        case "roas":
          return mul * (parseFloat(a.roas) - parseFloat(b.roas));
        case "cpl":
          return (
            mul *
            (parseFloat(a.cpl.replace("₹", "")) -
              parseFloat(b.cpl.replace("₹", "")))
          );
        default:
          return 0;
      }
    });
  }, [selectedProjects, selectedStatuses, sortKey, sortDir, inRange]);

  const filterGroups = useMemo(
    () => [
      {
        id: "status",
        label: "Status",
        options: ["Active", "Inactive", "Hold"] as string[],
      },
      {
        id: "project",
        label: "Projects",
        options: projects
          .map((p) => ({ value: p.id, label: p.name }))
          .sort((a, b) => a.label.localeCompare(b.label)),
      },
    ],
    [],
  );

  const kpis = useMemo(() => {
    const active = filteredProjects.filter((p) => p.status === "Active").length;
    const inactive = filteredProjects.filter((p) => p.status === "Inactive").length;
    const hold = filteredProjects.filter((p) => p.status === "Hold").length;
    return [
      {
        label: "Active Projects",
        value: active.toLocaleString("en-IN"),
        icon: CheckCircle,
      },
      {
        label: "Inactive Projects",
        value: inactive.toLocaleString("en-IN"),
        icon: AlertTriangle,
      },
      {
        label: "On Hold Projects",
        value: hold.toLocaleString("en-IN"),
        icon: PauseCircle,
      },
    ];
  }, [filteredProjects]);

  const visibleMonthIndexes = useMemo(
    () =>
      monthLabels
        .map((m, i) => ({ i, d: parse(m, "MMM yyyy", new Date()) }))
        .filter((x) => {
          const monthStart = startOfMonth(x.d);
          const monthEnd = endOfMonth(x.d);
          return monthEnd >= state.range.from && monthStart <= state.range.to;
        })
        .map((x) => x.i),
    [state.range.from, state.range.to],
  );

  const filteredProjectNames = filteredProjects.map((p) => p.name);
  const filteredProjectDetails = projectChartData.projectMonthlyDetails.filter(
    (p) => filteredProjectNames.includes(p.name),
  );

  const monthTablePageSize = 10;
  const [monthTablePage, setMonthTablePage] = useState(1);
  const monthTableTotalPages = Math.max(
    1,
    Math.ceil(filteredProjectDetails.length / monthTablePageSize),
  );
  const monthTableRows = filteredProjectDetails.slice(
    (monthTablePage - 1) * monthTablePageSize,
    monthTablePage * monthTablePageSize,
  );

  const statusMonthlyAgg = useMemo(() => {
    const granularity = getGranularityFromPreset(state.preset);
    const buckets = createTimeBuckets(granularity, state.range);
    const seeded = buckets.map((bucket) => ({
      period: bucket.label,
      Active: 0,
      Inactive: 0,
      Hold: 0,
    }));
    const index = new Map(buckets.map((bucket, idx) => [bucket.key, idx]));

    filteredProjects.forEach((project) => {
      let baseDate: Date;
      try {
        baseDate = parseISO(project.updatedAt || project.createdAt);
      } catch {
        return;
      }
      const key = getBucketKey(baseDate, granularity);
      const idx = index.get(key);
      if (idx === undefined) return;
      if (project.status === "Active") seeded[idx].Active += 1;
      if (project.status === "Inactive") seeded[idx].Inactive += 1;
      if (project.status === "Hold") seeded[idx].Hold += 1;
    });

    // Keep chart readable when all projects share a single activity date.
    const hasAnyPoint = seeded.some((row) => row.Active || row.Inactive || row.Hold);
    if (!hasAnyPoint) {
      const fallback = {
        Active: filteredProjects.filter((p) => p.status === "Active").length,
        Inactive: filteredProjects.filter((p) => p.status === "Inactive").length,
        Hold: filteredProjects.filter((p) => p.status === "Hold").length,
      };
      return seeded.map((row) => ({ ...row, ...fallback }));
    }

    return seeded;
  }, [state.preset, state.range, filteredProjects]);

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
      filteredProjectDetails.forEach((p) => {
        const val = q.keys.reduce((sum, k) => sum + (p[k] as number), 0);
        entry[p.name] = parseFloat(val.toFixed(2));
        total += val;
      });
      entry.total = parseFloat(total.toFixed(2));
      return entry;
    });
  }, [filteredProjectDetails]);

  const tooltipStyle = {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 12,
    boxShadow: "0 8px 32px hsl(var(--foreground) / 0.1)",
  };
  const topProjectsChart = filteredProjects.slice(0, 6).map((p) => ({
    name: p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name,
    spend: parseFloat(p.spend.replace(/[₹L]/g, "")),
    revenue: parseFloat(p.revenue.replace(/[₹L]/g, "")),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-display font-bold">
            Project Reports
          </h1>
          <p className="text-[15px] text-muted-foreground">
            All {projects.length} campaigns ranked by performance
          </p>
        </div>
        <DateRangePicker scope="reports-project" className="w-auto" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {kpis.map((k, i) => (
          <PremiumKpiCard
            key={k.label}
            card={{
              ...k,
              value: k.value,
              accent: (["emerald", "orange", "amber"] as const)[i % 3],
            }}
            index={i}
          />
        ))}
      </div>
      {/* 
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">
            Top Projects — Spend vs Revenue
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topProjectsChart}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="spend"
                fill="hsl(var(--primary))"
                name="Spend (₹L)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="revenue"
                fill="hsl(var(--secondary))"
                name="Revenue (₹L)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card> */}

      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h3 className="font-display font-semibold text-lg">
              Project Reports - 2026
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <GroupedFiltersPopover
                groups={filterGroups}
                selections={{
                  status: selectedStatuses,
                  project: selectedProjects,
                }}
                onToggle={(groupId, value) => {
                  if (groupId === "status") {
                    setSelectedStatuses((prev) =>
                      prev.includes(value)
                        ? prev.filter((x) => x !== value)
                        : [...prev, value],
                    );
                    return;
                  }
                  if (groupId === "project") {
                    setSelectedProjects((prev) =>
                      prev.includes(value)
                        ? prev.filter((x) => x !== value)
                        : [...prev, value],
                    );
                  }
                }}
                onClearAll={() => {
                  setSelectedStatuses([]);
                  setSelectedProjects([]);
                }}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Project Status Overview (Active, Inactive, Hold)
            </h4>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={statusMonthlyAgg}>
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
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={tooltipStyle}
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
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-semibold sticky left-0 z-20 bg-card min-w-[220px]">
                      Project Name
                    </th>
                    <th className="text-left py-2 px-3 font-semibold sticky left-[220px] z-20 bg-card min-w-[120px]">
                      Status
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
                  {monthTableRows.map((item) => {
                    const proj = projects.find((p) => p.name === item.name);
                    return (
                      <tr
                        key={item.name}
                        className="border-b border-border/50 hover:bg-muted/30"
                      >
                        <td className="py-2 px-3 text-primary font-medium sticky left-0 z-10 bg-card min-w-[220px]">
                          {item.name}
                        </td>
                        <td className="py-2 px-3 sticky left-[220px] z-10 bg-card min-w-[120px]">
                          <Badge variant={
                            proj?.status === "Active" ? "success" : proj?.status === "Inactive" ? "destructive" : "secondary"
                          }>
                            {proj?.status ?? "Active"}
                          </Badge>
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
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <AdvancedPagination
                page={monthTablePage}
                totalPages={monthTableTotalPages}
                totalItems={filteredProjectDetails.length}
                perPage={monthTablePageSize}
                onPageChange={setMonthTablePage}
                onPerPageChange={() => { }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4">Project Details</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => toggleProjectSort("name")}
                >
                  Project{sortIndicator("name")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => toggleProjectSort("client")}
                >
                  Client{sortIndicator("client")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => toggleProjectSort("type")}
                >
                  Type{sortIndicator("type")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => toggleProjectSort("spend")}
                >
                  Spend{sortIndicator("spend")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => toggleProjectSort("revenue")}
                >
                  Revenue{sortIndicator("revenue")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => toggleProjectSort("leads")}
                >
                  Leads{sortIndicator("leads")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => toggleProjectSort("cpl")}
                >
                  CPL{sortIndicator("cpl")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => toggleProjectSort("roas")}
                >
                  ROAS{sortIndicator("roas")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => toggleProjectSort("status")}
                >
                  Status{sortIndicator("status")}
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                const paginatedProjects = filteredProjects.slice(
                  (tablePage - 1) * tablePerPage,
                  tablePage * tablePerPage,
                );
                return paginatedProjects.map((p, i) => {
                  const globalIdx = (tablePage - 1) * tablePerPage + i;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-bold">
                        {globalIdx + 1}
                      </TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-sm">{p.client}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {p.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{p.spend}</TableCell>
                      <TableCell>{p.revenue}</TableCell>
                      <TableCell>{p.leads.toLocaleString("en-IN")}</TableCell>
                      <TableCell>{p.cpl}</TableCell>
                      <TableCell className="font-semibold">{p.roas}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            p.status === "Active" ? "success" : p.status === "Inactive" ? "destructive" : "secondary"
                          }
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => router.push(`/projects/${p.id}`)}
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
          Math.ceil(filteredProjects.length / tablePerPage),
        )}
        totalItems={filteredProjects.length}
        perPage={tablePerPage}
        onPageChange={setTablePage}
        onPerPageChange={setTablePerPage}
      />
    </div>
  );
};

export default ProjectReports;