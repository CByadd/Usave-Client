"use client";
import React, { useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin, embedded = false }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, error, clearError } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (error) clearError();
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.firstName.trim()) errors.push('First name is required');
    if (!formData.lastName.trim()) errors.push('Last name is required');
    if (!formData.email.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    if (!formData.phone.trim()) {
      errors.push('Phone number is required');
    }
    if (!formData.password) {
      errors.push('Password is required');
    } else if (formData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    if (formData.password !== formData.confirmPassword) errors.push('Passwords do not match');
    if (!formData.agreeToTerms) errors.push('You must agree to the terms and conditions');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) return;

    setIsSubmitting(true);
    try {
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      if (result.success) {
        onClose();
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          agreeToTerms: false
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="register-firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      id="register-firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      placeholder="First name"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="register-lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    id="register-lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                    placeholder="Last name"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    id="register-email"
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
                <label htmlFor="register-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    id="register-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                    placeholder="+61 4XX XXX XXX"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="register-password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                    placeholder="Create a password"
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

              <div>
                <label htmlFor="register-confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="register-confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                    placeholder="Confirm your password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  required
                  className="mt-1 rounded border-gray-300 text-[#0B4866] focus:ring-[#0B4866]"
                  disabled={isSubmitting}
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                  I agree to the <span className="text-[#0B4866]">Terms and Conditions</span> and <span className="text-[#0B4866]">Privacy Policy</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !formData.agreeToTerms}
                className="w-full bg-[#0B4866] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#094058] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => { clearError(); onSwitchToLogin(); }}
                  className="text-[#0B4866] hover:underline font-medium"
                  disabled={isSubmitting}
                >
                  Sign in
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
            <h2 className="text-2xl font-semibold text-gray-900">Create Account</h2>
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




