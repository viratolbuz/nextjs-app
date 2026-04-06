"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { projects, projectChartData } from '@/data/mockData';
import { Download, Eye, DollarSign, TrendingUp, Target, Layers, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line, Area, Legend } from 'recharts';
import ReportFilters from '@/components/shared/ReportFilters';
import PremiumKpiCard from '@/components/shared/PremiumKpiCard';
import AdvancedPagination from '@/components/shared/AdvancedPagination';
import InteractiveLegend, { useHiddenSeries } from '@/components/shared/InteractiveLegend';
import ScrollableChartTooltip from '@/components/dashboard/ScrollableChartTooltip';

// Extended color palette - 16 distinct colors to avoid repetition for 54 projects
const EXTENDED_HUES = [22, 177, 45, 192, 350, 280, 30, 160, 120, 250, 10, 200, 60, 310, 80, 140];
const COLORS = EXTENDED_HUES.map((h, i) => `hsl(${h}, ${70 + (i % 3) * 10}%, ${50 + (i % 2) * 8}%)`);
const SOFT_COLORS = EXTENDED_HUES.map((h, i) => `hsl(${h}, ${50 + (i % 3) * 10}%, ${72 + (i % 2) * 5}%)`);

const months = ['apr','may','jun','jul','aug','sep','oct','nov','dec','jan','feb','mar'] as const;
const monthLabels = ['Apr 2025','May 2025','Jun 2025','Jul 2025','Aug 2025','Sep 2025','Oct 2025','Nov 2025','Dec 2025','Jan 2026','Feb 2026','Mar 2026'];

