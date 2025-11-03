"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '../services/api/apiClient';
import logger from '../utils/logger';

const defaultAuthValue = {
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

// Initialize with default value to ensure context is always defined
const AuthContext = createContext(defaultAuthValue);

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Context should always be available now (initialized with default value)
  // If it's still the default value and we're in a Provider, that's fine - it will update
  // Check if we're actually inside a Provider by checking if value has been updated
  // (This is a safety check - in practice, Provider always provides a value)
  
  // In production builds, sometimes context can be falsy during hydration
  // Always return the context value, which will be either default or Provider value
  return context || defaultAuthValue;
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

      const response = await apiService.auth.getCurrentUser();
      if (response?.success) {
        const userData = response.user || response.data;
        setUser(userData);
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

  const login = async (emailOrCredentials, password) => {
    // Initialize email variable in the outer scope
    let email = '';
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Handle both login(email, password) and login({ email, password }) formats
      let credentials;
      if (typeof emailOrCredentials === 'object' && emailOrCredentials !== null) {
        // Handle object parameter: login({ email, password })
        credentials = emailOrCredentials;
        email = credentials.email || '';
        password = credentials.password;
      } else {
        // Handle separate parameters: login(email, password)
        email = emailOrCredentials || '';
        credentials = { email, password };
      }
      
      if (!email || !password) {
        const errorMsg = 'Email and password are required';
        setError(errorMsg);
        logger.error('AUTH', 'Validation error', { error: errorMsg });
        return { success: false, error: errorMsg };
      }
      
      logger.apiRequest('POST', '/auth/login', { email });
      
      try {
        const response = await apiService.auth.login(credentials);
        
        // Check if response is valid and contains user data and token
        if (response && response.success && response.user && response.token) {
          const { user: userData, token } = response;
          
          // Store authentication data
          localStorage.setItem('authToken', token);
          localStorage.setItem('userData', JSON.stringify(userData));
          
          // Update auth state
          setUser(userData);
          setIsAuthenticated(true);
          
          // Log successful login
          logger.authLogin(email, true);
          logger.log('AUTH', 'User logged in successfully', { 
            userId: userData.id, 
            email 
          });
          
          return { success: true, user: userData };
        }
        
        // Handle invalid response format
        const invalidFormatError = 'Invalid response format from server';
        logger.error('AUTH', invalidFormatError, { response: response.data });
        throw new Error(invalidFormatError);
        
      } catch (apiError) {
        // Handle API errors
        const errorMessage = apiError.response?.data?.message || apiError.message || 'Login failed. Please check your credentials and try again.';
        const errorData = {
          email,
          error: errorMessage,
          status: apiError.response?.status || 'unknown',
          details: apiError.response?.data || {}
        };

        logger.error('AUTH', 'Login error', errorData);
        setError(errorMessage);
        return { success: false, error: errorMessage, details: errorData };
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      const errorMessage = error.message || 'An unexpected error occurred during login';
      logger.error('AUTH', 'Unexpected login error', { 
        email: email || 'unknown',
        error: errorMessage,
        stack: error.stack
      });
      
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    let email = '';
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Ensure userData is an object with required fields
      const registrationData = typeof userData === 'object' && userData !== null 
        ? userData 
        : { name: '', email: '', password: '' };
      
      email = registrationData.email || '';
      
      logger.apiRequest('POST', '/auth/register', { email });
      const response = await apiService.auth.register(registrationData);
      
      if (response.success) {
        const { user: registeredUser, token } = response;
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(registeredUser));
        
        setUser(registeredUser);
        setIsAuthenticated(true);
        
        logger.authRegister(email, true);
        logger.log('AUTH', 'User registered successfully', { userId: registeredUser.id, email });
        
        return { success: true, user: registeredUser };
      } else {
        const errorMessage = response.message || 'Registration failed';
        setError(errorMessage);
        logger.authRegister(email, false);
        logger.error('AUTH', 'Registration failed', { email, error: errorMessage });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      logger.authRegister(email, false);
      logger.error('AUTH', 'Registration error', { email, error: errorMessage });
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
    logger.apiRequest('POST', '/auth/logout');
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