import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Listings API
export const listingsAPI = {
  getAll: (params) => api.get('/listings', { params }),
  getById: (id) => api.get(`/listings/${id}`),
  create: (data) => api.post('/listings', data),
  update: (id, data) => api.put(`/listings/${id}`, data),
  delete: (id) => api.delete(`/listings/${id}`),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
};

// Users API
export const usersAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (id, data) => api.put(`/users/${id}`, data),
  getListings: (id) => api.get(`/users/${id}/listings`),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  listUsers: (params) => api.get('/admin/users/list', { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  listListings: (params) => api.get('/admin/listings', { params }),
  removeListing: (id, data) => api.delete(`/admin/listings/${id}`, { data }),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
};

export default api;
