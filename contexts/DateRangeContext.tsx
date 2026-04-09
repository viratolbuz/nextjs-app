"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import {
  addDays,
  addHours,
  addMonths,
  endOfDay,
  format,
  isAfter,
  isBefore,
  parse,
  startOfDay,
  startOfMonth,
  subDays,
} from "date-fns";
import { Button } from "@/components/ui/button";
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
}

interface DateRangeContextValue {
  scoped: Record<string, ScopeState>;
  setPreset: (scope: string, preset: DatePreset) => void;
  setCustomRange: (scope: string, range: DateRangeValue) => void;
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

  if (longPreset) {
    const totalMonths = 12;
    const rangeMonths = Math.max(1, Math.ceil(daysSpan / 30));
    const startIdx = Math.max(0, totalMonths - rangeMonths);
    const sliced = monthlyTrend.filter((_item, idx) => idx >= startIdx);
    return { data: sliced.length ? sliced : monthlyTrend.slice(-3), xKey: "month", mode: "monthly" };
  }

  const useHourly = type === "today" || type === "yesterday";

  const useDaily =
    type === "7days" ||
    type === "14days" ||
    type === "lastweek" ||
    type === "1month" ||
    (type === "custom" && daysSpan <= 14);

  const filteredEntries = entries.filter((entry) => {
    const ed = parsePerformanceEntryDate(entry.date, anchor);
    if (!ed) return false;
    return !isBefore(ed, startOfDay(from)) && !isAfter(ed, endOfDay(to));
  });

  const setPreset = (scope: string, preset: DatePreset) => {
    setScoped((prev) => ({
      ...prev,
      [scope]: {
        preset,
        range: preset === "custom" ? prev[scope]?.range ?? getTodayRange() : getRangeFromPreset(preset),
      },
    }));
  };

  const setCustomRange = (scope: string, range: DateRangeValue) => {
    setScoped((prev) => ({
      ...prev,
      [scope]: {
        preset: "custom",
        range,
      },
    }));
  };

    const spendL = spendLTotal > 0 ? spendLTotal : lastBar.spend / 30;
    const revenueL = revenueLTotal > 0 ? revenueLTotal : lastBar.revenue / 30;
    const leads = leadsTotal > 0 ? leadsTotal : Math.max(1, Math.round(lastBar.leads / 30));

    const data = Array.from({ length: 24 }).map((_v, h) => {
      const w = 0.65 + (((h * 17) % 35) / 100);
      return {
        hour: `${String(h).padStart(2, "0")}:00`,
        spend: Math.round((spendL / 24) * w * 100) / 100,
        revenue: Math.round((revenueL / 24) * w * 100) / 100,
        leads: Math.max(0, Math.round((leads / 24) * w)),
        roas: Math.round(roasAvg * 100) / 100,
        cpa: Math.round(cpaAvg),
      };
    });

export function useDateRange(scope: ScopeKey = "dashboard") {
  const ctx = useContext(DateRangeContext);
  if (!ctx) throw new Error("useDateRange must be used inside DateRangeProvider");

  const state = ctx.scoped[scope] ?? { preset: "lastMonth", range: getRangeFromPreset("lastMonth") };
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
  const [year, setYear] = useState(String(new Date().getFullYear()));

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const list: string[] = [];
    for (let y = current; y >= current - 4; y -= 1) list.push(String(y));
    return list;
  }, []);

  const parsedFrom = format(state.range.from, "yyyy-MM-dd");
  const parsedTo = format(state.range.to, "yyyy-MM-dd");

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
                  <Select value={year} onValueChange={setYear}>
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
                <ScrollArea className="h-[360px] pr-2">
                  <div className="space-y-3">
                    {monthStarts.map((monthStart) => (
                      <div key={monthStart.toISOString()} className="border rounded-md">
                        <Calendar
                          mode="single"
                          month={monthStart}
                          selected={activeInput === "from" ? state.range.from : state.range.to}
                          onSelect={onSelectDate}
                          showOutsideDays={false}
                          classNames={{ nav: "hidden", caption: "px-2 pt-2" }}
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="border rounded-md p-2">
                <Calendar
                  mode="range"
                  numberOfMonths={1}
                  selected={{ from: state.range.from, to: state.range.to }}
                  onSelect={(range) => {
                    if (!range?.from || !range?.to) return;
                    setCustomRange({ from: range.from, to: range.to });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

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

    // Hourly points are derived from day-level dummy data to keep the chart alive.
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

export type DateSeriesGranularity = "hourly" | "daily" | "monthly";

export const getGranularityFromPreset = (preset: DatePreset): DateSeriesGranularity => {
  if (preset === "today" || preset === "yesterday") return "hourly";
  if (preset === "last7" || preset === "last14" || preset === "lastMonth") return "daily";
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
