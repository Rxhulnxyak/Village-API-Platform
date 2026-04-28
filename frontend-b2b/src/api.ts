import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('b2b_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const b2bApi = {
  login: (credentials: any) => api.post('/v1/b2b/auth/login', credentials),
  register: (data: any) => api.post('/v1/b2b/auth/register', data),
  
  getKeys: () => api.get('/v1/b2b/keys'),
  createKey: (name: string) => api.post('/v1/b2b/keys', { name }),
  deleteKey: (id: string) => api.delete(`/v1/b2b/keys/${id}`),
  
  getUsage: () => api.get('/v1/b2b/usage'),
  getProfile: () => api.get('/v1/b2b/profile'),
};
