import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Platform } from '@/types';
import { platforms as mockPlatforms } from '@/data/mockData';

interface PlatformsState {
  list: Platform[];
  loading: boolean;
}

const initialState: PlatformsState = {
  list: mockPlatforms,
  loading: false,
};

const platformsSlice = createSlice({
  name: 'platforms',
  initialState,
  reducers: {
    addPlatform(state, action: PayloadAction<Platform>) {
      state.list.push(action.payload);
    },
    updatePlatform(state, action: PayloadAction<Platform>) {
      const idx = state.list.findIndex(p => p.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
    deletePlatform(state, action: PayloadAction<string>) {
      state.list = state.list.filter(p => p.id !== action.payload);
    },
  },
});

export const { addPlatform, updatePlatform, deletePlatform } = platformsSlice.actions;
export default platformsSlice.reducer;
