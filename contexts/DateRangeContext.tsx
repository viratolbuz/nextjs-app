"use client";

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { format, addDays, subDays, subWeeks, subMonths, subQuarters, parseISO, isAfter, isBefore } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';

export type DateRangeType = 
  | 'today' | 'yesterday' | 'lastweek' | '7days' | '14days' 
  | '1month' | '6months' | 'quarterly' | '12months' | 'custom';

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangeState {
  type: DateRangeType;
  range: DateRange;
}

type DateRangeAction = 
  | { type: 'SET_PRESET'; payload: DateRangeType }
  | { type: 'SET_CUSTOM'; payload: DateRange };

const initialState: DateRangeState = {
  type: '1month',
  range: getPresetRange('1month'),
};

export const DateRangeContext = createContext<{
  state: DateRangeState;
  dispatch: React.Dispatch<DateRangeAction>;
  setPreset: (preset: DateRangeType) => void;
  setCustomRange: (range: DateRange) => void;
  DateRangePicker: React.FC<{ className?: string }>;
  filterPerformanceTrend: (data: any[]) => any[];
  filterEntries: (data: any[]) => any[];
} | null>(null);

function dateRangeReducer(state: DateRangeState, action: DateRangeAction): DateRangeState {
  switch (action.type) {
    case 'SET_PRESET':
      return { type: action.payload, range: getPresetRange(action.payload) };
    case 'SET_CUSTOM':
      return { type: 'custom', range: action.payload };
    default:
      return state;
  }
}

function getPresetRange(type: DateRangeType): DateRange {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const today = new Date(now);

  switch (type) {
    case 'today':
      return { from: today, to: today };
    case 'yesterday':
      return { from: subDays(today, 1), to: subDays(today, 1) };
    case 'lastweek':
      return { from: subWeeks(today, 1), to: subDays(subWeeks(today, 1), 6) };
    case '7days':
      return { from: subDays(today, 6), to: today };
    case '14days':
      return { from: subDays(today, 13), to: today };
    case '1month':
      return { from: subMonths(today, 1), to: today };
    case '6months':
      return { from: subMonths(today, 6), to: today };
    case 'quarterly':
      return { from: subQuarters(today, 1), to: today };
    case '12months':
      return { from: subMonths(today, 12), to: today };
    default:
      return { from: undefined, to: undefined };
  }
}

const computePerformanceTrendFilter = (data: any[], range: DateRange): any[] => {
  if (!range.from || !range.to) return data;

  const totalMonths = 12;
  const rangeMonths = Math.ceil((range.to.getTime() - range.from.getTime()) / (30 * 24 * 60 * 60 * 1000));
  const startIdx = Math.max(0, totalMonths - rangeMonths);
  return data.filter((_item, idx) => idx >= startIdx);
};

const computeEntryFilter = (data: any[], range: DateRange): any[] => {
  const from = range.from;
  const to = range.to;
  if (!from || !to) return data;

  return data.filter(entry => {
    const entryDate = parseISO(entry.date + ' 00:00:00'); // Assume '01 Apr' -> parse
    return isAfter(entryDate, subDays(from, 1)) && isBefore(entryDate, addDays(to, 1));
  });
};

export const DateRangePicker: React.FC<{ className?: string }> = ({ className = '' }) => {
  const ctx = useContext(DateRangeContext)!;
  const { state, dispatch } = ctx;
  const [open, setOpen] = React.useState(false);

  const presetLabel = {
    today: 'Today',
    yesterday: 'Yesterday',
    lastweek: 'Last Week',
    '7days': '7 Days',
    '14days': '14 Days',
    '1month': '1 Month',
    '6months': '6 Months',
    quarterly: 'Quarter',
    '12months': '12 Months',
    custom: format(state.range.from || new Date(), 'MMM dd') + ' - ' + format(state.range.to || new Date(), 'MMM dd'),
  }[state.type];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={className}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {presetLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {/* Presets */}
        <div className="grid grid-cols-2 p-2 border-b border-border">
          {(['today', 'yesterday', '7days', '14days', '1month', '6months', 'quarterly', '12months'] as DateRangeType[]).map(preset => (
            <Button
              key={preset}
              variant="ghost"
              className="justify-start h-9 px-2 text-xs"
              onClick={() => {
                dispatch({ type: 'SET_PRESET', payload: preset });
                setOpen(false);
              }}
            >
              {presetLabel[preset as keyof typeof presetLabel] as string}
            </Button>
          ))}
        </div>
        {/* Custom Calendar */}
        <div className="p-3">
          <Calendar
            mode="range"
            selected={{ from: state.range.from, to: state.range.to }}
            onSelect={(range) => {
              dispatch({ type: 'SET_CUSTOM', payload: range as DateRange });
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
    dispatch({ type: 'SET_PRESET', payload: preset });
  }, []);

  const setCustomRange = useCallback((range: DateRange) => {
    dispatch({ type: 'SET_CUSTOM', payload: range });
  }, []);

  const filterPerformanceTrend = useCallback((data: any[]) => {
    return computePerformanceTrendFilter(data, state.range);
  }, [state.range]);

  const filterEntries = useCallback((data: any[]) => {
    return computeEntryFilter(data, state.range);
  }, [state.range]);

  return (
    <DateRangeContext.Provider value={{
      state,
      dispatch,
      setPreset,
      setCustomRange,
      DateRangePicker,
      filterPerformanceTrend,
      filterEntries,
    }}>
      {children}
    </DateRangeContext.Provider>
  );
};

export const useDateRange = () => {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error('useDateRange must be used within DateRangeProvider');
  }
  return context;
};

