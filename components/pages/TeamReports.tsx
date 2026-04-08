"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { users, chartData, projects } from '@/services/appData.service';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, Download, TrendingUp, Users as UsersIcon, DollarSign, Target, BarChart3, FolderKanban } from 'lucide-react';
import ReportFilters from '@/components/shared/ReportFilters';
import PremiumKpiCard from '@/components/shared/PremiumKpiCard';
import SwitchUserDropdown from '@/components/shared/SwitchUserDropdown';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart, Area, Legend } from 'recharts';
import GlassTabs from '@/components/shared/GlassTabs';
import AdvancedPagination from '@/components/shared/AdvancedPagination';
import InteractiveLegend, { useHiddenSeries } from '@/components/shared/InteractiveLegend';

const COLORS = [
  'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))',
  'hsl(var(--chart-5))', 'hsl(var(--chart-6))', 'hsl(var(--chart-7))', 'hsl(var(--chart-8))',
];
const SOFT_COLORS = [
  'hsl(var(--chart-1-soft))', 'hsl(var(--chart-2-soft))', 'hsl(var(--chart-3-soft))', 'hsl(var(--chart-4-soft))',
  'hsl(var(--chart-5-soft))', 'hsl(var(--chart-6-soft))', 'hsl(var(--chart-7-soft))', 'hsl(var(--chart-8-soft))',
];

const months = ['apr','may','jun','jul','aug','sep','oct','nov','dec','jan','feb','mar'] as const;
const monthLabels = ['Apr 2025','May 2025','Jun 2025','Jul 2025','Aug 2025','Sep 2025','Oct 2025','Nov 2025','Dec 2025','Jan 2026','Feb 2026','Mar 2026'];

type TeamSortKey = "name" | "role" | "projects" | "spend" | "revenue" | "leads" | "roas" | "cpa";

