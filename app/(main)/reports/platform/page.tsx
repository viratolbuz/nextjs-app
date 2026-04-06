"use client";

import PlatformReports from "@/components/pages/PlatformReports";
import { PermGuard } from "@/components/PermGuard";

export default function PlatformReportsPage() {
  return (
    <PermGuard permKey="Platform_spend_report">
      <PlatformReports />
    </PermGuard>
  );
}
