"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";

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

const ReportFilters = ({ items, selectedItems, onToggleItem, onSelectAll, selectLabel }: Props) => {
  const [open, setOpen] = useState(false);
  const allSelected = selectedItems.length === 0;
  const selectedCount = allSelected ? items.length : selectedItems.length;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="min-w-[180px] justify-between text-sm font-normal">
            <span>
              {selectLabel}: {allSelected ? "All" : `${selectedCount} selected`}
            </span>
            <ChevronDown className="w-3.5 h-3.5 ml-2 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0" align="start">
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
