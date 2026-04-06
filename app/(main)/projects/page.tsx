"use client";

import Projects from "@/components/pages/Projects";
import { PermGuard } from "@/components/PermGuard";

export default function ProjectsPage() {
  return (
    <PermGuard permKey="View_projects">
      <Projects />
    </PermGuard>
  );
}
