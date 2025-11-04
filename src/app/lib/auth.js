// Simple auth module - no context needed
import { apiService } from '../services/api/apiClient';

// Get current user from localStorage
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('authToken');
};

// Login function
export const login = async (email, password) => {
  console.log('=== LOGIN START ===');
  console.log('Email:', email);

  try {
    const response = await apiService.auth.login(email, password);
    console.log('Login response:', response);

    if (!response) {
      throw new Error('No response from server');
    }

    if (response.success === true) {
      const userData = response.user || response.data?.user || response.data;
      const token = response.token || response.data?.token;

      if (!userData || !token) {
        throw new Error('Missing user or token in response');
      }

      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));

      console.log('=== LOGIN SUCCESS ===');
      return { success: true, user: userData };
    } else {
      const errorMsg = response.error || response.message || 'Login failed';
      console.error('Login failed:', errorMsg);
      return { success: false, error: errorMsg };
    }
  } catch (err) {
    console.error('=== LOGIN ERROR ===');
    console.error('Error:', err);
    console.error('Error response:', err.response?.data);
    console.error('Error status:', err.response?.status);

    let errorMsg = 'Login failed. Please check your credentials.';
    
    if (err.response?.data?.error) {
      errorMsg = err.response.data.error;
    } else if (err.response?.data?.message) {
      errorMsg = err.response.data.message;
    } else if (err.message) {
      errorMsg = err.message;
    }

    return { success: false, error: errorMsg };
  }
};

// Register function
export const register = async (userData) => {
  try {
    const response = await apiService.auth.register(userData);
    
    if (response && response.success === true) {
      const newUser = response.user || response.data?.user || response.data;
      const token = response.token || response.data?.token;

      if (newUser && token) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(newUser));
        return { success: true, user: newUser };
      }
    }

    const errorMsg = response?.error || response?.message || 'Registration failed';
    return { success: false, error: errorMsg };
  } catch (err) {
    const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed';
    return { success: false, error: errorMsg };
  }
};

// Logout function
export const logout = async () => {
  try {
    await apiService.auth.logout();
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }
};

// Get auth token
export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

