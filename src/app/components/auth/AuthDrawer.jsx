"use client";
import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';
import { motion, AnimatePresence } from 'framer-motion';

const LoginForm = ({ onSwitch, onClose }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!login || typeof login !== 'function') {
      setError('Login function is not available');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result && result.success) {
        if (onClose && typeof onClose === 'function') {
          onClose();
        }
        setFormData({ email: '', password: '' });
      } else {
        setError(result?.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              )}
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          
          <div className="text-sm">
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Forgot password?
            </a>
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#003B8E] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="button"
            onClick={() => onSwitch && typeof onSwitch === 'function' && onSwitch('register')}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
};

const RegisterForm = ({ onSwitch, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!register || typeof register !== 'function') {
      setError('Registration function is not available');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      if (result && result.success) {
        if (onClose && typeof onClose === 'function') {
          onClose();
        }
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      } else {
        setError(result?.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create an account</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your full name"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              )}
            </button>
          </div>
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm your password"
            />
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
            I agree to the <a href="#" className="text-blue-600 hover:text-blue-500">Terms of Service</a> and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
          </label>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Sign up'}
          </button>
        </div>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Already have an account?</span>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="button"
            onClick={() => onSwitch && typeof onSwitch === 'function' && onSwitch('login')}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign in to your account
          </button>
        </div>
      </div>
    </div>
  );
};

const UserDropdown = ({ user, onClose, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
          >
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || ''}
              </p>
            </div>
            <div className="py-1">
              <a
                href="/account"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={onClose}
              >
                My Account
              </a>
              <a
                href="/orders"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={onClose}
              >
                My Orders
              </a>
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AuthDrawer = () => {
  const { isAuthDrawerOpen, closeAuthDrawer } = useUI();
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [forceOpen, setForceOpen] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onOpen = (e) => {
      try {
        const tab = e?.detail?.tab || 'login';
        setActiveTab(tab);
      } catch {}
      setForceOpen(true);
    };
    const onClose = () => setForceOpen(false);
    document.body.addEventListener('usave:openAuth', onOpen);
    document.body.addEventListener('usave:closeAuth', onClose);
    return () => {
      document.body.removeEventListener('usave:openAuth', onOpen);
      document.body.removeEventListener('usave:closeAuth', onClose);
    };
  }, []);
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleLogout = () => {
    if (logout && typeof logout === 'function') {
      logout();
    }
    if (closeAuthDrawer && typeof closeAuthDrawer === 'function') {
      closeAuthDrawer();
    }
  };
  
  const safeCloseAuthDrawer = (e) => {
    console.log('[AuthDrawer] safeCloseAuthDrawer called');
    console.log('[AuthDrawer] closeAuthDrawer type:', typeof closeAuthDrawer);
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (closeAuthDrawer && typeof closeAuthDrawer === 'function') {
      console.log('[AuthDrawer] Calling closeAuthDrawer');
      closeAuthDrawer();
      console.log('[AuthDrawer] closeAuthDrawer called');
    } else {
      console.warn('[AuthDrawer] closeAuthDrawer is not a function');
    }
    // Fallback: dispatch close event
    if (typeof document !== 'undefined') {
      try {
        document.body.dispatchEvent(new CustomEvent('usave:closeAuth'));
        console.log('[AuthDrawer] Dispatched usave:closeAuth event');
      } catch (err) {
        console.error('[AuthDrawer] Error dispatching close event:', err);
      }
    }
  };
  
  console.log('AuthDrawer render - isAuthDrawerOpen:', isAuthDrawerOpen, 'forceOpen:', forceOpen);
  
  if (!isAuthDrawerOpen && !forceOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence>
          <motion.div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={safeCloseAuthDrawer}
            aria-hidden="true"
          />
        </AnimatePresence>
        
        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex z-20">
          <motion.div 
            className="w-screen max-w-md"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
              {isAuthenticated ? (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">My Account</h2>
                    <button 
                      onClick={safeCloseAuthDrawer}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-sm text-gray-500">{user?.email || ''}</p>
                    </div>
                  </div>
                  
                  <nav className="space-y-1">
                    <a
                      href="/account"
                      className="group flex items-center px-3 py-3 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                      onClick={safeCloseAuthDrawer}
                    >
                      <span className="truncate">My Profile</span>
                    </a>
                    <a
                      href="/orders"
                      className="group flex items-center px-3 py-3 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                      onClick={safeCloseAuthDrawer}
                    >
                      <span className="truncate">My Orders</span>
                    </a>
                    <a
                      href="/wishlist"
                      className="group flex items-center px-3 py-3 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                      onClick={safeCloseAuthDrawer}
                    >
                      <span className="truncate">My Wishlist</span>
                    </a>
                    <a
                      href="/addresses"
                      className="group flex items-center px-3 py-3 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                      onClick={safeCloseAuthDrawer}
                    >
                      <span className="truncate">Saved Addresses</span>
                    </a>
                    <button
                      onClick={() => {
                        handleLogout();
                        safeCloseAuthDrawer();
                      }}
                      className="w-full group flex items-center px-3 py-3 text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                    >
                      <LogOut className="h-5 w-5 mr-2 text-red-500" />
                      <span>Sign out</span>
                    </button>
                  </nav>
                </div>
              ) : (
                <>
                  <div className="border-b border-gray-200">
                    <div className="flex">
                      <button
                        type="button"
                        className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                          activeTab === 'login'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                        onClick={() => handleTabChange('login')}
                      >
                        Sign in
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                          activeTab === 'register'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                        onClick={() => handleTabChange('register')}
                      >
                        Create account
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    {activeTab === 'login' ? (
                      <LoginForm 
                        onSwitch={() => handleTabChange('register')} 
                        onClose={safeCloseAuthDrawer} 
                      />
                    ) : (
                      <RegisterForm 
                        onSwitch={() => handleTabChange('login')} 
                        onClose={safeCloseAuthDrawer} 
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthDrawer;
