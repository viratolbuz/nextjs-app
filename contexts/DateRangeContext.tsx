"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  addDays,
  addHours,
  addMonths,
  addWeeks,
  differenceInDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { PerformanceEntry } from "@/types";

export type DatePreset =
  | "today"
  | "yesterday"
  | "thisWeek"
  | "last7"
  | "lastWeek"
  | "last14"
  | "thisMonth"
  | "last30"
  | "lastMonth"
  | "allTime"
  | "custom";

export type Granularity = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

type ScopeKey =
  | "dashboard"
  | "projects"
  | "reports-team"
  | "reports-platform"
  | "reports-project";

interface DateRangeValue {
  from: Date;
  to: Date;
}

interface ScopeState {
  preset: DatePreset;
  range: DateRangeValue;
  granularity: Granularity;
}

interface DateRangeContextValue {
  scoped: Record<string, ScopeState>;
  setPreset: (scope: string, preset: DatePreset) => void;
  setCustomRange: (scope: string, range: DateRangeValue) => void;
  setGranularity: (scope: string, granularity: Granularity) => void;
}

const DateRangeContext = createContext<DateRangeContextValue | null>(null);

const PRESET_LIST: { id: DatePreset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "thisWeek", label: "This week (Mon – Today)" },
  { id: "last7", label: "Last 7 days" },
  { id: "lastWeek", label: "Last week (Sun – Sat)" },
  { id: "last14", label: "Last 14 days" },
  { id: "thisMonth", label: "This month" },
  { id: "last30", label: "Last 30 days" },
  { id: "lastMonth", label: "Last month" },
  { id: "allTime", label: "All time" },
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
    case "thisWeek":
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: now };
    case "last7":
      return { from: subDays(now, 6), to: now };
    case "lastWeek": {
      const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 0 });
      const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 0 });
      return { from: lastWeekStart, to: lastWeekEnd };
    }
    case "last14":
      return { from: subDays(now, 13), to: now };
    case "thisMonth":
      return { from: startOfMonth(now), to: now };
    case "last30":
      return { from: subDays(now, 29), to: now };
    case "lastMonth": {
      const lastMonth = subMonths(now, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    }
    case "allTime":
      return { from: new Date("2024-01-01"), to: now };
    case "custom":
      return getTodayRange();
    default:
      return getTodayRange();
  }
};

const getPresetLabel = (preset: DatePreset): string =>
  PRESET_LIST.find((p) => p.id === preset)?.label ?? "Custom";

export function getGranularityOptionsForPreset(preset: DatePreset): Record<Granularity, boolean> {
  switch (preset) {
    case "today":
    case "yesterday":
      return { daily: false, weekly: false, monthly: false, quarterly: false, yearly: false };
    case "thisWeek":
    case "last7":
    case "lastWeek":
      return { daily: true, weekly: false, monthly: false, quarterly: false, yearly: false };
    case "last14":
    case "thisMonth":
    case "last30":
      return { daily: true, weekly: true, monthly: false, quarterly: false, yearly: false };
    default:
      return getGranularityOptionsForDateRange(null);
  }
}

export function getGranularityOptionsForDateRange(
  range: DateRangeValue | null,
): Record<Granularity, boolean> {
  if (!range) {
    return { daily: true, weekly: true, monthly: true, quarterly: true, yearly: true };
  }
  const days = differenceInDays(range.to, range.from) + 1;
  if (days >= 1 && days <= 7) {
    return { daily: true, weekly: false, monthly: false, quarterly: false, yearly: false };
  }
  if (days >= 8 && days <= 30) {
    return { daily: true, weekly: true, monthly: false, quarterly: false, yearly: false };
  }
  if (days >= 31 && days <= 90) {
    return { daily: false, weekly: true, monthly: true, quarterly: false, yearly: false };
  }
  if (days >= 91 && days <= 365) {
    return { daily: false, weekly: false, monthly: true, quarterly: true, yearly: false };
  }
  return { daily: false, weekly: false, monthly: false, quarterly: true, yearly: true };
}

export function getAllowedGranularities(
  preset: DatePreset,
  range: DateRangeValue,
): Record<Granularity, boolean> {
  if (preset !== "custom" && preset !== "lastMonth" && preset !== "allTime") {
    return getGranularityOptionsForPreset(preset);
  }
  return getGranularityOptionsForDateRange(range);
}

