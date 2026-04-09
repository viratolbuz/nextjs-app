/**
 * Hook to check permissions for the active user (proxy or current)
 * Provides granular CRUD permission checks per module
 */
import { useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { roles } from '@/data/mockData';

export const PERMISSION_KEYS = {
  VIEW_DASHBOARD: 'View_dashboard',
  MANAGE_DASHBOARD: 'Manage_dashboard',
  VIEW_USERS: 'View_users',
  CREATE_USERS: 'Create_users',
  EDIT_USERS: 'Edit_users',
  DELETE_USERS: 'Delete_users',
  VIEW_ROLES: 'View_roles',
  CREATE_ROLES: 'Create_roles',
  EDIT_ROLES: 'Edit_roles',
  DELETE_ROLES: 'Delete_roles',
  VIEW_PROJECTS: 'View_projects',
  CREATE_PROJECTS: 'Create_projects',
  EDIT_PROJECTS: 'Edit_projects',
  DELETE_PROJECTS: 'Delete_projects',
  VIEW_PLATFORMS: 'View_platforms',
  EDIT_PLATFORMS: 'Edit_platforms',
  DELETE_PLATFORMS: 'Delete_platforms',
  VIEW_PERFORMANCE: 'View_performance_entries',
  CREATE_PERFORMANCE: 'Create_performance_entries',
  EDIT_PERFORMANCE: 'Edit_performance_entries',
  DELETE_PERFORMANCE: 'Delete_performance_entries',
  EXPORT_PERFORMANCE: 'Export_performance_entries',
  IMPORT_PERFORMANCE: 'Import_performance_entries',
  TEAM_SPEND: 'Team_spend',
  SPEND_CHART: 'Spend_chart',
  SPEND_CHART_REPORT: 'Spend_chart_report',
  PLATFORM_SPEND_REPORT: 'Platform_spend_report',
  MONTHLY_SPEND: 'Monthly_spend',
  QUARTERLY_SPEND: 'Quarterly_spend',
  QUARTERLY_SPEND_REPORT: 'Quarterly_spend_report',
  PROJECT_SPEND_REPORT: 'Project_spend_report',
  TEAM_SPEND_REPORT: 'Team_spend_report',
  VIEW_REPORTS: 'View_reports',
  VIEW_EMAIL_HISTORIES: 'View_email_histories',
} as const;

export const usePermissions = () => {
  const { currentUser, proxyUser } = useAuth();
  const activeUser = proxyUser || currentUser;

  const activeRole = useMemo(() => {
    if (!activeUser) return null;
    return roles.find(r => r.name === activeUser.role) || null;
  }, [activeUser]);

  const hasPermission = useCallback((permKey: string, level: 'View' | 'Full' = 'View'): boolean => {
    if (!activeRole) return false;
    const perm = activeRole.permissions[permKey];
    if (!perm || perm === 'None') return false;
    if (level === 'View') return perm === 'View' || perm === 'Full';
    return perm === 'Full';
  }, [activeRole]);

  const canView = useCallback((permKey: string) => hasPermission(permKey, 'View'), [hasPermission]);
  const canEdit = useCallback((permKey: string) => hasPermission(permKey, 'Full'), [hasPermission]);

  const isSuperAdmin =
    activeRole?.name === 'Super Admin' || activeRole?.name === 'Super-admin';

  const can = useCallback((action: 'view' | 'create' | 'edit' | 'delete' | 'export' | 'import', module: string): boolean => {
    if (isSuperAdmin) return true;
    const key = `${action.charAt(0).toUpperCase() + action.slice(1)}_${module}`;
    return hasPermission(key, action === 'view' ? 'View' : 'Full');
  }, [hasPermission, isSuperAdmin]);

  return { activeUser, activeRole, hasPermission, canView, canEdit, isSuperAdmin, can, PERMISSION_KEYS };
};