const ProjectReports = () => {
  const router = useRouter();
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('spend');
  const [chartView, setChartView] = useState<'monthly' | 'quarterly'>('monthly');
  const [tablePage, setTablePage] = useState(1);
  const [tablePerPage, setTablePerPage] = useState(10);
  const { hiddenSeries, toggleSeries } = useHiddenSeries();

  const toggleProject = (id: string) => {
    setSelectedProjects(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const filteredProjects = useMemo(() => {
    let list = selectedProjects.length > 0 ? projects.filter(p => selectedProjects.includes(p.id)) : projects;
    return [...list].sort((a, b) => {
      if (sortBy === 'spend') return parseFloat(b.spend.replace(/[₹L]/g, '')) - parseFloat(a.spend.replace(/[₹L]/g, ''));
      if (sortBy === 'revenue') return parseFloat(b.revenue.replace(/[₹L]/g, '')) - parseFloat(a.revenue.replace(/[₹L]/g, ''));
      if (sortBy === 'leads') return b.leads - a.leads;
      if (sortBy === 'roas') return parseFloat(b.roas) - parseFloat(a.roas);
      if (sortBy === 'cpa') return parseFloat(a.cpl.replace('₹', '')) - parseFloat(b.cpl.replace('₹', ''));
      return 0;
    });
  }, [selectedProjects, sortBy]);

  // KPIs use ALL projects
  const kpis = useMemo(() => {
    const totalSpend = projects.reduce((a, p) => a + parseFloat(p.spend.replace(/[₹L]/g, '')), 0);
    const totalRevenue = projects.reduce((a, p) => a + parseFloat(p.revenue.replace(/[₹L]/g, '')), 0);
    const totalLeads = projects.reduce((a, p) => a + p.leads, 0);
    const avgRoas = projects.reduce((a, p) => a + parseFloat(p.roas), 0) / (projects.length || 1);
    const avgCpa = projects.reduce((a, p) => a + parseFloat(p.cpl.replace('₹', '')), 0) / (projects.length || 1);
    return [
      { label: 'Total Spend', value: `₹${totalSpend.toFixed(1)}L`, icon: DollarSign },
      { label: 'Revenue', value: `₹${totalRevenue.toFixed(1)}L`, icon: TrendingUp },
      { label: 'Avg ROAS', value: `${avgRoas.toFixed(2)}x`, icon: Target },
      { label: 'Avg CPA', value: `₹${Math.round(avgCpa)}`, icon: DollarSign },
      { label: 'Total Leads', value: totalLeads.toLocaleString(), icon: Layers },
    ];
  }, []);

  const filteredProjectNames = filteredProjects.map(p => p.name);
  const filteredProjectDetails = projectChartData.projectMonthlyDetails.filter(p => filteredProjectNames.includes(p.name));

  const monthlyAgg = useMemo(() => {
    return monthLabels.map((label, i) => {
      const key = months[i];
      let totalSpend = 0;
      filteredProjectDetails.forEach(p => { totalSpend += p[key] as number; });
      const perf = projectChartData.performanceTrend[i];
      const ratio = filteredProjectDetails.length / (projectChartData.projectMonthlyDetails.length || 1);
      return {
        month: label,
        spend: parseFloat(totalSpend.toFixed(2)),
        revenue: parseFloat((perf.revenue * ratio).toFixed(2)),
        leads: Math.round(perf.leads * ratio),
        roas: perf.roas,
      };
    });
  }, [filteredProjectDetails]);

  const quarterlyGrouped = useMemo(() => {
    const quarters = [
      { label: 'Q1 (Apr-Jun 2025)', keys: ['apr', 'may', 'jun'] as const },
      { label: 'Q2 (Jul-Sep 2025)', keys: ['jul', 'aug', 'sep'] as const },
      { label: 'Q3 (Oct-Dec 2025)', keys: ['oct', 'nov', 'dec'] as const },
      { label: 'Q4 (Jan-Mar 2026)', keys: ['jan', 'feb', 'mar'] as const },
    ];
    return quarters.map(q => {
      const entry: Record<string, any> = { quarter: q.label };
      let total = 0;
      filteredProjectDetails.forEach(p => {
        const val = q.keys.reduce((sum, k) => sum + (p[k] as number), 0);
        entry[p.name] = parseFloat(val.toFixed(2));
        total += val;
      });
      entry.total = parseFloat(total.toFixed(2));
      return entry;
    });
  }, [filteredProjectDetails]);

  const tooltipStyle = {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 12,
    boxShadow: '0 8px 32px hsl(var(--foreground) / 0.1)',
  };
  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}L`;

  const topProjectsChart = filteredProjects.slice(0, 6).map(p => ({
    name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
    spend: parseFloat(p.spend.replace(/[₹L]/g, '')),
    revenue: parseFloat(p.revenue.replace(/[₹L]/g, '')),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-display font-bold">Project Reports</h1>
          <p className="text-[15px] text-muted-foreground">All {projects.length} campaigns ranked by performance</p>
        </div>
        <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export CSV</Button>
      </div>

      {/* KPIs - always ALL data */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {kpis.map((k, i) => (
          <PremiumKpiCard key={k.label} card={{ ...k, value: k.value, accent: (['blue', 'emerald', 'purple', 'orange', 'cyan'] as const)[i % 5] }} index={i} />
        ))}
      </div>

      {/* Top Projects bar chart - filtered */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Top Projects — Spend vs Revenue</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topProjectsChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="spend" fill="hsl(var(--primary))" name="Spend (₹L)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" fill="hsl(var(--secondary))" name="Revenue (₹L)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Main chart with Monthly/Quarterly toggle */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h3 className="font-display font-semibold text-lg">Project Reports - 2026</h3>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant={chartView === 'monthly' ? 'default' : 'outline'} onClick={() => setChartView('monthly')} className="gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Monthly Performance Graph
              </Button>
              <Button size="sm" variant={chartView === 'quarterly' ? 'default' : 'outline'} onClick={() => setChartView('quarterly')} className="gap-1.5">
                <BarChart3 className="w-4 h-4" />
                Quarterly Project Spend
              </Button>
              <div className="h-6 w-px bg-border mx-1" />
              <ReportFilters
                sortBy={sortBy}
                onSortByChange={setSortBy}
                items={projects.map(p => ({ id: p.id, label: p.name }))}
                selectedItems={selectedProjects}
                onToggleItem={toggleProject}
                onSelectAll={() => setSelectedProjects([])}
                selectLabel="Projects"
              />
            </div>
          </div>

          {chartView === 'monthly' ? (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Performance Metrics (Spend, Revenue, Leads, ROAS)
              </h4>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={monthlyAgg}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `₹${v}L`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip content={<ScrollableChartTooltip valueFormatter={(val, name) => {
                    if (name.includes('Spend') || name.includes('Revenue')) return formatCurrency(val);
                    if (name.includes('Leads')) return val.toLocaleString('en-IN');
                    return String(val);
                  }} />} wrapperStyle={{ zIndex: 50 }} />
                  <Legend content={<InteractiveLegend hiddenSeries={hiddenSeries} onToggle={toggleSeries} />} />
                  <Line yAxisId="left" type="monotone" dataKey="spend" stroke="hsl(var(--metric-spend))" strokeWidth={2} dot={{ r: 3 }} name="Spend (₹)" hide={hiddenSeries.has('Spend (₹)')} />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(var(--metric-revenue))" fill="hsl(var(--metric-revenue) / 0.15)" strokeWidth={2} name="Revenue (₹)" hide={hiddenSeries.has('Revenue (₹)')} />
                  <Line yAxisId="right" type="monotone" dataKey="leads" stroke="hsl(var(--metric-leads))" strokeWidth={2} dot={{ r: 3 }} name="Leads" hide={hiddenSeries.has('Leads')} />
                  <Line yAxisId="right" type="monotone" dataKey="roas" stroke="hsl(var(--metric-roas))" strokeWidth={2} dot={{ r: 3 }} name="ROAS" hide={hiddenSeries.has('ROAS')} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-4">Quarterly Project Spend Distribution</h4>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={quarterlyGrouped}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="quarter" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `₹${v}L`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `₹${v}L`} />
                  <Tooltip content={<ScrollableChartTooltip valueFormatter={(val) => formatCurrency(val)} />} wrapperStyle={{ zIndex: 50 }} />
                  <Legend content={<InteractiveLegend hiddenSeries={hiddenSeries} onToggle={toggleSeries} />} />
                  {filteredProjectDetails.map((p, idx) => (
                    <Bar key={p.name} yAxisId="left" dataKey={p.name} fill={SOFT_COLORS[idx % SOFT_COLORS.length]} fillOpacity={0.55} stroke={COLORS[idx % COLORS.length]} strokeWidth={1} radius={[4, 4, 0, 0]} hide={hiddenSeries.has(p.name)} />
                  ))}
                  <Line yAxisId="right" type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} name="Total" hide={hiddenSeries.has('Total')} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Detail table */}
          <div className="mt-6 overflow-x-auto">
            {chartView === 'monthly' ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-semibold">Project Name</th>
                    {monthLabels.map(m => <th key={m} className="text-right py-2 px-2 font-medium text-xs">{m.split(' ')[0]}</th>)}
                    <th className="text-right py-2 px-3 font-semibold">Total (₹L)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjectDetails.map(item => (
                    <tr key={item.name} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 px-3 text-primary font-medium">{item.name}</td>
                      {months.map(k => <td key={k} className="text-right py-2 px-2 text-xs">{(item[k] as number).toFixed(2)}</td>)}
                      <td className="text-right py-2 px-3 font-bold text-primary">{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-semibold">Project Name</th>
                    {quarterlyGrouped.map(q => <th key={q.quarter} className="text-right py-2 px-3 font-medium text-xs">{q.quarter}</th>)}
                    <th className="text-right py-2 px-3 font-semibold">Total (₹L)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjectDetails.map(item => {
                    const qKeys = [['apr','may','jun'],['jul','aug','sep'],['oct','nov','dec'],['jan','feb','mar']];
                    return (
                      <tr key={item.name} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2 px-3 text-primary font-medium">{item.name}</td>
                        {qKeys.map((keys, qi) => {
                          const val = keys.reduce((s, k) => s + ((item as any)[k] as number || 0), 0);
                          return <td key={qi} className="text-right py-2 px-3 text-xs">{val.toFixed(2)}</td>;
                        })}
                        <td className="text-right py-2 px-3 font-bold text-primary">{item.total.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Project Table - filtered */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4">Project Details</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Spend</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>CPL</TableHead>
                <TableHead>ROAS</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                const paginatedProjects = filteredProjects.slice((tablePage - 1) * tablePerPage, tablePage * tablePerPage);
                return paginatedProjects.map((p, i) => {
                  const globalIdx = (tablePage - 1) * tablePerPage + i;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-bold">{globalIdx + 1}</TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-sm">{p.client}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{p.type}</Badge></TableCell>
                      <TableCell className="font-semibold">{p.spend}</TableCell>
                      <TableCell>{p.revenue}</TableCell>
                      <TableCell>{p.leads.toLocaleString()}</TableCell>
                      <TableCell>{p.cpl}</TableCell>
                      <TableCell className="font-semibold">{p.roas}</TableCell>
                      <TableCell><Badge variant={p.status === 'Active' ? 'default' : 'secondary'}>{p.status}</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/projects/${p.id}`)}>
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
        totalPages={Math.max(1, Math.ceil(filteredProjects.length / tablePerPage))}
        totalItems={filteredProjects.length}
        perPage={tablePerPage}
        onPageChange={setTablePage}
        onPerPageChange={setTablePerPage}
      />
    </div>
  );
};

export default ProjectReports;
