import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types';
import { users as mockUsers } from '@/data/mockData';

interface UsersState {
  list: User[];
  loading: boolean;
}

const initialState: UsersState = {
  list: mockUsers,
  loading: false,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUser(state, action: PayloadAction<User>) {
      state.list.push(action.payload);
    },
    updateUser(state, action: PayloadAction<User>) {
      const idx = state.list.findIndex(u => u.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
    deleteUser(state, action: PayloadAction<string>) {
      state.list = state.list.filter(u => u.id !== action.payload);
    },
    setUsers(state, action: PayloadAction<User[]>) {
      state.list = action.payload;
    },
  },
});

export const { addUser, updateUser, deleteUser, setUsers } = usersSlice.actions;
export default usersSlice.reducer;
