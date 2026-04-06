"use client";

import ProjectReports from "@/components/pages/ProjectReports";
import { PermGuard } from "@/components/PermGuard";

export default function ProjectReportsPage() {
  return (
    <PermGuard permKey="Project_spend_report">
      <ProjectReports />
    </PermGuard>
  );
}
