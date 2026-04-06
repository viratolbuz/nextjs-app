/**
 * Users API Service - Mock backend simulation
 */
import { users as mockUsers } from '@/data/mockData';
import type { User } from '@/types';
import type { ApiResponse, PaginatedRequest } from './types';
import { delay, success, error, paginate } from './helpers';
import { ERROR_CODES } from './types';

let usersStore = [...mockUsers];

export const usersApi = {
  async getAll(params?: PaginatedRequest): Promise<ApiResponse<User[]>> {
    await delay();
    let list = [...usersStore];

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }

    if (params?.filters?.role?.length) {
      list = list.filter(u => params.filters!.role.includes(u.role));
    }
    if (params?.filters?.status?.length) {
      list = list.filter(u => params.filters!.status.includes(u.status));
    }

    if (params?.sortBy) {
      list.sort((a, b) => {
        if (params.sortBy === 'name') return a.name.localeCompare(b.name);
        if (params.sortBy === 'role') return a.role.localeCompare(b.role);
        if (params.sortBy === 'projects') return b.projects - a.projects;
        return 0;
      });
    }

    if (params?.page && params?.perPage) {
      const { items, meta } = paginate(list, params.page, params.perPage);
      return success(items, 'Users fetched successfully', meta);
    }

    return success(list, 'Users fetched successfully', { total: list.length });
  },

  async getById(id: string): Promise<ApiResponse<User>> {
    await delay();
    const user = usersStore.find(u => u.id === id);
    if (!user) return error(ERROR_CODES.NOT_FOUND, `User with ID ${id} not found`);
    return success(user, 'User fetched successfully');
  },

  async create(data: Omit<User, 'id'>): Promise<ApiResponse<User>> {
    await delay(500);
    const exists = usersStore.find(u => u.email === data.email);
    if (exists) return error(ERROR_CODES.DUPLICATE_ENTRY, 'Email already exists');

    const newUser: User = { ...data, id: String(Date.now()) };
    usersStore = [...usersStore, newUser];
    return success(newUser, 'User created successfully');
  },

  async update(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    await delay(500);
    const idx = usersStore.findIndex(u => u.id === id);
    if (idx === -1) return error(ERROR_CODES.NOT_FOUND, `User with ID ${id} not found`);

    usersStore[idx] = { ...usersStore[idx], ...data };
    return success(usersStore[idx], 'User updated successfully');
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await delay(500);
    const idx = usersStore.findIndex(u => u.id === id);
    if (idx === -1) return error(ERROR_CODES.NOT_FOUND, `User with ID ${id} not found`);

    usersStore = usersStore.filter(u => u.id !== id);
    return success(null, 'User deleted successfully');
  },

  async export(format: 'csv' | 'json' = 'csv'): Promise<ApiResponse<string>> {
    await delay(800);
    if (format === 'csv') {
      const csv = [
        'Name,Email,Role,Projects,Status,Last Login,Phone',
        ...usersStore.map(u => `${u.name},${u.email},${u.role},${u.projects},${u.status},${u.lastLogin},${u.phone || ''}`),
      ].join('\n');
      return success(csv, 'Export generated successfully');
    }
    return success(JSON.stringify(usersStore, null, 2), 'Export generated successfully');
  },
};
