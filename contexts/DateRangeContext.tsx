"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  addDays,
  addMonths,
  addQuarters,
  addWeeks,
  addYears,
  differenceInDays,
  endOfDay,
  endOfISOWeek,
  endOfMonth,
  endOfWeek,
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
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
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

export type ScopeKey =
  | "dashboard"
  | "projects"
  | "reports-team"
  | "reports-platform"
  | "reports-project"
  | "project-detail";

export type AdjustGranularity =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly";

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
      const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 0 });
      const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 0 });
      return { from: lastWeekStart, to: lastWeekEnd };
    }
    case "last14":
      return { from: subDays(now, 13), to: now };
    case "thisMonth":
      return { from: startOfMonth(now), to: now };
    case "last30":
      return { from: subDays(now, 29), to: now };
    case "lastMonth": {
      const lm = subMonths(now, 1);
      return { from: startOfMonth(lm), to: endOfMonth(lm) };
    }
    case "allTime":
      return { from: new Date("2022-01-01"), to: now };
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

/**
 * Allowed adjust options per preset (preset-specific rules override range-length rules).
 *
 * Today / Yesterday          → all 5 disabled
 * This week / Last 7 / Last week → only Daily enabled
 * Last 14 / This month / Last 30 → Daily + Weekly enabled
 * Last month / All time / Custom  → use date-range-length rules (Rule 2)
 */
export function getAllowedAdjustForPreset(
  preset: DatePreset,
  range: DateRangeValue,
): Record<AdjustGranularity, boolean> {
  switch (preset) {
    case "today":
    case "yesterday":
      return {
        daily: false,
        weekly: false,
        monthly: false,
        quarterly: false,
        yearly: false,
      };

    case "thisWeek":
    case "last7":
    case "lastWeek":
      return {
        daily: true,
        weekly: false,
        monthly: false,
        quarterly: false,
        yearly: false,
      };

    case "last14":
    case "thisMonth":
    case "last30":
      return {
        daily: true,
        weekly: true,
        monthly: false,
        quarterly: false,
        yearly: false,
      };

    case "lastMonth":
    case "allTime":
    case "custom":
    default:
      return getAllowedAdjustForDateRange(range);
  }
}

/**
 * Rule 2 – date-range-length based enable/disable:
 * 1–7 days   → Daily only
 * 8–30 days  → Daily + Weekly
 * 31–90 days → Weekly + Monthly
 * 91–365     → Monthly + Quarterly
 * >365       → Quarterly + Yearly
 */
export function getAllowedAdjustForDateRange(
  range: DateRangeValue,
): Record<AdjustGranularity, boolean> {
  const days = differenceInDays(range.to, range.from) + 1;
  if (days <= 7)
    return {
      daily: true,
      weekly: false,
      monthly: false,
      quarterly: false,
      yearly: false,
    };
  if (days <= 30)
    return {
      daily: true,
      weekly: true,
      monthly: false,
      quarterly: false,
      yearly: false,
    };
  if (days <= 90)
    return {
      daily: false,
      weekly: true,
      monthly: true,
      quarterly: false,
      yearly: false,
    };
  if (days <= 365)
    return {
      daily: false,
      weekly: false,
      monthly: true,
      quarterly: true,
      yearly: false,
    };
  return {
    daily: false,
    weekly: false,
    monthly: false,
    quarterly: true,
    yearly: true,
  };
}

export function isAdjustAllowed(
  adjust: AdjustGranularity,
  preset: DatePreset,
  range: DateRangeValue,
): boolean {
  return getAllowedAdjustForPreset(preset, range)[adjust];
}

function clampAdjust(
  preset: DatePreset,
  range: DateRangeValue,
  current: AdjustGranularity,
): AdjustGranularity {
  const allowed = getAllowedAdjustForPreset(preset, range);
  if (allowed[current]) return current;
  const order: AdjustGranularity[] = [
    "daily",
    "weekly",
    "monthly",
    "quarterly",
    "yearly",
  ];
  return order.find((g) => allowed[g]) ?? "daily";
}

