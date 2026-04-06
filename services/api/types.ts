/**
 * API Response Types - Standard response format for all API calls
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  error: ApiError | null;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  details: string;
}

export interface ApiMeta {
  page?: number;
  perPage?: number;
  total?: number;
  totalPages?: number;
}

export interface PaginatedRequest {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  filters?: Record<string, string[]>;
}

// Standard error codes
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
} as const;
