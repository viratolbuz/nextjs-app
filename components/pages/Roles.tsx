"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { roles as allRoles, sortRolesByDisplayOrder } from "@/data/mockData";
import { Plus, Edit, Trash2, Shield } from "lucide-react";
import type { Role } from "@/data/mockData";
import PermissionGate from "@/components/shared/PermissionGate";
import { GroupedFiltersPopover, type FilterSelections } from "@/components/shared/GroupedFiltersPopover";

const ALL_PERMISSIONS = [
  "View_dashboard",
  "Manage_dashboard",
  "View_users",
  "Create_users",
  "Edit_users",
  "Delete_users",
  "View_roles",
  "Create_roles",
  "Edit_roles",
  "Delete_roles",
  "View_projects",
  "Create_projects",
  "Edit_projects",
  "Delete_projects",
  "View_platforms",
  "Edit_platforms",
  "Delete_platforms",
  "View_performance_entries",
  "Create_performance_entries",
  "Edit_performance_entries",
  "Delete_performance_entries",
  "Export_performance_entries",
  "Import_performance_entries",
  "Team_spend",
  "Spend_chart",
  "Spend_chart_report",
  "Platform_spend_report",
  "Monthly_spend",
  "Quarterly_spend",
  "Quarterly_spend_report",
  "Project_spend_report",
  "Team_spend_report",
  "View_reports",
  "View_email_histories",
];

const permissionToModule = (perm: string) => {
  if (perm.includes("dashboard")) return "Dashboard";
  if (perm.includes("users")) return "Users";
  if (perm.includes("roles")) return "Roles";
  if (perm.includes("projects")) return "Projects";
  if (perm.includes("platforms")) return "Platforms";
  if (perm.includes("performance") || perm.includes("Export") || perm.includes("Import")) return "Performance";
  if (perm.includes("report") || perm.includes("spend") || perm.includes("chart") || perm.includes("email"))
    return "Reports";
  return "Other";
};

const MODULE_BADGE_COLORS: Record<string, string> = {
  Dashboard: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Users: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Roles: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  Projects: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Platforms: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  Performance: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Reports: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
};

const ROLE_BADGE_COLORS: Record<string, string> = {
  "Super Admin": "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300",
  Admin: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300",
  Manager: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
  Client: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300",
  User: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300",
};

type RoleWithPerms = Role & { detailedPermissions?: string[] };

