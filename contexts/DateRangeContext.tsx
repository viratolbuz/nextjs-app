"use client";

import React, { createContext, useContext, useReducer, useCallback, ReactNode, useMemo } from "react";
import {
  format,
  subDays,
  subMonths,
  subQuarters,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  parse,
  differenceInCalendarDays,
} from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import type { PerformanceEntry } from "@/data/mockData";

export type DateRangeType =
  | "today"
  | "yesterday"
  | "lastweek"
  | "7days"
  | "14days"
  | "1month"
  | "6months"
  | "quarterly"
  | "12months"
  | "custom";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangeState {
  type: DateRangeType;
  range: DateRange;
}

type DateRangeAction = { type: "SET_PRESET"; payload: DateRangeType } | { type: "SET_CUSTOM"; payload: DateRange };

const PRESET_LABELS: Record<DateRangeType, string> = {
  today: "Today",
  yesterday: "Yesterday",
  lastweek: "Last Week",
  "7days": "Last 7 days",
  "14days": "Last 14 days",
  "1month": "Last month",
  "6months": "Last 6 months",
  quarterly: "Last quarter",
  "12months": "Last 12 months",
  custom: "Custom",
};

function getPresetRange(type: DateRangeType): DateRange {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const today = new Date(now);

  switch (type) {
    case "today":
      return { from: today, to: today };
    case "yesterday":
      return { from: subDays(today, 1), to: subDays(today, 1) };
    case "lastweek": {
      const end = subDays(today, 7);
      return { from: subDays(end, 6), to: end };
    }
    case "7days":
      return { from: subDays(today, 6), to: today };
    case "14days":
      return { from: subDays(today, 13), to: today };
    case "1month":
      return { from: subMonths(today, 1), to: today };
    case "6months":
      return { from: subMonths(today, 6), to: today };
    case "quarterly":
      return { from: subQuarters(today, 1), to: today };
    case "12months":
      return { from: subMonths(today, 12), to: today };
    default:
      return { from: undefined, to: undefined };
  }
}

const initialState: DateRangeState = {
  type: "7days",
  range: getPresetRange("7days"),
};

export function parsePerformanceEntryDate(dateStr: string, anchor: Date): Date | null {
  const y = anchor.getFullYear();
  for (const yr of [y, y - 1]) {
    const d = parse(`${dateStr} ${yr}`, "dd MMM yyyy", new Date());
    if (!isNaN(d.getTime())) return startOfDay(d);
  }
  return null;
}

export function formatRangeSpan(range: DateRange): string {
  if (!range.from || !range.to) return "";
  if (format(range.from, "yyyy-MM-dd") === format(range.to, "yyyy-MM-dd")) {
    return format(range.from, "MMM d, yyyy");
  }
  return `${format(range.from, "MMM d, yyyy")} – ${format(range.to, "MMM d, yyyy")}`;
}

