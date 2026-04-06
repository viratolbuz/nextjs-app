import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User, AuthTokens } from '@/types';
import {
  loginUser,
  logoutUser,
  proxyLoginUser,
  restoreSession,
} from '@/services/auth.service';

const session =
  typeof window !== 'undefined'
    ? restoreSession()
    : { success: false, user: null, tokens: null };

const initialState: AuthState = {
  isLoggedIn: session.success,
  currentUser: session.user,
  proxyUser: null,
  tokens: session.tokens,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<{ user: User; tokens: AuthTokens }>) {
      state.isLoggedIn = true;
      state.currentUser = action.payload.user;
      state.tokens = action.payload.tokens;
      state.loading = false;
      state.error = null;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      logoutUser();
      state.isLoggedIn = false;
      state.currentUser = null;
      state.proxyUser = null;
      state.tokens = null;
      state.error = null;
    },
    setProxyUser(state, action: PayloadAction<string>) {
      const user = proxyLoginUser(action.payload);
      if (user) state.proxyUser = user;
    },
    clearProxyUser(state) {
      state.proxyUser = null;
    },
    updateCurrentUser(state, action: PayloadAction<Partial<User>>) {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setProxyUser,
  clearProxyUser,
  updateCurrentUser,
} = authSlice.actions;

// Thunk-like action creator for login
export const performLogin = (email: string, password: string) => {
  return (dispatch: any) => {
    dispatch(loginStart());
    const result = loginUser(email, password);
    if (result.success && result.user && result.tokens) {
      dispatch(loginSuccess({ user: result.user, tokens: result.tokens }));
      return true;
    }
    dispatch(loginFailure(result.error || 'Login failed'));
    return false;
  };
};

export default authSlice.reducer;
