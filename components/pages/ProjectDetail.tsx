"use client";

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangeProvider, DateRangePicker, useDateRange } from '@/contexts/DateRangeContext';
import { projects, performanceEntries, platforms, chartData } from '@/data/mockData';
import { ArrowLeft, DollarSign, TrendingUp, Target, Users, Globe, Clock, FileText, History } from 'lucide-react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import GlassTabs from '@/components/shared/GlassTabs';
import PremiumKpiCard from '@/components/shared/PremiumKpiCard';

const ProjectDetail = () => {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];
  const router = useRouter();
  const project = projects.find(p => p.id === id);
  const [activeTab, setActiveTab] = useState('timeline');
  const [metricsFilter, setMetricsFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('overall');

  const linkedPlatforms = platforms.filter(p => project?.platforms.includes(p.name));

  const timelineData = useMemo(() => {
    if (!project) return [];
    const months = ['Apr 2025','May 2025','Jun 2025','Jul 2025','Aug 2025','Sep 2025','Oct 2025','Nov 2025','Dec 2025','Jan 2026','Feb 2026','Mar 2026'];
    return months.map((month, i) => {
      const base = chartData.performanceTrend[i];
      const factor = (parseFloat(project.spend.replace(/[₹L,]/g, '')) / 48.2);
      return {
        month,
        spend: Math.round(base.spend * factor * 100000),
        revenue: Math.round(base.revenue * factor * 100000),
        leads: Math.round(base.leads * factor),
        roas: base.roas,
        cpa: base.cpa,
      };
    });
  }, [project]);

  if (!project) return <div className="p-8 text-center"><p>Project not found</p><Button onClick={() => router.push('/projects')}>Back</Button></div>;

  const kpis = [
    { label: 'Total Spend', value: project.spend, icon: DollarSign },
    { label: 'Revenue', value: project.revenue, icon: TrendingUp },
    { label: 'Linked Platforms', value: project.platforms.length, icon: Globe },
    { label: 'Leads', value: project.leads.toLocaleString(), icon: Target },
    { label: 'ROAS', value: project.roas, icon: TrendingUp },
    { label: 'CPL', value: project.cpl, icon: Users },
  ];

  const historyItems = [
    { date: '01 Apr 2026', action: 'Performance data updated', user: project.manager, type: 'update' },
    { date: '31 Mar 2026', action: `Budget increased to ${project.budget}`, user: 'Super Admin', type: 'budget' },
    { date: '28 Mar 2026', action: `New platform linked: ${project.platforms[0] || 'Meta Ads'}`, user: project.manager, type: 'platform' },
    { date: '25 Mar 2026', action: 'Monthly report generated', user: 'System', type: 'report' },
    { date: '20 Mar 2026', action: 'User assigned to project', user: 'Super Admin', type: 'user' },
    { date: '15 Mar 2026', action: 'Budget warning threshold reached', user: 'System', type: 'warning' },
    { date: '10 Mar 2026', action: 'Campaign optimization applied', user: project.manager, type: 'update' },
    { date: '05 Mar 2026', action: 'Reporting period reset', user: 'System', type: 'report' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/projects')}><ArrowLeft className="w-5 h-5" /></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] font-display font-bold">{project.name}</h1>
            <Badge variant={project.status === 'Active' ? 'default' : 'secondary'}>{project.status}</Badge>
          </div>
          <p className="text-[15px] text-muted-foreground">{project.client} · {project.type} · {project.country}</p>
        </div>
      </div>

      {/* Project Information */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-display font-semibold mb-4">Project Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div><p className="text-[13px] text-muted-foreground">Project Name</p><p className="text-sm font-medium">{project.name}</p></div>
            <div><p className="text-[13px] text-muted-foreground">Project Type</p><Badge variant="secondary">{project.type}</Badge></div>
            <div><p className="text-[13px] text-muted-foreground">Status</p><Badge variant={project.status === 'Active' ? 'default' : 'secondary'}>{project.status}</Badge></div>
            <div><p className="text-[13px] text-muted-foreground">Country</p><p className="text-sm">📍 {project.country}</p></div>
            <div>
              <p className="text-[13px] text-muted-foreground">Client</p>
              <p className="text-sm font-medium">{project.client}</p>
              <p className="text-[13px] text-muted-foreground">{project.client.toLowerCase().replace(/\s/g, '')}@gmail.com</p>
            </div>
            <div>
              <p className="text-[13px] text-muted-foreground">Platforms</p>
              <div className="flex gap-1 mt-1">{project.platforms.map((pl, i) => <Badge key={i} variant="outline" className="text-xs">{pl}</Badge>)}</div>
            </div>
            <div><p className="text-[13px] text-muted-foreground">Created</p><p className="text-sm">{project.createdAt}</p></div>
            <div><p className="text-[13px] text-muted-foreground">Last Updated</p><p className="text-sm">{project.updatedAt}</p></div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, i) => (
          <PremiumKpiCard key={kpi.label} card={{ ...kpi, value: String(kpi.value), accent: (['blue', 'emerald', 'cyan', 'purple', 'orange', 'pink'] as const)[i % 6] }} index={i} />
        ))}
      </div>

      {/* Glass Tabs */}
      <GlassTabs
        tabs={[
          { key: 'timeline', label: 'Timeline', icon: Clock },
          { key: 'report', label: 'Report', icon: FileText },
          { key: 'history', label: 'History', icon: History },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold">Timeline Report</h3>
                  <div className="flex gap-2">
                    <DateRangePicker className="w-[150px]" />
                    <Select value={platformFilter} onValueChange={setPlatformFilter}>
                      <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overall">Overall</SelectItem>
                        {project.platforms.map(pl => <SelectItem key={pl} value={pl}>{pl}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Metrics Filter */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Performance Timeline Chart</h4>
                  <Select value={metricsFilter} onValueChange={setMetricsFilter}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Metrics</SelectItem>
                      <SelectItem value="spend">Spend</SelectItem>
                      <SelectItem value="leads">Leads/Conversion</SelectItem>
                      <SelectItem value="cpa">CPA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={60} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `₹${(v/100000).toFixed(0)}L`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                    <Legend />
                    {(metricsFilter === 'all' || metricsFilter === 'spend') && <Line yAxisId="left" type="monotone" dataKey="spend" stroke="hsl(var(--metric-spend))" strokeWidth={2} name="Spend (₹)" dot={{ r: 3 }} />}
                    {(metricsFilter === 'all' || metricsFilter === 'leads') && <Line yAxisId="right" type="monotone" dataKey="leads" stroke="hsl(var(--metric-leads))" strokeWidth={2} name="Leads/Conversion" dot={{ r: 3 }} />}
                    {(metricsFilter === 'all' || metricsFilter === 'cpa') && <Line yAxisId="right" type="monotone" dataKey="cpa" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" name="CPA (₹)" dot={{ r: 2 }} />}
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Overview Table */}
            <Card>
              <CardContent className="p-4 overflow-x-auto">
                <h3 className="font-display font-semibold mb-4">Performance Overview</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      {timelineData.slice(0, 12).map(d => <TableHead key={d.month} className="text-right text-xs">{d.month.split(' ')[0]} {d.month.split(' ')[1]?.slice(2)}</TableHead>)}
                      <TableHead className="text-right font-bold">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="bg-primary/5">
                      <TableCell className="font-medium">All Platforms</TableCell>
                      {timelineData.map((d, i) => <TableCell key={i} className="text-right text-xs">₹{(d.spend / 1000).toFixed(0)}K</TableCell>)}
                      <TableCell className="text-right font-bold">{project.spend}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground text-xs">Spend</TableCell>
                      {timelineData.map((d, i) => <TableCell key={i} className="text-right text-xs">₹{(d.spend / 1000).toFixed(0)}K</TableCell>)}
                      <TableCell className="text-right text-[13px] font-medium">{project.spend}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground text-xs">Leads/Conversion</TableCell>
                      {timelineData.map((d, i) => <TableCell key={i} className="text-right text-xs">{d.leads}</TableCell>)}
                      <TableCell className="text-right text-[13px] font-medium">{project.leads.toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground text-xs">CPA</TableCell>
                      {timelineData.map((d, i) => <TableCell key={i} className="text-right text-xs">₹{d.cpa}</TableCell>)}
                      <TableCell className="text-right text-[13px] font-medium">{project.cpl}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}


      {/* Report Tab */}
      {activeTab === 'report' && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Performance Report</h3>
              <Button variant="outline" size="sm">📥 Download PDF</Button>
            </div>

            {/* Report Filters */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-lg bg-muted/30 border border-border">
              <div>
                <label className="text-[13px] text-muted-foreground block mb-1">Date Range</label>
                <Select defaultValue="6months">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">Last 1 Month</SelectItem>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="12months">Last 12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[13px] text-muted-foreground block mb-1">Platform</label>
                <Select defaultValue="all">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Overall</SelectItem>
                    {project.platforms.map(pl => <SelectItem key={pl} value={pl}>{pl}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Report Preview */}
            <div className="bg-muted/20 rounded-lg p-6 border border-border space-y-6">
              <div className="text-center p-4 bg-sidebar rounded-lg text-sidebar-primary-foreground">
                <h4 className="font-display font-bold text-lg">March 2026 Performance Marketing Report</h4>
              </div>

              {/* Blended Overview */}
              <div className="grid grid-cols-3 gap-4">
                <Card><CardContent className="p-4 text-center"><p className="text-[13px] text-muted-foreground">Total Spend</p><p className="text-xl font-bold text-primary">{project.spend}</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-[13px] text-muted-foreground">Total Leads</p><p className="text-xl font-bold">{project.leads.toLocaleString()}</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-[13px] text-muted-foreground">Avg CPL</p><p className="text-xl font-bold">{project.cpl}</p></CardContent></Card>
              </div>

              {/* Spend & Conversion Trend */}
              <div>
                <h5 className="font-semibold mb-3 text-center">Spend & Conversion Trend</h5>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={timelineData.slice(-6)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="spend" fill="hsl(var(--primary) / 0.7)" name="Spend" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="leads" fill="hsl(var(--secondary) / 0.7)" name="Leads" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Notes */}
              <div>
                <h5 className="font-medium mb-2">Custom Notes</h5>
                <textarea className="w-full bg-background border border-border rounded-lg p-3 text-sm min-h-[80px]" placeholder="Add notes for this report..." />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display font-semibold mb-4">Project History</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-4">
                {historyItems.map((h, i) => (
                  <div key={i} className="flex items-start gap-4 pl-8 relative">
                    <div className={`absolute left-[11px] w-2.5 h-2.5 rounded-full mt-1.5 ${
                      h.type === 'warning' ? 'bg-warning' : h.type === 'report' ? 'bg-info' : 'bg-primary'
                    }`} />
                    <div className="flex-1 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                      <p className="text-sm font-medium">{h.action}</p>
                      <p className="text-[13px] text-muted-foreground mt-1">{h.date} · by {h.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectDetail;
