/**
 * Simulated JWT Service
 * In production, replace with real JWT library (jsonwebtoken)
 * This simulates token creation, validation, and refresh for demo purposes
 */

import type { JWTPayload, AuthTokens, User } from '@/types';

const JWT_SECRET = 'pms-demo-secret-key-2026'; 
const ACCESS_TOKEN_EXPIRY = 60 * 60 * 1000; 
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; 

const base64Encode = (data: string): string => {
  return btoa(encodeURIComponent(data));
};

const base64Decode = (encoded: string): string => {
  try {
    return decodeURIComponent(atob(encoded));
  } catch {
    return '';
  }
};

const createToken = (payload: JWTPayload): string => {
  const header = base64Encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64Encode(JSON.stringify(payload));
  const signature = base64Encode(`${header}.${body}.${JWT_SECRET}`);
  return `${header}.${body}.${signature}`;
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(base64Decode(parts[1]));
    return payload as JWTPayload;
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const payload = decodeToken(token);
  if (!payload) return true;
  return Date.now() > payload.exp;
};

export const generateTokens = (user: User): AuthTokens => {
  const now = Date.now();

  const accessPayload: JWTPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    iat: now,
    exp: now + ACCESS_TOKEN_EXPIRY,
  };

  const refreshPayload: JWTPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    iat: now,
    exp: now + REFRESH_TOKEN_EXPIRY,
  };

  return {
    accessToken: createToken(accessPayload),
    refreshToken: createToken(refreshPayload),
  };
};

export const refreshAccessToken = (refreshToken: string, user: User): AuthTokens | null => {
  if (isTokenExpired(refreshToken)) return null;

  return generateTokens(user);
};

const TOKEN_KEY = 'pms-auth-tokens';
const USER_KEY = 'pms-auth-user';

export const saveTokens = (tokens: AuthTokens): void => {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
};

export const getStoredTokens = (): AuthTokens | null => {
  const stored = localStorage.getItem(TOKEN_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const saveUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getStoredUser = (): User | null => {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const clearAuthStorage = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('pms-logged-in');
  localStorage.removeItem('pms-user');
};

export const validateSession = (): { user: User | null; tokens: AuthTokens | null; valid: boolean } => {
  const tokens = getStoredTokens();
  const user = getStoredUser();

  if (!tokens || !user) return { user: null, tokens: null, valid: false };

  if (!isTokenExpired(tokens.accessToken)) {
    return { user, tokens, valid: true };
  }

  if (!isTokenExpired(tokens.refreshToken)) {
    const newTokens = refreshAccessToken(tokens.refreshToken, user);
    if (newTokens) {
      saveTokens(newTokens);
      return { user, tokens: newTokens, valid: true };
    }
  }

  clearAuthStorage();
  return { user: null, tokens: null, valid: false };
};
