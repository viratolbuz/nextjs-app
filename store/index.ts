import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import platformsReducer from './slices/platformsSlice';
import projectsReducer from './slices/projectsSlice';
import rolesReducer from './slices/rolesSlice';
import notificationsReducer from './slices/notificationsSlice';
import performanceReducer from './slices/performanceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    platforms: platformsReducer,
    projects: projectsReducer,
    roles: rolesReducer,
    notifications: notificationsReducer,
    performance: performanceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
