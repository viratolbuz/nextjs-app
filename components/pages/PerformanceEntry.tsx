"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  performanceEntries as allEntries,
  projects,
  platforms,
} from '@/services/appData.service';
import { Search, Plus, Upload, Download, Edit, Trash2, Eye, FileDown } from 'lucide-react';
import type { PerformanceEntry } from '@/services/appData.service';
import AdvancedPagination from '@/components/shared/AdvancedPagination';
import PermissionGate from '@/components/shared/PermissionGate';
import { GroupedFiltersPopover, type FilterSelections } from '@/components/shared/GroupedFiltersPopover';

const generateEntries = (): PerformanceEntry[] => {
  const entries: PerformanceEntry[] = [...allEntries];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const years = [2025, 2026];
  let id = 100;

  projects.forEach(proj => {
    platforms.slice(0, 2).forEach(plat => {
      const monthCount = 3 + Math.floor(Math.random() * 4);
      for (let m = 0; m < monthCount; m++) {
        const year = years[Math.random() > 0.5 ? 1 : 0];
        const month = months[Math.floor(Math.random() * 12)];
        const spend = Math.round(5000 + Math.random() * 400000);
        const leads = Math.floor(Math.random() * 3000);
        const cpl = leads > 0 ? Math.round(spend / leads) : 0;
        const revenue = Math.round(spend * (2 + Math.random() * 20));
        const roas = spend > 0 ? parseFloat((revenue / spend).toFixed(2)) : 0;
        entries.push({ id: String(id++), date: `${year}`, project: proj.name, platform: plat.name, spend, leads, cpl, revenue, roas });
      }
    });
  });
  return entries;
};

