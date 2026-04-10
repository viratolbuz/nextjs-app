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
import { Eye, CircleCheck as CheckCircle, CirclePause as PauseCircle, TriangleAlert as AlertTriangle, TrendingUp } from "lucide-react";
import { GroupedFiltersPopover } from "@/components/shared/GroupedFiltersPopover";
import PremiumKpiCard from "@/components/shared/PremiumKpiCard";
import AdvancedPagination from "@/components/shared/AdvancedPagination";
import { useHiddenSeries } from "@/components/shared/InteractiveLegend";
import {
  DateRangeWithAdjust,
  useDateRange,
  createTimeBuckets,
  getBucketKey,
  clampAdjustForRange,
} from "@/contexts/DateRangeContext";
import { StatusOverviewSplitChart } from "@/components/shared/StatusOverviewSplitChart";
import { ReportMatrixScrollTable } from "@/components/shared/ReportMatrixScrollTable";
import { formatReportMonthHeader } from "@/lib/reportTableFormat";
import { endOfMonth, parse, parseISO, startOfMonth } from "date-fns";

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
    const granularity = clampAdjustForRange(state.range, state.adjust);
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
  }, [state.adjust, state.range, filteredProjects]);

  const tooltipStyle = {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 12,
    boxShadow: "0 8px 32px hsl(var(--foreground) / 0.1)",
  };

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
        <DateRangeWithAdjust scope="reports-project" pickerClassName="w-auto" />
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
            <StatusOverviewSplitChart
              data={statusMonthlyAgg}
              dataLength={statusMonthlyAgg.length}
              granularity={clampAdjustForRange(state.range, state.adjust)}
              heightClassName="h-[400px]"
              hiddenSeries={hiddenSeries}
              toggleSeries={toggleSeries}
              tooltipStyle={tooltipStyle}
            />
          <ReportMatrixScrollTable>
              <table className="w-full text-sm min-w-max">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-semibold sticky left-0 z-30 bg-card w-[220px] min-w-[220px] shadow-[4px_0_12px_-4px_hsl(var(--foreground)/0.12)]">
                      Project Name
                    </th>
                    <th className="text-left py-2 px-3 font-semibold sticky left-[220px] z-30 bg-card w-[120px] min-w-[120px] shadow-[4px_0_12px_-4px_hsl(var(--foreground)/0.12)]">
                      Status
                    </th>
                    {visibleMonthIndexes.map((idx) => (
                      <th
                        key={monthLabels[idx]}
                        className="text-right py-2 px-2 font-medium text-xs min-w-[72px] whitespace-nowrap"
                      >
                        {formatReportMonthHeader(monthLabels[idx]!)}
                      </th>
                    ))}
                    <th className="text-right py-2 px-3 font-semibold sticky right-0 z-30 bg-card min-w-[112px] shadow-[-4px_0_12px_-4px_hsl(var(--foreground)/0.12)]">
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
                        <td className="py-2 px-3 sticky left-0 z-20 bg-card w-[220px] min-w-[220px] shadow-[4px_0_12px_-4px_hsl(var(--foreground)/0.08)]">
                          <button
                            className="text-primary font-medium hover:underline cursor-pointer text-left w-full"
                            onClick={() => proj && router.push(`/projects/${proj.id}`)}
                          >
                            {item.name}
                          </button>
                        </td>
                        <td className="py-2 px-3 sticky left-[220px] z-20 bg-card w-[120px] min-w-[120px] shadow-[4px_0_12px_-4px_hsl(var(--foreground)/0.08)]">
                          <Badge variant={
                            proj?.status === "Active" ? "success" : proj?.status === "Inactive" ? "destructive" : "secondary"
                          }>
                            {proj?.status ?? "Active"}
                          </Badge>
                        </td>
                        {visibleMonthIndexes.map((idx) => {
                          const k = months[idx];
                          return (
                            <td key={k} className="text-right py-2 px-2 text-xs min-w-[72px] whitespace-nowrap tabular-nums">
                              {(item[k] as number).toFixed(2)}
                            </td>
                          );
                        })}
                        <td className="text-right py-2 px-3 font-bold text-primary sticky right-0 z-20 bg-card min-w-[112px] shadow-[-4px_0_12px_-4px_hsl(var(--foreground)/0.08)] tabular-nums">
                          {item.total.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
          </ReportMatrixScrollTable>

            <div className="mt-4">
              <AdvancedPagination
                page={monthTablePage}
                totalPages={monthTableTotalPages}
                totalItems={filteredProjectDetails.length}
                perPage={monthTablePageSize}
                onPageChange={setMonthTablePage}
                onPerPageChange={() => {}}
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
                      <TableCell>
                        <button
                          className="font-medium text-primary hover:underline cursor-pointer text-left"
                          onClick={() => router.push(`/projects/${p.id}`)}
                        >
                          {p.name}
                        </button>
                      </TableCell>
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