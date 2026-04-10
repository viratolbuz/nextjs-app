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
 * Today / Yesterday          → all disabled
 * This week / Last 7 / Last week → Daily + Weekly (≤365d so both enabled)
 * Last 14 / This month / Last 30 → Daily + Weekly
 * Last month / All time / Custom  → use date-range-length rules
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
    case "last14":
    case "thisMonth":
    case "last30":
    case "lastMonth":
    case "allTime":
    case "custom":
    default:
      return getAllowedAdjustForDateRange(range);
  }
}

/**
 * Granularity rules based on date range length:
 * - Daily:     enabled when ≤ 365 days
 * - Weekly:    enabled when ≤ 365 days
 * - Monthly:   enabled when > 31 days  (no upper limit)
 * - Quarterly: enabled when > 93 days  (no upper limit)
 * - Yearly:    enabled when ≥ 365 days (no upper limit)
 */
export function getAllowedAdjustForDateRange(
  range: DateRangeValue,
): Record<AdjustGranularity, boolean> {
  const days = differenceInDays(range.to, range.from) + 1;
  return {
    daily: days <= 365,
    weekly: days <= 365,
    monthly: days > 31,
    quarterly: days > 93,
    yearly: days >= 365,
  };
}

/**
 * Returns which granularity options should be visible in the dropdown.
 * Options below their threshold are hidden entirely rather than shown disabled.
 * - Monthly:   visible when > 31 days
 * - Quarterly: visible when > 93 days
 * - Yearly:    visible when ≥ 365 days
 * - Daily/Weekly: always visible
 */
export function getVisibleAdjustOptions(
  range: DateRangeValue,
): Record<AdjustGranularity, boolean> {
  const days = differenceInDays(range.to, range.from) + 1;
  return {
    daily: true,
    weekly: true,
    monthly: days > 31,
    quarterly: days > 93,
    yearly: days >= 365,
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
      ]),
    ),
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

/**
 * Segmented numeric date input: DD / MM / YYYY
 * - Typing digits updates in real time
 * - ArrowUp/ArrowDown increments/decrements each segment with proper bounds
 * - DD wraps within valid days for the current month/year
 * - MM clamps 1–12
 * - YYYY clamps to minYear–maxYear (defaults 2022–today's year)
 */
