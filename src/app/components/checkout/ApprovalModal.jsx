'use client';

import { useState } from 'react';
import { requestApproval } from '../../actions/orderActions';

export default function ApprovalModal({ 
  isOpen, 
  onClose, 
  onContinueWithoutApproval, 
  orderDetails, 
  userId 
}) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await requestApproval(email, orderDetails, userId);
      
      if (result.error) {
        setError(result.error);
      } else {
        onClose();
        // Show success message or redirect
        alert('Approval request sent successfully!');
      }
    } catch (error) {
      setError('Failed to send approval request. Please try again.');
      console.error('Approval request error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Request Approval</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Owner's Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
              placeholder="owner@example.com"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onContinueWithoutApproval}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              disabled={isSubmitting}
            >
              Continue Without Approval
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 bg-[#0F4C81] text-white rounded-md hover:bg-[#0D3F6A] disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
