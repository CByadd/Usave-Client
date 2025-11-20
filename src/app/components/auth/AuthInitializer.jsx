"use client";

import { useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { apiService } from '../../services/api/apiClient';

// Helper function to decode JWT token without verification
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

// Check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
  // Add 5 minute buffer to account for clock skew
  const currentTime = Math.floor(Date.now() / 1000);
  const bufferTime = 5 * 60; // 5 minutes
  return decoded.exp < (currentTime + bufferTime);
};

// Clear auth data
const clearAuth = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  
  // Update store state
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
  });
};

export default function AuthInitializer() {
  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    // Check token expiration on initial load
    const validateToken = async () => {
      if (typeof window === 'undefined') return;

      const storedToken = localStorage.getItem('authToken');
      
      // If no token, nothing to validate
      if (!storedToken) {
        clearAuth();
        return;
      }

      // First, check if token is expired locally (quick check)
      if (isTokenExpired(storedToken)) {
        console.warn('Token expired on initial load. Logging out...');
        clearAuth();
        return;
      }

      // Then, validate token with server to ensure it's still valid
      try {
        const response = await apiService.auth.getCurrentUser();
        if (!response || !response.success) {
          // Token is invalid on server
          console.warn('Token invalid on server. Logging out...');
          clearAuth();
        }
        // If successful, token is valid - no action needed
      } catch (error) {
        // If 401 or token error, clear auth
        if (error.response?.status === 401 || 
            error.response?.data?.error?.toLowerCase().includes('token') ||
            error.response?.data?.message?.toLowerCase().includes('token')) {
          console.warn('Token validation failed. Logging out...');
          clearAuth();
        }
        // For other errors, don't clear auth (might be network issue)
      }
    };

    // Validate token on mount
    validateToken();
  }, []); // Empty dependency array - only run on mount

  return null; // This component doesn't render anything
}

