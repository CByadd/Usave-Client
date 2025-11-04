// Auth module using Zustand store
// Re-export from Zustand store for backward compatibility
export { 
  getCurrentUser, 
  isAuthenticated, 
  getAuthToken,
  loginUser as login,
  registerUser as register,
  logoutUser as logout,
} from '../stores/useAuthStore';

