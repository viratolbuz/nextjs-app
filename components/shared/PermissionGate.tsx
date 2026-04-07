"use client";

/**
 * PermissionGate - Conditionally renders children based on user permissions
 * Usage: <PermissionGate permission="Create_users"> <Button>Add User</Button> </PermissionGate>
 */
import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGateProps {
  /** The permission key to check (e.g. 'Create_users', 'Edit_projects') */
  permission: string;
  /** Permission level required: 'View' or 'Full'. Defaults to 'Full' for action gates */
  level?: 'View' | 'Full';
  /** What to render if no permission. Defaults to null */
  fallback?: ReactNode;
  children: ReactNode;
}

const PermissionGate = ({ permission, level = 'Full', fallback = null, children }: PermissionGateProps) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission, level)) return <>{fallback}</>;
  return <>{children}</>;
};

export default PermissionGate;
