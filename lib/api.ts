import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Turn an axios/DRF error into a human-readable message. DRF returns validation
 * errors keyed by field (e.g. {slug: ["already exists"]}), not always `detail`,
 * so a naive `data.detail` read hides the real cause behind a generic fallback.
 */
export function apiError(err: any, fallback = 'Something went wrong'): string {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;
  if (typeof data === 'string') return data;
  if (data.detail) return String(data.detail);
  if (data.error) return String(data.error);
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = (data as any)[firstKey];
    const msg = Array.isArray(val) ? val[0] : val;
    return firstKey === 'non_field_errors' ? String(msg) : `${firstKey}: ${msg}`;
  }
  return fallback;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token refresh management to prevent race conditions
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];
let refreshFailed = false;

export const resetRefreshState = () => {
  isRefreshing = false;
  refreshFailed = false;
  refreshSubscribers = [];
};

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const onRefreshFailed = () => {
  refreshFailed = true;
  refreshSubscribers = [];
  // Only redirect if we're not already on login/register page
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (!path.includes('/login') && !path.includes('/register') && 
        !path.includes('/forgot-password') && !path.includes('/reset-password') &&
        !path.includes('/verify-email')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
  }
};

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
    const originalRequest = error.config;
    
    // Skip refresh for login/register endpoints
    if (originalRequest.url?.includes('/auth/login/') || 
        originalRequest.url?.includes('/auth/register/') ||
        originalRequest.url?.includes('/auth/token/refresh/')) {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If refresh already failed, don't try again
      if (refreshFailed) {
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;
      
      if (isRefreshing) {
        // Wait for the refresh to complete
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api.request(originalRequest));
          });
        });
      }
      
      isRefreshing = true;
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const { access, refresh } = response.data;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', access);
            if (refresh) {
              localStorage.setItem('refresh_token', refresh);
            }
          }
          
          isRefreshing = false;
          refreshFailed = false;
          onTokenRefreshed(access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api.request(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          onRefreshFailed();
          return Promise.reject(refreshError);
        }
      } else {
        isRefreshing = false;
        onRefreshFailed();
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (email: string, password: string, captchaToken?: string) =>
    api.post('/auth/login/', { email, password, turnstile_token: captchaToken }),
  register: (data: any) =>
    api.post('/auth/register/', data),
  // SMS (sms.ir) phone login: request a code, then verify it to log in / sign up.
  smsStatus: () =>
    api.get('/auth/sms/status/'),
  smsRequestOtp: (phone: string) =>
    api.post('/auth/sms/request/', { phone }),
  smsVerifyOtp: (phone: string, code: string) =>
    api.post('/auth/sms/verify/', { phone, code }),
  logout: () =>
    api.post('/auth/logout/'),
  getCurrentUser: () =>
    api.get('/auth/profile/'),
  
  // OAuth / Social Login
  getOAuthUrls: () =>
    api.get('/auth/social/login/'),
  googleLogin: () =>
    api.get('/auth/social/google/'),
  discordLogin: () =>
    api.get('/auth/social/discord/'),
  socialCallback: (code: string, state: string) =>
    api.post('/auth/social/callback/', { code, state }),
};

