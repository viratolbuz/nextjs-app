"use client";

/**
 * AuthContext - Bridges Redux auth state with React Context API
 * This provides backward compatibility while Redux manages the state
 */
import { createContext, useContext, ReactNode, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  setProxyUser,
  clearProxyUser,
} from '@/store/slices/authSlice';
import { loginUser, logoutUser } from '@/services/auth.service';
import type { User } from '@/types';

interface AuthContextType {
  isLoggedIn: boolean;
  currentUser: User | null;
  proxyUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  proxyLogin: (userId: string) => void;
  exitProxy: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const { isLoggedIn, currentUser, proxyUser } = useAppSelector(state => state.auth);

  const login = useCallback((email: string, password: string): boolean => {
    dispatch(loginStart());
    const result = loginUser(email, password);
    if (result.success && result.user && result.tokens) {
      dispatch(loginSuccess({ user: result.user, tokens: result.tokens }));
      return true;
    }
    dispatch(loginFailure(result.error || 'Login failed'));
    return false;
  }, [dispatch]);

  const logout = useCallback(() => {
    logoutUser();
    dispatch(logoutAction());
  }, [dispatch]);

  const proxyLogin = useCallback((userId: string) => {
    dispatch(setProxyUser(userId));
  }, [dispatch]);

  const exitProxy = useCallback(() => {
    dispatch(clearProxyUser());
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, currentUser, proxyUser, login, logout, proxyLogin, exitProxy }}>
      {children}
    </AuthContext.Provider>
  );
};
