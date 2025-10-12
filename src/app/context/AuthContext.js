"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          const parsedUserData = JSON.parse(userData);
          setUser(parsedUserData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Check if we should use mock API (for development)
  const useMockAPI = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL;

  // Mock API calls for development
  const mockApiCall = async (endpoint, data) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock responses based on endpoint
    switch (endpoint) {
      case 'login':
        if (data.email === 'demo@usave.com' && data.password === 'password123') {
          return {
            success: true,
            token: 'mock-jwt-token-' + Date.now(),
            user: {
              id: 1,
              email: data.email,
              firstName: 'John',
              lastName: 'Doe',
              phone: '+61 4XX XXX XXX',
              role: 'customer',
              createdAt: new Date().toISOString(),
              addresses: [
                {
                  id: 1,
                  type: 'home',
                  street: '123 Main Street',
                  city: 'Cairns',
                  state: 'QLD',
                  postcode: '4870',
                  country: 'Australia',
                  isDefault: true
                }
              ]
            }
          };
        } else {
          return {
            success: false,
            error: 'Invalid email or password'
          };
        }
        
      case 'register':
        // Check if email already exists
        if (data.email === 'demo@usave.com') {
          return {
            success: false,
            error: 'Email already exists'
          };
        }
        
        return {
          success: true,
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: Date.now(),
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone || '',
            role: 'customer',
            createdAt: new Date().toISOString(),
            addresses: []
          }
        };
        
      case 'verify-token':
        const token = localStorage.getItem('authToken');
        if (token) {
          return {
            success: true,
            user: JSON.parse(localStorage.getItem('userData'))
          };
        }
        return {
          success: false,
          error: 'Invalid token'
        };
        
      default:
        return {
          success: false,
          error: 'Unknown endpoint'
        };
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (useMockAPI) {
        response = await mockApiCall('login', { email, password });
      } else {
        response = await apiService.auth.login({ email, password });
      }
      
      if (response.success) {
        const { token, user } = response;
        
        // Store in localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (useMockAPI) {
        response = await mockApiCall('register', userData);
      } else {
        response = await apiService.auth.register(userData);
      }
      
      if (response.success) {
        const { token, user } = response;
        
        // Store in localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout API if not using mock
      if (!useMockAPI) {
        await apiService.auth.logout();
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('cartItems'); // Clear cart on logout
      
      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      // Redirect to home
      router.push('/');
    }
  };

  const updateProfile = async (updatedData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock API call for profile update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = { ...user, ...updatedData };
      
      // Update localStorage
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true };
    } catch (error) {
      const errorMessage = 'Profile update failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const addAddress = async (addressData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock API call for adding address
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newAddress = {
        id: Date.now(),
        ...addressData,
        isDefault: !user.addresses || user.addresses.length === 0
      };
      
      const updatedUser = {
        ...user,
        addresses: [...(user.addresses || []), newAddress]
      };
      
      // Update localStorage
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true };
    } catch (error) {
      const errorMessage = 'Failed to add address. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const updateAddress = async (addressId, addressData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock API call for updating address
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedAddresses = user.addresses.map(addr =>
        addr.id === addressId ? { ...addr, ...addressData } : addr
      );
      
      const updatedUser = {
        ...user,
        addresses: updatedAddresses
      };
      
      // Update localStorage
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true };
    } catch (error) {
      const errorMessage = 'Failed to update address. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAddress = async (addressId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock API call for deleting address
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedAddresses = user.addresses.filter(addr => addr.id !== addressId);
      
      const updatedUser = {
        ...user,
        addresses: updatedAddresses
      };
      
      // Update localStorage
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true };
    } catch (error) {
      const errorMessage = 'Failed to delete address. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    // State
    user,
    isLoading,
    isAuthenticated,
    error,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