// Products endpoints
export const productsAPI = {
  list: (params?: any) =>
    api.get('/products/', { params }),
  get: (slug: string) =>
    api.get(`/products/${slug}/`),
  getCategories: () =>
    api.get('/products/categories/'),
  getCountries: () =>
    api.get('/products/countries/'),
  getByCountry: (countryCode: string) =>
    api.get(`/products/by_country/?country_code=${countryCode}`),
  getDenominations: (productId: number) =>
    api.get(`/products/${productId}/denominations/`),
  getCardDetails: () =>
    api.get('/products/card_details/'),
  /** Cardtonic-style: { message, success, cardCategories } */
  getCardCategories: () =>
    api.get('/products/card/categories/'),
  
  // New Gift Card API endpoints (normalized dataset)
  /** Get all gift card brands, optionally filtered to those sold in a country */
  getBrands: (countryCode?: string) =>
    api.get('/products/brands/', countryCode ? { params: { country: countryCode } } : undefined),
  /** Get single brand details with countries */
  getBrand: (brandId: string) =>
    api.get(`/products/brands/${brandId}/`),
  /** Get brand details for dropdown (with countries) */
  getBrandDropdown: (brandId: string) =>
    api.get(`/products/brands/${brandId}/dropdown/`),
  /** Get all gift card countries */
  getGCCountries: () =>
    api.get('/products/gc-countries/'),
  /** Get card types for a brand/country combination */
  getCardTypes: (brandId: string, countryCode: string) =>
    api.get(`/products/card-types/?brand_id=${brandId}&country_code=${countryCode}`),
  /** Get full data for a brand (all countries and card types) */
  getBrandFullData: (brandId: string) =>
    api.get(`/products/brands/${brandId}/with_countries/`),
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
  directPurchase: (data: { product_id: number; denomination_id?: number; quantity: number; currency?: string }) =>
    api.post('/orders/direct_purchase/', data),
  list: () =>
    api.get('/orders/'),
  get: (id: number) =>
    api.get(`/orders/${id}/`),
  getCodes: (id: number) =>
    api.get(`/orders/${id}/codes/`),
  
  // Gift Card Purchase Requests
  createPurchaseRequest: (data: {
    brand_id: string;
    brand_name: string;
    country_code: string;
    country_name: string;
    card_type: string;
    card_type_id?: string;
    amount: number;
    quantity: number;
    currency?: string;
    discount_code?: string;
  }) =>
    api.post('/orders/purchase-requests/', data),
  getPurchaseRequests: () =>
    api.get('/orders/purchase-requests/'),
  getPurchaseRequest: (id: string) =>
    api.get(`/orders/purchase-requests/${id}/`),
  getPurchaseRequestCodes: (id: string) =>
    api.get(`/orders/purchase-requests/${id}/codes/`),
  
  // Payment endpoints
  initiatePayment: (id: string) =>
    api.post(`/orders/purchase-requests/${id}/initiate_payment/`),
  verifyPayment: (id: string, data: { authority?: string; Status?: string }) =>
    api.post(`/orders/purchase-requests/${id}/verify_payment/`, data),
  
  // Exchange rate
  getExchangeRate: () =>
    api.get('/orders/exchange-rate/'),
};

