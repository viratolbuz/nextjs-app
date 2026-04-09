"use client";

import {
  FolderKanban,
  TrendingUp,
  Wallet,
  Target,
  BarChart3,
  Users,
} from "lucide-react";
import { projects, performanceEntries } from "@/services/appData.service";
import { useMemo } from "react";
import PremiumKpiCard, {
  type KpiCardData,
} from "@/components/shared/PremiumKpiCard";
import { useDateRange } from "@/contexts/DateRangeContext";
import { parseISO, startOfDay, endOfDay, isBefore, isAfter } from "date-fns";
import { formatAmountFromLakhs, formatAmountFromRupees } from "@/lib/amount";

const parseSpend = (s: string) => {
  const num = parseFloat(s.replace(/[₹L,]/g, ""));
  return isNaN(num) ? 0 : num;
};

const KpiCards = () => {
  const { filterEntries, state } = useDateRange();
  const kpis = useMemo(() => {
    const filteredEntries = filterEntries(performanceEntries);
    const spendL =
      filteredEntries.length > 0
        ? filteredEntries.reduce((sum, e) => sum + e.spend, 0) / 100000
        : 0;
    const revenueL =
      filteredEntries.length > 0
        ? filteredEntries.reduce((sum, e) => sum + e.revenue, 0) / 100000
        : 0;
    const leadsFromEntries =
      filteredEntries.length > 0
        ? filteredEntries.reduce((sum, e) => sum + e.leads, 0)
        : 0;

    const from = state.range.from;
    const to = state.range.to;
    const projectsInRange =
      from && to
        ? projects.filter((p) => {
            try {
              const u = parseISO(p.updatedAt);
              return (
                !isBefore(u, startOfDay(from)) && !isAfter(u, endOfDay(to))
              );
            } catch {
              return true;
            }
          })
        : projects;

    const activeProjects = projectsInRange.filter((p) => p.status === "Active").length;

    const useProjectsFallback = filteredEntries.length === 0;
    const totalSpend = useProjectsFallback
      ? projectsInRange.reduce((sum, p) => sum + parseSpend(p.spend), 0)
      : spendL;
    const totalRevenue = useProjectsFallback
      ? projectsInRange.reduce((sum, p) => sum + parseSpend(p.revenue), 0)
      : revenueL;
    const totalLeads = useProjectsFallback
      ? projectsInRange.reduce((sum, p) => sum + p.leads, 0)
      : leadsFromEntries;

    const pool = useProjectsFallback ? projectsInRange : projects;
    const validCPL = pool.filter((p) => parseFloat(p.cpl.replace("₹", "")) > 0);
    const avgCPL =
      validCPL.length > 0
        ? validCPL.reduce(
            (sum, p) => sum + parseFloat(p.cpl.replace("₹", "")),
            0,
          ) / validCPL.length
        : 0;
    const validROAS = pool.filter((p) => parseFloat(p.roas) > 0);
    const avgROAS =
      validROAS.length > 0
        ? validROAS.reduce((sum, p) => sum + parseFloat(p.roas), 0) /
          validROAS.length
        : 0;

    return {
      activeProjects,
      totalSpend,
      totalRevenue,
      totalLeads,
      avgCPL,
      avgROAS,
      projectsInRangeCount: projectsInRange.length,
    };
  }, [filterEntries, state.range]);

  const cards: KpiCardData[] = [
    {
      label: "Active Projects",
      value: kpis.activeProjects.toString(),
      icon: FolderKanban,
      subtitle: `${kpis.projectsInRangeCount} in selected range`,
      accent: "blue",
      trend: 12,
    },
    {
      label: "Total Spend",
      value: formatAmountFromLakhs(kpis.totalSpend),
      icon: Wallet,
      subtitle: "Across range",
      accent: "orange",
      trend: 8,
    },
    {
      label: "Total Revenue",
      value: formatAmountFromLakhs(kpis.totalRevenue),
      icon: TrendingUp,
      subtitle: "Generated revenue",
      accent: "emerald",
      trend: 15,
    },
    {
      label: "Average ROAS",
      value: `${kpis.avgROAS.toFixed(1)}x`,
      icon: BarChart3,
      subtitle: "Return on ad spend",
      accent: "cyan",
      trend: 5,
    },
    {
      label: "Total Leads",
      value: kpis.totalLeads.toLocaleString("en-IN"),
      icon: Users,
      subtitle: "Conversions in range",
      accent: "pink",
      trend: 22,
    },
    {
      label: "Average CPL",
      value: formatAmountFromRupees(kpis.avgCPL, 0),
      icon: Target,
      subtitle: "Cost per lead",
      accent: "purple",
      trend: -3,
    },
  ];

  return (
    <div
      className="grid
  grid-cols-1
  md:grid-cols-2
  xl:grid-cols-3
  2xl:grid-cols-5
  3xl:grid-cols-6
  gap-4"
    >
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={i === cards.length ? "col-span-full" : ""}
        >
          <PremiumKpiCard card={card} index={i} />
        </div>
      ))}
    </div>
  );
};

export default KpiCards;