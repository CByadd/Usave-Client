import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  // baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://usave-server.vercel.app/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const apiEndpoints = {
  // Authentication
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
    profile: '/auth/profile',
  },
  
  // Products
  products: {
    list: '/products',
    detail: (id) => `/products/${id}`,
    search: '/products/search',
    suggestions: '/products/suggestions',
    categories: '/products/categories',
    featured: '/products/featured',
  },
  
  // Cart
  cart: {
    get: '/cart',
    add: '/cart/add',
    update: '/cart/update',
    remove: '/cart/remove',
    clear: '/cart/clear',
  },
  
  // Orders
  orders: {
    list: '/orders',
    create: '/orders',
    detail: (id) => `/orders/${id}`,
    update: (id) => `/orders/${id}`,
  },
  
  // User
  user: {
    profile: '/user/profile',
    addresses: '/user/addresses',
    wishlist: '/user/wishlist',
  },
};

// API service functions
export const apiService = {
  // Authentication
  auth: {
    async login(credentials) {
      const response = await api.post(apiEndpoints.auth.login, credentials);
      return response.data;
    },
    
    async register(userData) {
      const response = await api.post(apiEndpoints.auth.register, userData);
      return response.data;
    },
    
    async logout() {
      const response = await api.post(apiEndpoints.auth.logout);
      return response.data;
    },
    
    async getCurrentUser() {
      const response = await api.get(apiEndpoints.auth.me);
      return response.data;
    },
    
    async getProfile() {
      const response = await api.get(apiEndpoints.auth.profile);
      return response.data;
    },
    
    async refreshToken() {
      const response = await api.post(apiEndpoints.auth.refresh);
      return response.data;
    },
  },
  
  // Products
  products: {
    async getAll(params = {}) {
      const response = await api.get(apiEndpoints.products.list, { params });
      return response.data;
    },
    
    async getById(id) {
      const response = await api.get(apiEndpoints.products.detail(id));
      return response.data;
    },
    
    async search(query, filters = {}) {
      const response = await api.get(apiEndpoints.products.search, {
        params: { q: query, ...filters }
      });
      return response.data;
    },
    
    async getSuggestions(query, limit = 10) {
      const response = await api.get(apiEndpoints.products.suggestions, {
        params: { q: query, limit }
      });
      return response.data;
    },
    
    async getCategories() {
      const response = await api.get(apiEndpoints.products.categories);
      return response.data;
    },
    
    async getFeatured() {
      const response = await api.get(apiEndpoints.products.featured);
      return response.data;
    },
  },
  
  // Cart
  cart: {
    async get() {
      const response = await api.get(apiEndpoints.cart.get);
      return response.data;
    },
    
    async addItem(productId, quantity = 1) {
      const response = await api.post(apiEndpoints.cart.add, {
        productId,
        quantity
      });
      return response.data;
    },
    
    async updateItem(productId, quantity) {
      const response = await api.put(apiEndpoints.cart.update, {
        productId,
        quantity
      });
      return response.data;
    },
    
    async removeItem(productId) {
      const response = await api.delete(apiEndpoints.cart.remove, {
        data: { productId }
      });
      return response.data;
    },
    
    async clear() {
      const response = await api.delete(apiEndpoints.cart.clear);
      return response.data;
    },
  },
  
  // Orders
  orders: {
    async getAll() {
      const response = await api.get(apiEndpoints.orders.list);
      return response.data;
    },
    
    async create(orderData) {
      const response = await api.post(apiEndpoints.orders.create, orderData);
      return response.data;
    },
    
    async getById(id) {
      const response = await api.get(apiEndpoints.orders.detail(id));
      return response.data;
    },
    
    async approve(id, approvalNotes) {
      const response = await api.put(`/orders/${id}/approve`, { approvalNotes });
      return response.data;
    },
    
    async reject(id, approvalNotes) {
      const response = await api.put(`/orders/${id}/reject`, { approvalNotes });
      return response.data;
    },
    
    async requestReapproval(id, notes) {
      const response = await api.put(`/orders/${id}/resubmit`, { notes });
      return response.data;
    },

    // Admin order item management
    async addItemToOrder(orderId, productId, quantity) {
      const response = await api.post(`/orders/${orderId}/items`, { productId, quantity });
      return response.data;
    },

    async removeItemFromOrder(orderId, itemId) {
      const response = await api.delete(`/orders/${orderId}/items/${itemId}`);
      return response.data;
    },

    async updateOrderItemQuantity(orderId, itemId, quantity) {
      const response = await api.put(`/orders/${orderId}/items/${itemId}`, { quantity });
      return response.data;
    },

    // User order editing (rejected orders)
    async editOrderItems(orderId, items) {
      const response = await api.put(`/orders/${orderId}/edit-items`, { items });
      return response.data;
    },

    async editOrderAddresses(orderId, shippingAddress, billingAddress) {
      const response = await api.put(`/orders/${orderId}/edit-addresses`, { shippingAddress, billingAddress });
      return response.data;
    },

    // Payment processing
    async processPayment(orderId, paymentMethod, paymentIntentId) {
      const response = await api.put(`/orders/${orderId}/payment`, { paymentMethod, paymentIntentId });
      return response.data;
    },
  },
  
  // Admin
  admin: {
    products: {
      async getAll(params = {}) {
        const response = await api.get('/admin/products', { params });
        return response.data;
      },
      
      async getById(id) {
        const response = await api.get(`/admin/products/${id}`);
        return response.data;
      },
      
      async create(productData) {
        const response = await api.post('/admin/products', productData);
        return response.data;
      },
      
      async update(id, productData) {
        const response = await api.put(`/admin/products/${id}`, productData);
        return response.data;
      },
      
      async delete(id) {
        const response = await api.delete(`/admin/products/${id}`);
        return response.data;
      },
      
      async bulkUpdate(productIds, updateData) {
        const response = await api.put('/admin/products/bulk', {
          productIds,
          updateData
        });
        return response.data;
      },
      
      async getCategories() {
        const response = await api.get('/admin/products/categories');
        return response.data;
      },
      
      async getStats() {
        const response = await api.get('/admin/products/stats');
        return response.data;
      }
    }
  },
};

export default api;


