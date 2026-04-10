"use client";

import { cn } from "@/lib/utils";

export function ReportMatrixScrollTable({
  children,
  className,
  wrapperClassName,
}: {
  children: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
}) {
  return (
    <div className={cn("mt-6 w-full max-w-full min-w-0", className)}>
      <div
        className={cn(
          "rounded-lg border border-border bg-card overflow-hidden",
          wrapperClassName,
        )}
      >
        <div className="overflow-x-auto max-w-full scrollbar-themed">
          {children}
        </div>
      </div>
    </div>
  );
}
