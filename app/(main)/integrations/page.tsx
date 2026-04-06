"use client";

import Integrations from "@/components/pages/Integrations";
import { PermGuard } from "@/components/PermGuard";

export default function IntegrationsPage() {
  return (
    <PermGuard permKey="View_platforms">
      <Integrations />
    </PermGuard>
  );
}
