"use client";

import TeamReports from "@/components/pages/TeamReports";
import { PermGuard } from "@/components/PermGuard";

export default function TeamReportsPage() {
  return (
    <PermGuard permKey="Team_spend_report">
      <TeamReports />
    </PermGuard>
  );
}
