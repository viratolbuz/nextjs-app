"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addQuarters,
  addWeeks,
  addYears,
  endOfDay,
  endOfISOWeek,
  format,
  getISOWeek,
  getISOWeekYear,
  isAfter,
  isBefore,
  min as dateMin,
  parse,
  startOfDay,
  startOfISOWeek,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subDays,
} from "date-fns";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { PerformanceEntry } from "@/types";

type DatePreset =
  | "today"
  | "yesterday"
  | "last7"
  | "last14"
  | "lastMonth"
  | "last6Months"
  | "lastQuarter"
  | "last12Months"
  | "custom";

export type ScopeKey =
  | "dashboard"
  | "projects"
  | "reports-team"
  | "reports-platform"
  | "reports-project"
  | "project-detail";

export type AdjustGranularity = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

interface DateRangeValue {
  from: Date;
  to: Date;
}

interface ScopeState {
  preset: DatePreset;
  range: DateRangeValue;
  adjust: AdjustGranularity;
}

interface DateRangeContextValue {
  scoped: Record<string, ScopeState>;
  setPreset: (scope: string, preset: DatePreset) => void;
  setCustomRange: (scope: string, range: DateRangeValue) => void;
  setAdjust: (scope: string, adjust: AdjustGranularity) => void;
}

const DateRangeContext = createContext<DateRangeContextValue | null>(null);

const PRESET_LIST: { id: DatePreset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7", label: "Last 7 days" },
  { id: "last14", label: "Last 14 days" },
  { id: "lastMonth", label: "Last month" },
  { id: "last6Months", label: "Last 6 months" },
  { id: "lastQuarter", label: "Last quarter" },
  { id: "last12Months", label: "Last 12 months" },
  { id: "custom", label: "Custom" },
];

const getTodayRange = (): DateRangeValue => {
  const now = new Date();
  return { from: now, to: now };
};

const getRangeFromPreset = (preset: DatePreset): DateRangeValue => {
  const now = new Date();
  switch (preset) {
    case "today":
      return { from: now, to: now };
    case "yesterday":
      return { from: subDays(now, 1), to: subDays(now, 1) };
    case "last7":
      return { from: subDays(now, 6), to: now };
    case "last14":
      return { from: subDays(now, 13), to: now };
    case "lastMonth":
      return { from: subDays(now, 30), to: now };
    case "last6Months":
      return { from: subDays(now, 182), to: now };
    case "lastQuarter":
      return { from: subDays(now, 90), to: now };
    case "last12Months":
      return { from: subDays(now, 365), to: now };
    case "custom":
      return getTodayRange();
    default:
      return getTodayRange();
  }
};

const getPresetLabel = (preset: DatePreset): string =>
  PRESET_LIST.find((p) => p.id === preset)?.label ?? "Custom";

export const ADJUST_OPTIONS: { id: AdjustGranularity; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
  { id: "yearly", label: "Yearly" },
];

/** End date strictly after start + N calendar years (same boundary rule as before). */
export function rangeExceedsYears(from: Date, to: Date, years: number): boolean {
  return isAfter(startOfDay(to), addYears(startOfDay(from), years));
}

/**
 * Adjust eligibility by range length:
 * - Above 3 years: Daily disabled
 * - Above 4 years: Weekly disabled
 * - Above 6 years: Monthly & Quarterly disabled (Yearly only)
 */
export function isAdjustAllowedForRange(adjust: AdjustGranularity, from: Date, to: Date): boolean {
  const ex3 = rangeExceedsYears(from, to, 3);
  const ex4 = rangeExceedsYears(from, to, 4);
  const ex6 = rangeExceedsYears(from, to, 6);
  if (ex6) return adjust === "yearly";
  if (ex4) return adjust === "monthly" || adjust === "quarterly" || adjust === "yearly";
  if (ex3) return adjust !== "daily";
  return true;
}