// Gift Card Submissions (Sell Flow)
export const kycAPI = {
  // Returns { status: 'not_submitted' } or the full KYC record
  getStatus: () => api.get('/auth/kyc/'),
  // data is a FormData with the identity fields + document_front/document_back/selfie
  submit: (data: FormData) =>
    api.post('/auth/kyc/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const submissionsAPI = {
  create: (data: FormData | any) => {
    const isFormData = data instanceof FormData;
    return api.post('/products/submissions/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
  },
  list: (params?: any) =>
    api.get('/products/submissions/', { params }),
  get: (id: number) =>
    api.get(`/products/submissions/${id}/`),
  calculateCredit: (amount: number) =>
    api.post('/products/submissions/calculate_credit/', { amount }),
  approve: (id: number) =>
    api.post(`/products/submissions/${id}/approve/`),
  reject: (id: number, reason: string) =>
    api.post(`/products/submissions/${id}/reject/`, { reason }),
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
  // Validate a code against an order amount (returns discount_amount + new_total)
  validate: (code: string, orderAmount: number) =>
    api.post('/discounts/validate/', { code, order_amount: orderAmount }),
};

// Admin discount management (staff only)
export const discountsAdminAPI = {
  list: () => api.get('/discounts/'),
  create: (data: any) => api.post('/discounts/', data),
  update: (id: number, data: any) => api.patch(`/discounts/${id}/`, data),
  remove: (id: number) => api.delete(`/discounts/${id}/`),
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
  updateStatus: (ticketId: number, status: string) =>
    api.post(`/support/tickets/${ticketId}/update_status/`, { status }),
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
  resendVerification: (email: string, captchaToken?: string) =>
    api.post('/auth/resend-verification/', { email, turnstile_token: captchaToken }),
  requestPasswordReset: (email: string, captchaToken?: string) =>
    api.post('/auth/password-reset/', { email, turnstile_token: captchaToken }),
  confirmPasswordReset: (data: any) =>
    api.post('/auth/password-reset/confirm/', data),
  getMyCodes: () =>
    api.get('/auth/my-codes/'),
  // Wallet
  getWallet: () =>
    api.get('/auth/wallet/'),
  // User transactions
  getPurchaseRequests: () =>
    api.get('/orders/purchase-requests/'),
  getSubmissions: () =>
    api.get('/products/submissions/'),
  getWithdrawals: () =>
    api.get('/auth/withdrawals/my/'),
};

// Wallet & Withdrawal endpoints
export const walletAPI = {
  // Bank Details
  getBankDetail: () =>
    api.get('/auth/bank-detail/'),
  saveBankDetail: (data: {
    bank_name: string;
    account_name?: string;
    account_holder_first_name?: string;
    account_holder_last_name?: string;
    account_number?: string;
    card_number?: string;
    iban?: string;
    branch?: string;
    swift_code?: string;
  }) =>
    api.post('/auth/bank-detail/', data),
  
  // Wallet
  getWallet: () =>
    api.get('/auth/wallet/'),
  getTransactions: () =>
    api.get('/auth/wallet/transactions/'),
  
  // Withdrawals
  createWithdrawal: (data: {
    amount: number;
    use_saved_bank?: boolean;
    bank_name?: string;
    account_name?: string;
    account_number?: string;
  }) =>
    api.post('/auth/withdrawals/', data),
  getMyWithdrawals: () =>
    api.get('/auth/withdrawals/my/'),
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
  getCurrentExchangeRate: () =>
    api.get('/admin/dashboard/get_current_exchange_rate/'),
  updateExchangeRate: (rate: number) =>
    api.post('/admin/dashboard/update_exchange_rate/', { rate }),
  getExchangeRateHistory: () =>
    api.get('/admin/dashboard/exchange_rate_history/'),
  
  // IRR Exchange Rate Management
  getCurrentIRRRate: () =>
    api.get('/admin/dashboard/get_current_irr_rate/'),
  updateIRRRate: (rate: number) =>
    api.post('/admin/dashboard/update_irr_rate/', { rate }),
  getIRRRateHistory: () =>
    api.get('/admin/dashboard/irr_rate_history/'),

  // Referral reward configuration
  getReferralReward: () =>
    api.get('/admin/dashboard/get_referral_reward/'),
  updateReferralReward: (amount: number) =>
    api.post('/admin/dashboard/update_referral_reward/', { amount }),

  uploadCodes: (productId: number, codes: any[]) =>
    api.post('/admin/dashboard/upload_codes/', { product_id: productId, codes }),
  lockProduct: (productId: number, isLocked: boolean) =>
    api.post('/admin/dashboard/lock_product/', { product_id: productId, is_locked: isLocked }),
  createProduct: (data: any) =>
    api.post('/admin/dashboard/create_product/', data),
  seedSampleProducts: () =>
    api.post('/admin/dashboard/seed_sample_products/'),
  
  // Action logs
  getActionLogs: (params?: any) =>
    api.get('/admin/action-logs/', { params }),
  
  // Orders Management
  getAllOrders: (params?: any) =>
    api.get('/admin/dashboard/orders/', { params }),
  getOrderDetail: (orderId: number) =>
    api.get(`/admin/dashboard/order-detail/?order_id=${orderId}`),
  updateOrderStatus: (orderId: number, status: string) =>
    api.post('/admin/dashboard/orders/update_status/', { order_id: orderId, status }),
  updatePaymentStatus: (orderId: number, paymentStatus: string) =>
    api.post('/admin/dashboard/orders/update_payment_status/', { order_id: orderId, payment_status: paymentStatus }),
  bulkUpdateOrderStatus: (orderIds: number[], status: string) =>
    api.post('/admin/dashboard/orders/bulk_update_status/', { order_ids: orderIds, status }),
  getOrderCodes: (orderId: number) =>
    api.get(`/admin/dashboard/order-codes/?order_id=${orderId}`),
  resendOrderEmail: (orderId: number) =>
    api.post('/admin/dashboard/orders/resend_email/', { order_id: orderId }),
  sendCodeToUser: (data: {
    user_id?: number;
    user_email?: string;
    code: string;
    pin?: string;
    product_name: string;
    value: number;
    currency?: string;
    message?: string;
  }) =>
    api.post('/admin/dashboard/send_code_to_user/', data),
  
  // Users Management
  getAllUsers: (params?: any) =>
    api.get('/admin/dashboard/users/', { params }),
  
  // Export
  exportOrders: (params?: any) =>
    api.get('/admin/dashboard/export_orders/', { params, responseType: 'blob' }),
  exportUsers: (params?: any) =>
    api.get('/admin/dashboard/export_users/', { params, responseType: 'blob' }),
  
  // Withdrawal Management
  getWithdrawals: (params?: { status?: string; page?: number; page_size?: number }) =>
    api.get('/admin/dashboard/withdrawals/', { params }),
  getWithdrawalStats: () =>
    api.get('/admin/dashboard/withdrawal_stats/'),
  approveWithdrawal: (withdrawalId: number) =>
    api.post('/admin/dashboard/withdrawals/approve/', { withdrawal_id: withdrawalId }),
  rejectWithdrawal: (withdrawalId: number, reason?: string) =>
    api.post('/admin/dashboard/withdrawals/reject/', { withdrawal_id: withdrawalId, reason }),
  creditUserWallet: (userId: number, amount: number, description?: string) =>
    api.post('/admin/dashboard/withdrawals/credit_user/', { user_id: userId, amount, description }),
  // Ban (is_active=false) or unban (is_active=true) a user account
  setUserActive: (userId: number, isActive: boolean) =>
    api.post('/admin/dashboard/users/set_active/', { user_id: userId, is_active: isActive }),

  // Catalog (brand) management — the system the storefront /buy actually uses
  listCatalogBrands: () => api.get('/admin/catalog/brands/'),
  createCatalogBrand: (data: FormData) =>
    api.post('/admin/catalog/brands/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateCatalogBrand: (id: string, data: FormData) =>
    api.patch(`/admin/catalog/brands/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteCatalogBrand: (id: string) => api.delete(`/admin/catalog/brands/${id}/`),
  listCatalogCardTypes: (brandId: string) => api.get('/admin/catalog/card-types/', { params: { brand: brandId } }),
  createCatalogCardType: (data: any) => api.post('/admin/catalog/card-types/', data),
  updateCatalogCardType: (id: string, data: any) => api.patch(`/admin/catalog/card-types/${id}/`, data),
  deleteCatalogCardType: (id: string) => api.delete(`/admin/catalog/card-types/${id}/`),

  // KYC / Identity Verification Management
  getKycList: (params?: { status?: string; page?: number; page_size?: number }) =>
    api.get('/admin/dashboard/kyc/', { params }),
  approveKyc: (kycId: number) =>
    api.post('/admin/dashboard/kyc/approve/', { kyc_id: kycId }),
  rejectKyc: (kycId: number, reason?: string) =>
    api.post('/admin/dashboard/kyc/reject/', { kyc_id: kycId, reason }),

  // Gift Card Purchase Requests Management
  getPurchaseRequests: (params?: any) =>
    api.get('/admin/purchase-requests/', { params }),
  getPurchaseRequest: (id: string) =>
    api.get(`/admin/purchase-requests/${id}/`),
  approvePurchaseRequest: (id: string, notes?: string) =>
    api.post(`/admin/purchase-requests/${id}/approve/`, { notes }),
  rejectPurchaseRequest: (id: string, reason: string) =>
    api.post(`/admin/purchase-requests/${id}/reject/`, { reason }),
  confirmPayment: (id: string, paymentMethod?: string, transactionId?: string) =>
    api.post(`/admin/purchase-requests/${id}/confirm_payment/`, { payment_method: paymentMethod, transaction_id: transactionId }),
  assignCodes: (id: string, codes: string[]) =>
    api.post(`/admin/purchase-requests/${id}/assign_codes/`, { codes }),
};

// Blog endpoints (authenticated users)
export const blogAPI = {
  listPosts: (params?: any) =>
    api.get('/blog/posts/', { params }),
  getPost: (slug: string) =>
    api.get(`/blog/posts/${slug}/`),
  createComment: (slug: string, content: string) =>
    api.post(`/blog/posts/${slug}/comments/`, { content }),
  listCategories: () =>
    api.get('/blog/categories/'),
  listTags: () =>
    api.get('/blog/tags/'),
};

// Blog admin endpoints
export const blogAdminAPI = {
  // Upload an image (cover or inline) and get back its public URL.
  uploadImage: (file: File) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post('/blog/posts/upload_image/', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  listPosts: (params?: any) =>
    api.get('/blog/posts/', { params }),
  getPost: (id: number) =>
    api.get(`/blog/posts/${id}/`),
  createPost: (data: any) =>
    api.post('/blog/posts/', data),
  updatePost: (id: number, data: any) =>
    api.patch(`/blog/posts/${id}/`, data),
  deletePost: (id: number) =>
    api.delete(`/blog/posts/${id}/`),
  togglePublish: (id: number) =>
    api.post(`/blog/posts/${id}/toggle_publish/`),
  togglePin: (id: number) =>
    api.post(`/blog/posts/${id}/toggle_pin/`),
  toggleComments: (id: number) =>
    api.post(`/blog/posts/${id}/toggle_comments/`),
  deleteComment: (postId: number, commentId: number) =>
    api.delete(`/blog/posts/${postId}/comments/${commentId}/`),
  // Categories
  listCategories: () =>
    api.get('/blog/categories/'),
  createCategory: (data: any) =>
    api.post('/blog/categories/', data),
  updateCategory: (id: number, data: any) =>
    api.patch(`/blog/categories/${id}/`, data),
  deleteCategory: (id: number) =>
    api.delete(`/blog/categories/${id}/`),
  // Tags
  listTags: () =>
    api.get('/blog/tags/'),
  createTag: (data: any) =>
    api.post('/blog/tags/', data),
  updateTag: (id: number, data: any) =>
    api.patch(`/blog/tags/${id}/`, data),
  deleteTag: (id: number) =>
    api.delete(`/blog/tags/${id}/`),
};

export default api;


