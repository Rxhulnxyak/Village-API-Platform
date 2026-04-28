import axios from 'axios';
import { useAuthStore } from '../store';
import { DashboardStats, ChartDataPoint, User } from '../types/admin';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get('/v1/admin/stats');
    return data;
  },
  
  getRequestsChart: async (days: number): Promise<ChartDataPoint[]> => {
    // This endpoint might need implementation in adminRoutes.ts
    const { data } = await api.get(`/v1/admin/charts/requests?days=${days}`);
    return data;
  },

  getUsers: async (): Promise<User[]> => {
    const { data } = await api.get('/v1/admin/users');
    return data;
  },

  getTopStates: async (): Promise<any[]> => {
    const { data } = await api.get('/v1/admin/top-states');
    return data;
  },

  getPlanDistribution: async (): Promise<any[]> => {
    const { data } = await api.get('/v1/admin/plans');
    return data;
  },

  updateUserStatus: async (userId: string, status: string): Promise<User> => {
    const { data } = await api.post(`/v1/admin/users/${userId}/status`, { status });
    return data;
  }
};
