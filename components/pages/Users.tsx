"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GroupedFiltersPopover, type FilterSelections } from "@/components/shared/GroupedFiltersPopover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { users as mockUsersArray, roles, sortRolesByDisplayOrder } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Plus, Download, Edit, Trash2, Eye, Users as UsersIcon } from "lucide-react";
import PremiumKpiCard, { type KpiCardData } from "@/components/shared/PremiumKpiCard";
import { UserCheck, UserX } from "lucide-react";
import PermissionGate from "@/components/shared/PermissionGate";
import type { User } from "@/data/mockData";
import AdvancedPagination from "@/components/shared/AdvancedPagination";
import { useUserStore, generateSignupLink } from "@/store/userStore";
import { sendInviteEmail } from "@/services/email.service";
import { Copy, CheckCheck, Loader2, Mail, Link2 } from "lucide-react";

const AVATAR_COLORS = [
  { bg: "bg-blue-600", text: "text-white" },
  { bg: "bg-emerald-600", text: "text-white" },
  { bg: "bg-purple-600", text: "text-white" },
  { bg: "bg-orange-600", text: "text-white" },
  { bg: "bg-pink-600", text: "text-white" },
  { bg: "bg-cyan-600", text: "text-white" },
  { bg: "bg-red-600", text: "text-white" },
  { bg: "bg-indigo-600", text: "text-white" },
  { bg: "bg-teal-600", text: "text-white" },
  { bg: "bg-amber-600", text: "text-white" },
];

