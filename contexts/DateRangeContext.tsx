"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { format, isAfter, isBefore, parse, startOfDay, endOfDay, subDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
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

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  const [scoped, setScoped] = useState<Record<string, ScopeState>>({
    dashboard: { preset: "lastMonth", range: getRangeFromPreset("lastMonth") },
    projects: { preset: "lastMonth", range: getRangeFromPreset("lastMonth") },
    "reports-team": { preset: "lastMonth", range: getRangeFromPreset("lastMonth") },
    "reports-platform": { preset: "lastMonth", range: getRangeFromPreset("lastMonth") },
    "reports-project": { preset: "lastMonth", range: getRangeFromPreset("lastMonth") },
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

  return (
    <DateRangeContext.Provider value={{ scoped, setPreset, setCustomRange }}>
      {children}
    </DateRangeContext.Provider>
  );
}

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

  const formatRangeSpan = () =>
    `${format(state.range.from, "dd MMM yyyy")} - ${format(state.range.to, "dd MMM yyyy")}`;

  return {
    state,
    presetLabel: getPresetLabel(state.preset),
    formatRangeSpan,
    inRange,
    filterEntries,
    setPreset: (preset: DatePreset) => ctx.setPreset(scope, preset),
    setCustomRange: (range: DateRangeValue) => ctx.setCustomRange(scope, range),
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
              <div className="space-y-2">
                <div className="w-auto">
                  <label className="text-xs text-muted-foreground">Start date</label>
                  <Input
                    value={parsedFrom}
                    onFocus={() => setActiveInput("from")}
                    onChange={(e) => updateDateByInput("from", e.target.value)}
                  />
                </div>
                <div className="w-auto">
                  <label className="text-xs text-muted-foreground">End date</label>
                  <Input
                    value={parsedTo}
                    onFocus={() => setActiveInput("to")}
                    onChange={(e) => updateDateByInput("to", e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(state.range.from, "dd MMM yyyy")} - {format(state.range.to, "dd MMM yyyy")}
                </p>
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
  _type: string,
  range: DateRangeValue,
  trend: Array<{ month: string; spend: number; revenue: number; leads: number; roas: number; cpa?: number }>,
  _entries: PerformanceEntry[],
) {
  const data = trend.filter((item) => {
    const parsed = parse(item.month, "MMM yyyy", new Date());
    return !isBefore(parsed, startOfDay(range.from)) && !isAfter(parsed, endOfDay(range.to));
  });
  return { data: data.length > 0 ? data : trend, xKey: "month" as const };
}