/** Daily buckets for short ranges; single bucket for ~1 month rolling; monthly bars for long presets */
export function buildDashboardPerformanceSeries(
  type: DateRangeType,
  range: DateRange,
  monthlyTrend: Array<{
    month: string;
    spend: number;
    revenue: number;
    leads: number;
    roas: number;
    cpa: number;
  }>,
  entries: PerformanceEntry[],
): { data: Array<Record<string, string | number>>; xKey: string; mode: "daily" | "monthSummary" | "monthly" } {
  const from = range.from;
  const to = range.to;
  if (!from || !to) {
    return { data: monthlyTrend, xKey: "month", mode: "monthly" };
  }

  const anchor = to;
  const daysSpan = differenceInCalendarDays(endOfDay(to), startOfDay(from)) + 1;

  const longPreset =
    type === "6months" || type === "quarterly" || type === "12months" || (type === "custom" && daysSpan > 45);

  if (longPreset) {
    const totalMonths = 12;
    const rangeMonths = Math.max(1, Math.ceil(daysSpan / 30));
    const startIdx = Math.max(0, totalMonths - rangeMonths);
    const sliced = monthlyTrend.filter((_item, idx) => idx >= startIdx);
    return { data: sliced.length ? sliced : monthlyTrend.slice(-3), xKey: "month", mode: "monthly" };
  }

  const useDaily =
    type === "7days" ||
    type === "14days" ||
    type === "lastweek" ||
    type === "today" ||
    type === "yesterday" ||
    (type === "custom" && daysSpan <= 14);

  const filteredEntries = entries.filter((entry) => {
    const ed = parsePerformanceEntryDate(entry.date, anchor);
    if (!ed) return false;
    return !isBefore(ed, startOfDay(from)) && !isAfter(ed, endOfDay(to));
  });

  if (useDaily) {
    const days = eachDayOfInterval({ start: startOfDay(from), end: startOfDay(to) });
    const lastBar = monthlyTrend[monthlyTrend.length - 1] || {
      spend: 1,
      revenue: 4,
      leads: 100,
      roas: 3.9,
      cpa: 380,
    };
    const fallbackPerDay = {
      spend: lastBar.spend / Math.max(7, days.length),
      revenue: lastBar.revenue / Math.max(7, days.length),
      leads: Math.max(1, Math.round(lastBar.leads / Math.max(7, days.length))),
      roas: lastBar.roas,
      cpa: lastBar.cpa,
    };

    const data = days.map((d, i) => {
      const dayEntries = filteredEntries.filter((e) => {
        const ed = parsePerformanceEntryDate(e.date, anchor);
        return ed && format(ed, "yyyy-MM-dd") === format(d, "yyyy-MM-dd");
      });
      if (dayEntries.length) {
        const spendL = dayEntries.reduce((s, e) => s + e.spend, 0) / 100000;
        const revenueL = dayEntries.reduce((s, e) => s + e.revenue, 0) / 100000;
        const leads = dayEntries.reduce((s, e) => s + e.leads, 0);
        const roas = dayEntries.reduce((s, e) => s + e.roas, 0) / dayEntries.length;
        const cpa = dayEntries.reduce((s, e) => s + e.cpl, 0) / dayEntries.length;
        return {
          period: format(d, "MMM d"),
          spend: Math.round(spendL * 100) / 100,
          revenue: Math.round(revenueL * 100) / 100,
          leads,
          roas: Math.round(roas * 100) / 100,
          cpa: Math.round(cpa),
        };
      }
      const jitter = 0.85 + ((i * 13) % 30) / 100;
      return {
        period: format(d, "MMM d"),
        spend: Math.round(fallbackPerDay.spend * jitter * 100) / 100,
        revenue: Math.round(fallbackPerDay.revenue * jitter * 100) / 100,
        leads: Math.round(fallbackPerDay.leads * jitter),
        roas: fallbackPerDay.roas,
        cpa: fallbackPerDay.cpa,
      };
    });
    return { data, xKey: "period", mode: "daily" };
  }

  // Last month (rolling ~30d) and medium custom: one summary point — axis shows period, not each day
  const spendL = filteredEntries.reduce((s, e) => s + e.spend, 0) / 100000;
  const revenueL = filteredEntries.reduce((s, e) => s + e.revenue, 0) / 100000;
  const leads = filteredEntries.reduce((s, e) => s + e.leads, 0);
  const roasAvg =
    filteredEntries.length > 0 ? filteredEntries.reduce((s, e) => s + e.roas, 0) / filteredEntries.length : 3.9;
  const cpaAvg =
    filteredEntries.length > 0 ? filteredEntries.reduce((s, e) => s + e.cpl, 0) / filteredEntries.length : 380;

  const lastBar = monthlyTrend[monthlyTrend.length - 1];
  const label =
    format(from, "MMM yyyy") === format(to, "MMM yyyy")
      ? format(from, "MMMM yyyy")
      : `${format(from, "MMM yyyy")} – ${format(to, "MMM yyyy")}`;

  const row = {
    period: label,
    spend: spendL > 0 ? Math.round(spendL * 100) / 100 : Math.round((lastBar?.spend ?? 4) * (daysSpan / 30) * 100) / 100,
    revenue:
      revenueL > 0
        ? Math.round(revenueL * 100) / 100
        : Math.round((lastBar?.revenue ?? 16) * (daysSpan / 30) * 100) / 100,
    leads: leads > 0 ? leads : Math.round((lastBar?.leads ?? 2000) * (daysSpan / 30)),
    roas: roasAvg,
    cpa: Math.round(cpaAvg),
  };

  return { data: [row], xKey: "period", mode: "monthSummary" };
}

function dateRangeReducer(state: DateRangeState, action: DateRangeAction): DateRangeState {
  switch (action.type) {
    case "SET_PRESET":
      return { type: action.payload, range: getPresetRange(action.payload) };
    case "SET_CUSTOM":
      return { type: "custom", range: action.payload };
    default:
      return state;
  }
}

