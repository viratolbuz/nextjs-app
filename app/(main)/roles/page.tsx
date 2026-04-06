"use client";

import Roles from "@/components/pages/Roles";
import { PermGuard } from "@/components/PermGuard";

export default function RolesPage() {
  return (
    <PermGuard permKey="View_roles">
      <Roles />
    </PermGuard>
  );
}
