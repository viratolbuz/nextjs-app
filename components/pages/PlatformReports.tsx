"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { platforms, chartData, platformChartData, projects } from '@/data/mockData';
import { Download, Eye, Globe, DollarSign, TrendingUp, Target, Layers, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line, Area, Legend } from 'recharts';
import ReportFilters from '@/components/shared/ReportFilters';
import PremiumKpiCard from '@/components/shared/PremiumKpiCard';
import AdvancedPagination from '@/components/shared/AdvancedPagination';
import InteractiveLegend, { useHiddenSeries } from '@/components/shared/InteractiveLegend';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];
const SOFT_COLORS = ['hsl(var(--chart-1-soft))', 'hsl(var(--chart-2-soft))', 'hsl(var(--chart-3-soft))', 'hsl(var(--chart-4-soft))'];

const months = ['apr','may','jun','jul','aug','sep','oct','nov','dec','jan','feb','mar'] as const;
const monthLabels = ['Apr 2025','May 2025','Jun 2025','Jul 2025','Aug 2025','Sep 2025','Oct 2025','Nov 2025','Dec 2025','Jan 2026','Feb 2026','Mar 2026'];

const PlatformReports = () => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('spend');
  const [chartView, setChartView] = useState<'monthly' | 'quarterly'>('monthly');
  const [detailPlatform, setDetailPlatform] = useState<string | null>(null);
  const [tablePage, setTablePage] = useState(1);
  const [tablePerPage, setTablePerPage] = useState(10);
  const { hiddenSeries, toggleSeries } = useHiddenSeries();
  const togglePlatform = (name: string) => {
    setSelectedPlatforms(prev => prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]);
  };

  const filteredPlatforms = useMemo(() => {
    let list = selectedPlatforms.length > 0 ? platforms.filter(p => selectedPlatforms.includes(p.name)) : platforms;
    return [...list].sort((a, b) => {
      if (sortBy === 'spend') return parseFloat(b.spendMTD.replace(/[₹L]/g, '')) - parseFloat(a.spendMTD.replace(/[₹L]/g, ''));
      if (sortBy === 'revenue') return parseFloat(b.avgROAS.replace('x', '')) - parseFloat(a.avgROAS.replace('x', ''));
      if (sortBy === 'roas') return parseFloat(b.avgROAS.replace('x', '')) - parseFloat(a.avgROAS.replace('x', ''));
      return 0;
    });
  }, [selectedPlatforms, sortBy]);

  // KPIs use ALL platforms
  const kpis = useMemo(() => {
    const totalSpend = platforms.reduce((a, p) => a + parseFloat(p.spendMTD.replace(/[₹L]/g, '')), 0);
    const connected = platforms.filter(p => p.status === 'Connected').length;
    const totalProjects = platforms.reduce((a, p) => a + p.projects, 0);
    const avgRoas = platforms.reduce((a, p) => a + parseFloat(p.avgROAS.replace('x', '')), 0) / (platforms.length || 1);
    return [
      { label: 'Avg Spend', value: `₹${(totalSpend / (platforms.length || 1)).toFixed(1)}L`, icon: DollarSign },
      { label: 'Total Spend', value: `₹${totalSpend.toFixed(1)}L`, icon: DollarSign },
      { label: 'Avg ROAS', value: `${avgRoas.toFixed(1)}x`, icon: TrendingUp },
      { label: 'Connected', value: `${connected}/${platforms.length}`, icon: Globe },
      { label: 'Total Projects', value: totalProjects.toString(), icon: Layers },
      { label: 'Avg CPA', value: '₹380', icon: Target },
    ];
  }, []);

  const filteredPlatformNames = filteredPlatforms.map(p => p.name);
  const filteredPlatformDetails = platformChartData.platformMonthlyDetails.filter(p => filteredPlatformNames.includes(p.name));

  const monthlyAgg = useMemo(() => {
    return monthLabels.map((label, i) => {
      const key = months[i];
      const entry: Record<string, any> = { month: label };
      let total = 0;
      filteredPlatformDetails.forEach(p => {
        entry[p.name] = p[key];
        total += p[key] as number;
      });
      entry.total = parseFloat(total.toFixed(2));
      return entry;
    });
  }, [filteredPlatformDetails]);

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
      filteredPlatformDetails.forEach(p => {
        const val = q.keys.reduce((sum, k) => sum + (p[k] as number), 0);
        entry[p.name] = parseFloat(val.toFixed(2));
        total += val;
      });
      entry.total = parseFloat(total.toFixed(2));
      return entry;
    });
  }, [filteredPlatformDetails]);

  const tooltipStyle = {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 12,
    boxShadow: '0 8px 32px hsl(var(--foreground) / 0.1)',
  };
  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}L`;

  const budgetData = filteredPlatforms.map(p => ({
    name: p.name.replace(' Ads', ''),
    budget: parseFloat(p.spendMTD.replace(/[₹L]/g, '')) * 1.15,
    actual: parseFloat(p.spendMTD.replace(/[₹L]/g, '')),
  }));

  const detailData = useMemo(() => {
    if (!detailPlatform) return null;
    const p = platforms.find(pl => pl.name === detailPlatform);
    const pProjects = projects.filter(pr => pr.platforms.includes(detailPlatform));
    return { platform: p, projects: pProjects };
  }, [detailPlatform]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-display font-bold">Platform Reports</h1>
          <p className="text-[15px] text-muted-foreground">Cross-platform performance comparison</p>
        </div>
        <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export CSV</Button>
      </div>

      {/* KPIs - always ALL data */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((k, i) => (
          <PremiumKpiCard key={k.label} card={{ ...k, value: k.value, accent: (['blue', 'orange', 'emerald', 'cyan', 'purple', 'pink'] as const)[i % 6] }} index={i} />
        ))}
      </div>

      {/* Budget & Pie charts - filtered */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Budget Allocation vs Actual</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="budget" fill="hsl(var(--muted))" name="Budget (₹L)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" fill="hsl(var(--primary))" name="Actual (₹L)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Spend Share</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={chartData.platformSpendShare} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                  {chartData.platformSpendShare.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Main chart with Monthly/Quarterly toggle */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h3 className="font-display font-semibold text-lg">Platform Reports - 2026</h3>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant={chartView === 'monthly' ? 'default' : 'outline'} onClick={() => setChartView('monthly')} className="gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Monthly Performance Graph
              </Button>
              <Button size="sm" variant={chartView === 'quarterly' ? 'default' : 'outline'} onClick={() => setChartView('quarterly')} className="gap-1.5">
                <BarChart3 className="w-4 h-4" />
                Quarterly Platform Spend
              </Button>
              <div className="h-6 w-px bg-border mx-1" />
              <ReportFilters
                sortBy={sortBy}
                onSortByChange={setSortBy}
                items={platforms.map(p => ({ id: p.name, label: p.name }))}
                selectedItems={selectedPlatforms}
                onToggleItem={togglePlatform}
                onSelectAll={() => setSelectedPlatforms([])}
                selectLabel="Platforms"
              />
            </div>
          </div>

          {chartView === 'monthly' ? (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Platform Spend Trend (Monthly)
              </h4>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={monthlyAgg}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `₹${v}L`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `₹${v}L`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(val: any, name: string) => [formatCurrency(val), name]} />
                  <Legend content={<InteractiveLegend hiddenSeries={hiddenSeries} onToggle={toggleSeries} />} />
                  {filteredPlatformDetails.map((p, idx) => (
                    <Area key={p.name} yAxisId="left" type="monotone" dataKey={p.name} stroke={COLORS[idx % COLORS.length]} fill={SOFT_COLORS[idx % SOFT_COLORS.length]} fillOpacity={0.25} strokeWidth={2} name={p.name} hide={hiddenSeries.has(p.name)} />
                  ))}
                  <Line yAxisId="right" type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Total" hide={hiddenSeries.has('Total')} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-4">Quarterly Platform Spend Distribution</h4>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={quarterlyGrouped}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="quarter" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `₹${v}L`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `₹${v}L`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(val: any, name: string) => [formatCurrency(val), name === 'total' ? 'Total' : name]} />
                  <Legend content={<InteractiveLegend hiddenSeries={hiddenSeries} onToggle={toggleSeries} />} />
                  {filteredPlatformDetails.map((p, idx) => (
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
                    <th className="text-left py-2 px-3 font-semibold">Platform</th>
                    {monthLabels.map(m => <th key={m} className="text-right py-2 px-2 font-medium text-xs">{m.split(' ')[0]}</th>)}
                    <th className="text-right py-2 px-3 font-semibold">Total (₹L)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlatformDetails.map(item => (
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
                    <th className="text-left py-2 px-3 font-semibold">Platform</th>
                    {quarterlyGrouped.map(q => <th key={q.quarter} className="text-right py-2 px-3 font-medium text-xs">{q.quarter}</th>)}
                    <th className="text-right py-2 px-3 font-semibold">Total (₹L)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlatformDetails.map(item => {
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

      {/* Platform Table - filtered */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4">Platform Details</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Spend MTD</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Avg ROAS</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Share</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                const paginatedPlatforms = filteredPlatforms.slice((tablePage - 1) * tablePerPage, tablePage * tablePerPage);
                return paginatedPlatforms.map(p => {
                  const share = chartData.platformSpendShare.find(s => s.name === p.name || s.name === p.name.replace(' Ads', ''));
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">{p.icon}</div>
                          <span className="font-medium">{p.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{p.projects}</TableCell>
                      <TableCell className="font-semibold">{p.spendMTD}</TableCell>
                      <TableCell>₹{(parseFloat(p.spendMTD.replace(/[₹L]/g, '')) * parseFloat(p.avgROAS)).toFixed(1)}L</TableCell>
                      <TableCell className="font-semibold">{p.avgROAS}</TableCell>
                      <TableCell><Badge variant={p.status === 'Connected' ? 'default' : 'destructive'}>{p.status}</Badge></TableCell>
                      <TableCell><Badge variant="secondary">{share?.value || 0}%</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailPlatform(p.name)}>
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
        totalPages={Math.max(1, Math.ceil(filteredPlatforms.length / tablePerPage))}
        totalItems={filteredPlatforms.length}
        perPage={tablePerPage}
        onPageChange={setTablePage}
        onPerPageChange={setTablePerPage}
      />

      {/* Platform Detail Dialog */}
      <Dialog open={!!detailPlatform} onOpenChange={() => setDetailPlatform(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{detailPlatform} — Detailed Report</DialogTitle></DialogHeader>
          {detailData && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-muted rounded-lg"><p className="text-lg font-bold">{detailData.platform?.spendMTD}</p><p className="text-[13px] text-muted-foreground">Spend MTD</p></div>
                <div className="text-center p-3 bg-muted rounded-lg"><p className="text-lg font-bold">{detailData.platform?.avgROAS}</p><p className="text-[13px] text-muted-foreground">Avg ROAS</p></div>
                <div className="text-center p-3 bg-muted rounded-lg"><p className="text-lg font-bold">{detailData.platform?.projects}</p><p className="text-[13px] text-muted-foreground">Projects</p></div>
              </div>
              <h4 className="font-semibold text-sm">Projects on {detailPlatform}</h4>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Project</TableHead><TableHead>Client</TableHead><TableHead>Spend</TableHead><TableHead>Revenue</TableHead><TableHead>ROAS</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {detailData.projects.map(p => (
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
