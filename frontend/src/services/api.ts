import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await api.post('/auth/refresh', { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          return api(original);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  signup: (email: string, password: string) =>
    api.post('/auth/signup', { email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  refresh: (token: string) =>
    api.post('/auth/refresh', { refreshToken: token }),
};

export const transactionsAPI = {
  list: (from?: string, to?: string) =>
    api.get('/transactions', { params: { from, to } }),
  create: (data: any) =>
    api.post('/transactions', data),
  get: (id: string) =>
    api.get(`/transactions/${id}`),
  update: (id: string, data: any) =>
    api.patch(`/transactions/${id}`, data),
  delete: (id: string) =>
    api.delete(`/transactions/${id}`),
};

export const paymentsAPI = {
  checkout: (planId: string) =>
    api.post('/payments/checkout', { planId }),
};

export const openFinanceAPI = {
  getAuthUrl: () =>
    api.get('/open-finance/authorize'),
  callback: (code: string) =>
    api.get('/open-finance/callback', { params: { code } }),
};

export default api;
