"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, X } from "lucide-react";
import { Input } from "../ui/input";

interface FilterItem {
  id: string;
  label: string;
}

interface Props {
  items: FilterItem[];
  selectedItems: string[];
  onToggleItem: (id: string) => void;
  onSelectAll: () => void;
  selectLabel: string;
}

const ReportFilters = ({
  items,
  selectedItems,
  onToggleItem,
  onSelectAll,
  selectLabel,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const allSelected = selectedItems.length === 0;
  const selectedCount = allSelected ? items.length : selectedItems.length;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full sm:w-auto sm:min-w-[180px] justify-between text-sm font-normal min-h-9 touch-manipulation"
          >
            <span>
              {selectLabel}: {allSelected ? "All" : `${selectedCount} selected`}
            </span>
            <ChevronDown className="w-3.5 h-3.5 ml-2 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(100vw-2rem,240px)] p-0" align="start">
          <div className="px-3 py-2 border-b border-border relative">
            <Input
              placeholder="Search filters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs"
            />
            {search && search.length > 0 && (
              <X
                className="absolute right-3 top-3 text-primary"
                onClick={() => setSearch("")}
              />
            )}
          </div>
          <div className="p-2 border-b border-border">
            <label className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-muted rounded">
              <Checkbox checked={allSelected} onCheckedChange={onSelectAll} />
              <span className="font-medium">All {selectLabel}</span>
            </label>
          </div>
          <div className="max-h-[240px] overflow-y-auto p-2 space-y-0.5">
            {items.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-muted rounded"
              >
                <Checkbox
                  checked={allSelected || selectedItems.includes(item.id)}
                  onCheckedChange={() => onToggleItem(item.id)}
                />
                <span className="truncate">{item.label}</span>
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ReportFilters;
