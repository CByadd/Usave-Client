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
    getSuggestions: '/products/suggestions',
  },
  cart: {
    get: '/cart',
    add: '/cart/add',
    update: '/cart/update',
    save: '/cart/save', // Save entire cart as single object
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
    add: '/wishlist',
    remove: (productId) => `/wishlist/${productId}`,
    clear: '/wishlist',
  },
  user: {
    profile: '/user/profile',
    addresses: '/user/addresses',
    addAddress: '/user/addresses',
    updateAddress: (id) => `/user/addresses/${id}`,
    deleteAddress: (id) => `/user/addresses/${id}`,
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
    
    async sendRegistrationOTP(email) {
      try {
        const response = await axios.post(
          `${api.defaults.baseURL}${apiEndpoints.auth.sendRegistrationOTP}`,
          { email },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Send registration OTP error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    async verifyAndRegister(userData) {
      try {
        const response = await axios.post(
          `${api.defaults.baseURL}${apiEndpoints.auth.verifyAndRegister}`,
          userData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Verify and register error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    async sendPasswordResetOTP(email) {
      try {
        const response = await axios.post(
          `${api.defaults.baseURL}${apiEndpoints.auth.sendPasswordResetOTP}`,
          { email },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Send password reset OTP error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    async verifyPasswordResetOTP(email, otp) {
      try {
        const response = await axios.post(
          `${api.defaults.baseURL}${apiEndpoints.auth.verifyPasswordResetOTP}`,
          { email, otp },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Verify password reset OTP error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    async resetPassword(resetToken, newPassword) {
      try {
        const response = await axios.post(
          `${api.defaults.baseURL}${apiEndpoints.auth.resetPassword}`,
          { resetToken, newPassword },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Reset password error:', error.response?.data || error.message);
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
          // Silently fall back to localStorage
          return { success: true, data: { items: [] } };
        }
        // Only log meaningful errors (not empty objects or common network errors)
        const errorData = error.response?.data;
        const errorMessage = error.message || '';
        const isNetworkError = errorMessage.includes('Network Error') || errorMessage.includes('timeout');
        
        // Only log if there's actual error content and it's not a network error
        if (status && status !== 404 && !isNetworkError && errorData && 
            Object.keys(errorData).length > 0 && 
            (errorData.error || errorData.message || Object.keys(errorData).some(key => errorData[key]))) {
          console.error('API: Get cart error:', errorData);
        }
        // Return empty cart on error instead of throwing - will use localStorage
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
    
    // Save entire cart as single object (for authenticated users)
    async save(cartData) {
      const token = getAuthToken();
      try {
        const response = await axios.post(
          `${api.defaults.baseURL}${apiEndpoints.cart.save}`,
          cartData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );
        return response.data;
      } catch (error) {
        // Handle errors gracefully
        const status = error.response?.status;
        if (status === 404 || !error.response) {
          // Endpoint not available, try update endpoint
          try {
            const updateResponse = await axios.put(
              `${api.defaults.baseURL}${apiEndpoints.cart.update}`,
              cartData,
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': token ? `Bearer ${token}` : '',
                },
              }
            );
            return updateResponse.data;
          } catch (updateError) {
            return { success: false, error: 'Cart save endpoint not available' };
          }
        }
        const errorData = error.response?.data;
        const errorMessage = errorData?.error || error.message || 'Failed to save cart';
        if (status && status !== 404 && errorData && Object.keys(errorData).length > 0) {
          console.error('API: Save cart error:', errorData);
        }
        return { success: false, error: errorMessage };
      }
    },
    
    async clear() {
      const token = getAuthToken();
      try {
        const response = await axios.delete(
          `${api.defaults.baseURL}${apiEndpoints.cart.clear}`,
          {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );
        return response.data;
      } catch (error) {
        const status = error.response?.status;
        if (status === 404 || !error.response) {
          return { success: false, error: 'Cart clear endpoint not available' };
        }
        const errorData = error.response?.data;
        const errorMessage = errorData?.error || error.message || 'Failed to clear cart';
        if (status && status !== 404 && errorData && Object.keys(errorData).length > 0) {
          console.error('API: Clear cart error:', errorData);
        }
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
    
    async getById(id) {
      const token = getAuthToken();
      try {
        const response = await axios.get(
          `${api.defaults.baseURL}${apiEndpoints.orders.getById(id)}`,
          {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Get order by ID error:', error.response?.data || error.message);
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
    
    async approve(orderId, approvalNotes) {
      const token = getAuthToken();
      try {
        const response = await axios.put(
          `${api.defaults.baseURL}${apiEndpoints.orders.getById(orderId)}/status`,
          { 
            status: 'APPROVED',
            approvalNotes 
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Approve order error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    async reject(orderId, rejectionNotes) {
      const token = getAuthToken();
      try {
        const response = await axios.put(
          `${api.defaults.baseURL}${apiEndpoints.orders.getById(orderId)}/status`,
          { 
            status: 'REJECTED',
            approvalNotes: rejectionNotes 
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Reject order error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    async sendPaymentInfo(orderId, paymentDetails) {
      const token = getAuthToken();
      try {
        const response = await axios.post(
          `${api.defaults.baseURL}${apiEndpoints.orders.getById(orderId)}/send-payment-info`,
          { paymentDetails },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Send payment info error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    async requestReapproval(orderId, orderDetails, requiresOwnerApproval = false, ownerEmail = null) {
      // This method is kept for backward compatibility but not used directly
      // The ReApprovalModal handles the request directly
      const token = getAuthToken();
      try {
        const response = await axios.post(
          `${api.defaults.baseURL}/api/orders/request-approval`,
          {
            orderDetails,
            requiresOwnerApproval,
            ownerEmail,
            userId: token ? undefined : 'guest', // Will be extracted from token if authenticated
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Request reapproval error:', error.response?.data || error.message);
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
        // Only log meaningful errors (not empty objects or common network errors)
        const errorData = error.response?.data;
        const errorMessage = error.message || '';
        const isNetworkError = errorMessage.includes('Network Error') || errorMessage.includes('timeout');
        
        // Log error details for debugging
        if (status && status !== 404 && !isNetworkError) {
          const errorMsg = errorData?.error || errorData?.message || error.message || 'Failed to add item to wishlist';
          console.error('API: Add to wishlist error:', {
            status,
            statusText: error.response?.statusText,
            error: errorMsg,
            data: errorData,
            productId,
          });
        }
        // Return error response instead of throwing
        const errorMsg = errorData?.error || errorData?.message || error.message || 'Failed to add item to wishlist';
        return { success: false, error: errorMsg };
      }
    },
    
    async removeItem(productId) {
      const token = getAuthToken();
      try {
        const response = await axios.delete(
          `${api.defaults.baseURL}${apiEndpoints.wishlist.remove(productId)}`,
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
        // Log error details for debugging
        const errorData = error.response?.data;
        if (status && status !== 404) {
          const errorMsg = errorData?.error || errorData?.message || error.message || 'Failed to remove item from wishlist';
          console.error('API: Remove from wishlist error:', {
            status,
            statusText: error.response?.statusText,
            error: errorMsg,
            data: errorData,
            productId,
          });
        }
        // Return error response instead of throwing
        const errorMsg = errorData?.error || errorData?.message || error.message || 'Failed to remove item from wishlist';
        return { success: false, error: errorMsg };
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
  
  user: {
    // Get user profile
    async getProfile() {
      const token = getAuthToken();
      try {
        const response = await axios.get(
          `${api.defaults.baseURL}${apiEndpoints.user.profile}`,
          {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Get user profile error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    // Update user profile
    async updateProfile(profileData) {
      const token = getAuthToken();
      try {
        const response = await axios.put(
          `${api.defaults.baseURL}${apiEndpoints.user.profile}`,
          profileData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Update user profile error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    // Get user addresses
    async getAddresses() {
      const token = getAuthToken();
      try {
        const response = await axios.get(
          `${api.defaults.baseURL}${apiEndpoints.user.addresses}`,
          {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Get addresses error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    // Add address
    async addAddress(addressData) {
      const token = getAuthToken();
      try {
        const response = await axios.post(
          `${api.defaults.baseURL}${apiEndpoints.user.addAddress}`,
          addressData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Add address error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    // Update address
    async updateAddress(addressId, addressData) {
      const token = getAuthToken();
      try {
        const response = await axios.put(
          `${api.defaults.baseURL}${apiEndpoints.user.updateAddress(addressId)}`,
          addressData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Update address error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    // Delete address
    async deleteAddress(addressId) {
      const token = getAuthToken();
      try {
        const response = await axios.delete(
          `${api.defaults.baseURL}${apiEndpoints.user.deleteAddress(addressId)}`,
          {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('API: Delete address error:', error.response?.data || error.message);
        throw error;
      }
    },
  },
};
