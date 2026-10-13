import axios from 'axios';
import {
  AdminUser,
  Article,
  Author,
  Category,
  Comment,
  DashboardStats,
  MediaAsset,
  UserRole,
} from '../types/index.js';

const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL as string) || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('techquo_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect if checking login credentials
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem('techquo_admin_token');
        localStorage.removeItem('techquo_admin_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authApi = {
  login: async (credentials: { email: string; password: string; rememberMe?: boolean }) => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data;
  },
  logout: async () => {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  forgotPassword: async (email: string) => {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  },
};

// ==================== ARTICLES API ====================
export const articleApi = {
  getAdminArticles: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  }) => {
    const res = await apiClient.get('/admin/articles', { params });
    return res.data;
  },
  getArticle: async (id: string) => {
    const res = await apiClient.get(`/admin/articles/${id}`);
    return res.data;
  },
  createArticle: async (data: Partial<Article>) => {
    const res = await apiClient.post('/admin/articles', data);
    return res.data;
  },
  updateArticle: async (id: string, data: Partial<Article>) => {
    const res = await apiClient.put(`/admin/articles/${id}`, data);
    return res.data;
  },
  publishArticle: async (id: string) => {
    const res = await apiClient.post(`/admin/articles/${id}/publish`);
    return res.data;
  },
  unpublishArticle: async (id: string) => {
    const res = await apiClient.post(`/admin/articles/${id}/unpublish`);
    return res.data;
  },
  deleteArticle: async (id: string) => {
    const res = await apiClient.delete(`/admin/articles/${id}`);
    return res.data;
  },
};

// ==================== CATEGORIES API ====================
export const categoryApi = {
  getCategories: async () => {
    const res = await apiClient.get('/categories');
    return res.data;
  },
  createCategory: async (data: { name: string; slug?: string; description?: string; icon?: string }) => {
    const res = await apiClient.post('/admin/categories', data);
    return res.data;
  },
  updateCategory: async (
    id: string,
    data: { name?: string; slug?: string; description?: string; icon?: string }
  ) => {
    const res = await apiClient.put(`/admin/categories/${id}`, data);
    return res.data;
  },
  deleteCategory: async (id: string) => {
    const res = await apiClient.delete(`/admin/categories/${id}`);
    return res.data;
  },
};

// ==================== AUTHORS API ====================
export const authorApi = {
  getAuthors: async () => {
    const res = await apiClient.get('/authors');
    return res.data;
  },
  createAuthor: async (data: Partial<Author>) => {
    const res = await apiClient.post('/admin/authors', data);
    return res.data;
  },
  updateAuthor: async (id: string, data: Partial<Author>) => {
    const res = await apiClient.put(`/admin/authors/${id}`, data);
    return res.data;
  },
  deleteAuthor: async (id: string, reassignTo?: string) => {
    const res = await apiClient.delete(`/admin/authors/${id}`, {
      params: reassignTo ? { reassignTo } : undefined,
    });
    return res.data;
  },
};

// ==================== MEDIA / CLOUDINARY API ====================
export const mediaApi = {
  getMedia: async (params?: { page?: number; limit?: number }) => {
    const res = await apiClient.get('/admin/media', { params });
    return res.data;
  },
  uploadMedia: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/admin/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  deleteMedia: async (id: string) => {
    const res = await apiClient.delete(`/admin/media/${id}`);
    return res.data;
  },
};

// ==================== COMMENTS API ====================
export const commentApi = {
  getComments: async (params?: { status?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get('/admin/comments', { params });
    return res.data;
  },
  approveComment: async (id: string) => {
    const res = await apiClient.post(`/admin/comments/${id}/approve`);
    return res.data;
  },
  rejectComment: async (id: string) => {
    const res = await apiClient.post(`/admin/comments/${id}/reject`);
    return res.data;
  },
  deleteComment: async (id: string) => {
    const res = await apiClient.delete(`/admin/comments/${id}`);
    return res.data;
  },
};

// ==================== USERS API ====================
export const userApi = {
  getUsers: async () => {
    const res = await apiClient.get('/admin/users');
    return res.data;
  },
  createUser: async (data: { name: string; email: string; password: string; role: UserRole }) => {
    const res = await apiClient.post('/admin/users', data);
    return res.data;
  },
  updateUserRole: async (id: string, role: UserRole) => {
    const res = await apiClient.patch(`/admin/users/${id}/role`, { role });
    return res.data;
  },
  toggleUserStatus: async (id: string) => {
    const res = await apiClient.patch(`/admin/users/${id}/toggle-status`);
    return res.data;
  },
  deleteUser: async (id: string) => {
    const res = await apiClient.delete(`/admin/users/${id}`);
    return res.data;
  },
};

// ==================== ANALYTICS API ====================
export const analyticsApi = {
  getDashboardStats: async (period: string = '30d'): Promise<{ success: boolean; data: DashboardStats }> => {
    const res = await apiClient.get('/admin/analytics/dashboard', { params: { period } });
    return res.data;
  },
  getViewsTimeline: async (period: string = '30d') => {
    const res = await apiClient.get('/admin/analytics/views', { params: { period } });
    return res.data;
  },
  getTopArticles: async (limit: number = 5) => {
    const res = await apiClient.get('/admin/analytics/top-articles', { params: { limit } });
    return res.data;
  },
};

// ==================== SETTINGS API ====================
export const settingsApi = {
  getSettings: async () => {
    const res = await apiClient.get('/admin/settings');
    return res.data;
  },
  updateSettings: async (settings: Record<string, any>) => {
    const res = await apiClient.put('/admin/settings', settings);
    return res.data;
  },
  changePassword: async (passwords: { currentPassword: string; newPassword: string }) => {
    const res = await apiClient.post('/admin/settings/change-password', passwords);
    return res.data;
  },
};
