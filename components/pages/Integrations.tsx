"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GroupedFiltersPopover, type FilterSelections } from '@/components/shared/GroupedFiltersPopover';
import { Textarea } from '@/components/ui/textarea';
import { platforms as allPlatforms, projects } from '@/services/appData.service';
import { Search, Plus, Edit, Trash2, Eye, Plug, PlugZap, Calendar, User } from 'lucide-react';
import type { Platform } from '@/services/appData.service';
import AdvancedPagination from '@/components/shared/AdvancedPagination';
import PermissionGate from '@/components/shared/PermissionGate';
import GlassTabs from '@/components/shared/GlassTabs';

const STATUS_COLORS: Record<string, string> = {
  Connected: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Disconnected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  Expiring: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const PLATFORM_TABS = [
  { key: 'connectors', label: 'Connectors' },
  { key: 'google-ads', label: 'Google Ads' },
  { key: 'meta-ads', label: 'Meta Ads' },
  { key: 'bing-ads', label: 'Bing Ads' },
];

const Integrations = () => {
  const [activeTab, setActiveTab] = useState('connectors');
  const [platList, setPlatList] = useState(allPlatforms);
  const [search, setSearch] = useState('');
  const [filterSelections, setFilterSelections] = useState<FilterSelections>({ status: [] });
  const [showDialog, setShowDialog] = useState(false);
  const [editPlat, setEditPlat] = useState<Platform | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewProjects, setViewProjects] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'Connected' as Platform['status'], icon: '' });

  const statusFilterGroups = useMemo(
    () => [{ id: 'status', label: 'Connection status', options: ['Connected', 'Disconnected', 'Expiring'] as string[] }],
    [],
  );

  const toggleGroupFilter = (groupId: string, value: string) => {
    setFilterSelections(prev => {
      const cur = prev[groupId] ?? [];
      const next = cur.includes(value) ? cur.filter(x => x !== value) : [...cur, value];
      return { ...prev, [groupId]: next };
    });
    setPage(1);
  };

  const clearAllFilters = () => {
    setFilterSelections({ status: [] });
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = platList.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    const st = filterSelections.status ?? [];
    if (st.length > 0) list = list.filter(p => st.includes(p.status));
    return list;
  }, [platList, search, filterSelections]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openCreate = () => { setEditPlat(null); setFormData({ name: '', description: '', status: 'Connected', icon: '' }); setShowDialog(true); };
  const openEdit = (p: Platform) => { setEditPlat(p); setFormData({ name: p.name, description: p.channels.join(', '), status: p.status, icon: p.icon }); setShowDialog(true); };

  const savePlat = () => {
    if (editPlat) {
      setPlatList(prev => prev.map(p => p.id === editPlat.id ? { ...p, name: formData.name, channels: formData.description.split(',').map(c => c.trim()).filter(Boolean), status: formData.status, icon: formData.icon || formData.name[0]?.toUpperCase() || 'P' } : p));
    } else {
      const np: Platform = { id: String(Date.now()), name: formData.name, icon: formData.icon || formData.name[0]?.toUpperCase() || 'P', channels: formData.description.split(',').map(c => c.trim()).filter(Boolean), status: formData.status, projects: 0, spendMTD: '₹0', avgROAS: '0x', color: 'hsl(var(--primary))' };
      setPlatList(prev => [...prev, np]);
    }
    setShowDialog(false);
  };

  const toggleConnection = (id: string) => {
    setPlatList(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'Connected' ? 'Disconnected' : 'Connected' } : p));
  };

  const deletePlat = (id: string) => { setPlatList(prev => prev.filter(p => p.id !== id)); setDeleteConfirm(null); };

  const connectedProjects = useMemo(() => {
    if (!viewProjects) return [];
    const plat = platList.find(p => p.id === viewProjects);
    if (!plat) return [];
    return projects.filter(p => p.platforms.includes(plat.name));
  }, [viewProjects, platList]);

  const renderPlatformTab = (platformName: string) => (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mx-auto mb-4">
            {platformName[0]}
          </div>
          <h2 className="text-xl font-display font-bold mb-2">{platformName}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Integration settings and configuration for {platformName} will be available here.
          </p>
          <Badge variant="outline" className="text-xs">Coming Soon</Badge>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-[28px] font-display font-bold tracking-tight">Integrations</h1>
          <p className="text-sm sm:text-[15px] text-muted-foreground">Manage platform connectors and integrations</p>
        </div>
        {activeTab === 'connectors' && (
          <PermissionGate permission="Edit_platforms">
            <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" />Add Platform</Button>
          </PermissionGate>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {PLATFORM_TABS.map(tab => (
          <Button
            key={tab.key}
            size="sm"
            variant={activeTab === tab.key ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab.key)}
            className="rounded-xl text-xs"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === 'connectors' && (
        <>
          <Card className="shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input placeholder="Search platforms..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-10 min-h-9" />
                </div>
                <GroupedFiltersPopover
                  groups={statusFilterGroups}
                  selections={filterSelections}
                  onToggle={toggleGroupFilter}
                  onClearAll={clearAllFilters}
                />
              </div>
              {(filterSelections.status?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {(filterSelections.status ?? []).map(val => (
                    <Badge
                      key={val}
                      variant="secondary"
                      className="text-xs sm:text-[13px] gap-1 cursor-pointer font-medium touch-manipulation"
                      onClick={() => toggleGroupFilter('status', val)}
                    >
                      Status: {val} ✕
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {paginated.map(p => (
              <Card key={p.id} className="shadow-md hover:shadow-lg transition-shadow border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg font-bold shadow-sm">
                        {p.icon}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-base">{p.name}</h3>
                        <p className="text-[13px] text-muted-foreground">{p.channels.join(', ')}</p>
                      </div>
                    </div>
                    <Badge className={`text-[12px] border-0 font-bold ${STATUS_COLORS[p.status] || ''}`}>
                      {p.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-lg font-bold">{p.projects}</p>
                      <p className="text-[12px] text-muted-foreground font-semibold">Projects</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-lg font-bold">{p.spendMTD}</p>
                      <p className="text-[12px] text-muted-foreground font-semibold">Spend MTD</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-lg font-bold">{p.avgROAS}</p>
                      <p className="text-[12px] text-muted-foreground font-semibold">Avg ROAS</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[12px] text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />Created by: Admin</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Updated: Apr 2026</span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-border/50">
                    <Button variant="outline" size="sm" className="flex-1 text-[13px] gap-1" onClick={() => setViewProjects(p.id)}>
                      <Eye className="w-3.5 h-3.5" /> View Projects
                    </Button>
                    <Button
                      variant={p.status === 'Connected' ? 'outline' : 'default'}
                      size="sm"
                      className="flex-1 text-[13px] gap-1"
                      onClick={() => toggleConnection(p.id)}
                    >
                      {p.status === 'Connected' ? <PlugZap className="w-3.5 h-3.5" /> : <Plug className="w-3.5 h-3.5" />}
                      {p.status === 'Connected' ? 'Disconnect' : 'Connect'}
                    </Button>
                    <PermissionGate permission="Edit_platforms">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    </PermissionGate>
                    <PermissionGate permission="Delete_platforms">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteConfirm(p.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </PermissionGate>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <AdvancedPagination page={page} totalPages={totalPages} totalItems={filtered.length} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} />
        </>
      )}

      {activeTab === 'google-ads' && renderPlatformTab('Google Ads')}
      {activeTab === 'meta-ads' && renderPlatformTab('Meta Ads')}
      {activeTab === 'bing-ads' && renderPlatformTab('Bing Ads')}

      <Dialog open={!!viewProjects} onOpenChange={() => setViewProjects(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display font-bold">Connected Projects</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-themed">
            {connectedProjects.length > 0 ? connectedProjects.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-[13px] text-muted-foreground">{p.client}</p>
                </div>
                <Badge variant="outline" className="text-[12px]">{p.status}</Badge>
              </div>
            )) : <p className="text-sm text-muted-foreground text-center py-4">No projects connected</p>}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display font-bold">{editPlat ? 'Edit Platform' : 'Add Platform'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-[14px] font-bold mb-1 block">Platform Name <span className="text-destructive">*</span></label>
              <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-[14px] font-bold mb-1 block">Description (channels)</label>
              <Textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} placeholder="Search, Display, Shopping..." />
            </div>
            <div>
              <label className="text-[14px] font-bold mb-1 block">Status</label>
              <Select value={formData.status} onValueChange={v => setFormData(f => ({ ...f, status: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Connected">Connected</SelectItem>
                  <SelectItem value="Disconnected">Disconnected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[14px] font-bold mb-1 block">Icon (letter or emoji)</label>
              <Input value={formData.icon} onChange={e => setFormData(f => ({ ...f, icon: e.target.value }))} placeholder="G" maxLength={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={savePlat} disabled={!formData.name.trim()}>{editPlat ? 'Update' : 'Add Platform'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display font-bold">Confirm Delete</DialogTitle></DialogHeader>
          <p className="text-[15px] text-muted-foreground">Are you sure you want to delete this platform?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deletePlat(deleteConfirm!)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Integrations;
