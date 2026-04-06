import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Notification } from '@/types';
import { notifications as mockNotifications } from '@/data/mockData';

interface NotificationsState {
  list: Notification[];
}

const initialState: NotificationsState = {
  list: mockNotifications,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markAsRead(state, action: PayloadAction<string>) {
      const n = state.list.find(n => n.id === action.payload);
      if (n) n.read = true;
    },
    markAllAsRead(state) {
      state.list.forEach(n => { n.read = true; });
    },
    addNotification(state, action: PayloadAction<Notification>) {
      state.list.unshift(action.payload);
    },
  },
});

export const { markAsRead, markAllAsRead, addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
