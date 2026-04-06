"use client";

import ProjectDetail from "@/components/pages/ProjectDetail";
import { PermGuard } from "@/components/PermGuard";

export default function ProjectDetailPage() {
  return (
    <PermGuard permKey="View_projects">
      <ProjectDetail />
    </PermGuard>
  );
}
