/**
 * Projects API Service - Mock backend simulation
 */
import { projects as mockProjects } from '@/data/mockData';
import type { Project } from '@/types';
import type { ApiResponse, PaginatedRequest } from './types';
import { delay, success, error, paginate } from './helpers';
import { ERROR_CODES } from './types';

let projectsStore = [...mockProjects];

export const projectsApi = {
  async getAll(params?: PaginatedRequest): Promise<ApiResponse<Project[]>> {
    await delay();
    let list = [...projectsStore];

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q));
    }

    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, values]) => {
        if (values.length > 0) {
          list = list.filter(p => values.includes((p as any)[key]));
        }
      });
    }

    if (params?.sortBy) {
      list.sort((a, b) => {
        if (params.sortBy === 'name') return a.name.localeCompare(b.name);
        if (params.sortBy === 'budget') return b.budgetUsed - a.budgetUsed;
        if (params.sortBy === 'status') return a.status.localeCompare(b.status);
        if (params.sortBy === 'created') return b.createdAt.localeCompare(a.createdAt);
        return 0;
      });
    }

    if (params?.page && params?.perPage) {
      const { items, meta } = paginate(list, params.page, params.perPage);
      return success(items, 'Projects fetched successfully', meta);
    }

    return success(list, 'Projects fetched successfully', { total: list.length });
  },

  async getById(id: string): Promise<ApiResponse<Project>> {
    await delay();
    const project = projectsStore.find(p => p.id === id);
    if (!project) return error(ERROR_CODES.NOT_FOUND, `Project with ID ${id} not found`);
    return success(project, 'Project fetched successfully');
  },

  async create(data: Partial<Project>): Promise<ApiResponse<Project>> {
    await delay(500);
    const newProject: Project = {
      id: String(Date.now()),
      name: data.name || '',
      client: data.client || '',
      type: data.type || '',
      platforms: data.platforms || [],
      manager: data.manager || '',
      user: data.user || '',
      budget: data.budget || '₹0',
      budgetUsed: 0,
      status: data.status || 'Active',
      spend: '₹0',
      revenue: '₹0',
      leads: 0,
      cpl: '₹0',
      roas: '0x',
      country: data.country || 'India',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    projectsStore = [...projectsStore, newProject];
    return success(newProject, 'Project created successfully');
  },

  async update(id: string, data: Partial<Project>): Promise<ApiResponse<Project>> {
    await delay(500);
    const idx = projectsStore.findIndex(p => p.id === id);
    if (idx === -1) return error(ERROR_CODES.NOT_FOUND, `Project with ID ${id} not found`);
    projectsStore[idx] = { ...projectsStore[idx], ...data };
    return success(projectsStore[idx], 'Project updated successfully');
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await delay(500);
    projectsStore = projectsStore.filter(p => p.id !== id);
    return success(null, 'Project deleted successfully');
  },
};
