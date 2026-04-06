"use client";

import PerformanceEntry from "@/components/pages/PerformanceEntry";
import { PermGuard } from "@/components/PermGuard";

export default function PerformancePage() {
  return (
    <PermGuard permKey="View_performance_entries">
      <PerformanceEntry />
    </PermGuard>
  );
}
