"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { projects as allProjects, users, platforms } from '@/data/mockData';
import { Search, Plus, Edit, Trash2, Eye, Download, FolderKanban, AlertTriangle, CheckCircle, PauseCircle, Minus, ChevronDown } from 'lucide-react';
import type { Project } from '@/data/mockData';
import AdvancedPagination from '@/components/shared/AdvancedPagination';
import PermissionGate from '@/components/shared/PermissionGate';
import PremiumKpiCard, { type KpiCardData } from '@/components/shared/PremiumKpiCard';

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'On Hold': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Budget Warning': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

interface Assignment { userId: string; platformId: string; }
interface PlatformAccount { platformId: string; accountIds: { id: string; status: 'Active' | 'Inactive' }[]; }

type ProjectListSortKey = "name" | "client" | "type" | "manager" | "budget" | "status" | "created";

const Projects = () => {
  const router = useRouter();
  const [projectList, setProjectList] = useState(allProjects);
  const [search, setSearch] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<ProjectListSortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showDialog, setShowDialog] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '', type: 'Real Estate', description: '', client: '', country: 'India',
    status: 'Active' as Project['status'], whatsappLead: false,
  });
  const [assignments, setAssignments] = useState<Assignment[]>([{ userId: '', platformId: '' }]);
  const [platAccounts, setPlatAccounts] = useState<PlatformAccount[]>([{ platformId: '', accountIds: [{ id: '', status: 'Active' }] }]);

  const filterOptions: Record<string, string[]> = {
    status: ['Active', 'On Hold', 'Completed', 'Budget Warning'],
    type: [...new Set(projectList.map(p => p.type))],
    manager: [...new Set(projectList.map(p => p.manager))],
    country: [...new Set(projectList.map(p => p.country))],
    client: [...new Set(projectList.map(p => p.client))],
  };

  const toggleFilter = (val: string) => {
    setSelectedFilters(prev => prev.includes(val) ? prev.filter(f => f !== val) : [...prev, val]);
    setPage(1);
  };

  const toggleProjectListSort = (k: ProjectListSortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir(k === "name" || k === "client" || k === "type" || k === "manager" || k === "status" ? "asc" : "desc");
    }
  };

  const projSortIndicator = (k: ProjectListSortKey) => (sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : "");

  const filtered = useMemo(() => {
    let list = projectList.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase())
    );
    if (filterBy !== 'all' && selectedFilters.length > 0) {
      if (filterBy === 'status') list = list.filter(p => selectedFilters.includes(p.status));
      if (filterBy === 'type') list = list.filter(p => selectedFilters.includes(p.type));
      if (filterBy === 'manager') list = list.filter(p => selectedFilters.includes(p.manager));
      if (filterBy === 'country') list = list.filter(p => selectedFilters.includes(p.country));
      if (filterBy === 'client') list = list.filter(p => selectedFilters.includes(p.client));
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
        case "manager":
          return mul * a.manager.localeCompare(b.manager);
        case "status":
          return mul * a.status.localeCompare(b.status);
        case "budget":
          return mul * (a.budgetUsed - b.budgetUsed);
        case "created":
          return mul * a.createdAt.localeCompare(b.createdAt);
        default:
          return 0;
      }
    });
  }, [projectList, search, filterBy, selectedFilters, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const stats = {
    total: projectList.length,
    active: projectList.filter(p => p.status === 'Active').length,
    onHold: projectList.filter(p => p.status === 'On Hold').length,
    warning: projectList.filter(p => p.status === 'Budget Warning').length,
  };

  const openCreate = () => {
    setEditProject(null);
    setFormData({ name: '', type: 'Real Estate', description: '', client: '', country: 'India', status: 'Active', whatsappLead: false });
    setAssignments([{ userId: '', platformId: '' }]);
    setPlatAccounts([{ platformId: '', accountIds: [{ id: '', status: 'Active' }] }]);
    setShowDialog(true);
  };

  const openEdit = (p: Project) => {
    setEditProject(p);
    setFormData({ name: p.name, type: p.type, description: '', client: p.client, country: p.country, status: p.status, whatsappLead: false });
    setAssignments([{ userId: '', platformId: '' }]);
    setPlatAccounts([{ platformId: '', accountIds: [{ id: '', status: 'Active' }] }]);
    setShowDialog(true);
  };

  const saveProject = () => {
    const platNames = assignments.filter(a => a.platformId).map(a => {
      const plat = platforms.find(p => p.id === a.platformId);
      return plat?.name || '';
    }).filter(Boolean);
    const manager = assignments.find(a => a.userId)?.userId ? users.find(u => u.id === assignments.find(a => a.userId)?.userId)?.name || '' : '';

    if (editProject) {
      setProjectList(prev => prev.map(p => p.id === editProject.id ? {
        ...p, name: formData.name, client: formData.client, type: formData.type,
        country: formData.country, status: formData.status,
        platforms: platNames.length > 0 ? platNames : p.platforms,
        manager: manager || p.manager,
      } : p));
    } else {
      const np: Project = {
        id: String(Date.now()), name: formData.name, client: formData.client, type: formData.type,
        platforms: platNames, manager: manager || 'Unassigned', budget: '₹0',
        budgetUsed: 0, spend: '₹0', revenue: '₹0', leads: 0, cpl: '₹0', roas: '0x',
        country: formData.country, status: formData.status,
        createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0],
      };
      setProjectList(prev => [...prev, np]);
    }
    setShowDialog(false);
  };

  const deleteProject = (id: string) => { setProjectList(prev => prev.filter(p => p.id !== id)); setDeleteConfirm(null); };

  const exportCSV = () => {
    const csv = ['Name,Client,Type,Platform(s),Manager,Budget,Spent%,Status,Created',
      ...filtered.map(p => `${p.name},${p.client},${p.type},"${p.platforms.join('; ')}",${p.manager},${p.budget},${p.budgetUsed}%,${p.status},${p.createdAt}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'projects.csv'; a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[28px] font-display font-bold">Projects</h1>
          <p className="text-[15px] text-muted-foreground"><span className="font-semibold text-foreground">{stats.total}</span> campaigns across all platforms</p>
        </div>
        <div className="flex gap-2">
          <PermissionGate permission="Export_performance_entries">
            <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" />Export CSV</Button>
          </PermissionGate>
          <PermissionGate permission="Create_projects">
            <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" />Create Project</Button>
          </PermissionGate>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {([
          { label: 'Total Projects', value: stats.total.toString(), icon: FolderKanban, accent: 'blue' as const, subtitle: 'All projects', trend: 8 },
          { label: 'Active', value: stats.active.toString(), icon: CheckCircle, accent: 'emerald' as const, subtitle: 'Running campaigns', trend: 12 },
          { label: 'On Hold', value: stats.onHold.toString(), icon: PauseCircle, accent: 'amber' as const, subtitle: 'Paused projects' },
          { label: 'Budget Warning', value: stats.warning.toString(), icon: AlertTriangle, accent: 'red' as const, subtitle: 'Needs attention', trend: -5 },
        ] as KpiCardData[]).map((card, i) => (
          <PremiumKpiCard key={card.label} card={card} index={i} />
        ))}
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search projects, clients..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-10" />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[13px] font-semibold text-muted-foreground">Filter by:</span>
              <Select value={filterBy} onValueChange={v => { setFilterBy(v); setSelectedFilters([]); setPage(1); }}>
                <SelectTrigger className="w-[130px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {filterBy !== 'all' && filterOptions[filterBy] && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="min-w-[160px] justify-between text-[13px] h-9">
                    <span>{selectedFilters.length === 0 ? 'Select filters...' : `${selectedFilters.length} selected`}</span>
                    <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-0" align="start">
                  <div className="max-h-[280px] overflow-y-auto p-2 space-y-0.5">
                    {filterOptions[filterBy].map(opt => (
                      <label key={opt} className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-muted rounded">
                        <Checkbox checked={selectedFilters.includes(opt)} onCheckedChange={() => toggleFilter(opt)} />
                        <span className="text-[13px] truncate">{opt}</span>
                      </label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
          {selectedFilters.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedFilters.map(f => (
                <Badge key={f} variant="secondary" className="text-[13px] gap-1 cursor-pointer" onClick={() => toggleFilter(f)}>
                  {f} ✕
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-md">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold cursor-pointer select-none hover:bg-muted/50" onClick={() => toggleProjectListSort("name")}>
                  Project Name{projSortIndicator("name")}
                </TableHead>
                <TableHead className="font-bold cursor-pointer select-none hover:bg-muted/50" onClick={() => toggleProjectListSort("client")}>
                  Client{projSortIndicator("client")}
                </TableHead>
                <TableHead className="font-bold cursor-pointer select-none hover:bg-muted/50" onClick={() => toggleProjectListSort("type")}>
                  Type{projSortIndicator("type")}
                </TableHead>
                <TableHead className="font-bold">Platform(s)</TableHead>
                <TableHead className="font-bold cursor-pointer select-none hover:bg-muted/50" onClick={() => toggleProjectListSort("manager")}>
                  Manager{projSortIndicator("manager")}
                </TableHead>
                <TableHead className="font-bold">Budget</TableHead>
                <TableHead className="font-bold cursor-pointer select-none hover:bg-muted/50" onClick={() => toggleProjectListSort("budget")}>
                  Spent %{projSortIndicator("budget")}
                </TableHead>
                <TableHead className="font-bold cursor-pointer select-none hover:bg-muted/50" onClick={() => toggleProjectListSort("status")}>
                  Status{projSortIndicator("status")}
                </TableHead>
                <TableHead className="font-bold cursor-pointer select-none hover:bg-muted/50" onClick={() => toggleProjectListSort("created")}>
                  Created{projSortIndicator("created")}
                </TableHead>
                <TableHead className="font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(p => (
                <TableRow key={p.id} className="hover:bg-muted/50">
                  <TableCell className="font-semibold">{p.name}</TableCell>
                  <TableCell className="text-sm">{p.client}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[12px] font-semibold">{p.type}</Badge></TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.platforms.map(pl => (
                        <Badge key={pl} className="text-[9px] bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 border-0">{pl}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{p.manager}</TableCell>
                  <TableCell className="text-sm font-semibold">{p.budget}</TableCell>
                  <TableCell>
                    <div className="space-y-1 min-w-[60px]">
                      <Progress value={p.budgetUsed} className="h-1.5" />
                      <span className="text-[12px] font-bold text-muted-foreground">{p.budgetUsed}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[12px] border-0 font-bold ${STATUS_COLORS[p.status] || ''}`}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-[13px] text-muted-foreground">{p.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/projects/${p.id}`)}><Eye className="w-3.5 h-3.5" /></Button>
                      <PermissionGate permission="Edit_projects">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Edit className="w-3.5 h-3.5" /></Button>
                      </PermissionGate>
                      <PermissionGate permission="Delete_projects">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteConfirm(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </PermissionGate>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AdvancedPagination page={page} totalPages={totalPages} totalItems={filtered.length} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} />

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-themed">
          <DialogHeader><DialogTitle className="font-display font-bold">{editProject ? 'Edit Project' : 'Create New Project'}</DialogTitle></DialogHeader>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[14px] font-bold mb-1 block">Project Name <span className="text-destructive">*</span></label>
                <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-[14px] font-bold mb-1 block">Project Type</label>
                <Select value={formData.type} onValueChange={v => setFormData(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Real Estate', 'Healthcare', 'Education', 'E-Commerce', 'Technology', 'Finance', 'Marketing', 'Creative', 'Industrial', 'Automotive', 'Travel', 'Legal', 'F&B', 'Publishing', 'Import/Export'].map(t =>
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-[14px] font-bold mb-1 block">Description</label>
              <Textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} placeholder="Project description..." rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[14px] font-bold mb-1 block">Select Client <span className="text-destructive">*</span></label>
                <Select value={formData.client} onValueChange={v => setFormData(f => ({ ...f, client: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {[...new Set(allProjects.map(p => p.client))].sort().map(c =>
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[14px] font-bold mb-1 block">Select Country</label>
                <Select value={formData.country} onValueChange={v => setFormData(f => ({ ...f, country: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['India', 'USA', 'Australia', 'New Zealand', 'UAE', 'UK'].map(c =>
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assign Users & Platforms */}
            <div className="border rounded-lg p-4 bg-muted/10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="text-sm font-bold">Assign Users & Platforms <span className="text-destructive">*</span></label>
                  <p className="text-[11px] text-muted-foreground">Assign users to platforms. Each platform can only be assigned to one user.</p>
                </div>
                <Button size="icon" className="h-8 w-8" onClick={() => setAssignments(prev => [...prev, { userId: '', platformId: '' }])}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {assignments.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-background">
                    <div className="flex-1">
                      <label className="text-[13px] font-semibold mb-1 block">Assigned User <span className="text-destructive">*</span></label>
                      <Select value={a.userId} onValueChange={v => setAssignments(prev => prev.map((x, j) => j === i ? { ...x, userId: v } : x))}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Select User" /></SelectTrigger>
                        <SelectContent>
                          {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <label className="text-[13px] font-semibold mb-1 block">Platform <span className="text-destructive">*</span></label>
                      <Select value={a.platformId} onValueChange={v => setAssignments(prev => prev.map((x, j) => j === i ? { ...x, platformId: v } : x))}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Select Platform" /></SelectTrigger>
                        <SelectContent>
                          {platforms.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" size="icon" className="h-9 w-9 mt-5 text-destructive border-destructive/30" onClick={() => setAssignments(prev => prev.filter((_, j) => j !== i))}>
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Platforms & Account IDs */}
            <div className="border rounded-lg p-4 bg-muted/10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="text-sm font-bold">Platforms & Account IDs</label>
                  <p className="text-[11px] text-muted-foreground">Select platform and add multiple account IDs.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setPlatAccounts(prev => [...prev, { platformId: '', accountIds: [{ id: '', status: 'Active' }] }])}>
                  + Add Platform
                </Button>
              </div>
              <div className="space-y-3">
                {platAccounts.map((pa, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-background space-y-3">
                    <div>
                      <label className="text-[13px] font-semibold mb-1 block">Platform <span className="text-destructive">*</span></label>
                      <Select value={pa.platformId} onValueChange={v => setPlatAccounts(prev => prev.map((x, j) => j === i ? { ...x, platformId: v } : x))}>
                        <SelectTrigger className="h-9 w-[200px]"><SelectValue placeholder="Select Platform" /></SelectTrigger>
                        <SelectContent>
                          {platforms.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    {pa.accountIds.map((acc, ai) => (
                      <div key={ai} className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="text-[13px] font-semibold mb-1 block">Account IDs <span className="text-destructive">*</span></label>
                          <Input className="h-9" placeholder="Enter Account ID" value={acc.id}
                            onChange={e => setPlatAccounts(prev => prev.map((x, j) => j === i ? {
                              ...x, accountIds: x.accountIds.map((a, k) => k === ai ? { ...a, id: e.target.value } : a)
                            } : x))}
                          />
                        </div>
                        <div className="w-[100px]">
                          <label className="text-[13px] font-semibold mb-1 block">&nbsp;</label>
                          <Select value={acc.status} onValueChange={v => setPlatAccounts(prev => prev.map((x, j) => j === i ? {
                            ...x, accountIds: x.accountIds.map((a, k) => k === ai ? { ...a, status: v as any } : a)
                          } : x))}>
                            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                    <Button variant="link" size="sm" className="text-[13px] p-0 h-auto text-emerald-600" onClick={() => setPlatAccounts(prev => prev.map((x, j) => j === i ? { ...x, accountIds: [...x.accountIds, { id: '', status: 'Active' }] } : x))}>
                      + Add Account ID
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[14px] font-bold mb-1 block">Select Status</label>
                <Select value={formData.status} onValueChange={v => setFormData(f => ({ ...f, status: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Active', 'On Hold', 'Completed'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={formData.whatsappLead} onCheckedChange={v => setFormData(f => ({ ...f, whatsappLead: !!v }))} />
                  <span className="text-sm font-semibold">Enable WhatsApp Lead</span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={saveProject} disabled={!formData.name.trim()}>{editProject ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display font-bold">Confirm Delete</DialogTitle></DialogHeader>
          <p className="text-[15px] text-muted-foreground">Are you sure you want to delete this project? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteProject(deleteConfirm!)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;
