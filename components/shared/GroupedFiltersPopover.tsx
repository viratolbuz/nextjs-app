"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterGroupOption = string | { value: string; label: string };

export type FilterGroup = {
  id: string;
  label: string;
  options: FilterGroupOption[];
};

export type FilterSelections = Record<string, string[]>;

function optionValue(opt: FilterGroupOption): string {
  return typeof opt === "string" ? opt : opt.value;
}

function optionLabel(opt: FilterGroupOption): string {
  return typeof opt === "string" ? opt : opt.label;
}

interface GroupedFiltersPopoverProps {
  groups: FilterGroup[];
  selections: FilterSelections;
  onToggle: (groupId: string, value: string) => void;
  onClearAll?: () => void;
  className?: string;
  triggerClassName?: string;
}

export function GroupedFiltersPopover({
  groups,
  selections,
  onToggle,
  onClearAll,
  className,
  triggerClassName,
}: GroupedFiltersPopoverProps) {
  const [open, setOpen] = useState(false);
  const totalSelected = Object.values(selections).reduce((n, arr) => n + arr.length, 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full sm:w-auto min-w-0 sm:min-w-[160px] justify-between text-sm font-normal h-9 touch-manipulation",
            triggerClassName,
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <ListFilter className="w-3.5 h-3.5 shrink-0 opacity-60" />
            <span className="truncate">
              Filters{totalSelected > 0 ? ` (${totalSelected})` : ""}
            </span>
          </span>
          <ChevronDown className="w-3.5 h-3.5 ml-2 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-[min(100vw-2rem,288px)] sm:w-[280px] p-0 max-h-[min(70vh,420px)] flex flex-col",
          className,
        )}
        align="start"
        sideOffset={4}
      >
        <div className="px-3 py-2 border-b border-border flex items-center justify-between gap-2 shrink-0">
          <span className="text-xs font-semibold text-muted-foreground">Refine list</span>
          {totalSelected > 0 && onClearAll && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs shrink-0"
              onClick={onClearAll}
            >
              Clear all
            </Button>
          )}
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-3 scrollbar-themed">
          {groups.map((group, idx) => (
            <div key={group.id}>
              {idx > 0 && <Separator className="mb-3" />}
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide px-2 mb-2">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.options.map((opt) => {
                  const v = optionValue(opt);
                  const label = optionLabel(opt);
                  return (
                    <label
                      key={`${group.id}-${v}`}
                      className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-muted rounded-md touch-manipulation"
                    >
                      <Checkbox
                        checked={selections[group.id]?.includes(v) ?? false}
                        onCheckedChange={() => onToggle(group.id, v)}
                      />
                      <span className="truncate">{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { optionValue, optionLabel };