const PerformanceEntryPage = () => {
  const [entries, setEntries] = useState(generateEntries);
  const [search, setSearch] = useState('');
  const [filterSelections, setFilterSelections] = useState<FilterSelections>({
    project: [],
    platform: [],
    period: [],
  });
  const [showDialog, setShowDialog] = useState(false);
  const [editEntry, setEditEntry] = useState<PerformanceEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(30);

  const [formData, setFormData] = useState({ date: '', project: '', platform: '', spend: 0, leads: 0, cpl: 0, revenue: 0, roas: 0 });

  const filterGroups = useMemo(() => {
    const projectOpts = [...new Set(entries.map(e => e.project))].sort();
    const platformOpts = [...new Set(entries.map(e => e.platform))].sort();
    const periodOpts = [...new Set(entries.map(e => e.date))].sort();
    return [
      { id: 'project', label: 'Project', options: projectOpts },
      { id: 'platform', label: 'Platform', options: platformOpts },
      { id: 'period', label: 'Period / date', options: periodOpts },
    ];
  }, [entries]);

  const toggleGroupFilter = (groupId: string, value: string) => {
    setFilterSelections(prev => {
      const cur = prev[groupId] ?? [];
      const next = cur.includes(value) ? cur.filter(x => x !== value) : [...cur, value];
      return { ...prev, [groupId]: next };
    });
    setPage(1);
  };

  const clearAllFilters = () => {
    setFilterSelections({ project: [], platform: [], period: [] });
    setPage(1);
  };

  const filtered = useMemo(() => {
    return entries.filter(e => {
      const matchSearch = e.project.toLowerCase().includes(search.toLowerCase()) || e.platform.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      const pr = filterSelections.project ?? [];
      const pl = filterSelections.platform ?? [];
      const pe = filterSelections.period ?? [];
      if (pr.length > 0 && !pr.includes(e.project)) return false;
      if (pl.length > 0 && !pl.includes(e.platform)) return false;
      if (pe.length > 0 && !pe.includes(e.date)) return false;
      return true;
    });
  }, [entries, search, filterSelections]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const totals = useMemo(() => ({
    spend: filtered.reduce((a, e) => a + e.spend, 0),
    leads: filtered.reduce((a, e) => a + e.leads, 0),
    revenue: filtered.reduce((a, e) => a + e.revenue, 0),
  }), [filtered]);
  const avgCPL = totals.leads > 0 ? Math.round(totals.spend / totals.leads) : 0;
  const avgROAS = totals.spend > 0 ? (totals.revenue / totals.spend).toFixed(1) : '0';

  const openCreate = () => { setEditEntry(null); setFormData({ date: 'March', project: '', platform: '', spend: 0, leads: 0, cpl: 0, revenue: 0, roas: 0 }); setShowDialog(true); };
  const openEdit = (e: PerformanceEntry) => { setEditEntry(e); setFormData({ date: e.date, project: e.project, platform: e.platform, spend: e.spend, leads: e.leads, cpl: e.cpl, revenue: e.revenue, roas: e.roas }); setShowDialog(true); };
  const saveEntry = () => {
    const cpl = formData.leads > 0 ? Math.round(formData.spend / formData.leads) : 0;
    const roas = formData.spend > 0 ? parseFloat((formData.revenue / formData.spend).toFixed(2)) : 0;
    if (editEntry) {
      setEntries(prev => prev.map(e => e.id === editEntry.id ? { ...e, ...formData, cpl, roas } : e));
    } else {
      setEntries(prev => [...prev, { id: String(Date.now()), ...formData, cpl, roas }]);
    }
    setShowDialog(false);
  };
  const deleteEntry = (id: string) => { setEntries(prev => prev.filter(e => e.id !== id)); setDeleteConfirm(null); };

  const exportCSV = () => {
    const csv = ['Project,Project Type,Client,Platform,Spend,Leads,CPL,Revenue,ROAS,Year,Month,Status',
      ...filtered.map(e => {
        const proj = projects.find(p => p.name === e.project);
        return `${e.project},${proj?.type || ''},${proj?.client || ''},${e.platform},${e.spend},${e.leads},${e.cpl},${e.revenue},${e.roas},${e.date},March,Active`;
      })
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'performance_entries.csv'; a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-[28px] font-display font-bold tracking-tight">Performance Entries</h1>
          <p className="text-sm sm:text-[15px] text-muted-foreground">Log daily Spend, Leads, CPL, Revenue and ROAS per project</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PermissionGate permission="Import_performance_entries">
            <Button variant="outline" size="sm" className="bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"><FileDown className="w-4 h-4 mr-1" />Download Template</Button>
            <Button variant="outline" size="sm"><Upload className="w-4 h-4 mr-1" />Import</Button>
          </PermissionGate>
          <PermissionGate permission="Create_performance_entries">
            <Button size="sm" onClick={openCreate} className="bg-secondary text-secondary-foreground hover:bg-secondary/90"><Plus className="w-4 h-4 mr-1" />Add New Entry</Button>
          </PermissionGate>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        {[
          { l: 'Total Spend', v: `₹${(totals.spend / 100000).toFixed(1)}L` },
          { l: 'Total Leads', v: totals.leads.toLocaleString() },
          { l: 'Avg CPL', v: `₹${avgCPL}` },
          { l: 'Total Revenue', v: `₹${(totals.revenue / 100000).toFixed(1)}L` },
          { l: 'Avg ROAS', v: `${avgROAS}x` },
        ].map((s, i) => (
          <Card key={i}><CardContent className="p-4 text-center"><p className="text-xl font-display font-bold">{s.v}</p><p className="text-[13px] text-muted-foreground">{s.l}</p></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-3 sm:p-4 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input placeholder="Search entries..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-10 min-h-9" />
            </div>
            <GroupedFiltersPopover
              groups={filterGroups}
              selections={filterSelections}
              onToggle={toggleGroupFilter}
              onClearAll={clearAllFilters}
            />
          </div>
          {Object.values(filterSelections).some(arr => arr.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {filterGroups.flatMap(g =>
                (filterSelections[g.id] ?? []).map(val => (
                  <Badge
                    key={`${g.id}-${val}`}
                    variant="secondary"
                    className="text-xs sm:text-[13px] gap-1 cursor-pointer font-medium touch-manipulation max-w-full truncate"
                    onClick={() => toggleGroupFilter(g.id, val)}
                  >
                    {g.label}: {val} ✕
                  </Badge>
                )),
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Project Type</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead className="text-right">Spend</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead className="text-right">CPL</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">ROAS</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(e => {
                const proj = projects.find(p => p.name === e.project);
                return (
                  <TableRow key={e.id}>
                    <TableCell className="text-sm font-medium">{e.project}</TableCell>
                    <TableCell><Badge variant={proj?.type === 'Real Estate' ? 'secondary' : 'default'} className="text-[12px]">{proj?.type || 'Lead Gen'}</Badge></TableCell>
                    <TableCell className="text-sm">{proj?.client || e.project}</TableCell>
                    <TableCell className="text-sm">{e.platform}</TableCell>
                    <TableCell className="text-right text-sm">₹{e.spend.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-sm">{e.leads > 0 ? e.leads.toLocaleString() : '-'}</TableCell>
                    <TableCell className="text-right text-sm">{e.cpl > 0 ? `₹${e.cpl.toLocaleString()}` : '-'}</TableCell>
                    <TableCell className="text-right text-sm">{e.revenue > 0 ? `₹${e.revenue.toLocaleString()}` : '-'}</TableCell>
                    <TableCell className="text-right text-sm">{e.roas > 0 ? e.roas : '-'}</TableCell>
                    <TableCell className="text-sm">2026</TableCell>
                    <TableCell className="text-sm">March</TableCell>
                    <TableCell><Badge variant="default" className="text-[12px]">Active</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 bg-info/10 text-info hover:bg-info/20 rounded"><Eye className="w-3 h-3" /></Button>
                        <PermissionGate permission="Edit_performance_entries">
                          <Button variant="ghost" size="icon" className="h-7 w-7 bg-success/10 text-success hover:bg-success/20 rounded" onClick={() => openEdit(e)}><Edit className="w-3 h-3" /></Button>
                        </PermissionGate>
                        <PermissionGate permission="Delete_performance_entries">
                          <Button variant="ghost" size="icon" className="h-7 w-7 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded" onClick={() => setDeleteConfirm(e.id)}><Trash2 className="w-3 h-3" /></Button>
                        </PermissionGate>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AdvancedPagination page={page} totalPages={totalPages} totalItems={filtered.length} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} />

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="w-[calc(100vw-1.5rem)] max-w-lg sm:w-full">
          <DialogHeader><DialogTitle>{editEntry ? 'Edit Entry' : 'Add Performance Entry'}</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label className="text-[14px] font-semibold mb-1 block">Project *</label>
              <Select value={formData.project} onValueChange={v => setFormData(f => ({ ...f, project: v }))}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[14px] font-semibold mb-1 block">Platform *</label>
              <Select value={formData.platform} onValueChange={v => setFormData(f => ({ ...f, platform: v }))}>
                <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                <SelectContent>{platforms.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="text-[14px] font-semibold mb-1 block">Spend (₹) *</label><Input type="number" value={formData.spend || ''} onChange={e => setFormData(f => ({ ...f, spend: +e.target.value }))} /></div>
              <div><label className="text-[14px] font-semibold mb-1 block">Leads</label><Input type="number" value={formData.leads || ''} onChange={e => setFormData(f => ({ ...f, leads: +e.target.value }))} /></div>
              <div><label className="text-[14px] font-semibold mb-1 block">Revenue (₹)</label><Input type="number" value={formData.revenue || ''} onChange={e => setFormData(f => ({ ...f, revenue: +e.target.value }))} /></div>
              <div><label className="text-[14px] font-semibold mb-1 block">ROAS</label><Input type="number" step="0.1" value={formData.roas || ''} onChange={e => setFormData(f => ({ ...f, roas: +e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="text-[14px] font-semibold mb-1 block">Year</label><Input value="2026" readOnly /></div>
              <div>
                <label className="text-[14px] font-semibold mb-1 block">Month</label>
                <Select value={formData.date || 'March'} onValueChange={v => setFormData(f => ({ ...f, date: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={saveEntry}>{editEntry ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Delete</DialogTitle></DialogHeader>
          <p className="text-[15px] text-muted-foreground">Are you sure you want to delete this entry?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteEntry(deleteConfirm!)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PerformanceEntryPage;
