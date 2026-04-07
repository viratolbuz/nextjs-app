/**
 * Invite Store — localStorage-based bridge between admin invite and user signup.
 * Simulates backend invite/signup flow without a real server.
 */

import type { User } from '@/data/mockData';

const INVITES_KEY = 'pms_invites';
const SIGNUPS_KEY = 'pms_signups';
const PASSWORDS_KEY = 'pms_passwords';
const PUBLISHED_APP_URL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')) ||
  'https://insight-buddy-71.lovable.app';
const INVITE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const toBase64Url = (value: string) =>
  btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

const fromBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return atob(`${normalized}${padding}`);
};

interface InviteTokenPayload {
  email: string;
  sentAt: string;
  expiresAt: string;
  nonce: string;
}

const buildInviteToken = (email: string, sentAt = new Date().toISOString()) => {
  const issuedAt = new Date(sentAt);
  const payload: InviteTokenPayload = {
    email: normalizeEmail(email),
    sentAt: issuedAt.toISOString(),
    expiresAt: new Date(issuedAt.getTime() + INVITE_EXPIRY_MS).toISOString(),
    nonce:
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `invite-${Date.now()}`,
  };

  return toBase64Url(JSON.stringify(payload));
};

const parseInviteToken = (token: string | null | undefined): InviteTokenPayload | null => {
  if (!token) return null;

  try {
    const decoded = fromBase64Url(token);

    try {
      const parsed = JSON.parse(decoded) as Partial<InviteTokenPayload>;
      if (typeof parsed.email !== 'string' || typeof parsed.sentAt !== 'string') return null;

      return {
        email: normalizeEmail(parsed.email),
        sentAt: parsed.sentAt,
        expiresAt:
          typeof parsed.expiresAt === 'string'
            ? parsed.expiresAt
            : new Date(new Date(parsed.sentAt).getTime() + INVITE_EXPIRY_MS).toISOString(),
        nonce: typeof parsed.nonce === 'string' ? parsed.nonce : 'legacy-invite',
      };
    } catch {
      const [legacyEmail, legacyTimestamp] = decoded.split(':');
      const timestamp = Number(legacyTimestamp);

      if (!legacyEmail || !Number.isFinite(timestamp)) return null;

      return {
        email: normalizeEmail(legacyEmail),
        sentAt: new Date(timestamp).toISOString(),
        expiresAt: new Date(timestamp + INVITE_EXPIRY_MS).toISOString(),
        nonce: 'legacy-invite',
      };
    }
  } catch {
    return null;
  }
};

const isInviteExpired = (invite: Pick<InviteTokenPayload, 'expiresAt'>) =>
  new Date(invite.expiresAt).getTime() < Date.now();

const resolveSignupBaseUrl = () => {
  if (typeof window === 'undefined') return PUBLISHED_APP_URL;

  const { origin } = window.location;
  const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');

  return isLocalhost ? PUBLISHED_APP_URL : origin;
};

export interface Invite {
  email: string;
  sentAt: string;
  token: string;
  role: string;
}

export interface SignupData {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  profilePicture: string | null; // base64 or null
  createdAt: string;
}

// ---- Invites ----
export const getInvites = (): Invite[] => {
  try { return JSON.parse(localStorage.getItem(INVITES_KEY) || '[]'); }
  catch { return []; }
};

export const addInvite = (email: string, role: string = 'User'): Invite => {
  const normalizedEmail = normalizeEmail(email);
  const invites = getInvites().filter(invite => invite.email.toLowerCase() !== normalizedEmail);
  const sentAt = new Date().toISOString();
  const invite: Invite = { email: normalizedEmail, sentAt, token: buildInviteToken(normalizedEmail, sentAt), role };
  invites.unshift(invite);
  localStorage.setItem(INVITES_KEY, JSON.stringify(invites));
  return invite;
};

export const getInviteByEmail = (email: string): Invite | undefined => {
  const normalizedEmail = normalizeEmail(email);
  return getInvites().find(invite => invite.email.toLowerCase() === normalizedEmail);
};

export const getInviteFromToken = (token: string | null | undefined): Invite | null => {
  const parsed = parseInviteToken(token);
  if (!parsed || isInviteExpired(parsed)) return null;

  // Look up stored invite to get role
  const storedInvite = getInviteByEmail(parsed.email);
  return {
    email: parsed.email,
    sentAt: parsed.sentAt,
    token: token || '',
    role: storedInvite?.role || 'User',
  };
};

export const isInvited = (email: string, token?: string | null): boolean => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return false;

  const tokenInvite = getInviteFromToken(token);
  if (tokenInvite && tokenInvite.email === normalizedEmail) return true;

  const storedInvite = getInviteByEmail(normalizedEmail);
  if (!storedInvite) return false;

  const parsedStoredInvite = parseInviteToken(storedInvite.token);
  if (parsedStoredInvite && isInviteExpired(parsedStoredInvite)) return false;

  return !token || token === storedInvite.token;
};

export const getInviteEmailFromToken = (token: string | null | undefined): string => {
  return getInviteFromToken(token)?.email || '';
};

// ---- Signups ----
export const getSignups = (): SignupData[] => {
  try { return JSON.parse(localStorage.getItem(SIGNUPS_KEY) || '[]'); }
  catch { return []; }
};

export const addSignup = (data: Omit<SignupData, 'id' | 'createdAt'>): SignupData => {
  const signups = getSignups();
  const signup: SignupData = {
    ...data,
    email: normalizeEmail(data.email),
    id: `signup-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  signups.push(signup);
  localStorage.setItem(SIGNUPS_KEY, JSON.stringify(signups));
  return signup;
};

export const getSignupByEmail = (email: string): SignupData | undefined => {
  const normalizedEmail = normalizeEmail(email);
  return getSignups().find(s => s.email.toLowerCase() === normalizedEmail);
};

// Convert signup to User object for the users list
export const signupToUser = (s: SignupData): User => {
  // Get assigned role from invite
  const invite = getInviteByEmail(s.email);
  const statusUpdates = JSON.parse(localStorage.getItem('pms_user_status') || '{}');
  const role = statusUpdates[`${s.email.toLowerCase()}_role`] || invite?.role || 'User';
  return {
    id: s.id,
    name: s.fullName,
    email: s.email,
    role,
    avatar: '',
    projects: 0,
    status: 'Active',
    lastLogin: 'Never',
    phone: s.mobile,
    department: '',
  };
};

// Store passwords (simulated)
export const storePassword = (email: string, password: string) => {
  const passwords = JSON.parse(localStorage.getItem(PASSWORDS_KEY) || '{}');
  passwords[normalizeEmail(email)] = password;
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
};

export const verifyPassword = (email: string, password: string): boolean => {
  const passwords = JSON.parse(localStorage.getItem(PASSWORDS_KEY) || '{}');
  return passwords[normalizeEmail(email)] === password;
};

// Generate signup link
export const generateSignupLink = (email: string, token?: string): string => {
  const normalizedEmail = normalizeEmail(email);
  const params = new URLSearchParams({
    email: normalizedEmail,
    token: token || buildInviteToken(normalizedEmail),
  });

  return `${resolveSignupBaseUrl()}/signup?${params.toString()}`;
};
