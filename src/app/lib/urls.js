import { config } from './config';

export const APP_ROUTES = {
  home: '/',
  orders: '/orders',
  orderRequestApprovalApi: '/api/orders/request-approval',
};

export const FALLBACK_URLS = {
  clientProduction: 'https://duffys-furniture-client.vercel.app',
  serverLocal: 'http://localhost:3001',
};

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    profile: '/auth/profile',
    refresh: '/auth/refresh',
    sendRegistrationOTP: '/auth/send-registration-otp',
    verifyAndRegister: '/auth/verify-and-register',
    sendPasswordResetOTP: '/auth/send-password-reset-otp',
    verifyPasswordResetOTP: '/auth/verify-password-reset-otp',
    resetPassword: '/auth/reset-password',
  },
  products: {
    getAll: '/products',
    getById: (id) => `/products/${id}`,
    search: '/products/search',
    filter: '/products/filter',
    getSuggestions: '/products/suggestions',
    getReviews: (id) => `/products/${id}/reviews`,
    getNavCategories: '/products/categories/nav',
    getCategoriesSummary: '/products/categories/summary',
    getLandingPage: (category) => `/products/landing-page/${category}`,
  },
  cart: {
    get: '/cart',
    add: '/cart/add',
    update: '/cart/update',
    save: '/cart/save',
    remove: '/cart/remove',
    clear: '/cart/clear',
  },
  orders: {
    getAll: '/orders',
    getById: (id) => `/orders/${id}`,
    create: '/orders',
    cancel: (id) => `/orders/${id}/cancel`,
    requestApproval: '/orders/request-approval',
    addItem: (orderId) => `/orders/${orderId}/items`,
    updateItem: (orderId, itemId) => `/orders/${orderId}/items/${itemId}`,
    removeItem: (orderId, itemId, ownerToken) =>
      `/orders/${orderId}/items/${itemId}${ownerToken ? `?token=${ownerToken}` : ''}`,
    ownerApprove: (orderId) => `/orders/${orderId}/owner-approve`,
    status: (orderId) => `/orders/${orderId}/status`,
    sendPaymentInfo: (orderId) => `/orders/${orderId}/send-payment-info`,
  },
  wishlist: {
    get: '/wishlist',
    add: '/wishlist',
    remove: (productId) => `/wishlist/${productId}`,
    clear: '/wishlist',
  },
  reviews: {
    submit: '/reviews',
    mine: '/reviews/mine',
    eligible: '/reviews/eligible',
  },
  user: {
    profile: '/user/profile',
    addresses: '/user/addresses',
    addAddress: '/user/addresses',
    updateAddress: (id) => `/user/addresses/${id}`,
    deleteAddress: (id) => `/user/addresses/${id}`,
  },
};

export const buildApiUrl = (endpoint) => `${config.api.baseURL}${endpoint}`;