const TeamReports = () => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<TeamSortKey>("spend");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [chartView, setChartView] = useState<'monthly' | 'quarterly'>('monthly');
  const [proxyView, setProxyView] = useState<typeof users[0] | null>(null);
  const [proxyTab, setProxyTab] = useState('report');
  const [metricsFilter, setMetricsFilter] = useState('all');
  const [leaderPage, setLeaderPage] = useState(1);
  const [leaderPerPage, setLeaderPerPage] = useState(10);
  const { proxyLogin } = useAuth();
  const { hiddenSeries, toggleSeries } = useHiddenSeries();

  const toggleUser = (id: string) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const toggleTeamSort = (k: TeamSortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir(k === "name" || k === "role" ? "asc" : "desc");
    }
  };

  const teamSortIndicator = (k: TeamSortKey) => (sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : "");

  // Filtered users for charts & table only
  const filteredUsers = useMemo(() => {
    let list = selectedUsers.length > 0 ? users.filter(u => selectedUsers.includes(u.id)) : users;
    const mul = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const aData = chartData.userMonthlySpend.find(d => d.name === a.name);
      const bData = chartData.userMonthlySpend.find(d => d.name === b.name);
      const aSpend = aData?.total || 0;
      const bSpend = bData?.total || 0;
      const aLeads = Math.round(aSpend * 1000 / 380);
      const bLeads = Math.round(bSpend * 1000 / 380);
      switch (sortKey) {
        case "name":
          return mul * a.name.localeCompare(b.name);
        case "role":
          return mul * a.role.localeCompare(b.role);
        case "projects":
          return mul * (a.projects - b.projects);
        case "spend":
          return mul * (aSpend - bSpend);
        case "revenue":
          return mul * (aSpend * 3.8 - bSpend * 3.8);
        case "leads":
          return mul * (aLeads - bLeads);
        case "roas":
          return mul * (3.8 - 3.8);
        case "cpa":
          return mul * (380 - 380);
        default:
          return mul * (aSpend - bSpend);
      }
    });
  }, [selectedUsers, sortKey, sortDir]);

  // KPI cards use ALL users (not filtered)
  const kpis = useMemo(() => {
    const list = users;
    const totalSpend = list.reduce((a, u) => {
      const d = chartData.userMonthlySpend.find(s => s.name === u.name);
      return a + (d?.total || 0);
    }, 0);
    return [
      { label: 'Total Users', value: list.length.toString(), icon: UsersIcon },
      { label: 'Total Spend', value: `₹${totalSpend.toFixed(1)}L`, icon: DollarSign },
      { label: 'Revenue', value: `₹${(totalSpend * 3.8).toFixed(1)}L`, icon: TrendingUp },
      { label: 'Avg ROAS', value: '3.8x', icon: Target },
      { label: 'Total Leads', value: Math.round(totalSpend * 1000 / 380).toLocaleString(), icon: BarChart3 },
      { label: 'Avg CPA', value: '₹380', icon: DollarSign },
      { label: 'Active Users', value: list.filter(u => u.status === 'Active').length.toString(), icon: UsersIcon },
    ];
  }, []);

  // Chart data based on filtered users
  const filteredUserNames = filteredUsers.map(u => u.name);
  const filteredMonthlySpend = chartData.userMonthlySpend.filter(u => filteredUserNames.includes(u.name));

  const monthlyAgg = useMemo(() => {
    return monthLabels.map((label, i) => {
      const key = months[i];
      let totalSpend = 0;
      filteredMonthlySpend.forEach(u => { totalSpend += u[key] as number; });
      const perf = chartData.performanceTrend[i];
      const ratio = filteredMonthlySpend.length / (chartData.userMonthlySpend.length || 1);
      return {
        month: label,
        spend: parseFloat(totalSpend.toFixed(2)),
        revenue: parseFloat((perf.revenue * ratio).toFixed(2)),
        leads: Math.round(perf.leads * ratio),
        roas: perf.roas,
        cpa: perf.cpa,
      };
    });
  }, [filteredMonthlySpend]);

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
      filteredMonthlySpend.forEach(u => {
        const val = q.keys.reduce((sum, k) => sum + (u[k] as number), 0);
        entry[u.name] = parseFloat(val.toFixed(2));
        total += val;
      });
      entry.total = parseFloat(total.toFixed(2));
      return entry;
    });
  }, [filteredMonthlySpend]);

  const tooltipStyle = {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 12,
    boxShadow: '0 8px 32px hsl(var(--foreground) / 0.1)',
  };
  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}L`;

  // Proxy user data
  const proxyUserProjects = useMemo(() => {
    if (!proxyView) return [];
    return projects.filter(p => p.manager === proxyView.name);
  }, [proxyView]);

  const proxyUserChartData = useMemo(() => {
    if (!proxyView) return [];
    const userData = chartData.userMonthlySpend.find(u => u.name === proxyView.name);
    if (!userData) return chartData.performanceTrend;
    return monthLabels.map((month, i) => {
      const spend = (userData as any)[months[i]] * 100000;
      return { month, spend, revenue: spend * 3.8, leads: Math.round(spend / 380), roas: 3.8, cpa: 380 };
    });
  }, [proxyView]);

  // Proxy View
  if (proxyView) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-[28px] font-display font-bold">{proxyView.name} — Report</h1>
            <p className="text-[15px] text-muted-foreground">Viewing user performance details</p>
          </div>
          <SwitchUserDropdown
            currentProxyUser={proxyView}
            onSwitchUser={(u) => { setProxyView(u); setProxyTab('report'); }}
            onBackToAdmin={() => setProxyView(null)}
          />
        </div>

        <GlassTabs
          tabs={[
            { key: 'report', label: 'My Report', icon: TrendingUp },
            { key: 'project', label: 'My Projects', icon: FolderKanban },
          ]}
          activeTab={proxyTab}
          onChange={setProxyTab}
        />

        {proxyTab === 'report' && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold">Performance Metrics</h3>
                  <Select value={metricsFilter} onValueChange={setMetricsFilter}>
                    <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Metrics</SelectItem>
                      <SelectItem value="spend">Spend</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="leads">Leads</SelectItem>
                      <SelectItem value="roas">ROAS</SelectItem>
                      <SelectItem value="cpa">CPA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={proxyUserChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={60} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `₹${(v/100000).toFixed(0)}L`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    {(metricsFilter === 'all' || metricsFilter === 'spend') && <Line yAxisId="left" type="monotone" dataKey="spend" stroke="hsl(var(--primary))" strokeWidth={2} name="Spend (₹)" dot={{ r: 3 }} />}
                    {(metricsFilter === 'all' || metricsFilter === 'revenue') && <Area yAxisId="left" type="monotone" dataKey="revenue" fill="hsl(var(--secondary) / 0.15)" stroke="hsl(var(--secondary))" strokeWidth={2} name="Revenue (₹)" />}
                    {(metricsFilter === 'all' || metricsFilter === 'leads') && <Line yAxisId="right" type="monotone" dataKey="leads" stroke="hsl(var(--metric-leads))" strokeWidth={2} name="Leads" dot={{ r: 3 }} />}
                    {(metricsFilter === 'all' || metricsFilter === 'roas') && <Line yAxisId="right" type="monotone" dataKey="roas" stroke="hsl(var(--accent))" strokeWidth={2} name="ROAS" dot={{ r: 3 }} />}
                    {(metricsFilter === 'all' || metricsFilter === 'cpa') && <Line yAxisId="right" type="monotone" dataKey="cpa" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" name="CPA (₹)" dot={{ r: 2 }} />}
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-display font-semibold mb-4">Performance Metrics Table (Project Level)</h3>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Project Name</TableHead><TableHead className="text-right">Spend</TableHead><TableHead className="text-right">Revenue</TableHead><TableHead className="text-right">Leads</TableHead><TableHead className="text-right">ROAS</TableHead><TableHead className="text-right">CPA</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {proxyUserProjects.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium text-primary">{p.name}</TableCell>
                        <TableCell className="text-right">{p.spend}</TableCell>
                        <TableCell className="text-right">{p.revenue}</TableCell>
                        <TableCell className="text-right">{p.leads.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{p.roas}</TableCell>
                        <TableCell className="text-right">{p.cpl}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 overflow-x-auto">
                <h3 className="font-display font-semibold mb-4">📅 Last 12 Months: Apr 2025 - Mar 2026</h3>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Project Name</TableHead>
                    {['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'].map(m => <TableHead key={m} className="text-right text-xs">{m}</TableHead>)}
                    <TableHead className="text-right font-bold">Total (₹)</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {proxyUserProjects.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium text-primary whitespace-nowrap">{p.name}</TableCell>
                        {Array.from({ length: 12 }).map((_, i) => (
                          <TableCell key={i} className="text-right text-xs">₹{((parseFloat(p.spend.replace(/[₹L]/g, '')) / 12) * (0.7 + Math.random() * 0.6)).toFixed(1)}L</TableCell>
                        ))}
                        <TableCell className="text-right font-bold text-primary">{p.spend}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {proxyTab === 'project' && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="font-display font-semibold text-primary">My Assigned Projects</h3>
                <Badge>{proxyUserProjects.length} Total Projects</Badge>
              </div>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Project Name</TableHead><TableHead>Client Name</TableHead><TableHead>Project Type</TableHead><TableHead>Country</TableHead><TableHead>Platforms</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {proxyUserProjects.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.client}</TableCell>
                      <TableCell><Badge variant="secondary">{p.type}</Badge></TableCell>
                      <TableCell>📍 {p.country}</TableCell>
                      <TableCell>{p.platforms.join(', ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-display font-bold">Team Reports</h1>
          <p className="text-[15px] text-muted-foreground">Performance breakdown by team</p>
        </div>
        {/* <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export CSV</Button> */}
      </div>

      {/* KPI Cards - always show ALL data */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {kpis.map((k, i) => (
          <PremiumKpiCard key={k.label} card={{ ...k, value: k.value, accent: (['blue', 'orange', 'emerald', 'purple', 'cyan', 'pink', 'indigo'] as const)[i % 7] }} index={i} />
        ))}
      </div>

      {/* Chart with Monthly/Quarterly toggle buttons */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h3 className="font-display font-semibold text-lg">Team Reports - 2026</h3>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant={chartView === 'monthly' ? 'default' : 'outline'} onClick={() => setChartView('monthly')} className="gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Monthly Performance Graph
              </Button>
              <Button size="sm" variant={chartView === 'quarterly' ? 'default' : 'outline'} onClick={() => setChartView('quarterly')} className="gap-1.5">
                <BarChart3 className="w-4 h-4" />
                Quarterly Team Spend
              </Button>
              <div className="h-6 w-px bg-border mx-1" />
              <ReportFilters
                items={users.map(u => ({ id: u.id, label: u.name }))}
                selectedItems={selectedUsers}
                onToggleItem={toggleUser}
                onSelectAll={() => setSelectedUsers([])}
                selectLabel="Team Members"
              />
            </div>
          </div>

          {chartView === 'monthly' ? (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Performance Metrics (Spend, Revenue, Leads, ROAS, CPA)
              </h4>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={monthlyAgg}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `₹${v}L`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} formatter={(val: any, name: string) => {
                    if (name.includes('Spend') || name.includes('Revenue') || name.includes('CPA')) return [formatCurrency(val), name];
                    if (name.includes('Leads')) return [val.toLocaleString('en-IN'), name];
                    return [val, name];
                  }} />
                  <Legend content={<InteractiveLegend hiddenSeries={hiddenSeries} onToggle={toggleSeries} />} />
                  <Line yAxisId="left" type="monotone" dataKey="spend" stroke="hsl(var(--metric-spend))" strokeWidth={2} dot={{ r: 3 }} name="Spend (₹)" hide={hiddenSeries.has('Spend (₹)')} />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(var(--metric-revenue))" fill="hsl(var(--metric-revenue) / 0.15)" strokeWidth={2} name="Revenue (₹)" hide={hiddenSeries.has('Revenue (₹)')} />
                  <Line yAxisId="right" type="monotone" dataKey="leads" stroke="hsl(var(--metric-leads))" strokeWidth={2} dot={{ r: 3 }} name="Leads" hide={hiddenSeries.has('Leads')} />
                  <Line yAxisId="right" type="monotone" dataKey="roas" stroke="hsl(var(--metric-roas))" strokeWidth={2} dot={{ r: 3 }} name="ROAS" hide={hiddenSeries.has('ROAS')} />
                  <Line yAxisId="left" type="monotone" dataKey="cpa" stroke="hsl(var(--metric-cpa))" strokeWidth={1.5} strokeDasharray="5 5" dot={{ r: 2 }} name="CPA (₹)" hide={hiddenSeries.has('CPA (₹)')} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-4">Quarterly Team Spend Distribution</h4>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={quarterlyGrouped}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="quarter" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `₹${v}L`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `₹${v}L`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(val: any, name: string) => [formatCurrency(val), name === 'total' ? 'Total' : name]} />
                  <Legend content={<InteractiveLegend hiddenSeries={hiddenSeries} onToggle={toggleSeries} />} />
                  {filteredMonthlySpend.map((u, idx) => (
                    <Bar key={u.name} yAxisId="left" dataKey={u.name} fill={SOFT_COLORS[idx % SOFT_COLORS.length]} fillOpacity={0.55} stroke={COLORS[idx % COLORS.length]} strokeWidth={1} radius={[4, 4, 0, 0]} hide={hiddenSeries.has(u.name)} />
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
                    <th className="text-left py-2 px-3 font-semibold">Team Name</th>
                    {monthLabels.map(m => <th key={m} className="text-right py-2 px-2 font-medium text-xs">{m.split(' ')[0]}</th>)}
                    <th className="text-right py-2 px-3 font-semibold">Total (₹L)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMonthlySpend.map(item => (
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
                    <th className="text-left py-2 px-3 font-semibold">Team Name</th>
                    {quarterlyGrouped.map(q => <th key={q.quarter} className="text-right py-2 px-3 font-medium text-xs">{q.quarter}</th>)}
                    <th className="text-right py-2 px-3 font-semibold">Total (₹L)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMonthlySpend.map(item => {
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

      {/* User Table - filtered */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4">Team Leaderboard</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead className="cursor-pointer select-none hover:bg-muted/50" onClick={() => toggleTeamSort("name")}>
                  Team Member{teamSortIndicator("name")}
                </TableHead>
                <TableHead className="cursor-pointer select-none hover:bg-muted/50" onClick={() => toggleTeamSort("role")}>
                  Role{teamSortIndicator("role")}
                </TableHead>
                <TableHead className="cursor-pointer select-none hover:bg-muted/50" onClick={() => toggleTeamSort("projects")}>
                  Projects{teamSortIndicator("projects")}
                </TableHead>
                <TableHead className="cursor-pointer select-none hover:bg-muted/50" onClick={() => toggleTeamSort("spend")}>
                  Spend{teamSortIndicator("spend")}
                </TableHead>
                <TableHead className="cursor-pointer select-none hover:bg-muted/50" onClick={() => toggleTeamSort("revenue")}>
                  Revenue{teamSortIndicator("revenue")}
                </TableHead>
                <TableHead className="cursor-pointer select-none hover:bg-muted/50" onClick={() => toggleTeamSort("leads")}>
                  Leads{teamSortIndicator("leads")}
                </TableHead>
                <TableHead className="cursor-pointer select-none hover:bg-muted/50" onClick={() => toggleTeamSort("roas")}>
                  ROAS{teamSortIndicator("roas")}
                </TableHead>
                <TableHead className="cursor-pointer select-none hover:bg-muted/50" onClick={() => toggleTeamSort("cpa")}>
                  CPA{teamSortIndicator("cpa")}
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                const leaderTotalPages = Math.max(1, Math.ceil(filteredUsers.length / leaderPerPage));
                const paginatedUsers = filteredUsers.slice((leaderPage - 1) * leaderPerPage, leaderPage * leaderPerPage);
                return paginatedUsers.map((u, i) => {
                  const globalIdx = (leaderPage - 1) * leaderPerPage + i;
                  const uData = chartData.userMonthlySpend.find(d => d.name === u.name);
                  const spend = uData?.total || u.projects * 5;
                  const revenue = spend * 3.8;
                  const leads = Math.round(spend * 1000 / 380);
                  const rank = globalIdx === 0 ? '🏆' : globalIdx === 1 ? '🥈' : globalIdx === 2 ? '🥉' : String(globalIdx + 1);
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="text-lg">{rank}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[13px] font-bold">{u.avatar}</div>
                          <span className="font-medium">{u.name}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                      <TableCell>{u.projects}</TableCell>
                      <TableCell className="font-semibold">₹{spend.toFixed(1)}L</TableCell>
                      <TableCell>₹{revenue.toFixed(1)}L</TableCell>
                      <TableCell>{leads.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">3.8x</TableCell>
                      <TableCell>₹380</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setProxyView(u); setProxyTab('report'); }}>
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
        page={leaderPage}
        totalPages={Math.max(1, Math.ceil(filteredUsers.length / leaderPerPage))}
        totalItems={filteredUsers.length}
        perPage={leaderPerPage}
        onPageChange={setLeaderPage}
        onPerPageChange={setLeaderPerPage}
      />
    </div>
  );
};

export default TeamReports;