const Roles = () => {
  const [roleList, setRoleList] = useState<RoleWithPerms[]>(
    allRoles.map((r) => ({
      ...r,
      detailedPermissions: Object.entries(r.permissions)
        .filter(([, v]) => v !== "None")
        .map(([k]) => k),
    })),
  );
  const [showDialog, setShowDialog] = useState(false);
  const [editRole, setEditRole] = useState<RoleWithPerms | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formPerms, setFormPerms] = useState<string[]>([]);
  const [roleFilterSelections, setRoleFilterSelections] = useState<FilterSelections>({ role: [] });

  const openCreate = () => {
    setEditRole(null);
    setFormName("");
    setFormPerms([]);
    setShowDialog(true);
  };

  const openEdit = (r: RoleWithPerms) => {
    setEditRole(r);
    setFormName(r.name);
    setFormPerms(r.detailedPermissions || []);
    setShowDialog(true);
  };

  const togglePerm = (perm: string) => {
    setFormPerms((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));
  };

  const saveRole = () => {
    const permissions: Record<string, "Full" | "View" | "None"> = {};
    ALL_PERMISSIONS.forEach((p) => {
      permissions[p] = formPerms.includes(p) ? "Full" : "None";
    });
    if (editRole) {
      setRoleList((prev) =>
        prev.map((r) =>
          r.id === editRole.id ? { ...r, name: formName, permissions, detailedPermissions: formPerms } : r,
        ),
      );
    } else {
      setRoleList((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          name: formName,
          type: "Custom" as const,
          userCount: 0,
          permissions,
          detailedPermissions: formPerms,
        },
      ]);
    }
    setShowDialog(false);
  };

  const deleteRole = (id: string) => {
    setRoleList((prev) => prev.filter((r) => r.id !== id));
    setDeleteConfirm(null);
  };

  const groupedPerms = ALL_PERMISSIONS.reduce(
    (acc, p) => {
      const mod = permissionToModule(p);
      if (!acc[mod]) acc[mod] = [];
      acc[mod].push(p);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  const roleFilterGroups = useMemo(
    () => [
      {
        id: "role",
        label: "Role",
        options: sortRolesByDisplayOrder(roleList).map((r) => ({ value: r.id, label: r.name })),
      },
    ],
    [roleList],
  );

  const toggleRoleFilter = (groupId: string, value: string) => {
    setRoleFilterSelections((prev) => {
      const cur = prev[groupId] ?? [];
      const next = cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value];
      return { ...prev, [groupId]: next };
    });
  };

  const clearRoleFilters = () => setRoleFilterSelections({ role: [] });

  const displayedRoles = useMemo(() => {
    const ids = roleFilterSelections.role ?? [];
    const base = ids.length === 0 ? roleList : roleList.filter((r) => ids.includes(r.id));
    return sortRolesByDisplayOrder(base);
  }, [roleList, roleFilterSelections]);

  const getModuleLevel = (role: RoleWithPerms, module: string, perms: string[]) => {
    const granted = perms.filter(
      (p) => role.permissions[p] === "Full" || role.permissions[p] === "View" || role.detailedPermissions?.includes(p),
    );
    if (granted.length === 0) return "None";
    if (granted.length === perms.length) return "Full";
    return "View";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Define access levels for each role</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto">
          <GroupedFiltersPopover
            groups={roleFilterGroups}
            selections={roleFilterSelections}
            onToggle={toggleRoleFilter}
            onClearAll={clearRoleFilters}
          />
          <PermissionGate permission="Create_roles">
            <Button size="sm" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-1" />
              Create Role
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {displayedRoles.map((role) => {
          const isSuperAdmin = role.name === "Super Admin" || role.name === "Super-admin";

          return (
            <Card key={role.id} className="border-border/50 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base">{role.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {role.userCount} user{role.userCount !== 1 ? "s" : ""} · {role.type}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`text-[10px] border ${ROLE_BADGE_COLORS[role.name] || "bg-gray-100 text-gray-700"}`}
                  >
                    {role.type}
                  </Badge>
                </div>

                {/* Module Permission Badges */}
                <div className="space-y-2 mb-4">
                  {Object.entries(groupedPerms).map(([module, perms]) => {
                    const level = getModuleLevel(role, module, perms);
                    return (
                      <div
                        key={module}
                        className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/30"
                      >
                        <span className="text-xs font-semibold">{module}</span>
                        <Badge
                          className={`text-[10px] h-5 font-bold border-0 ${
                            level === "Full"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : level === "View"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                                : "bg-red-50 text-red-400 dark:bg-red-900/20 dark:text-red-400 opacity-60"
                          }`}
                        >
                          {level}
                        </Badge>
                      </div>
                    );
                  })}
                </div>

                {/* Actions - no edit/delete for Super Admin */}
                {!isSuperAdmin && (
                  <div className="flex gap-2 pt-2 border-t border-border/50 w-full">
                    <PermissionGate permission="Edit_roles">
                      <Button variant="outline" size="sm" className="w-1/2 gap-1.5" onClick={() => openEdit(role)}>
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </Button>
                    </PermissionGate>
                    <PermissionGate permission="Delete_roles">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-1/2 text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5"
                        onClick={() => setDeleteConfirm(role.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </PermissionGate>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-themed">
          <DialogHeader>
            <DialogTitle className="font-display font-bold">{editRole ? "Edit Role" : "Create New Role"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-bold mb-1 block">
                Role Name <span className="text-destructive">*</span>
              </label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Enter role name" />
            </div>
            <div>
              <label className="text-sm font-bold mb-3 block">
                Permissions <span className="text-destructive">*</span>
              </label>
              <div className="space-y-4">
                {Object.entries(groupedPerms).map(([module, perms]) => (
                  <div key={module}>
                    <h4
                      className={`text-xs font-bold mb-2 px-2 py-1 rounded inline-block ${MODULE_BADGE_COLORS[module] || ""}`}
                    >
                      {module}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {perms.map((perm) => (
                        <div
                          key={perm}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors shadow-sm"
                        >
                          <span className="text-xs font-medium">{perm.replace(/_/g, " ")}</span>
                          <Switch checked={formPerms.includes(perm)} onCheckedChange={() => togglePerm(perm)} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveRole} disabled={!formName.trim()}>
              {editRole ? "Update Role" : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display font-bold">Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this role? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteRole(deleteConfirm!)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Roles;
