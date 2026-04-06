"use client";

import Users from "@/components/pages/Users";
import { PermGuard } from "@/components/PermGuard";

export default function UsersPage() {
  return (
    <PermGuard permKey="View_users">
      <Users />
    </PermGuard>
  );
}
