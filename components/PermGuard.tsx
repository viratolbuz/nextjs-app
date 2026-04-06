"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";

export function PermGuard({ permKey, children }: { permKey?: string; children: ReactNode }) {
  const { canView, isSuperAdmin } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!permKey || isSuperAdmin) return;
    if (!canView(permKey)) router.replace("/dashboard");
  }, [permKey, isSuperAdmin, canView, router]);

  if (permKey && !isSuperAdmin && !canView(permKey)) return null;
  return <>{children}</>;
}
