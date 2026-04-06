"use client";

import { FolderKanban, TrendingUp, Wallet, Target, BarChart3, Users } from "lucide-react";
import { projects, performanceEntries } from "@/data/mockData";
import { useMemo } from "react";
import PremiumKpiCard, { type KpiCardData } from "@/components/shared/PremiumKpiCard";
import { useDateRange } from "@/contexts/DateRangeContext";

const parseSpend = (s: string) => {
  const num = parseFloat(s.replace(/[₹L,]/g, ""));
  return isNaN(num) ? 0 : num;
};

const KpiCards = () => {
  const { filterEntries } = useDateRange();
  const kpis = useMemo(() => {
    // For demo, filter performanceEntries (daily data better for date range)
    // Projects are static, but could filter if had dates
    const filteredEntries = filterEntries(performanceEntries); 
    const activeProjects = projects.filter(p => p.status === "Active" || p.status === "Budget Warning").length;
    const totalSpend = projects.reduce((sum, p) => sum + parseSpend(p.spend), 0);
    const totalRevenue = projects.reduce((sum, p) => sum + parseSpend(p.revenue), 0);
    const totalLeads = projects.reduce((sum, p) => sum + p.leads, 0);
    const validCPL = projects.filter(p => parseFloat(p.cpl.replace("₹", "")) > 0);
    const avgCPL = validCPL.length > 0
      ? validCPL.reduce((sum, p) => sum + parseFloat(p.cpl.replace("₹", "")), 0) / validCPL.length
      : 0;
    const validROAS = projects.filter(p => parseFloat(p.roas) > 0);
    const avgROAS = validROAS.length > 0
      ? validROAS.reduce((sum, p) => sum + parseFloat(p.roas), 0) / validROAS.length
      : 0;
    return { activeProjects, totalSpend, totalRevenue, totalLeads, avgCPL, avgROAS };
  }, [filterEntries]);

  const formatAmount = (v: number) => {
    if (v >= 100) return `₹${(v / 100).toFixed(1)}Cr`;
    return `₹${v.toFixed(1)}L`;
  };

  const cards: KpiCardData[] = [
    { label: "Active Projects", value: kpis.activeProjects.toString(), icon: FolderKanban, subtitle: `${projects.length} total projects`, accent: "blue", trend: 12 },
    { label: "Total Spend", value: formatAmount(kpis.totalSpend), icon: Wallet, subtitle: "Across all projects", accent: "orange", trend: 8 },
    { label: "Total Revenue", value: formatAmount(kpis.totalRevenue), icon: TrendingUp, subtitle: "Generated revenue", accent: "emerald", trend: 15 },
    { label: "Average CPL", value: `₹${Math.round(kpis.avgCPL)}`, icon: Target, subtitle: "Cost per lead", accent: "purple", trend: -3 },
    { label: "Average ROAS", value: `${kpis.avgROAS.toFixed(1)}x`, icon: BarChart3, subtitle: "Return on ad spend", accent: "cyan", trend: 5 },
    { label: "Total Leads", value: kpis.totalLeads.toLocaleString("en-IN"), icon: Users, subtitle: "All conversions", accent: "pink", trend: 22 },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card, i) => (
        <PremiumKpiCard key={card.label} card={card} index={i} />
      ))}
    </div>
  );
};

export default KpiCards;
