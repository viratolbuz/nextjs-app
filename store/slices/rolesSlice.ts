import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Role } from '@/types';
import { roles as mockRoles } from '@/data/mockData';

interface RolesState {
  list: Role[];
  loading: boolean;
}

const initialState: RolesState = {
  list: mockRoles,
  loading: false,
};

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    addRole(state, action: PayloadAction<Role>) {
      state.list.push(action.payload);
    },
    updateRole(state, action: PayloadAction<Role>) {
      const idx = state.list.findIndex(r => r.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
    deleteRole(state, action: PayloadAction<string>) {
      state.list = state.list.filter(r => r.id !== action.payload);
    },
  },
});

export const { addRole, updateRole, deleteRole } = rolesSlice.actions;
export default rolesSlice.reducer;
