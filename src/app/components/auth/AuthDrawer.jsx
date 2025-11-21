"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Eye, EyeOff, Mail, Lock, User, LogOut, ArrowLeft } from 'lucide-react';
import { login as loginUser } from '../../lib/auth';
import { apiService } from '../../services/api/apiClient';
import { useUIStore } from '../../stores/useUIStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationStore } from '../../stores/useAnimationStore';
import { useAuthStore } from '../../stores/useAuthStore';

const LoginForm = ({ onSwitch, onClose }) => {
  const router = useRouter();
  const authRedirectPath = useUIStore((state) => state.authRedirectPath);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

    setIsLoading(true);
    setError('');

    try {
      console.log('AuthDrawer: Calling login with:', { email: formData.email });
      const result = await loginUser(formData.email, formData.password);
      console.log('AuthDrawer: Login result:', result);
      
      if (result && result.success) {
        console.log('AuthDrawer: Login successful, closing drawer');
        setFormData({ email: '', password: '' });
        
        // Check if there's a redirect path (e.g., from checkout flow)
        if (authRedirectPath) {
          // Close drawer first
          if (onClose && typeof onClose === 'function') {
            onClose();
          }
          // Small delay to ensure auth state is updated, then redirect
          setTimeout(() => {
            router.push(authRedirectPath);
          }, 100);
        } else {
          // Close drawer and reload page to update auth state
          if (onClose && typeof onClose === 'function') {
            onClose();
          }
          window.location.reload();
        }
      } else {
        const errorMsg = result?.error || 'Login failed. Please try again.';
        console.error('AuthDrawer: Login failed:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('AuthDrawer: Login error:', err);
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B4866] focus:border-[#0B4866]"
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
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B4866] focus:border-[#0B4866]"
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
              className="h-4 w-4 text-[#0B4866] focus:ring-[#0B4866] border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          
          <div className="text-sm">
            <button
              type="button"
              onClick={() => onSwitch && typeof onSwitch === 'function' && onSwitch('forgot-password')}
              className="font-medium text-[#0B4866] hover:text-[#094058]"
            >
              Forgot password?
            </button>
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0B4866] hover:bg-[#094058] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B4866] disabled:opacity-50 disabled:cursor-not-allowed"
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
  const router = useRouter();
  const authRedirectPath = useUIStore((state) => state.authRedirectPath);
  const { login } = useAuthStore();
  const [step, setStep] = useState('details'); // 'details' or 'otp'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpResendTimer, setOtpResendTimer] = useState(0);

  // OTP resend countdown
  useEffect(() => {
    if (otpResendTimer > 0) {
      const timer = setTimeout(() => setOtpResendTimer(otpResendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpResendTimer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
  };

  const validateRegistrationForm = () => {
    // Validate first name
    if (!formData.firstName || !formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (formData.firstName.trim().length < 2) {
      setError('First name must be at least 2 characters');
      return false;
    }

    // Validate last name
    if (!formData.lastName || !formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (formData.lastName.trim().length < 2) {
      setError('Last name must be at least 2 characters');
      return false;
    }

    // Validate email
    if (!formData.email || !formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Validate phone (if provided)
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[\d\s()+-]{10,}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        setError('Please enter a valid phone number (at least 10 digits)');
        return false;
      }
    }

    // Validate password
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    // Check password strength
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumber = /\d/.test(formData.password);
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return false;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!validateRegistrationForm()) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.auth.sendRegistrationOTP(formData.email);
      
      if (response && response.success) {
        setStep('otp');
        setSuccess('Verification code sent to your email');
        setOtpResendTimer(60); // 60 seconds cooldown
      } else {
        setError(response?.message || 'Failed to send verification code');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpResendTimer > 0) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.auth.sendRegistrationOTP(formData.email);
      
      if (response && response.success) {
        setSuccess('Verification code resent to your email');
        setOtpResendTimer(60);
      } else {
        setError(response?.message || 'Failed to resend verification code');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to resend verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.auth.verifyAndRegister({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || null,
        otp
      });
      
      if (response && response.success) {
        const userData = response.data?.user || response.user || response.data;
        const token = response.data?.token || response.token;

        if (userData && token) {
          // Login the user
          await login(userData.email, formData.password);
          
          // Check if there's a redirect path
          if (authRedirectPath) {
            if (onClose && typeof onClose === 'function') {
              onClose();
            }
            setTimeout(() => {
              router.push(authRedirectPath);
            }, 100);
          } else {
            if (onClose && typeof onClose === 'function') {
              onClose();
            }
            window.location.reload();
          }
        }
      } else {
        setError(response?.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setStep('details')}
            className="mr-3 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-900 flex-1">Verify Email</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
            {success}
          </div>
        )}
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            We've sent a 6-digit verification code to <strong>{formData.email}</strong>
          </p>
        </div>
        
        <form onSubmit={handleVerifyAndRegister} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={otp}
              onChange={handleOtpChange}
              required
              maxLength={6}
              className="block w-full text-center text-2xl tracking-widest py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B4866] focus:border-[#0B4866]"
              placeholder="000000"
              autoComplete="one-time-code"
            />
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={otpResendTimer > 0 || isLoading}
              className="text-sm text-[#0B4866] hover:text-[#094058] disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {otpResendTimer > 0 ? `Resend code in ${otpResendTimer}s` : 'Resend code'}
            </button>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0B4866] hover:bg-[#094058] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B4866] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify & Create Account'}
            </button>
          </div>
        </form>
      </div>
    );
  }

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
      
      <form onSubmit={handleSendOTP} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B4866] focus:border-[#0B4866]"
                placeholder="First name"
              />
            </div>
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B4866] focus:border-[#0B4866]"
              placeholder="Last name"
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B4866] focus:border-[#0B4866]"
              placeholder="Enter your email"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone (Optional)
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B4866] focus:border-[#0B4866]"
            placeholder="Enter your phone number"
          />
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
              minLength={8}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B4866] focus:border-[#0B4866]"
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
          <p className="mt-1 text-xs text-gray-500">
            Must be at least 8 characters with uppercase, lowercase, and a number
          </p>
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
              minLength={8}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B4866] focus:border-[#0B4866]"
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
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0B4866] hover:bg-[#094058] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B4866] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending code...' : 'Send Verification Code'}
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

const ForgotPasswordForm = ({ onSwitch, onClose }) => {
  const [step, setStep] = useState('email'); // 'email', 'otp', 'reset'
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [resetToken, setResetToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpResendTimer, setOtpResendTimer] = useState(0);

  // OTP resend countdown
  useEffect(() => {
    if (otpResendTimer > 0) {
      const timer = setTimeout(() => setOtpResendTimer(otpResendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpResendTimer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, otp: value }));
    setError('');
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      setError('Email is required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.auth.sendPasswordResetOTP(formData.email);
      
      if (response && response.success) {
        setStep('otp');
        setSuccess('Verification code sent to your email');
        setOtpResendTimer(60);
      } else {
        setError(response?.message || 'Failed to send verification code');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpResendTimer > 0) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.auth.sendPasswordResetOTP(formData.email);
      
      if (response && response.success) {
        setSuccess('Verification code resent to your email');
        setOtpResendTimer(60);
      } else {
        setError(response?.message || 'Failed to resend verification code');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to resend verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.auth.verifyPasswordResetOTP(formData.email, formData.otp);
      
      if (response && response.success) {
        setResetToken(response.data?.resetToken || '');
        setStep('reset');
        setSuccess('OTP verified. Please enter your new password');
      } else {
        setError(response?.message || 'Invalid verification code');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.auth.resetPassword(resetToken, formData.newPassword);
      
      if (response && response.success) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          if (onSwitch && typeof onSwitch === 'function') {
            onSwitch('login');
          }
        }, 2000);
      } else {
        setError(response?.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setStep('email')}
            className="mr-3 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-900 flex-1">Verify Email</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
            {success}
          </div>
        )}
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            We've sent a 6-digit verification code to <strong>{formData.email}</strong>
          </p>
        </div>
        
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={formData.otp}
              onChange={handleOtpChange}
              required
              maxLength={6}
              className="block w-full text-center text-2xl tracking-widest py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B4866] focus:border-[#0B4866]"
              placeholder="000000"
              autoComplete="one-time-code"
            />
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={otpResendTimer > 0 || isLoading}
              className="text-sm text-[#0B4866] hover:text-[#094058] disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {otpResendTimer > 0 ? `Resend code in ${otpResendTimer}s` : 'Resend code'}
            </button>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading || formData.otp.length !== 6}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0B4866] hover:bg-[#094058] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B4866] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (step === 'reset') {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setStep('otp')}
            className="mr-3 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-900 flex-1">Reset Password</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
            {success}
          </div>
        )}
        
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B4866] focus:border-[#0B4866]"
                placeholder="Enter new password"
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
              Confirm New Password
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
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B4866] focus:border-[#0B4866]"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0B4866] hover:bg-[#094058] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B4866] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => onSwitch && typeof onSwitch === 'function' && onSwitch('login')}
          className="mr-3 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 flex-1">Reset Password</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
          {success}
        </div>
      )}
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Enter your email address and we'll send you a verification code to reset your password.
        </p>
      </div>
      
      <form onSubmit={handleSendOTP} className="space-y-4">
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B4866] focus:border-[#0B4866]"
              placeholder="Enter your email"
            />
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0B4866] hover:bg-[#094058] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B4866] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending code...' : 'Send Verification Code'}
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => onSwitch && typeof onSwitch === 'function' && onSwitch('login')}
          className="text-sm text-[#0B4866] hover:text-[#094058]"
        >
          Back to Sign in
        </button>
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
  const router = useRouter();
  const isAuthDrawerOpen = useUIStore((state) => state.isAuthDrawerOpen);
  const authRedirectPath = useUIStore((state) => state.authRedirectPath);
  const closeAuthDrawer = useUIStore((state) => state.closeAuthDrawer);
  const setAuthRedirectPath = useUIStore((state) => state.setAuthRedirectPath);
  const { getAnimationConfig } = useAnimationStore();
  const drawerConfig = getAnimationConfig('drawer');
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const [activeTab, setActiveTab] = useState('login');
  const [forceOpen, setForceOpen] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onOpen = (e) => {
      try {
        const tab = e?.detail?.tab || 'login';
        const redirectPath = e?.detail?.redirectPath || null;
        setActiveTab(tab);
        if (redirectPath) {
          setAuthRedirectPath(redirectPath);
        }
      } catch {}
      setForceOpen(true);
    };
    const onClose = () => {
      setForceOpen(false);
      setAuthRedirectPath(null);
    };
    document.body.addEventListener('usave:openAuth', onOpen);
    document.body.addEventListener('usave:closeAuth', onClose);
    return () => {
      document.body.removeEventListener('usave:openAuth', onOpen);
      document.body.removeEventListener('usave:closeAuth', onClose);
    };
  }, [setAuthRedirectPath]);
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      closeAuthDrawer();
      setForceOpen(false);
      setAuthRedirectPath(null);
      // Use router to navigate instead of reload for immediate effect
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };
  
  const safeCloseAuthDrawer = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    closeAuthDrawer();
    setForceOpen(false);
    setAuthRedirectPath(null);
    // Fallback: dispatch close event
    if (typeof document !== 'undefined') {
      try {
        document.body.dispatchEvent(new CustomEvent('usave:closeAuth'));
      } catch (err) {
        console.error('[AuthDrawer] Error dispatching close event:', err);
      }
    }
  };
  
  console.log('AuthDrawer render - isAuthDrawerOpen:', isAuthDrawerOpen, 'forceOpen:', forceOpen);
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      {(isAuthDrawerOpen || forceOpen) && (
        <motion.div
          key="auth-drawer"
          className="fixed inset-0 z-[100] overflow-hidden"
          initial="closed"
          animate="open"
          exit="closed"
          variants={{
            open: { transition: { staggerChildren: 0.05 } },
            closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
          }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-10"
              variants={{
                open: { opacity: 1 },
                closed: { opacity: 0 },
              }}
              transition={{ 
                duration: drawerConfig.backdrop.duration, 
                ease: drawerConfig.backdrop.ease 
              }}
              onClick={safeCloseAuthDrawer}
              aria-hidden="true"
              style={{ willChange: 'opacity' }}
            />
            
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex z-20">
              <motion.div 
                className="w-screen max-w-md"
                variants={{
                  open: { x: 0 },
                  closed: { x: '100%' },
                }}
                transition={drawerConfig.panel}
                onClick={(e) => e.stopPropagation()}
                style={{ willChange: 'transform' }}
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
                  {activeTab !== 'forgot-password' && (
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
                  )}
                  
                  <div className="flex-1 overflow-y-auto">
                    {activeTab === 'login' ? (
                      <LoginForm 
                        onSwitch={(tab) => handleTabChange(tab)} 
                        onClose={safeCloseAuthDrawer} 
                      />
                    ) : activeTab === 'register' ? (
                      <RegisterForm 
                        onSwitch={(tab) => handleTabChange(tab)} 
                        onClose={safeCloseAuthDrawer} 
                      />
                    ) : activeTab === 'forgot-password' ? (
                      <ForgotPasswordForm 
                        onSwitch={(tab) => handleTabChange(tab)} 
                        onClose={safeCloseAuthDrawer} 
                      />
                    ) : null}
                  </div>
                </>
              )}
            </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthDrawer;
