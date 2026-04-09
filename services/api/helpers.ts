/**
 * API Helpers - Simulate async API calls with realistic delays
 */
import type { ApiResponse, ApiMeta } from './types';
import { ERROR_CODES } from './types';
import { roles } from '@/data/mockData';

const SIMULATED_DELAY = 300; 

export const delay = (ms: number = SIMULATED_DELAY) => new Promise(resolve => setTimeout(resolve, ms));

export function success<T>(data: T, message = 'Success', meta?: ApiMeta): ApiResponse<T> {
  return { success: true, message, data, error: null, meta };
}

export function error<T = null>(code: string, details: string, message = 'Request failed'): ApiResponse<T> {
  return { success: false, message, data: null, error: { code, details } };
}

export function paginate<T>(items: T[], page: number, perPage: number): { items: T[]; meta: ApiMeta } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    meta: { page: safePage, perPage, total, totalPages },
  };
}

export function checkPermission(userRole: string, requiredPermission: string): ApiResponse | null {
  const role = roles.find((r) => r.name === userRole);
  if (!role) {
    return error(ERROR_CODES.UNAUTHORIZED, 'Invalid role');
  }
  const perm = role.permissions[requiredPermission];
  if (!perm || perm === 'None') {
    return error(ERROR_CODES.PERMISSION_DENIED, `Missing permission: ${requiredPermission}`);
  }
  return null; 
}
