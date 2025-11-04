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
        // Handle 404 and other errors gracefully - endpoint may not exist yet
        const status = error.response?.status;
        if (status === 404 || !error.response) {
          return { success: true, data: { items: [] } };
        }
        // Only log meaningful errors (not empty objects)
        const errorData = error.response?.data;
        if (status && status !== 404 && errorData && Object.keys(errorData).length > 0) {
          console.error('API: Get cart error:', errorData);
        }
        // Return empty cart on error instead of throwing
        return { success: true, data: { items: [] } };
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
        // Handle 404 and other errors gracefully - endpoint may not exist yet
        const status = error.response?.status;
        if (status === 404 || !error.response) {
          return { success: false, error: 'Cart endpoint not available' };
        }
        // Only log meaningful errors (not empty objects)
        const errorData = error.response?.data;
        if (status && status !== 404 && errorData && Object.keys(errorData).length > 0) {
          console.error('API: Add to cart error:', errorData);
        }
        // Return error response instead of throwing
        return { success: false, error: errorData?.error || error.message || 'Failed to add item to cart' };
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
        // Handle 404 and other errors gracefully - endpoint may not exist yet
        const status = error.response?.status;
        if (status === 404 || !error.response) {
          return { success: false, error: 'Cart endpoint not available' };
        }
        
        // Get error data
        const errorData = error.response?.data;
        const errorMessage = errorData?.error || error.message || 'Failed to remove item from cart';
        
        // If item not found error (500), return it without logging
        // This happens when item exists in localStorage but not in API - it's expected
        if (status === 500 && (errorMessage.includes('not found') || errorMessage.includes('Cart item not found'))) {
          return { success: false, error: errorMessage };
        }
        
        // Only log meaningful errors (not empty objects and not "not found" errors)
        if (status && status !== 404 && errorData && Object.keys(errorData).length > 0 && !errorMessage.includes('not found')) {
          console.error('API: Remove from cart error:', errorData);
        }
        
        // Return error response instead of throwing
        return { success: false, error: errorMessage };
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
        // Handle 404 and other errors gracefully - endpoint may not exist yet
        const status = error.response?.status;
        if (status === 404 || !error.response) {
          return { success: true, data: { items: [] } };
        }
        // Only log meaningful errors (not empty objects)
        const errorData = error.response?.data;
        if (status && status !== 404 && errorData && Object.keys(errorData).length > 0) {
          console.error('API: Get wishlist error:', errorData);
        }
        // Return empty wishlist on error instead of throwing
        return { success: true, data: { items: [] } };
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
        // Handle 404 and other errors gracefully - endpoint may not exist yet
        const status = error.response?.status;
        if (status === 404 || !error.response) {
          return { success: false, error: 'Wishlist endpoint not available' };
        }
        // Only log meaningful errors (not empty objects)
        const errorData = error.response?.data;
        if (status && status !== 404 && errorData && Object.keys(errorData).length > 0) {
          console.error('API: Add to wishlist error:', errorData);
        }
        // Return error response instead of throwing
        return { success: false, error: errorData?.error || error.message || 'Failed to add item to wishlist' };
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
        // Handle 404 and other errors gracefully - endpoint may not exist yet
        const status = error.response?.status;
        if (status === 404 || !error.response) {
          return { success: false, error: 'Wishlist endpoint not available' };
        }
        // Only log meaningful errors (not empty objects)
        const errorData = error.response?.data;
        if (status && status !== 404 && errorData && Object.keys(errorData).length > 0) {
          console.error('API: Remove from wishlist error:', errorData);
        }
        // Return error response instead of throwing
        return { success: false, error: errorData?.error || error.message || 'Failed to remove item from wishlist' };
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
        // Handle 404 and other errors gracefully - endpoint may not exist yet
        const status = error.response?.status;
        if (status === 404 || !error.response) {
          return { success: false, error: 'Wishlist endpoint not available' };
        }
        // Only log meaningful errors (not empty objects)
        const errorData = error.response?.data;
        if (status && status !== 404 && errorData && Object.keys(errorData).length > 0) {
          console.error('API: Clear wishlist error:', errorData);
        }
        // Return error response instead of throwing
        return { success: false, error: errorData?.error || error.message || 'Failed to clear wishlist' };
      }
    },
  },
};