function DateSegmentInput({
  value,
  onChange,
  onFocus,
  maxDate,
  minYear = 2022,
}: {
  value: Date;
  onChange: (d: Date) => void;
  onFocus?: () => void;
  maxDate?: Date;
  minYear?: number;
}) {
  const maxYear = maxDate ? maxDate.getFullYear() : new Date().getFullYear();

  const [dd, setDd] = useState(format(value, "dd"));
  const [mm, setMm] = useState(format(value, "MM"));
  const [yyyy, setYyyy] = useState(format(value, "yyyy"));

  // Sync segments when value changes externally (e.g. calendar click)
  useEffect(() => {
    setDd(format(value, "dd"));
    setMm(format(value, "MM"));
    setYyyy(format(value, "yyyy"));
  }, [value]);

  const daysInMonth = (month: number, year: number) =>
    new Date(year, month, 0).getDate(); // month is 1-based here

  const tryEmit = (newDd: string, newMm: string, newYyyy: string) => {
    const d = Number(newDd);
    const m = Number(newMm);
    const y = Number(newYyyy);
    if (!d || !m || y < minYear || y > maxYear) return;
    const candidate = new Date(y, m - 1, d);
    if (
      candidate.getFullYear() === y &&
      candidate.getMonth() === m - 1 &&
      candidate.getDate() === d
    ) {
      // Clamp to maxDate
      const clamped = maxDate && candidate > maxDate ? maxDate : candidate;
      onChange(clamped);
    }
  };

  const handleDd = (v: string) => {
    const clean = v.replace(/\D/g, "").slice(0, 2);
    setDd(clean);
    tryEmit(clean, mm, yyyy);
  };
  const handleMm = (v: string) => {
    const clean = v.replace(/\D/g, "").slice(0, 2);
    setMm(clean);
    tryEmit(dd, clean, yyyy);
  };
  const handleYyyy = (v: string) => {
    const clean = v.replace(/\D/g, "").slice(0, 4);
    setYyyy(clean);
    tryEmit(dd, mm, clean);
  };

  const handleKeyDown = (
    seg: "dd" | "mm" | "yyyy",
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const dir = e.key === "ArrowUp" ? 1 : -1;

    const curDd = Number(dd) || 1;
    const curMm = Number(mm) || 1;
    const curYyyy = Number(yyyy) || new Date().getFullYear();

    if (seg === "dd") {
      const maxDay = daysInMonth(curMm, curYyyy);
      let next = curDd + dir;
      if (next < 1) next = maxDay;
      if (next > maxDay) next = 1;
      const s = String(next).padStart(2, "0");
      setDd(s);
      tryEmit(s, mm, yyyy);
    } else if (seg === "mm") {
      let next = curMm + dir;
      if (next < 1) next = 12;
      if (next > 12) next = 1;
      const s = String(next).padStart(2, "0");
      setMm(s);
      // Clamp day to new month's max
      const maxDay = daysInMonth(next, curYyyy);
      const clampedDd = Math.min(curDd, maxDay);
      const ddS = String(clampedDd).padStart(2, "0");
      setDd(ddS);
      tryEmit(ddS, s, yyyy);
    } else {
      let next = curYyyy + dir;
      if (next < minYear) next = minYear;
      if (next > maxYear) next = maxYear;
      const s = String(next);
      setYyyy(s);
      // Clamp day to new year's month max (handles Feb in leap years)
      const maxDay = daysInMonth(curMm, next);
      const clampedDd = Math.min(curDd, maxDay);
      const ddS = String(clampedDd).padStart(2, "0");
      setDd(ddS);
      tryEmit(ddS, mm, s);
    }
  };

  const segCls =
    "w-[2.2rem] text-center border-0 border-b border-border bg-transparent p-0 text-sm focus:outline-none focus:border-primary focus:ring-0 tabular-nums";

  return (
    <div
      className="flex items-center gap-0.5 rounded-md border border-input bg-background px-2 py-1 text-sm focus-within:ring-1 focus-within:ring-ring"
      onFocus={onFocus}
    >
      <input
        className={segCls}
        value={dd}
        onChange={(e) => handleDd(e.target.value)}
        onKeyDown={(e) => handleKeyDown("dd", e)}
        placeholder="DD"
        inputMode="numeric"
        maxLength={2}
      />
      <span className="text-muted-foreground select-none">/</span>
      <input
        className={segCls}
        value={mm}
        onChange={(e) => handleMm(e.target.value)}
        onKeyDown={(e) => handleKeyDown("mm", e)}
        placeholder="MM"
        inputMode="numeric"
        maxLength={2}
      />
      <span className="text-muted-foreground select-none">/</span>
      <input
        className={cn(segCls, "w-[3rem]")}
        value={yyyy}
        onChange={(e) => handleYyyy(e.target.value)}
        onKeyDown={(e) => handleKeyDown("yyyy", e)}
        placeholder="YYYY"
        inputMode="numeric"
        maxLength={4}
      />
    </div>
  );
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
  const [draftRange, setDraftRange] = useState<{ from: Date; to: Date }>(
    state.range,
  );

  useEffect(() => {
    if (open) {
      setDraftRange(state.range);
      setYear(String(state.range.from.getFullYear()));
    }
  }, [open]);

  useEffect(() => {
    setYear(String(draftRange.from.getFullYear()));
  }, [draftRange.from]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  }, []);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const list: string[] = [];
    for (let y = current; y >= 2022; y -= 1) list.push(String(y));
    return list;
  }, []);

  const previewRange = useMemo(() => {
    if (!hoverDate) return { from: draftRange.from, to: draftRange.to };
    if (activeInput === "from") {
      if (isAfter(hoverDate, draftRange.to))
        return { from: hoverDate, to: hoverDate };
      return { from: hoverDate, to: draftRange.to };
    }
    if (isBefore(hoverDate, draftRange.from))
      return { from: hoverDate, to: draftRange.from };
    return { from: draftRange.from, to: hoverDate };
  }, [activeInput, hoverDate, draftRange.from, draftRange.to]);

  const monthStarts = useMemo(() => {
    const selectedYear = Number(year);
    const now = new Date();
    const maxMonth = selectedYear === now.getFullYear() ? now.getMonth() : 11;
    const items: Date[] = [];
    for (let m = 0; m <= maxMonth; m += 1)
      items.push(new Date(selectedYear, m, 1));
    return items;
  }, [year]);

  const updateFrom = (d: Date) => {
    const next = { from: d, to: draftRange.to };
    if (isAfter(d, draftRange.to)) next.to = d;
    setDraftRange(next);
  };

  const updateTo = (d: Date) => {
    const next = { from: draftRange.from, to: d };
    if (isBefore(d, draftRange.from)) next.from = d;
    setDraftRange(next);
  };

  const onSelectDate = (day?: Date) => {
    if (!day) return;
    const next = { ...draftRange };
    if (activeInput === "from") {
      next.from = day;
      if (isAfter(next.from, next.to)) next.to = day;
      setActiveInput("to");
    } else {
      next.to = day;
      if (isBefore(next.to, next.from)) next.from = day;
    }
    setDraftRange(next);
    setHoverDate(undefined);
  };

  const handleApply = () => {
    setCustomRange(draftRange);
    setOpen(false);
  };

  const handleCancel = () => {
    setDraftRange(state.range);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        if (!o) handleCancel();
        else setOpen(true);
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("justify-start", className)}>
          {compact
            ? presetLabel
            : `${format(state.range.from, "dd MMM yyyy")} – ${format(state.range.to, "dd MMM yyyy")}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[570px] p-0">
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
                  if (preset.id !== "custom") {
                    setPreset(preset.id);
                    setOpen(false);
                  } else {
                    setPreset(preset.id);
                    setDraftRange(state.range);
                  }
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="w-full p-3">
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Start date{" "}
                  </label>
                  <DateSegmentInput
                    value={draftRange.from}
                    onChange={updateFrom}
                    onFocus={() => setActiveInput("from")}
                    maxDate={today}
                    minYear={2022}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">
                    End date{" "}
                  </label>
                  <DateSegmentInput
                    value={draftRange.to}
                    onChange={updateTo}
                    onFocus={() => setActiveInput("to")}
                    maxDate={today}
                    minYear={2022}
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
                          disabled={{ after: new Date() }}
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

              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleApply}>
                  Apply
                </Button>
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
                !allowed &&
                  "text-muted-foreground opacity-40 cursor-not-allowed",
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
