import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PerformanceEntry } from '@/types';
import { performanceEntries as mockEntries } from '@/data/mockData';

interface PerformanceState {
  entries: PerformanceEntry[];
  loading: boolean;
}

const initialState: PerformanceState = {
  entries: mockEntries,
  loading: false,
};

const performanceSlice = createSlice({
  name: 'performance',
  initialState,
  reducers: {
    addEntry(state, action: PayloadAction<PerformanceEntry>) {
      state.entries.push(action.payload);
    },
    updateEntry(state, action: PayloadAction<PerformanceEntry>) {
      const idx = state.entries.findIndex(e => e.id === action.payload.id);
      if (idx !== -1) state.entries[idx] = action.payload;
    },
    deleteEntry(state, action: PayloadAction<string>) {
      state.entries = state.entries.filter(e => e.id !== action.payload);
    },
  },
});

export const { addEntry, updateEntry, deleteEntry } = performanceSlice.actions;
export default performanceSlice.reducer;
