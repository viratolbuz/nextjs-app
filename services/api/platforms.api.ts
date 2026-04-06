/**
 * Platforms API Service - Mock backend simulation
 */
import { platforms as mockPlatforms } from '@/data/mockData';
import type { Platform } from '@/types';
import type { ApiResponse } from './types';
import { delay, success, error } from './helpers';
import { ERROR_CODES } from './types';

let platformsStore = [...mockPlatforms];

export const platformsApi = {
  async getAll(): Promise<ApiResponse<Platform[]>> {
    await delay();
    return success([...platformsStore], 'Platforms fetched successfully');
  },

  async create(data: Partial<Platform>): Promise<ApiResponse<Platform>> {
    await delay(500);
    const np: Platform = {
      id: String(Date.now()),
      name: data.name || '',
      icon: (data.name || 'P')[0].toUpperCase(),
      channels: data.channels || [],
      status: data.status || 'Connected',
      projects: 0,
      spendMTD: '₹0',
      avgROAS: '0x',
      color: 'hsl(var(--primary))',
    };
    platformsStore = [...platformsStore, np];
    return success(np, 'Platform created successfully');
  },

  async update(id: string, data: Partial<Platform>): Promise<ApiResponse<Platform>> {
    await delay(500);
    const idx = platformsStore.findIndex(p => p.id === id);
    if (idx === -1) return error(ERROR_CODES.NOT_FOUND, 'Platform not found');
    platformsStore[idx] = { ...platformsStore[idx], ...data };
    return success(platformsStore[idx], 'Platform updated successfully');
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await delay(500);
    platformsStore = platformsStore.filter(p => p.id !== id);
    return success(null, 'Platform deleted successfully');
  },
};
