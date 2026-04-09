"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import {
  LayoutDashboard,
  Users,
  Shield,
  Globe,
  FolderKanban,
  BarChart3,
  FileText,
  TrendingUp,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Puzzle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  path?: string;
  label: string;
  icon: any;
  type?: 'group';
  children?: NavItem[];
  permKey?: string;
}

const allNavItems: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, permKey: "View_dashboard" },
  {
    label: "Management",
    type: "group",
    icon: Settings,
    children: [
      { path: "/users", label: "Users", icon: Users, permKey: "View_users" },
      { path: "/roles", label: "Roles & Permissions", icon: Shield, permKey: "View_roles" },
      { path: "/projects", label: "Projects", icon: FolderKanban, permKey: "View_projects" },
    ],
  },
  {
    label: "Integrations",
    type: "group",
    icon: Puzzle,
    children: [
      { path: "/integrations", label: "Connectors", icon: Globe, permKey: "View_platforms" },
    ],
  },
  {
    label: "Reports",
    type: "group",
    icon: FileText,
    children: [
      { path: "/reports/team", label: "Team Reports", icon: Users, permKey: "Team_spend_report" },
      { path: "/reports/platform", label: "Platform Reports", icon: Globe, permKey: "Platform_spend_report" },
      { path: "/reports/project", label: "Project Reports", icon: FolderKanban, permKey: "Project_spend_report" },
    ],
  },
  { path: "/settings", label: "Settings", icon: Settings },
];

type SidebarProps = {
  className?: string;
  /** Close mobile drawer after navigation */
  onNavigate?: () => void;
  /** Rendered inside mobile sheet: full width, labels always visible */
  inDrawer?: boolean;
};

export const Sidebar = ({ className, onNavigate, inDrawer }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const effectiveCollapsed = inDrawer ? false : collapsed;
  const activeLayoutId = inDrawer ? "sidebar-active-drawer" : "sidebar-active-desktop";
  const [openGroups, setOpenGroups] = useState<string[]>(["Management"]);
  const pathname = usePathname();
  const { currentUser, proxyUser, logout, exitProxy } = useAuth();
  const { canView, isSuperAdmin } = usePermissions();

  const activeUser = proxyUser || currentUser;

  const navItems = useMemo(() => {
    if (isSuperAdmin) return allNavItems;

    return allNavItems.map(item => {
      if (item.type === 'group' && item.children) {
        const visibleChildren = item.children.filter(child =>
          !child.permKey || canView(child.permKey)
        );
        if (visibleChildren.length === 0) return null;
        return { ...item, children: visibleChildren };
      }
      if (item.permKey && !canView(item.permKey)) return null;
      return item;
    }).filter(Boolean) as NavItem[];
  }, [isSuperAdmin, canView]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => (prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]));
  };

  return (
    <aside
      className={cn(
        "h-screen flex flex-col border-r border-sidebar-border transition-all duration-300 sticky top-0 overflow-hidden shrink-0",
        inDrawer ? "w-full border-0" : effectiveCollapsed ? "w-[70px]" : "w-[260px]",
        className,
      )}
      style={{
        background:
          "linear-gradient(180deg, hsl(var(--sidebar-background)) 0%, hsl(var(--sidebar-background) / 0.95) 100%)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border/50">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
          A
        </div>
        {!effectiveCollapsed && (
          <div className="min-w-0">
            <h1 className="font-display font-bold text-[15px] text-primary-foreground">AdtoRise PMS</h1>
            <p className="text-[11px] text-sidebar-foreground/60">an olbuz company</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-themed py-3 px-2 space-y-0.5">
        {navItems.map((item, i) => {
          if (item.type === "group" && item.children) {
            const Icon = item.icon!;
            const isOpen = openGroups.includes(item.label);
            const isChildActive = item.children.some((c) => pathname === c.path);
            return (
              <div key={i} className="space-y-0.5">
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-all duration-200",
                    "text-sidebar-foreground hover:bg-sidebar-accent/60",
                    isChildActive && "text-primary",
                  )}
                  style={
                    isChildActive
                      ? {
                          background:
                            "linear-gradient(135deg, hsl(var(--sidebar-accent) / 0.6) 0%, hsl(var(--sidebar-accent) / 0.3) 100%)",
                          backdropFilter: "blur(12px)",
                        }
                      : undefined
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!effectiveCollapsed && (
                    <>
                      <span className="flex-1 text-left font-medium">{item.label}</span>
                      <ChevronDown
                        className={cn("w-3 h-3 transition-transform duration-200", isOpen && "rotate-180")}
                      />
                    </>
                  )}
                </button>
                <AnimatePresence>
                  {isOpen && !effectiveCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden ml-3 space-y-0.5"
                    >
                      {item.children.map((child, j) => {
                        const ChildIcon = child.icon;
                        const isActive = pathname === child.path;
                        return (
                          <Link
                            key={j}
                            href={child.path!}
                            onClick={() => onNavigate?.()}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] transition-all duration-200 relative",
                              isActive
                                ? "text-primary-foreground font-medium"
                                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40",
                            )}
                          >
                            {isActive && (
                              <motion.div
                                layoutId={activeLayoutId}
                                className="absolute inset-0 rounded-lg"
                                style={{
                                  background:
                                    "linear-gradient(135deg, hsl(var(--primary) / 0.9) 0%, hsl(var(--primary) / 0.7) 100%)",
                                  boxShadow: "0 2px 12px hsl(var(--primary) / 0.3)",
                                }}
                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                              />
                            )}
                            <ChildIcon className="w-4 h-4 shrink-0 relative z-10" />
                            <span className="relative z-10">{child.label}</span>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          if (item.path) {
            const Icon = item.icon!;
            const isActive = pathname === item.path;
            return (
              <Link
                key={i}
                href={item.path}
                onClick={() => onNavigate?.()}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-all duration-200 relative",
                  isActive
                    ? "text-primary-foreground font-medium"
                    : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/40",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId={activeLayoutId}
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(var(--primary) / 0.9) 0%, hsl(var(--primary) / 0.7) 100%)",
                      boxShadow: "0 2px 12px hsl(var(--primary) / 0.3)",
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className="w-4 h-4 shrink-0 relative z-10" />
                {!effectiveCollapsed && <span className="relative z-10">{item.label}</span>}
              </Link>
            );
          }

          return null;
        })}
      </nav>

      <div className="border-t border-sidebar-border/50 p-3 space-y-2">
        {!inDrawer && (
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors text-sidebar-foreground/60 hover:text-sidebar-foreground touch-manipulation"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        )}
        {!effectiveCollapsed && activeUser && (
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
              {activeUser.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{activeUser.name}</p>
              <p className="text-[12px] text-sidebar-foreground/60 truncate">{activeUser.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded hover:bg-sidebar-accent/50 text-sidebar-foreground/60 hover:text-destructive transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
