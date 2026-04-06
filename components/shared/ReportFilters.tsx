"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown } from 'lucide-react';

interface FilterItem {
  id: string;
  label: string;
}

interface Props {
  sortBy: string;
  onSortByChange: (v: string) => void;
  items: FilterItem[];
  selectedItems: string[];
  onToggleItem: (id: string) => void;
  onSelectAll: () => void;
  selectLabel: string;
}

const ReportFilters = ({ sortBy, onSortByChange, items, selectedItems, onToggleItem, onSelectAll, selectLabel }: Props) => {
  const [open, setOpen] = useState(false);
  const allSelected = selectedItems.length === 0;
  const selectedCount = allSelected ? items.length : selectedItems.length;

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Select dropdown with checkboxes */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="min-w-[180px] justify-between text-sm font-normal">
            <span>{selectLabel}: {allSelected ? 'All' : `${selectedCount} selected`}</span>
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
            {items.map(item => (
              <label key={item.id} className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-muted rounded">
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

      {/* Sort by */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Sort by:</span>
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="spend">Spend</SelectItem>
            <SelectItem value="revenue">Revenue</SelectItem>
            <SelectItem value="leads">Leads</SelectItem>
            <SelectItem value="roas">ROAS</SelectItem>
            <SelectItem value="cpa">CPA</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ReportFilters;
