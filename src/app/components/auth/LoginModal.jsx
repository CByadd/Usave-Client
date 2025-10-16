"use client";
import React, { useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginModal({ isOpen, onClose, onSwitchToRegister, embedded = false }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error, clearError } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        onClose();
        setFormData({ email: '', password: '' });
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    try {
      const result = await login('demo@usave.com', 'password123');
      if (result.success) onClose();
    } catch (err) {
      console.error('Demo login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    id="login-email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                    placeholder="Enter your email"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                    placeholder="Enter your password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-[#0B4866] focus:ring-[#0B4866]" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button type="button" className="text-sm text-[#0B4866] hover:underline" disabled={isSubmitting}>
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0B4866] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#094058] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleDemoLogin}
                disabled={isSubmitting}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Demo Login (demo@usave.com)
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => { clearError(); onSwitchToRegister(); }}
                  className="text-[#0B4866] hover:underline font-medium"
                  disabled={isSubmitting}
                >
                  Sign up
                </button>
              </p>
            </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50`}>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[380px] bg-white shadow-xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="relative h-full overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">Sign In</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={24} />
            </button>
          </div>
          {content}
        </div>
      </div>
    </div>
  );
}




