/**
 * Zustand User Store — Single source of truth for all user management.
 * Handles: invites, signups, authentication, proxy login, role assignment.
 * Persists to localStorage and syncs across components reactively.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { users as mockUsers, roles } from '@/data/mockData';
import type { User } from '@/data/mockData';

// ---- Types ----
export interface Invite {
  email: string;
  role: string;
  token: string;
  sentAt: string;
}

export interface RegisteredUser {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  profilePicture: string | null;
  password: string;
  role: string;
  createdAt: string;
}

interface UserStore {
  // Invites
  invites: Invite[];
  addInvite: (email: string, role: string) => Invite;
  getInviteByEmail: (email: string) => Invite | undefined;

  // Registered users (from signup)
  registeredUsers: RegisteredUser[];
  registerUser: (data: Omit<RegisteredUser, 'id' | 'createdAt'>) => RegisteredUser;
  getRegisteredByEmail: (email: string) => RegisteredUser | undefined;
  isEmailRegistered: (email: string) => boolean;
  updateUserRole: (email: string, role: string) => void;

  // Get all users (mock + registered) as User[]
  getAllUsers: () => User[];

  // Auth
  verifyLogin: (email: string, password: string) => User | null;
}

const normalize = (e: string) => e.trim().toLowerCase();

const INVITE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

const toBase64Url = (value: string) =>
  btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

const fromBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return atob(`${normalized}${padding}`);
};

// Build a self-contained token with email + expiry
export const buildInviteToken = (email: string, role: string) => {
  const payload = {
    email: normalize(email),
    role,
    sentAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + INVITE_EXPIRY_MS).toISOString(),
    nonce: crypto?.randomUUID?.() || `inv-${Date.now()}`,
  };
  return toBase64Url(JSON.stringify(payload));
};

// Parse and validate a token — works without localStorage
export const parseInviteToken = (token: string | null | undefined): { email: string; role: string; expired: boolean } | null => {
  if (!token) return null;
  try {
    const decoded = fromBase64Url(token);
    const parsed = JSON.parse(decoded);
    if (typeof parsed.email !== 'string') return null;
    const expired = new Date(parsed.expiresAt).getTime() < Date.now();
    return { email: normalize(parsed.email), role: parsed.role || 'User', expired };
  } catch {
    // Try legacy format
    try {
      const decoded = fromBase64Url(token);
      const [email, ts] = decoded.split(':');
      if (!email || !Number.isFinite(Number(ts))) return null;
      const expired = Number(ts) + INVITE_EXPIRY_MS < Date.now();
      return { email: normalize(email), role: 'User', expired };
    } catch {
      return null;
    }
  }
};

export const resolveSignupBaseUrl = () => {
  if (typeof window === 'undefined') return 'https://insight-buddy-71.lovable.app';
  const { origin } = window.location;
  return (origin.includes('localhost') || origin.includes('127.0.0.1'))
    ? 'https://insight-buddy-71.lovable.app'
    : origin;
};

export const generateSignupLink = (email: string, token: string) => {
  const params = new URLSearchParams({ email: normalize(email), token });
  return `${resolveSignupBaseUrl()}/signup?${params.toString()}`;
};

// Convert RegisteredUser → User (for display in user list)
const registeredToUser = (r: RegisteredUser): User => ({
  id: r.id,
  name: r.fullName,
  email: r.email,
  role: r.role,
  avatar: '',
  projects: 0,
  status: 'Active',
  lastLogin: 'Never',
  phone: r.mobile,
  department: '',
});

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      invites: [],
      registeredUsers: [],

      addInvite: (email, role) => {
        const normalizedEmail = normalize(email);
        const token = buildInviteToken(normalizedEmail, role);
        const invite: Invite = {
          email: normalizedEmail,
          role,
          token,
          sentAt: new Date().toISOString(),
        };
        set(state => ({
          invites: [invite, ...state.invites.filter(i => i.email !== normalizedEmail)],
        }));
        return invite;
      },

      getInviteByEmail: (email) => {
        return get().invites.find(i => i.email === normalize(email));
      },

      registerUser: (data) => {
        const user: RegisteredUser = {
          ...data,
          email: normalize(data.email),
          id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          createdAt: new Date().toISOString(),
        };
        set(state => ({
          registeredUsers: [...state.registeredUsers.filter(u => u.email !== user.email), user],
        }));
        return user;
      },

      getRegisteredByEmail: (email) => {
        return get().registeredUsers.find(u => u.email === normalize(email));
      },

      isEmailRegistered: (email) => {
        return get().registeredUsers.some(u => u.email === normalize(email));
      },

      updateUserRole: (email, role) => {
        set(state => ({
          registeredUsers: state.registeredUsers.map(u =>
            u.email === normalize(email) ? { ...u, role } : u
          ),
        }));
      },

      getAllUsers: () => {
        const registered = get().registeredUsers;
        const mockEmails = new Set(mockUsers.map(u => u.email.toLowerCase()));
        const signupUsers = registered
          .filter(r => !mockEmails.has(r.email.toLowerCase()))
          .map(registeredToUser);
        return [...mockUsers, ...signupUsers];
      },

      verifyLogin: (email, password) => {
        const normalizedEmail = normalize(email);

        // Check mock users first (demo: any password works for mock users)
        const mockUser = mockUsers.find(u => u.email.toLowerCase() === normalizedEmail);
        if (mockUser) return mockUser;

        // Check registered users with password verification
        const registered = get().getRegisteredByEmail(normalizedEmail);
        if (registered && registered.password === password) {
          return registeredToUser(registered);
        }

        return null;
      },
    }),
    {
      name: 'pms-user-store',
      partialize: (state) => ({
        invites: state.invites,
        registeredUsers: state.registeredUsers,
      }),
    }
  )
);