const ROLE_BADGE_COLORS: Record<string, string> = {
  "Super Admin": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  Admin: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  Manager: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Client: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  User: "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-300",
};

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Inactive: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (name: string) => {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

type UserSortKey = "name" | "email" | "role" | "projects" | "status" | "lastLogin";

const Users = () => {
  const router = useRouter();
  const getAllUsers = useUserStore((s) => s.getAllUsers);
  const addInvite = useUserStore((s) => s.addInvite);
  const updateUserRole = useUserStore((s) => s.updateUserRole);
  const updateInviteRole = useUserStore((s) => s.updateInviteRole);
  const removeUserByEmail = useUserStore((s) => s.removeUserByEmail);
  const userList = getAllUsers();
  const [search, setSearch] = useState("");
  const [filterSelections, setFilterSelections] = useState<FilterSelections>({ status: [], role: [] });
  const [sortKey, setSortKey] = useState<UserSortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { proxyLogin } = useAuth();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("User");
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [editError, setEditError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "User",
  });

  const filterGroups = useMemo(
    () => [
      { id: "status", label: "Status", options: ["Active", "Inactive", "Pending"] as string[] },
      { id: "role", label: "Role", options: [...new Set(userList.map((u) => u.role))].sort() },
    ],
    [userList],
  );

  const toggleGroupFilter = (groupId: string, value: string) => {
    setFilterSelections((prev) => {
      const cur = prev[groupId] ?? [];
      const next = cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value];
      return { ...prev, [groupId]: next };
    });
    setPage(1);
  };

  const clearAllFilters = () => {
    setFilterSelections({ status: [], role: [] });
    setPage(1);
  };

  const toggleUserSort = (k: UserSortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir(k === "name" || k === "email" || k === "role" || k === "status" || k === "lastLogin" ? "asc" : "desc");
    }
  };

  const userSortIndicator = (k: UserSortKey) => (sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : "");

  const filtered = useMemo(() => {
    let list = userList.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()),
    );
    const st = filterSelections.status ?? [];
    const rl = filterSelections.role ?? [];
    if (st.length > 0) list = list.filter((u) => st.includes(u.status));
    if (rl.length > 0) list = list.filter((u) => rl.includes(u.role));
    const mul = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      switch (sortKey) {
        case "name":
          return mul * a.name.localeCompare(b.name);
        case "email":
          return mul * a.email.localeCompare(b.email);
        case "role":
          return mul * a.role.localeCompare(b.role);
        case "status":
          return mul * a.status.localeCompare(b.status);
        case "lastLogin":
          return mul * a.lastLogin.localeCompare(b.lastLogin);
        case "projects":
          return mul * (a.projects - b.projects);
        default:
          return 0;
      }
    });
  }, [userList, search, filterSelections, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openCreate = () => {
    setInviteEmail("");
    setInviteRole("User");
    setInviteSent(false);
    setShowInviteDialog(true);
  };
  const openEdit = (u: User) => {
    setEditUser(u);
    setFormData({ name: u.name, email: u.email, phone: u.phone || "", role: u.role });
    setEditError("");
    setShowEditDialog(true);
  };

  const [inviteSending, setInviteSending] = useState(false);
  const [inviteMethod, setInviteMethod] = useState<"email" | "link-only">("link-only");

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviteSending(true);
    const invite = addInvite(inviteEmail.trim(), inviteRole);
    const link = generateSignupLink(invite.email, invite.token);
    setInviteLink(link);
    setLinkCopied(false);

    const result = await sendInviteEmail(invite.email, link);
    setInviteMethod(result.method);
    setInviteSending(false);
    setInviteSent(true);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = inviteLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const saveUser = () => {
    if (editUser) {
      if (editUser.id.startsWith("invite-")) {
        updateInviteRole(editUser.email, formData.role);
      } else {
        updateUserRole(formData.email, formData.role);
      }
    }
    setShowEditDialog(false);
    setEditError("");
  };

  const deleteUser = (target: User) => {
    if (target.id.startsWith("invite-") || !mockUsersArray.find((mu) => mu.id === target.id)) {
      removeUserByEmail(target.email);
    }
    setDeleteConfirm(null);
  };

  const exportCSV = () => {
    const csv = [
      "Name,Email,Role,Projects,Status,Last Login,Phone",
      ...filtered.map(
        (u) => `${u.name},${u.email},${u.role},${u.projects},${u.status},${u.lastLogin},${u.phone || ""}`,
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "users.csv";
    a.click();
  };

  const openProxy = (u: User) => {
    // Ensure user exists in mockUsers array so proxyLoginUser can find them
    if (!mockUsersArray.find((mu) => mu.id === u.id)) {
      mockUsersArray.push(u);
    }
    proxyLogin(u.id);
    router.push("/dashboard");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-[28px] font-display font-bold tracking-tight">User Management</h1>
          <p className="text-sm sm:text-[15px] text-muted-foreground">Manage team members, roles and access</p>
        </div>
        <div className="flex gap-2">
          {/* <PermissionGate permission="Export_performance_entries">
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </PermissionGate> */}
          <PermissionGate permission="Create_users">
            <Button size="sm" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-1" />
              Invite User
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* KPI Cards - Total, Active, Inactive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(
          [
            {
              label: "Total Users",
              value: userList.length.toString(),
              icon: UsersIcon,
              accent: "blue" as const,
              subtitle: "All team members",
              trend: 8,
            },
            {
              label: "Active Users",
              value: userList.filter((u) => u.status === "Active").length.toString(),
              icon: UserCheck,
              accent: "emerald" as const,
              subtitle: "Currently active",
              trend: 12,
            },
            {
              label: "Inactive Users",
              value: userList.filter((u) => u.status === "Inactive").length.toString(),
              icon: UserX,
              accent: "red" as const,
              subtitle: "Deactivated accounts",
            },
          ] as KpiCardData[]
        ).map((card, i) => (
          <PremiumKpiCard key={card.label} card={card} index={i} />
        ))}
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-3 sm:p-4 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10 min-h-9"
              />
            </div>
            <GroupedFiltersPopover
              groups={filterGroups}
              selections={filterSelections}
              onToggle={toggleGroupFilter}
              onClearAll={clearAllFilters}
            />
          </div>
          {(filterSelections.status?.length || filterSelections.role?.length) ? (
            <div className="flex flex-wrap gap-1.5">
              {filterGroups.flatMap((g) =>
                (filterSelections[g.id] ?? []).map((val) => (
                  <Badge
                    key={`${g.id}-${val}`}
                    variant="secondary"
                    className="text-xs sm:text-[13px] gap-1 cursor-pointer font-medium touch-manipulation"
                    onClick={() => toggleGroupFilter(g.id, val)}
                  >
                    {g.label}: {val} ✕
                  </Badge>
                )),
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-md hidden md:block overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold cursor-pointer select-none hover:bg-muted/50" onClick={() => toggleUserSort("name")}>
                  User{userSortIndicator("name")}
                </TableHead>
                <TableHead className="font-bold cursor-pointer select-none hover:bg-muted/50" onClick={() => toggleUserSort("email")}>
                  Email{userSortIndicator("email")}
                </TableHead>
                <TableHead className="font-bold cursor-pointer select-none hover:bg-muted/50" onClick={() => toggleUserSort("role")}>
                  Role{userSortIndicator("role")}
                </TableHead>
                <TableHead className="font-bold cursor-pointer select-none hover:bg-muted/50" onClick={() => toggleUserSort("projects")}>
                  Projects{userSortIndicator("projects")}
                </TableHead>
                <TableHead className="font-bold cursor-pointer select-none hover:bg-muted/50" onClick={() => toggleUserSort("status")}>
                  Status{userSortIndicator("status")}
                </TableHead>
                <TableHead className="font-bold cursor-pointer select-none hover:bg-muted/50" onClick={() => toggleUserSort("lastLogin")}>
                  Last Login{userSortIndicator("lastLogin")}
                </TableHead>
                <TableHead className="font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((u) => {
                const avatarColor = getAvatarColor(u.name);
                return (
                  <TableRow key={u.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full ${avatarColor.bg} ${avatarColor.text} flex items-center justify-center text-[13px] font-bold shadow-sm`}
                        >
                          {getInitials(u.name)}
                        </div>
                        <span className="text-sm font-semibold">{u.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[15px] text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[12px] border-0 font-bold ${ROLE_BADGE_COLORS[u.role] || "bg-gray-100 text-gray-600"}`}
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-semibold">{u.projects}</TableCell>
                    <TableCell>
                      <Badge className={`text-[12px] border-0 font-bold ${STATUS_COLORS[u.status] || ""}`}>{u.status}</Badge>
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">{u.lastLogin}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <PermissionGate permission="View_users" level="View">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Proxy Login"
                            onClick={() => openProxy(u)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </PermissionGate>
                        <PermissionGate permission="Edit_users">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u)}>
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </PermissionGate>
                        <PermissionGate permission="Delete_users">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => setDeleteConfirm(u.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {paginated.map((u) => {
          const avatarColor = getAvatarColor(u.name);
          return (
            <Card key={u.id} className="shadow-md">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full shrink-0 ${avatarColor.bg} ${avatarColor.text} flex items-center justify-center text-sm font-bold`}
                    >
                      {getInitials(u.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold">{u.name}</p>
                      <p className="text-[13px] text-muted-foreground truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 justify-end">
                    <Badge className={`text-[12px] border-0 font-bold ${ROLE_BADGE_COLORS[u.role] || ""}`}>
                      {u.role}
                    </Badge>
                    <Badge className={`text-[12px] border-0 font-bold ${STATUS_COLORS[u.status] || ""}`}>{u.status}</Badge>
                    <span className="text-sm font-semibold">{u.projects} projects</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <PermissionGate permission="View_users" level="View">
                    <Button variant="outline" size="sm" onClick={() => openProxy(u)}>
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </PermissionGate>
                  <PermissionGate permission="Edit_users">
                    <Button variant="outline" size="sm" onClick={() => openEdit(u)}>
                      Edit
                    </Button>
                  </PermissionGate>
                  <PermissionGate permission="Delete_users">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setDeleteConfirm(u.id)}
                    >
                      Delete
                    </Button>
                  </PermissionGate>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AdvancedPagination
        page={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
      />

      {/* Invite User Dialog - Email only */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-bold">Invite New User</DialogTitle>
            <p className="text-[13px] text-muted-foreground mt-1">
              Send a signup invitation link to the user's email address
            </p>
          </DialogHeader>
          {!inviteSent ? (
            <div className="space-y-4">
              <div>
                <label className="text-[14px] font-bold mb-1 block">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="text-[14px] font-bold mb-1 block">
                  Assign Role <span className="text-destructive">*</span>
                </label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortRolesByDisplayOrder(roles)
                      .filter((r) => r.name !== "Super Admin")
                      .map((r) => (
                        <SelectItem key={r.id} value={r.name}>
                          {r.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  This role will be assigned when the user signs up
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={sendInvite} disabled={!inviteEmail.trim() || inviteSending}>
                  {inviteSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-1" />
                      Send Invite
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
                {inviteMethod === "email" ? (
                  <Mail className="w-8 h-8 text-emerald-600" />
                ) : (
                  <Link2 className="w-8 h-8 text-emerald-600" />
                )}
              </div>
              <div>
                <p className="font-bold text-foreground">
                  {inviteMethod === "email" ? "Invitation Email Sent!" : "Invitation Link Ready!"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {inviteMethod === "email" ? (
                    <>
                      Email sent to <span className="font-semibold text-foreground">{inviteEmail}</span>. You can also
                      share the link below.
                    </>
                  ) : (
                    <>
                      Share this signup link with <span className="font-semibold text-foreground">{inviteEmail}</span>
                    </>
                  )}
                </p>
              </div>
              {/* Copyable signup link */}
              <div className="bg-muted rounded-lg p-3 text-left">
                <label className="text-[13px] font-bold text-muted-foreground block mb-1">Signup Link</label>
                <div className="flex items-center gap-2">
                  <code className="text-[13px] bg-background px-2 py-1.5 rounded border flex-1 break-all select-all">
                    {inviteLink}
                  </code>
                  <Button size="sm" variant="outline" onClick={copyLink} className="shrink-0">
                    {linkCopied ? <CheckCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              {inviteMethod === "link-only" && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-left border border-amber-200 dark:border-amber-800">
                  <p className="text-[13px] text-amber-700 dark:text-amber-300 font-semibold">⚡ EmailJS not configured</p>
                  <p className="text-[12px] text-amber-600 dark:text-amber-400 mt-0.5">
                    To send real emails, configure EmailJS credentials in{" "}
                    <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">
                      src/services/email.service.ts
                    </code>
                  </p>
                </div>
              )}
              <p className="text-[13px] text-muted-foreground">
                The user will sign up with the{" "}
                <Badge className={`text-[12px] border-0 font-bold ${ROLE_BADGE_COLORS[inviteRole] || ""}`}>
                  {inviteRole}
                </Badge>{" "}
                role and get immediate access.
              </p>
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display font-bold">Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] px-1 pb-1 overflow-y-auto scrollbar-themed">
            <div>
              <label className="text-[14px] font-bold mb-1 block">
                Full Name <span className="text-destructive">*</span>
              </label>
              <Input value={formData.name} onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-[14px] font-bold mb-1 block">
                Email <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-[14px] font-bold mb-1 block">Mobile Number</label>
              <Input value={formData.phone} onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="text-[14px] font-bold mb-1 block">
                Role <span className="text-destructive">*</span>
              </label>
              <Select value={formData.role} onValueChange={(v) => setFormData((f) => ({ ...f, role: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortRolesByDisplayOrder(roles).map((r) => (
                    <SelectItem key={r.id} value={r.name}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editError && (
              <p className="text-sm text-destructive font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                {editError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveUser} disabled={!formData.name.trim() || !formData.email.trim()}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display font-bold">Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-[15px] text-muted-foreground">
            Are you sure you want to delete this user? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const u = userList.find((x) => x.id === deleteConfirm);
                if (u) deleteUser(u);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
