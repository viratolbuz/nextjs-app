import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Project } from '@/types';
import { projects as mockProjects } from '@/data/mockData';

interface ProjectsState {
  list: Project[];
  loading: boolean;
}

const initialState: ProjectsState = {
  list: mockProjects,
  loading: false,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    addProject(state, action: PayloadAction<Project>) {
      state.list.push(action.payload);
    },
    updateProject(state, action: PayloadAction<Project>) {
      const idx = state.list.findIndex(p => p.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
    deleteProject(state, action: PayloadAction<string>) {
      state.list = state.list.filter(p => p.id !== action.payload);
    },
  },
});

export const { addProject, updateProject, deleteProject } = projectsSlice.actions;
export default projectsSlice.reducer;
