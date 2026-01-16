import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const { access } = response.data;
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', access);
          }
          error.config.headers.Authorization = `Bearer ${access}`;
          return api.request(error.config);
        } catch (refreshError) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login/', { email, password }),
  register: (data: any) =>
    api.post('/auth/register/', data),
  logout: () =>
    api.post('/auth/logout/'),
  getCurrentUser: () =>
    api.get('/auth/profile/'),
};

// Products endpoints
export const productsAPI = {
  list: (params?: any) =>
    api.get('/products/', { params }),
  get: (slug: string) =>
    api.get(`/products/${slug}/`),
  getCategories: () =>
    api.get('/products/categories/'),
};

// Cart endpoints
export const cartAPI = {
  get: () =>
    api.get('/orders/cart/my_cart/'),
  addItem: (productId: number, quantity: number) =>
    api.post('/orders/cart/add_item/', { product_id: productId, quantity }),
  updateItem: (itemId: number, quantity: number) =>
    api.post('/orders/cart/update_item/', { item_id: itemId, quantity }),
  removeItem: (itemId: number) =>
    api.post('/orders/cart/remove_item/', { item_id: itemId }),
  clear: () =>
    api.post('/orders/cart/clear/'),
};

// Orders endpoints
export const ordersAPI = {
  create: (data: any) =>
    api.post('/orders/create_order/', data),
  list: () =>
    api.get('/orders/'),
  get: (id: number) =>
    api.get(`/orders/${id}/`),
  getCodes: (id: number) =>
    api.get(`/orders/${id}/codes/`),
};

// Referrals endpoints
export const referralsAPI = {
  getStats: () =>
    api.get('/referrals/stats/'),
  getCode: () =>
    api.get('/referrals/code/'),
};

// Discounts endpoints
export const discountsAPI = {
  validate: (code: string) =>
    api.post('/discounts/validate/', { code }),
};

// Support endpoints
export const supportAPI = {
  list: () =>
    api.get('/support/tickets/'),
  get: (id: number) =>
    api.get(`/support/tickets/${id}/`),
  create: (data: any) =>
    api.post('/support/tickets/', data),
  addMessage: (ticketId: number, message: string) =>
    api.post(`/support/tickets/${ticketId}/add_message/`, { message }),
  markResolved: (ticketId: number) =>
    api.post(`/support/tickets/${ticketId}/mark_resolved/`),
  getUnreadCount: () =>
    api.get('/support/tickets/unread_count/'),
};

// User profile endpoints
export const userAPI = {
  getProfile: () =>
    api.get('/auth/profile/'),
  updateProfile: (data: any) =>
    api.patch('/auth/profile/update/', data),
  changePassword: (data: any) =>
    api.post('/auth/change-password/', data),
  verifyEmail: (token: string) =>
    api.post('/auth/verify-email/', { token }),
  requestPasswordReset: (email: string) =>
    api.post('/auth/password-reset/', { email }),
  confirmPasswordReset: (data: any) =>
    api.post('/auth/password-reset/confirm/', data),
};

// Admin endpoints (secured)
export const adminAPI = {
  // Stats
  getStats: () =>
    api.get('/admin/dashboard/stats/'),
  getRevenueChart: (days: number = 30) =>
    api.get(`/admin/dashboard/revenue_chart/?days=${days}`),
  getProductSales: () =>
    api.get('/admin/dashboard/product_sales/'),
  
  // Management
  updateExchangeRate: (rate: number) =>
    api.post('/admin/dashboard/update_exchange_rate/', { rate }),
  uploadCodes: (productId: number, codes: any[]) =>
    api.post('/admin/dashboard/upload_codes/', { product_id: productId, codes }),
  lockProduct: (productId: number, isLocked: boolean) =>
    api.post('/admin/dashboard/lock_product/', { product_id: productId, is_locked: isLocked }),
  
  // Action logs
  getActionLogs: (params?: any) =>
    api.get('/admin/action-logs/', { params }),
  
  // Management
  getAllOrders: (params?: any) =>
    api.get('/admin/dashboard/orders/', { params }),
  getAllUsers: (params?: any) =>
    api.get('/admin/dashboard/users/', { params }),
  
  // Export
  exportOrders: (params?: any) =>
    api.get('/admin/dashboard/export_orders/', { params, responseType: 'blob' }),
  exportUsers: (params?: any) =>
    api.get('/admin/dashboard/export_users/', { params, responseType: 'blob' }),
};

export default api;

