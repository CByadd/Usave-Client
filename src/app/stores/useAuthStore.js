"use client";

import { create } from 'zustand';
import { apiService } from '../services/api/apiClient';

const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';

// Load auth state from localStorage
const loadAuthFromStorage = () => {
  if (typeof window === 'undefined') {
    return { user: null, token: null, isAuthenticated: false };
  }
  
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userData = localStorage.getItem(USER_DATA_KEY);
    const user = userData ? JSON.parse(userData) : null;
    
    return {
      user,
      token,
      isAuthenticated: !!token,
    };
  } catch (err) {
    console.error('Error loading auth from localStorage:', err);
    return { user: null, token: null, isAuthenticated: false };
  }
};

// Save auth state to localStorage
const saveAuthToStorage = (user, token) => {
  if (typeof window === 'undefined') return;
  
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    
    if (user) {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_DATA_KEY);
    }
  } catch (err) {
    console.error('Error saving auth to localStorage:', err);
  }
};

// Clear auth state from localStorage
const clearAuthFromStorage = () => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  } catch (err) {
    console.error('Error clearing auth from localStorage:', err);
  }
};

export const useAuthStore = create((set, get) => {
  // Initialize from localStorage
  const initialAuth = loadAuthFromStorage();
  
  return {
    user: initialAuth.user,
    token: initialAuth.token,
    isAuthenticated: initialAuth.isAuthenticated,
    isLoading: false,
    error: null,

    // Login
    login: async (email, password) => {
      set({ isLoading: true, error: null });

      try {
        const response = await apiService.auth.login(email, password);

        if (!response) {
          throw new Error('No response from server');
        }

        if (response.success === true) {
          const userData = response.user || response.data?.user || response.data;
          const token = response.token || response.data?.token;

          if (!userData || !token) {
            throw new Error('Missing user or token in response');
          }

          saveAuthToStorage(userData, token);
          set({
            user: userData,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true, user: userData };
        } else {
          const errorMsg = response.error || response.message || 'Login failed';
          set({ isLoading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      } catch (err) {
        console.error('Login error:', err);
        
        let errorMsg = 'Login failed. Please check your credentials.';
        if (err.response?.data?.error) {
          errorMsg = err.response.data.error;
        } else if (err.response?.data?.message) {
          errorMsg = err.response.data.message;
        } else if (err.message) {
          errorMsg = err.message;
        }

        set({ isLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }
    },

    // Register
    register: async (userData) => {
      set({ isLoading: true, error: null });

      try {
        const response = await apiService.auth.register(userData);

        if (response && response.success === true) {
          const newUser = response.user || response.data?.user || response.data;
          const token = response.token || response.data?.token;

          if (newUser && token) {
            saveAuthToStorage(newUser, token);
            set({
              user: newUser,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return { success: true, user: newUser };
          }
        }

        const errorMsg = response?.error || response?.message || 'Registration failed';
        set({ isLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      } catch (err) {
        const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed';
        set({ isLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }
    },

    // Logout
    logout: async () => {
      set({ isLoading: true });

      try {
        await apiService.auth.logout();
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        clearAuthFromStorage();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    },

    // Get current user
    getCurrentUser: () => {
      return get().user;
    },

    // Check if authenticated
    checkAuth: () => {
      const auth = loadAuthFromStorage();
      set({
        user: auth.user,
        token: auth.token,
        isAuthenticated: auth.isAuthenticated,
      });
      return auth.isAuthenticated;
    },

    // Update user data
    updateUser: (userData) => {
      const { token } = get();
      saveAuthToStorage(userData, token);
      set({ user: userData });
    },

    // Clear error
    clearError: () => {
      set({ error: null });
    },
  };
});

// Initialize auth state on mount
if (typeof window !== 'undefined') {
  const store = useAuthStore.getState();
  store.checkAuth();
}

// Export a hook that matches the old API for compatibility
export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const getCurrentUser = useAuthStore((state) => state.getCurrentUser);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const updateUser = useAuthStore((state) => state.updateUser);
  const clearError = useAuthStore((state) => state.clearError);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    getCurrentUser,
    checkAuth,
    updateUser,
    clearError,
  };
};

// Export helper functions for backward compatibility
export const getCurrentUser = () => useAuthStore.getState().getCurrentUser();
export const isAuthenticated = () => useAuthStore.getState().isAuthenticated;
export const getAuthToken = () => useAuthStore.getState().token;
export const loginUser = (email, password) => useAuthStore.getState().login(email, password);
export const registerUser = (userData) => useAuthStore.getState().register(userData);
export const logoutUser = () => useAuthStore.getState().logout();