export function clampAdjustForRange(
  range: DateRangeValue,
  current: AdjustGranularity,
): AdjustGranularity {
  const allowed = getAllowedAdjustForDateRange(range);
  if (allowed[current]) return current;
  const order: AdjustGranularity[] = [
    "daily",
    "weekly",
    "monthly",
    "quarterly",
    "yearly",
  ];
  return order.find((g) => allowed[g]) ?? "monthly";
}

const defaultScopeState = (): ScopeState => ({
  preset: "last7",
  range: getRangeFromPreset("last7"),
  adjust: "daily",
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
  Object.fromEntries(
    INITIAL_SCOPES.map((k) => [
      k,
      k === "projects"
        ? {
            preset: "allTime",
            range: getRangeFromPreset("allTime"),
            adjust: "quarterly",
          }
        : defaultScopeState(),
    ])
  )
);

  const setPreset = (scope: string, preset: DatePreset) => {
    setScoped((prev) => {
      const range =
        preset === "custom"
          ? (prev[scope]?.range ?? getTodayRange())
          : getRangeFromPreset(preset);
      const prevAdjust = prev[scope]?.adjust ?? "monthly";
      const adjust = clampAdjust(preset, range, prevAdjust);
      return { ...prev, [scope]: { preset, range, adjust } };
    });
  };

  const setCustomRange = (scope: string, range: DateRangeValue) => {
    setScoped((prev) => {
      const prevAdjust = prev[scope]?.adjust ?? "monthly";
      const adjust = clampAdjust("custom", range, prevAdjust);
      return { ...prev, [scope]: { preset: "custom", range, adjust } };
    });
  };

  const setAdjust = (scope: string, adjust: AdjustGranularity) => {
    setScoped((prev) => {
      const cur = prev[scope] ?? defaultScopeState();
      if (!isAdjustAllowed(adjust, cur.preset, cur.range)) return prev;
      return { ...prev, [scope]: { ...cur, adjust } };
    });
  };

  return (
    <DateRangeContext.Provider
      value={{ scoped, setPreset, setCustomRange, setAdjust }}
    >
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange(scope: ScopeKey = "dashboard") {
  const ctx = useContext(DateRangeContext);
  if (!ctx)
    throw new Error("useDateRange must be used inside DateRangeProvider");

  const state = ctx.scoped[scope] ?? defaultScopeState();
  const from = startOfDay(state.range.from);
  const to = endOfDay(state.range.to);

  const inRange = (date: Date) => !isBefore(date, from) && !isAfter(date, to);

  const filterEntries = (entries: PerformanceEntry[]) =>
    entries.filter((entry) => {
      try {
        const parsed = parsePerformanceEntryDate(entry.date);
        if (!parsed) return true;
        return inRange(parsed);
      } catch {
        return true;
      }
    });

  const formatRangeSpan = () =>
    `${format(state.range.from, "dd MMM yyyy")} - ${format(state.range.to, "dd MMM yyyy")}`;

  const adjustLabel =
    ADJUST_OPTIONS.find((o) => o.id === state.adjust)?.label ?? "Monthly";
  const allowedAdjust = getAllowedAdjustForPreset(state.preset, state.range);
  const allAdjustDisabled = !Object.values(allowedAdjust).some(Boolean);

  return {
    state,
    presetLabel: getPresetLabel(state.preset),
    adjustLabel,
    allowedAdjust,
    allAdjustDisabled,
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
    for (let y = current; y >= 2022; y -= 1) list.push(String(y));
    return list;
  }, []);

  const parsedFrom = format(state.range.from, "yyyy-MM-dd");
  const parsedTo = format(state.range.to, "yyyy-MM-dd");

  const previewRange = useMemo(() => {
    if (!hoverDate) return { from: state.range.from, to: state.range.to };
    if (activeInput === "from") {
      if (isAfter(hoverDate, state.range.to))
        return { from: hoverDate, to: hoverDate };
      return { from: hoverDate, to: state.range.to };
    }
    if (isBefore(hoverDate, state.range.from))
      return { from: hoverDate, to: state.range.from };
    return { from: state.range.from, to: hoverDate };
  }, [activeInput, hoverDate, state.range.from, state.range.to]);

  const monthStarts = useMemo(() => {
    const selectedYear = Number(year);
    const now = new Date();
    const maxMonth = selectedYear === now.getFullYear() ? now.getMonth() : 11;
    const items: Date[] = [];
    for (let m = 0; m <= maxMonth; m += 1)
      items.push(new Date(selectedYear, m, 1));
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("justify-start", className)}>
          {compact
            ? presetLabel
            : `${presetLabel}: ${format(state.range.from, "dd MMM")} - ${format(state.range.to, "dd MMM")}`}
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

          <div className="p-3">
            <div className="flex flex-col gap-3 w-full">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">
                    Start date*
                  </label>
                  <Input
                    value={parsedFrom}
                    onFocus={() => setActiveInput("from")}
                    onChange={(e) => updateDateByInput("from", e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">
                    End date*
                  </label>
                  <Input
                    value={parsedTo}
                    onFocus={() => setActiveInput("to")}
                    onChange={(e) => updateDateByInput("to", e.target.value)}
                  />
                </div>
              </div>

              <div className="border rounded-md p-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Date range
                  </p>
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
                <ScrollArea className="h-[420px] pr-2">
                  <div className="space-y-3">
                    {monthStarts.map((monthStart) => (
                      <div
                        key={monthStart.toISOString()}
                        className="border rounded-md"
                      >
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
  const { state, setAdjust, allowedAdjust, allAdjustDisabled } =
    useDateRange(scope);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn("gap-1", className)}
          disabled={allAdjustDisabled}
        >
          Adjust:{" "}
          {ADJUST_OPTIONS.find((o) => o.id === state.adjust)?.label ?? "—"}
          <ChevronDown className="h-4 w-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[9rem]">
        {ADJUST_OPTIONS.map((opt) => {
          const allowed = allowedAdjust[opt.id];
          return (
            <DropdownMenuItem
              key={opt.id}
              disabled={!allowed}
              className={cn(
                state.adjust === opt.id && "bg-muted",
                !allowed && "text-muted-foreground opacity-50",
              )}
              onClick={() => allowed && setAdjust(opt.id)}
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
  const buckets = createTimeBuckets(adjust, range);
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
    if (
      isBefore(parsed, startOfDay(range.from)) ||
      isAfter(parsed, endOfDay(range.to))
    ) {
      return;
    }

    const key = getBucketKey(parsed, adjust);
    const idx = bucketIndex.get(key);
    if (idx === undefined) return;

    seeded[idx].spend += entry.spend / 100000;
    seeded[idx].revenue += entry.revenue / 100000;
    seeded[idx].leads += entry.leads;
  });

  const data = seeded.map((row, idx) => {
    const spend = Number(row.spend.toFixed(2));
    const revenue = Number(row.revenue.toFixed(2));
    const leads = Math.round(row.leads);
    const roas = spend > 0 ? Number((revenue / spend).toFixed(2)) : 0;
    const cpa = leads > 0 ? Math.round((spend * 100000) / leads) : 0;
    return { period: buckets[idx].label, spend, revenue, leads, roas, cpa };
  });

  if (data.some((d) => d.spend || d.revenue || d.leads)) {
    return { data, xKey: "period" as const, granularity: adjust };
  }

  if (options?.skipGlobalTrendFallback) {
    return { data, xKey: "period" as const, granularity: adjust };
  }

  const fallback = trend.filter((item) => {
    const parsed = parse(item.month, "MMM yyyy", new Date());
    return (
      !isBefore(parsed, startOfDay(range.from)) &&
      !isAfter(parsed, endOfDay(range.to))
    );
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
    const withYear = parse(dateValue, "dd MMM yyyy", new Date());
    if (!Number.isNaN(withYear.getTime())) return withYear;
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

export const getBucketKey = (
  date: Date,
  granularity: DateSeriesGranularity,
): string => {
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
    buckets.push({ start: cursor, key: String(y), label: String(y) });
    cursor = addYears(cursor, 1);
  }
  return buckets;
};

export const getGranularityFromPreset = (
  preset: DatePreset,
): AdjustGranularity => {
  if (preset === "today" || preset === "yesterday") return "daily";
  if (
    preset === "thisWeek" ||
    preset === "last7" ||
    preset === "lastWeek" ||
    preset === "last14" ||
    preset === "thisMonth" ||
    preset === "last30"
  )
    return "daily";
  return "monthly";
};
