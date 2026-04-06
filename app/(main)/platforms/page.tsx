"use client";

import Platforms from "@/components/pages/Platforms";
import { PermGuard } from "@/components/PermGuard";

export default function PlatformsPage() {
  return (
    <PermGuard permKey="View_platforms">
      <Platforms />
    </PermGuard>
  );
}
