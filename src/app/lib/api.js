// Base API service for making HTTP requests
// Remove /api from the end since Next.js routes already include it
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const apiService = {
  // Generic request handler
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 204 No Content responses
      if (response.status === 204) {
        return { success: true };
      }

      // Parse response as JSON if possible
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json().catch(() => ({}));
      } else {
        responseData = await response.text();
      }

      // Handle non-2xx responses
      if (!response.ok) {
        const error = new Error(
          (responseData && responseData.message) || 
          `Request failed with status ${response.status}`
        );
        error.status = response.status;
        error.data = responseData;
        throw error;
      }

      // For successful responses, ensure consistent format
      if (typeof responseData === 'object' && responseData !== null) {
        return { ...responseData, success: true };
      }
      
      return { data: responseData, success: true };
    } catch (error) {
      console.error(`API request to ${endpoint} failed:`, error);
      
      // Ensure the error has a message
      if (!error.message) {
        error.message = 'Network error: Could not connect to the server';
      }
      
      // Add a flag to indicate this is an API error
      error.isApiError = true;
      throw error;
    }
  },

  // HTTP Methods
  get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET',
    });
  },

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
  },

  // Auth specific methods
  async login(credentials) {
    return this.post('/auth/login', credentials);
  },

  async register(userData) {
    return this.post('/auth/register', userData);
  },

  async getCurrentUser() {
    return this.get('/auth/me');
  },

  // Product related methods
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/products${query ? `?${query}` : ''}`);
  },

  async getProductById(id) {
    return this.get(`/products/${id}`);
  },

  async searchProducts(query, filters = {}) {
    const params = new URLSearchParams({ q: query, ...filters });
    return this.get(`/products/search?${params.toString()}`);
  },

  // Cart related methods
  async getCart() {
    return this.get('/cart');
  },

  async addToCart(productId, quantity = 1) {
    return this.post('/cart/items', { productId, quantity });
  },

  async updateCartItem(itemId, quantity) {
    return this.put(`/cart/items/${itemId}`, { quantity });
  },

  async removeFromCart(itemId) {
    return this.delete(`/cart/items/${itemId}`);
  },

  // Wishlist related methods
  async getWishlist() {
    return this.get('/wishlist');
  },

  async addToWishlist(productId) {
    return this.post('/wishlist', { productId });
  },

  async removeFromWishlist(productId) {
    return this.delete(`/wishlist/${productId}`);
  },

  // Order related methods
  async createOrder(orderData) {
    return this.post('/orders', orderData);
  },

  async getOrders() {
    return this.get('/orders');
  },

  async getOrderById(id) {
    return this.get(`/orders/${id}`);
  },

  // Utility methods
  setAuthToken(token) {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  },

  getAuthToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  clearAuth() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },
};

export default apiService;
