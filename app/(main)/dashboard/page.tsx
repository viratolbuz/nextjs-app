"use client";

import Dashboard from "@/components/pages/Dashboard";
import { PermGuard } from "@/components/PermGuard";

export default function DashboardPage() {
  return (
    <PermGuard permKey="View_dashboard">
      <Dashboard />
    </PermGuard>
  );
}
