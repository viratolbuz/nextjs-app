/**
 * Authentication Service
 * Handles login, logout, proxy login, and session management
 * In production, replace mock logic with real API calls
 */

import { users as mockUsers, roles } from '@/data/mockData';
import type { User, AuthTokens } from '@/types';
import { useUserStore } from '@/store/userStore';
import {
  generateTokens,
  saveTokens,
  saveUser,
  clearAuthStorage,
  validateSession,
  decodeToken,
} from './jwt.service';

export interface LoginResult {
  success: boolean;
  user: User | null;
  tokens: AuthTokens | null;
  error?: string;
}

// Simulate API login
export const loginUser = (email: string, _password: string): LoginResult => {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check hardcoded mock users first (any password works for demo)
  const mockUser = mockUsers.find(u => u.email.toLowerCase() === normalizedEmail);
  if (mockUser) {
    const tokens = generateTokens(mockUser);
    saveTokens(tokens);
    saveUser(mockUser);
    return { success: true, user: mockUser, tokens };
  }

  // 2. Check Zustand registered users (password must match)
  const store = useUserStore.getState();
  const registeredUser = store.getRegisteredByEmail(normalizedEmail);
  if (registeredUser && registeredUser.password === _password) {
    // Convert to User type
    const user: User = {
      id: registeredUser.id,
      name: registeredUser.fullName,
      email: registeredUser.email,
      role: registeredUser.role,
      avatar: '',
      projects: 0,
      status: 'Active',
      lastLogin: new Date().toLocaleString(),
      phone: registeredUser.mobile,
      department: '',
    };
    // Also push to mockUsers array so proxyLogin and other lookups work
    if (!mockUsers.find(u => u.id === user.id)) {
      mockUsers.push(user);
    }
    const tokens = generateTokens(user);
    saveTokens(tokens);
    saveUser(user);
    return { success: true, user, tokens };
  }

  // 3. No match
  return { success: false, user: null, tokens: null, error: 'Invalid email or password' };
};

// Logout
export const logoutUser = (): void => {
  clearAuthStorage();
};

// Proxy login - admin views as another user
export const proxyLoginUser = (userId: string): User | null => {
  // Check mockUsers array first, then Zustand registered users
  const mockUser = mockUsers.find(u => u.id === userId);
  if (mockUser) return mockUser;

  // Check Zustand store
  const store = useUserStore.getState();
  const allUsers = store.getAllUsers();
  const found = allUsers.find(u => u.id === userId);
  if (found) {
    // Ensure it's in mockUsers for future lookups
    if (!mockUsers.find(u => u.id === found.id)) {
      mockUsers.push(found);
    }
    return found;
  }
  return null;
};

// Restore session on app load
export const restoreSession = (): LoginResult => {
  const { user, tokens, valid } = validateSession();
  if (valid && user && tokens) {
    return { success: true, user, tokens };
  }
  return { success: false, user: null, tokens: null };
};

// Get current user role from token
export const getUserRoleFromToken = (accessToken: string): string | null => {
  const payload = decodeToken(accessToken);
  return payload?.role || null;
};

// Check if user has required permission
export const hasPermission = (
  userRole: string,
  module: string,
  requiredLevel: 'View' | 'Full'
): boolean => {
  const role = roles.find((r) => r.name === userRole);
  if (!role) return false;

  const permission = role.permissions[module];
  if (!permission || permission === 'None') return false;
  if (requiredLevel === 'View') return permission === 'View' || permission === 'Full';
  return permission === 'Full';
};
