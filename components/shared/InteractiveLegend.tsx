"use client";

import { useState, useCallback } from 'react';

interface InteractiveLegendProps {
  payload?: Array<{
    value: string;
    color: string;
    dataKey?: string;
    type?: string;
  }>;
  hiddenSeries: Set<string>;
  onToggle: (dataKey: string) => void;
}

/**
 * Reusable interactive legend for Recharts.
 * Horizontal scrollable, click to toggle series visibility.
 * Uses many distinct colors — no repetition within reason.
 */
const InteractiveLegend = ({ payload, hiddenSeries, onToggle }: InteractiveLegendProps) => {
  if (!payload) return null;

  return (
    <div className="mt-4 overflow-x-auto overflow-y-hidden scrollbar-themed pb-1">
      <div className="flex items-center gap-1.5 w-max px-1">
        {payload.map((entry, index) => {
          const key = entry.value || entry.dataKey || '';
          const isHidden = hiddenSeries.has(key);

          return (
            <button
              key={index}
              onClick={() => onToggle(key)}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-200 hover:scale-[1.02] select-none whitespace-nowrap shrink-0"
              style={{
                opacity: isHidden ? 0.35 : 1,
                background: isHidden ? 'hsl(var(--muted))' : `${entry.color}15`,
                border: `1.5px solid ${isHidden ? 'hsl(var(--border))' : entry.color}`,
                textDecoration: isHidden ? 'line-through' : 'none',
                color: isHidden ? 'hsl(var(--muted-foreground))' : entry.color,
              }}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{
                  background: isHidden ? 'hsl(var(--muted-foreground))' : entry.color,
                }}
              />
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default InteractiveLegend;

/**
 * Hook to manage hidden series state
 */
export const useHiddenSeries = () => {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const toggleSeries = useCallback((dataKey: string) => {
    setHiddenSeries(prev => {
      const next = new Set(prev);
      if (next.has(dataKey)) next.delete(dataKey);
      else next.add(dataKey);
      return next;
    });
  }, []);

  return { hiddenSeries, toggleSeries };
};