export function clampAdjustForRange(range: DateRangeValue, adjust: AdjustGranularity): AdjustGranularity {
  const { from, to } = range;
  if (isAdjustAllowedForRange(adjust, from, to)) return adjust;
  const ex6 = rangeExceedsYears(from, to, 6);
  const ex4 = rangeExceedsYears(from, to, 4);
  const ex3 = rangeExceedsYears(from, to, 3);
  if (ex6) return "yearly";
  if (ex4) return "monthly";
  if (ex3) return "weekly";
  return "monthly";
}

const defaultScopeState = (): ScopeState => ({
  preset: "lastMonth",
  range: getRangeFromPreset("lastMonth"),
  adjust: "monthly",
});

const INITIAL_SCOPES: ScopeKey[] = [
  "dashboard",
  "projects",
  "reports-team",
  "reports-platform",
  "reports-project",
  "project-detail",
];

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  const [scoped, setScoped] = useState<Record<string, ScopeState>>(() =>
    Object.fromEntries(INITIAL_SCOPES.map((k) => [k, defaultScopeState()])),
  );

  const setPreset = (scope: string, preset: DatePreset) => {
    setScoped((prev) => {
      const range =
        preset === "custom" ? (prev[scope]?.range ?? getTodayRange()) : getRangeFromPreset(preset);
      const prevAdjust = prev[scope]?.adjust ?? "monthly";
      const adjust = clampAdjustForRange(range, prevAdjust);
      return {
        ...prev,
        [scope]: { preset, range, adjust },
      };
    });
  };

  const setCustomRange = (scope: string, range: DateRangeValue) => {
    setScoped((prev) => {
      const prevAdjust = prev[scope]?.adjust ?? "monthly";
      const adjust = clampAdjustForRange(range, prevAdjust);
      return {
        ...prev,
        [scope]: {
          preset: "custom",
          range,
          adjust,
        },
      };
    });
  };

  const setAdjust = (scope: string, adjust: AdjustGranularity) => {
    setScoped((prev) => {
      const cur = prev[scope] ?? defaultScopeState();
      if (!isAdjustAllowedForRange(adjust, cur.range.from, cur.range.to)) return prev;
      return {
        ...prev,
        [scope]: { ...cur, adjust },
      };
    });
  };

  return (
    <DateRangeContext.Provider value={{ scoped, setPreset, setCustomRange, setAdjust }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange(scope: ScopeKey = "dashboard") {
  const ctx = useContext(DateRangeContext);
  if (!ctx) throw new Error("useDateRange must be used inside DateRangeProvider");

  const state = ctx.scoped[scope] ?? defaultScopeState();
  const from = startOfDay(state.range.from);
  const to = endOfDay(state.range.to);

  const inRange = (date: Date) => !isBefore(date, from) && !isAfter(date, to);

  const filterEntries = (entries: PerformanceEntry[]) =>
    entries.filter((entry) => {
      try {
        const parsed = parse(`${entry.date} 2026`, "dd MMM yyyy", new Date());
        return inRange(parsed);
      } catch {
        return true;
      }
    });

  const formatRangeSpan = () =>
    `${format(state.range.from, "dd MMM yyyy")} - ${format(state.range.to, "dd MMM yyyy")}`;

  const adjustLabel = ADJUST_OPTIONS.find((o) => o.id === state.adjust)?.label ?? "Monthly";
  const longRangeRestrictsAdjust = rangeExceedsYears(state.range.from, state.range.to, 3);

  return {
    state,
    presetLabel: getPresetLabel(state.preset),
    adjustLabel,
    longRangeRestrictsAdjust,
    formatRangeSpan,
    inRange,
    filterEntries,
    setPreset: (preset: DatePreset) => ctx.setPreset(scope, preset),
    setCustomRange: (range: DateRangeValue) => ctx.setCustomRange(scope, range),
    setAdjust: (adjust: AdjustGranularity) => ctx.setAdjust(scope, adjust),
  };
}

export function DateRangePicker({
  className,
  compact,
  scope = "dashboard",
}: {
  className?: string;
  compact?: boolean;
  scope?: ScopeKey;
}) {
  const { state, presetLabel, setPreset, setCustomRange } = useDateRange(scope);
  const [open, setOpen] = useState(false);
  const [activeInput, setActiveInput] = useState<"from" | "to">("from");
  const [hoverDate, setHoverDate] = useState<Date | undefined>(undefined);
  const [year, setYear] = useState(String(new Date().getFullYear()));

  useEffect(() => {
    setYear(String(state.range.from.getFullYear()));
  }, [state.range.from, open]);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const list: string[] = [];
    for (let y = current; y >= current - 4; y -= 1) list.push(String(y));
    return list;
  }, []);

  const parsedFrom = format(state.range.from, "yyyy-MM-dd");
  const parsedTo = format(state.range.to, "yyyy-MM-dd");

  const previewRange = useMemo(() => {
    if (!hoverDate) return { from: state.range.from, to: state.range.to };
    if (activeInput === "from") {
      if (isAfter(hoverDate, state.range.to)) return { from: hoverDate, to: hoverDate };
      return { from: hoverDate, to: state.range.to };
    }
    if (isBefore(hoverDate, state.range.from)) return { from: hoverDate, to: state.range.from };
    return { from: state.range.from, to: hoverDate };
  }, [activeInput, hoverDate, state.range.from, state.range.to]);

  const monthStarts = useMemo(() => {
    const selectedYear = Number(year);
    const now = new Date();
    const maxMonth = selectedYear === now.getFullYear() ? now.getMonth() : 11;
    const items: Date[] = [];
    for (let m = 0; m <= maxMonth; m += 1) items.push(new Date(selectedYear, m, 1));
    return items;
  }, [year]);

  const updateDateByInput = (key: "from" | "to", value: string) => {
    const parsed = parse(value, "yyyy-MM-dd", new Date());
    if (Number.isNaN(parsed.getTime())) return;
    const next = { ...state.range, [key]: parsed };
    if (isAfter(next.from, next.to)) {
      if (key === "from") next.to = parsed;
      else next.from = parsed;
    }
    setCustomRange(next);
  };

  const onSelectDate = (day?: Date) => {
    if (!day) return;
    const next = { ...state.range };
    if (activeInput === "from") {
      next.from = day;
      if (isAfter(next.from, next.to)) next.to = day;
      setActiveInput("to");
    } else {
      next.to = day;
      if (isBefore(next.to, next.from)) next.from = day;
    }
    setCustomRange(next);
    setHoverDate(undefined);
  };

  const onYearChange = (nextYear: string) => {
    setYear(nextYear);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("justify-start", className)}>
          {/* <CalendarIcon className="mr-2 h-4 w-4" /> */}
          {compact ? presetLabel : `${presetLabel}: ${format(state.range.from, "dd MMM")} - ${format(state.range.to, "dd MMM")}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[550px] p-0">
        <div className="grid grid-cols-[220px_1fr]">
          <div className="border-r p-2">
            {PRESET_LIST.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted",
                  state.preset === preset.id && "bg-muted",
                )}
                onClick={() => {
                  setPreset(preset.id);
                  if (preset.id !== "custom") setOpen(false);
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="p-3">
            <div className="flex flex-col gap-3 w-full">
              <div className="space-y-2 flex gap-2">
                <div className="w-auto mt-0">
                  <label className="text-xs text-muted-foreground">Start date</label>
                  <Input
                    value={parsedFrom}
                    onFocus={() => setActiveInput("from")}
                    onChange={(e) => updateDateByInput("from", e.target.value)}
                  />
                </div>
                <div className="w-auto !mt-0">
                  <label className="text-xs text-muted-foreground">End date</label>
                  <Input
                    value={parsedTo}
                    onFocus={() => setActiveInput("to")}
                    onChange={(e) => updateDateByInput("to", e.target.value)}
                  />
                </div>
                {/* <p className="text-xs text-muted-foreground">
                  {format(state.range.from, "dd MMM yyyy")} - {format(state.range.to, "dd MMM yyyy")}
                </p> */}
              </div>

              <div className="border rounded-md p-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">Date range</p>
                  <Select value={year} onValueChange={onYearChange}>
                    <SelectTrigger className="h-8 w-[110px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={y}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ScrollArea className="h-[420px] pr-2">
                  <div className="space-y-3">
                    {monthStarts.map((monthStart) => (
                      <div key={monthStart.toISOString()} className="border rounded-md">
                        <Calendar
                          mode="range"
                          numberOfMonths={1}
                          month={monthStart}
                          selected={previewRange}
                          onDayMouseEnter={(day) => setHoverDate(day)}
                          onDayMouseLeave={() => setHoverDate(undefined)}
                          onDayClick={(day) => onSelectDate(day)}
                          classNames={{ nav: "hidden", caption: "px-2 pt-2" }}
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function AdjustGranularityDropdown({
  scope = "dashboard",
  className,
}: {
  scope?: ScopeKey;
  className?: string;
}) {
  const { state, setAdjust } = useDateRange(scope);
  const from = state.range.from;
  const to = state.range.to;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("gap-1", className)}>
          Adjust: {ADJUST_OPTIONS.find((o) => o.id === state.adjust)?.label}
          <ChevronDown className="h-4 w-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[9rem]">
        {ADJUST_OPTIONS.map((opt) => {
          const allowed = isAdjustAllowedForRange(opt.id, from, to);
          return (
            <DropdownMenuItem
              key={opt.id}
              disabled={!allowed}
              className={cn(state.adjust === opt.id && "bg-muted", !allowed && "text-muted-foreground")}
              onClick={() => setAdjust(opt.id)}
            >
              {opt.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DateRangeWithAdjust({
  scope = "dashboard",
  pickerClassName,
  className,
}: {
  scope?: ScopeKey;
  pickerClassName?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <DateRangePicker scope={scope} className={pickerClassName} />
      <AdjustGranularityDropdown scope={scope} />
    </div>
  );
}

export type BuildDashboardSeriesOptions = {
  /** When true, never substitute global monthly trend if entry buckets are empty (e.g. project-scoped charts). */
  skipGlobalTrendFallback?: boolean;
};

export function buildDashboardPerformanceSeries(
  adjust: AdjustGranularity,
  range: DateRangeValue,
  trend: Array<{
    month: string;
    spend: number;
    revenue: number;
    leads: number;
    roas: number;
    cpa?: number;
  }>,
  entries: PerformanceEntry[],
  options?: BuildDashboardSeriesOptions,
) {
  const granularity = clampAdjustForRange(range, adjust);
  const buckets = createTimeBuckets(granularity, range);
  const seeded = buckets.map((bucket) => ({
    key: bucket.key,
    spend: 0,
    revenue: 0,
    leads: 0,
  }));
  const bucketIndex = new Map(seeded.map((row, idx) => [row.key, idx]));

  entries.forEach((entry) => {
    const parsed = parsePerformanceEntryDate(entry.date);
    if (!parsed) return;
    if (isBefore(parsed, startOfDay(range.from)) || isAfter(parsed, endOfDay(range.to))) {
      return;
    }

    const key = getBucketKey(parsed, granularity);
    const idx = bucketIndex.get(key);
    if (idx === undefined) return;

    const spendLakhs = entry.spend / 100000;
    const revenueLakhs = entry.revenue / 100000;
    seeded[idx].spend += spendLakhs;
    seeded[idx].revenue += revenueLakhs;
    seeded[idx].leads += entry.leads;
  });

  const data = seeded.map((row, idx) => {
    const spend = Number(row.spend.toFixed(2));
    const revenue = Number(row.revenue.toFixed(2));
    const leads = Math.round(row.leads);
    const roas = spend > 0 ? Number((revenue / spend).toFixed(2)) : 0;
    const cpa = leads > 0 ? Math.round((spend * 100000) / leads) : 0;
    return {
      period: buckets[idx].label,
      spend,
      revenue,
      leads,
      roas,
      cpa,
    };
  });

  if (data.some((d) => d.spend || d.revenue || d.leads)) {
    return { data, xKey: "period" as const, granularity };
  }

  if (options?.skipGlobalTrendFallback) {
    return { data, xKey: "period" as const, granularity };
  }

  const fallback = trend.filter((item) => {
    const parsed = parse(item.month, "MMM yyyy", new Date());
    return !isBefore(parsed, startOfDay(range.from)) && !isAfter(parsed, endOfDay(range.to));
  });

  return {
    data: fallback.length > 0 ? fallback : trend,
    xKey: "month" as const,
    granularity: "monthly" as AdjustGranularity,
  };
}

export type DateSeriesGranularity = AdjustGranularity;

export const parsePerformanceEntryDate = (dateValue: string): Date | null => {
  try {
    const withCurrentYear = parse(
      `${dateValue} ${new Date().getFullYear()}`,
      "dd MMM yyyy",
      new Date(),
    );
    if (!Number.isNaN(withCurrentYear.getTime())) return withCurrentYear;
    const with2026 = parse(`${dateValue} 2026`, "dd MMM yyyy", new Date());
    return Number.isNaN(with2026.getTime()) ? null : with2026;
  } catch {
    return null;
  }
};

export const getBucketKey = (date: Date, granularity: DateSeriesGranularity): string => {
  if (granularity === "daily") return format(date, "yyyy-MM-dd");
  if (granularity === "weekly") {
    const ws = startOfISOWeek(date);
    return `${getISOWeekYear(ws)}-W${String(getISOWeek(ws)).padStart(2, "0")}`;
  }
  if (granularity === "monthly") return format(date, "yyyy-MM");
  if (granularity === "quarterly") {
    const q = Math.floor(date.getMonth() / 3) + 1;
    return `${date.getFullYear()}-Q${q}`;
  }
  return String(date.getFullYear());
};

export const createTimeBuckets = (
  granularity: DateSeriesGranularity,
  range: DateRangeValue,
): Array<{ key: string; label: string; start: Date }> => {
  const from = startOfDay(range.from);
  const to = endOfDay(range.to);
  const buckets: Array<{ key: string; label: string; start: Date }> = [];

  if (granularity === "daily") {
    let cursor = from;
    while (!isAfter(cursor, to)) {
      buckets.push({
        start: cursor,
        key: getBucketKey(cursor, "daily"),
        label: format(cursor, "dd MMM"),
      });
      cursor = addDays(cursor, 1);
    }
    return buckets;
  }

  if (granularity === "weekly") {
    let cursor = startOfISOWeek(from);
    while (!isAfter(cursor, to)) {
      const wk = getISOWeek(cursor);
      const y = getISOWeekYear(cursor);
      const weekEnd = endOfISOWeek(cursor);
      const labelEnd = dateMin([weekEnd, to]);
      buckets.push({
        start: cursor,
        key: `${y}-W${String(wk).padStart(2, "0")}`,
        label: `${format(cursor, "dd MMM")} – ${format(labelEnd, "dd MMM yyyy")}`,
      });
      cursor = addWeeks(cursor, 1);
    }
    return buckets;
  }

  if (granularity === "monthly") {
    let cursor = startOfMonth(from);
    while (!isAfter(cursor, to)) {
      buckets.push({
        start: cursor,
        key: getBucketKey(cursor, "monthly"),
        label: format(cursor, "MMM yyyy"),
      });
      cursor = addMonths(cursor, 1);
    }
    return buckets;
  }

  if (granularity === "quarterly") {
    let cursor = startOfQuarter(from);
    while (!isAfter(cursor, to)) {
      const q = Math.floor(cursor.getMonth() / 3) + 1;
      buckets.push({
        start: cursor,
        key: `${cursor.getFullYear()}-Q${q}`,
        label: `Q${q} ${cursor.getFullYear()}`,
      });
      cursor = addQuarters(cursor, 1);
    }
    return buckets;
  }

  let cursor = startOfYear(from);
  while (!isAfter(cursor, to)) {
    const y = cursor.getFullYear();
    buckets.push({
      start: cursor,
      key: String(y),
      label: String(y),
    });
    cursor = addYears(cursor, 1);
  }
  return buckets;
};