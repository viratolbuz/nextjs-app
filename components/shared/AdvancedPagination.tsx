"use client";

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface Props {
  page: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

const AdvancedPagination = ({ page, totalPages, totalItems, perPage, onPageChange, onPerPageChange }: Props) => {
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Showing {start}-{end} of {totalItems}</span>
        <span className="mx-2">|</span>
        <span>Rows per page:</span>
        <Select value={String(perPage)} onValueChange={v => { onPerPageChange(Number(v)); onPageChange(1); }}>
          <SelectTrigger className="w-[70px] h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[5, 10, 15, 20, 30, 50].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => onPageChange(1)}>
          <ChevronsLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {getPageNumbers().map((p, i) =>
          typeof p === 'string' ? (
            <span key={i} className="px-2 text-muted-foreground text-sm">…</span>
          ) : (
            <Button key={i} variant={page === p ? 'default' : 'outline'} size="sm" className="w-8 h-8" onClick={() => onPageChange(p)}>{p}</Button>
          )
        )}
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => onPageChange(totalPages)}>
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default AdvancedPagination;