export function getDefaultGranularity(allowed: Record<Granularity, boolean>): Granularity {
  const order: Granularity[] = ["daily", "weekly", "monthly", "quarterly", "yearly"];
  return order.find((g) => allowed[g]) ?? "daily";
}

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  const initialPreset: DatePreset = "lastMonth";
  const initialRange = getRangeFromPreset(initialPreset);
  const initialAllowed = getAllowedGranularities(initialPreset, initialRange);
  const initialGranularity = getDefaultGranularity(initialAllowed);

  const makeInitial = (): ScopeState => ({
    preset: initialPreset,
    range: initialRange,
    granularity: initialGranularity,
  });

  const [scoped, setScoped] = useState<Record<string, ScopeState>>({
    dashboard: makeInitial(),
    projects: makeInitial(),
    "reports-team": makeInitial(),
    "reports-platform": makeInitial(),
    "reports-project": makeInitial(),
  });

  const setPreset = (scope: string, preset: DatePreset) => {
    setScoped((prev) => {
      const range =
        preset === "custom"
          ? prev[scope]?.range ?? getTodayRange()
          : getRangeFromPreset(preset);
      const allowed = getAllowedGranularities(preset, range);
      const currentGranularity = prev[scope]?.granularity ?? "daily";
      const granularity = allowed[currentGranularity]
        ? currentGranularity
        : getDefaultGranularity(allowed);
      return {
        ...prev,
        [scope]: { preset, range, granularity },
      };
    });
  };

  const setCustomRange = (scope: string, range: DateRangeValue) => {
    setScoped((prev) => {
      const allowed = getAllowedGranularities("custom", range);
      const currentGranularity = prev[scope]?.granularity ?? "daily";
      const granularity = allowed[currentGranularity]
        ? currentGranularity
        : getDefaultGranularity(allowed);
      return {
        ...prev,
        [scope]: { preset: "custom", range, granularity },
      };
    });
  };

  const setGranularity = (scope: string, granularity: Granularity) => {
    setScoped((prev) => ({
      ...prev,
      [scope]: { ...prev[scope], granularity },
    }));
  };

  return (
    <DateRangeContext.Provider value={{ scoped, setPreset, setCustomRange, setGranularity }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange(scope: ScopeKey = "dashboard") {
  const ctx = useContext(DateRangeContext);
  if (!ctx) throw new Error("useDateRange must be used inside DateRangeProvider");

  const defaultRange = getRangeFromPreset("lastMonth");
  const state = ctx.scoped[scope] ?? {
    preset: "lastMonth" as DatePreset,
    range: defaultRange,
    granularity: "monthly" as Granularity,
  };
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

  const allowedGranularities = getAllowedGranularities(state.preset, state.range);

  return {
    state,
    presetLabel: getPresetLabel(state.preset),
    formatRangeSpan,
    inRange,
    filterEntries,
    allowedGranularities,
    setPreset: (preset: DatePreset) => ctx.setPreset(scope, preset),
    setCustomRange: (range: DateRangeValue) => ctx.setCustomRange(scope, range),
    setGranularity: (granularity: Granularity) => ctx.setGranularity(scope, granularity),
  };
}

const GRANULARITY_LABELS: Record<Granularity, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

const ALL_GRANULARITIES: Granularity[] = ["daily", "weekly", "monthly", "quarterly", "yearly"];

export function DateRangePicker({
  className,
  compact,
  scope = "dashboard",
  showAdjust = false,
}: {
  className?: string;
  compact?: boolean;
  scope?: ScopeKey;
  showAdjust?: boolean;
}) {
  const { state, presetLabel, setPreset, setCustomRange, setGranularity, allowedGranularities } =
    useDateRange(scope);
  const [open, setOpen] = useState(false);
  const [activeInput, setActiveInput] = useState<"from" | "to">("from");
  const [hoverDate, setHoverDate] = useState<Date | undefined>(undefined);
  const [displayMonth, setDisplayMonth] = useState<Date>(state.range.from);
  const [year, setYear] = useState(String(new Date().getFullYear()));

  useEffect(() => {
    setDisplayMonth(state.range.from);
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

  const updateDateByInput = (key: "from" | "to", value: string) => {
    const parsed = parse(value, "yyyy-MM-dd", new Date());
    if (Number.isNaN(parsed.getTime())) return;
    const next = { ...state.range, [key]: parsed };
    if (isAfter(next.from, next.to)) {
      if (key === "from") next.to = parsed;
      else next.from = parsed;
    }
    setCustomRange(next);
    setDisplayMonth(parsed);
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
    setDisplayMonth(day);
    setHoverDate(undefined);
  };

  const onYearChange = (nextYear: string) => {
    setYear(nextYear);
    const y = Number(nextYear);
    setDisplayMonth((prev) => new Date(y, prev.getMonth(), 1));
  };

  const allDisabled = ALL_GRANULARITIES.every((g) => !allowedGranularities[g]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("justify-start", className)}>
          {compact
            ? presetLabel
            : `${presetLabel}: ${format(state.range.from, "dd MMM")} - ${format(state.range.to, "dd MMM")}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[620px] p-0">
        <div className="grid grid-cols-[200px_1fr]">
          <div className="border-r p-2 flex flex-col">
            {PRESET_LIST.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted",
                  state.preset === preset.id && "bg-muted font-medium",
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

          <div className="p-3 flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Start date*</label>
                <Input
                  value={parsedFrom}
                  onFocus={() => setActiveInput("from")}
                  onChange={(e) => updateDateByInput("from", e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">End date*</label>
                <Input
                  value={parsedTo}
                  onFocus={() => setActiveInput("to")}
                  onChange={(e) => updateDateByInput("to", e.target.value)}
                />
              </div>
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
              <Calendar
                mode="range"
                numberOfMonths={1}
                month={displayMonth}
                onMonthChange={setDisplayMonth}
                selected={previewRange}
                onDayMouseEnter={(day) => setHoverDate(day)}
                onDayMouseLeave={() => setHoverDate(undefined)}
                onSelect={(range) => {
                  if (!range?.from && !range?.to) return;
                  const dateToApply =
                    activeInput === "from"
                      ? (range?.from ?? range?.to)
                      : (range?.to ?? range?.from);
                  onSelectDate(dateToApply);
                }}
              />
            </div>

            {showAdjust && (
              <div className="border rounded-md p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Adjust</p>
                <div className="flex gap-1.5 flex-wrap">
                  {ALL_GRANULARITIES.map((g) => {
                    const enabled = allowedGranularities[g];
                    const active = state.granularity === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        disabled={!enabled || allDisabled}
                        onClick={() => enabled && setGranularity(g)}
                        className={cn(
                          "px-3 py-1.5 text-xs rounded-md border transition-colors",
                          active && enabled
                            ? "bg-foreground text-background border-foreground"
                            : enabled
                              ? "bg-background text-foreground border-border hover:bg-muted"
                              : "bg-muted/40 text-muted-foreground border-border/40 cursor-not-allowed opacity-50",
                        )}
                      >
                        {GRANULARITY_LABELS[g]}
                      </button>
                    );
                  })}
                </div>
                {allDisabled && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Granularity not available for this date range
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export type DateSeriesGranularity = "hourly" | "daily" | "monthly";

export const getGranularityFromPreset = (preset: DatePreset): DateSeriesGranularity => {
  if (preset === "today" || preset === "yesterday") return "hourly";
  if (
    preset === "last7" ||
    preset === "last14" ||
    preset === "lastMonth" ||
    preset === "thisWeek" ||
    preset === "lastWeek" ||
    preset === "thisMonth" ||
    preset === "last30"
  )
    return "daily";
  return "monthly";
};

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
  if (granularity === "hourly") return format(date, "yyyy-MM-dd HH");
  if (granularity === "daily") return format(date, "yyyy-MM-dd");
  return format(date, "yyyy-MM");
};

export const createTimeBuckets = (
  granularity: DateSeriesGranularity,
  range: DateRangeValue,
): Array<{ key: string; label: string; start: Date }> => {
  const from = startOfDay(range.from);
  const to = endOfDay(range.to);
  const buckets: Array<{ key: string; label: string; start: Date }> = [];

  if (granularity === "hourly") {
    const day = startOfDay(from);
    for (let hour = 0; hour < 24; hour += 1) {
      const point = addHours(day, hour);
      buckets.push({
        start: point,
        key: getBucketKey(point, "hourly"),
        label: format(point, "HH:mm"),
      });
    }
    return buckets;
  }

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
};

export function buildDashboardPerformanceSeries(
  type: DatePreset,
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
) {
  const granularity = getGranularityFromPreset(type);
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

    const divisor = granularity === "hourly" ? 24 : 1;
    seeded[idx].spend += entry.spend / divisor;
    seeded[idx].revenue += entry.revenue / divisor;
    seeded[idx].leads += entry.leads / divisor;
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

  const fallback = trend.filter((item) => {
    const parsed = parse(item.month, "MMM yyyy", new Date());
    return !isBefore(parsed, startOfDay(range.from)) && !isAfter(parsed, endOfDay(range.to));
  });

  return {
    data: fallback.length > 0 ? fallback : trend,
    xKey: "month" as const,
    granularity: "monthly" as const,
  };
}