const computePerformanceTrendFilter = (data: { month: string }[], range: DateRange): typeof data => {
  if (!range.from || !range.to) return data;
  const daysSpan = differenceInCalendarDays(endOfDay(range.to), startOfDay(range.from)) + 1;
  const totalMonths = data.length;
  const rangeMonths = Math.max(1, Math.ceil(daysSpan / 30));
  const startIdx = Math.max(0, totalMonths - rangeMonths);
  return data.filter((_item, idx) => idx >= startIdx);
};

const computeEntryFilter = (data: PerformanceEntry[], range: DateRange): PerformanceEntry[] => {
  const from = range.from;
  const to = range.to;
  if (!from || !to) return data;

  return data.filter((entry) => {
    const entryDate = parsePerformanceEntryDate(entry.date, to);
    if (!entryDate) return false;
    return !isBefore(entryDate, startOfDay(from)) && !isAfter(entryDate, endOfDay(to));
  });
};

export const DateRangeContext = createContext<{
  state: DateRangeState;
  dispatch: React.Dispatch<DateRangeAction>;
  setPreset: (preset: DateRangeType) => void;
  setCustomRange: (range: DateRange) => void;
  DateRangePicker: React.FC<{ className?: string; compact?: boolean }>;
  filterPerformanceTrend: (data: { month: string }[]) => { month: string }[];
  filterEntries: (data: PerformanceEntry[]) => PerformanceEntry[];
  formatRangeSpan: () => string;
  presetLabel: string;
} | null>(null);

export const DateRangePicker: React.FC<{ className?: string; compact?: boolean }> = ({
  className = "",
  compact = false,
}) => {
  const ctx = useContext(DateRangeContext)!;
  const { state, dispatch } = ctx;
  const [open, setOpen] = React.useState(false);

  const triggerLabel =
    state.type === "custom" && state.range.from && state.range.to
      ? `${format(state.range.from, "MMM d")} – ${format(state.range.to, "MMM d, yyyy")}`
      : PRESET_LABELS[state.type];

  const presetOrder: DateRangeType[] = [
    "today",
    "yesterday",
    "7days",
    "14days",
    "1month",
    "6months",
    "quarterly",
    "12months",
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size={compact ? "sm" : "default"} className={className}>
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">{triggerLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="grid grid-cols-2 p-2 border-b border-border">
          {presetOrder.map((preset) => (
            <Button
              key={preset}
              variant="ghost"
              className="justify-start h-9 px-2 text-xs"
              onClick={() => {
                dispatch({ type: "SET_PRESET", payload: preset });
                setOpen(false);
              }}
            >
              {PRESET_LABELS[preset]}
            </Button>
          ))}
        </div>
        <div className="p-3">
          <Calendar
            mode="range"
            selected={{ from: state.range.from, to: state.range.to }}
            onSelect={(rge) => {
              dispatch({ type: "SET_CUSTOM", payload: rge as DateRange });
              setOpen(false);
            }}
            className="rounded-md border"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface ProviderProps {
  children: ReactNode;
}

export const DateRangeProvider: React.FC<ProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dateRangeReducer, initialState);

  const setPreset = useCallback((preset: DateRangeType) => {
    dispatch({ type: "SET_PRESET", payload: preset });
  }, []);

  const setCustomRange = useCallback((range: DateRange) => {
    dispatch({ type: "SET_CUSTOM", payload: range });
  }, []);

  const filterPerformanceTrend = useCallback(
    (data: { month: string }[]) => {
      return computePerformanceTrendFilter(data, state.range);
    },
    [state.range],
  );

  const filterEntries = useCallback(
    (data: PerformanceEntry[]) => {
      return computeEntryFilter(data, state.range);
    },
    [state.range],
  );

  const formatRangeSpanFn = useCallback(() => formatRangeSpan(state.range), [state.range]);

  const presetLabel = PRESET_LABELS[state.type];

  const value = useMemo(
    () => ({
      state,
      dispatch,
      setPreset,
      setCustomRange,
      DateRangePicker,
      filterPerformanceTrend,
      filterEntries,
      formatRangeSpan: formatRangeSpanFn,
      presetLabel,
    }),
    [state, setPreset, setCustomRange, filterPerformanceTrend, filterEntries, formatRangeSpanFn, presetLabel],
  );

  return <DateRangeContext.Provider value={value}>{children}</DateRangeContext.Provider>;
};

export const useDateRange = () => {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error("useDateRange must be used within DateRangeProvider");
  }
  return context;
};
