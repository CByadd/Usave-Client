import axios from 'axios';
import { config } from '../../lib/config';

// Create axios instance
const api = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API endpoints
export const apiEndpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    profile: '/auth/profile',
    refresh: '/auth/refresh',
  },
  products: {
    getAll: '/products',
    getById: (id) => `/products/${id}`,
    search: '/products/search',
    getSuggestions: '/products/suggestions',
  },
  cart: {
    get: '/cart',
    add: '/cart/add',
    update: '/cart/update',
    remove: '/cart/remove',
    clear: '/cart/clear',
  },
  orders: {
    getAll: '/orders',
    getById: (id) => `/orders/${id}`,
    create: '/orders',
    cancel: (id) => `/orders/${id}/cancel`,
  },
  wishlist: {
    get: '/wishlist',
    add: '/wishlist/add',
    remove: '/wishlist/remove',
    clear: '/wishlist/clear',
  },
};

// Helper to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// API service functions - simple axios calls
export const apiService = {
  auth: {
    async login(email, password) {
      console.log('API: Login request to:', `${api.defaults.baseURL}${apiEndpoints.auth.login}`);
      console.log('API: Email:', email);
      
      try {
        const response = await axios.post(
          `${api.defaults.baseURL}${apiEndpoints.auth.login}`,
          { email, password },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        
        console.log('API: Login response:', response.data);
        return response.data;
      } catch (error) {
        console.error('API: Login error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    async register(userData) {
      try {
        const response = await axios.post(
          `${api.defaults.baseURL}${apiEndpoints.auth.register}`,
          userData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Register error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    async logout() {
      const token = getAuthToken();
      try {
        const response = await axios.post(
          `${api.defaults.baseURL}${apiEndpoints.auth.logout}`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Logout error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    async getCurrentUser() {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No token found');
      }
      
      try {
        const response = await axios.get(
          `${api.defaults.baseURL}${apiEndpoints.auth.me}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Get current user error:', error.response?.data || error.message);
        throw error;
      }
    },
  },
  
  products: {
    async getAll(params = {}) {
      try {
        const response = await axios.get(
          `${api.defaults.baseURL}${apiEndpoints.products.getAll}`,
          { params }
        );
        return response.data;
      } catch (error) {
        console.error('API: Get products error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    async getById(id) {
      try {
        const response = await axios.get(
          `${api.defaults.baseURL}${apiEndpoints.products.getById(id)}`
        );
        return response.data;
      } catch (error) {
        console.error('API: Get product error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    async search(query, params = {}) {
      try {
        const response = await axios.get(
          `${api.defaults.baseURL}${apiEndpoints.products.search}`,
          { params: { q: query, ...params } }
        );
        return response.data;
      } catch (error) {
        console.error('API: Search products error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    async getSuggestions(query, limit = 10) {
      try {
        const response = await axios.get(
          `${api.defaults.baseURL}${apiEndpoints.products.getSuggestions}`,
          { params: { q: query, limit } }
        );
        return response.data;
      } catch (error) {
        console.error('API: Get suggestions error:', error.response?.data || error.message);
        throw error;
      }
    },
  },
  
  cart: {
    async get() {
      const token = getAuthToken();
      try {
        const response = await axios.get(
          `${api.defaults.baseURL}${apiEndpoints.cart.get}`,
          {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Get cart error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    async addItem(productId, quantity = 1) {
      const token = getAuthToken();
      try {
        const response = await axios.post(
          `${api.defaults.baseURL}${apiEndpoints.cart.add}`,
          { productId, quantity },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Add to cart error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    async removeItem(productId) {
      const token = getAuthToken();
      try {
        const response = await axios.delete(
          `${api.defaults.baseURL}${apiEndpoints.cart.remove}`,
          {
            data: { productId },
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Remove from cart error:', error.response?.data || error.message);
        throw error;
      }
    },
  },
  
  orders: {
    async getAll() {
      const token = getAuthToken();
      try {
        const response = await axios.get(
          `${api.defaults.baseURL}${apiEndpoints.orders.getAll}`,
          {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Get orders error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    async create(orderData) {
      const token = getAuthToken();
      try {
        const response = await axios.post(
          `${api.defaults.baseURL}${apiEndpoints.orders.create}`,
          orderData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Create order error:', error.response?.data || error.message);
        throw error;
      }
    },
  },
  
  wishlist: {
    async get() {
      const token = getAuthToken();
      try {
        const response = await axios.get(
          `${api.defaults.baseURL}${apiEndpoints.wishlist.get}`,
          {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Get wishlist error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    async addItem(productId) {
      const token = getAuthToken();
      try {
        const response = await axios.post(
          `${api.defaults.baseURL}${apiEndpoints.wishlist.add}`,
          { productId },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Add to wishlist error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    async removeItem(productId) {
      const token = getAuthToken();
      try {
        const response = await axios.delete(
          `${api.defaults.baseURL}${apiEndpoints.wishlist.remove}`,
          {
            data: { productId },
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Remove from wishlist error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    async clear() {
      const token = getAuthToken();
      try {
        const response = await axios.delete(
          `${api.defaults.baseURL}${apiEndpoints.wishlist.clear}`,
          {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Clear wishlist error:', error.response?.data || error.message);
        throw error;
      }
    },
  },
};
