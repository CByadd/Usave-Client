"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '../services/api';
import logger from '../utils/logger';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return a default context during static generation
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      login: () => Promise.resolve({ success: false }),
      register: () => Promise.resolve({ success: false }),
      logout: () => {},
      updateProfile: () => Promise.resolve({ success: false }),
      changePassword: () => Promise.resolve({ success: false }),
      forgotPassword: () => Promise.resolve({ success: false }),
      resetPassword: () => Promise.resolve({ success: false }),
      checkAuthStatus: () => {},
      clearError: () => {}
    };
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await apiService.auth.getProfile();
      if (response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      logger.apiRequest('POST', '/api/auth/login', { email });
      const response = await apiService.auth.login({ email, password });
      
      if (response.success) {
        const { user: userData, token } = response.data;
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        logger.authLogin(email, true);
        logger.log('AUTH', 'User logged in successfully', { userId: userData.id, email });
        
        return { success: true, user: userData };
      } else {
        const errorMessage = response.message || 'Login failed';
        setError(errorMessage);
        logger.authLogin(email, false);
        logger.error('AUTH', 'Login failed', { email, error: errorMessage });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      logger.authLogin(email, false);
      logger.error('AUTH', 'Login error', { email, error: errorMessage });
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      
      logger.apiRequest('POST', '/api/auth/register', { email: userData.email });
      const response = await apiService.auth.register(userData);
      
      if (response.success) {
        const { user: newUser, token } = response.data;
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(newUser));
        
        setUser(newUser);
        setIsAuthenticated(true);
        
        logger.authRegister(userData.email, true);
        logger.log('AUTH', 'User registered successfully', { userId: newUser.id, email: userData.email });
        
        return { success: true, user: newUser };
      } else {
        const errorMessage = response.message || 'Registration failed';
        logger.authRegister(userData.email, false);
        logger.error('AUTH', 'Registration failed', { email: userData.email, error: errorMessage });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed';
      logger.authRegister(userData.email, false);
      logger.error('AUTH', 'Registration error', { email: userData.email, error: errorMessage });
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

 const logout = async () => {
  try {
    logger.apiRequest('POST', '/api/auth/logout');
    await apiService.auth.logout();
    logger.authLogout();
    logger.log('AUTH', 'User logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    logger.error('AUTH', 'Logout error', { error: error.message });
  } finally {
    // Clear local storage first
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');

    // Reset context state
    setUser(null);
    setIsAuthenticated(false);

    // Use a small delay to ensure state updates before navigation
    setTimeout(() => {
      router.push('/');
      router.refresh(); // ✅ ensures full revalidation of page and auth state
    }, 50);
  }
};


  const updateProfile = async (profileData) => {
    try {
      const response = await apiService.auth.updateProfile(profileData);
      
      if (response.success) {
        const updatedUser = response.data;
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true, user: updatedUser };
      } else {
        return { success: false, error: response.message || 'Profile update failed' };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Profile update failed' 
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await apiService.auth.changePassword({
        currentPassword,
        newPassword
      });
      
      if (response.success) {
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Password change failed' };
      }
    } catch (error) {
      console.error('Password change error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Password change failed' 
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await apiService.auth.forgotPassword({ email });
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Request failed' 
      };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await apiService.auth.resetPassword({ token, password });
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Reset password error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Reset failed' 
      };
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    checkAuthStatus,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};