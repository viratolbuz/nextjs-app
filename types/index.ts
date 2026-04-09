
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  projects: number;
  status: 'Active' | 'Inactive' | 'Pending';
  lastLogin: string;
  phone?: string;
  department?: string;
}

export interface Platform {
  id: string;
  name: string;
  icon: string;
  channels: string[];
  status: 'Connected' | 'Disconnected' | 'Expiring';
  projects: number;
  spendMTD: string;
  avgROAS: string;
  color: string;
  tokenExpiry?: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  type: string;
  platforms: string[];
  manager: string;
  budget: string;
  budgetUsed: number;
  status: 'Active' | 'Hold' | 'Inactive';
  spend: string;
  revenue: string;
  leads: number;
  cpl: string;
  roas: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceEntry {
  id: string;
  date: string;
  project: string;
  platform: string;
  spend: number;
  leads: number;
  cpl: number;
  revenue: number;
  roas: number;
}

export interface Role {
  id: string;
  name: string;
  type: 'System' | 'Custom';
  userCount: number;
  permissions: Record<string, 'Full' | 'View' | 'None'>;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  time: string;
  read: boolean;
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  name: string;
  iat: number;
  exp: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  currentUser: User | null;
  proxyUser: User | null;
  tokens: AuthTokens | null;
  loading: boolean;
  error: string | null;
}

export interface PerformanceTrendItem {
  month: string;
  spend: number;
  revenue: number;
  leads: number;
  roas: number;
  cpa?: number;
}

export interface QuarterlySpendItem {
  quarter: string;
  spend: number;
  revenue: number;
  users?: string[];
}

export interface PlatformSpendShareItem {
  name: string;
  value: number;
  spend: string;
}

export interface UserMonthlySpendItem {
  name: string;
  apr: number; may: number; jun: number; jul: number;
  aug: number; sep: number; oct: number; nov: number;
  dec: number; jan: number; feb: number; mar: number;
  total: number;
}

export interface QuarterlyUserSpendItem {
  name: string;
  q1: number; q2: number; q3: number; q4: number;
  total: number;
}
