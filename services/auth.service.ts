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

export const loginUser = (email: string, _password: string): LoginResult => {
  const normalizedEmail = email.trim().toLowerCase();

  const mockUser = mockUsers.find(u => u.email.toLowerCase() === normalizedEmail);
  if (mockUser) {
    const tokens = generateTokens(mockUser);
    saveTokens(tokens);
    saveUser(mockUser);
    return { success: true, user: mockUser, tokens };
  }

  const store = useUserStore.getState();
  const registeredUser = store.getRegisteredByEmail(normalizedEmail);
  if (registeredUser && registeredUser.password === _password) {
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
    if (!mockUsers.find(u => u.id === user.id)) {
      mockUsers.push(user);
    }
    const tokens = generateTokens(user);
    saveTokens(tokens);
    saveUser(user);
    return { success: true, user, tokens };
  }

  return { success: false, user: null, tokens: null, error: 'Invalid email or password' };
};

export const logoutUser = (): void => {
  clearAuthStorage();
};

export const proxyLoginUser = (userId: string): User | null => {
  const mockUser = mockUsers.find(u => u.id === userId);
  if (mockUser) return mockUser;

  const store = useUserStore.getState();
  const allUsers = store.getAllUsers();
  const found = allUsers.find(u => u.id === userId);
  if (found) {
    if (!mockUsers.find(u => u.id === found.id)) {
      mockUsers.push(found);
    }
    return found;
  }
  return null;
};

export const restoreSession = (): LoginResult => {
  const { user, tokens, valid } = validateSession();
  if (valid && user && tokens) {
    return { success: true, user, tokens };
  }
  return { success: false, user: null, tokens: null };
};

export const getUserRoleFromToken = (accessToken: string): string | null => {
  const payload = decodeToken(accessToken);
  return payload?.role || null;
};

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
