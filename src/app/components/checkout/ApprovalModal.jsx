'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function ApprovalModal({ 
  isOpen, 
  onClose, 
  onContinueWithoutApproval, 
  cartItems = [],
  totalAmount = 0
}) {
  const { user } = useAuth();
  const [adminEmail, setAdminEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('email'); // 'email' or 'success'
  const [orderNumber, setOrderNumber] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminEmail) {
      setError('Please enter an email address');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      // Prepare order details
      const orderDetails = {
        items: cartItems.map(item => ({
          id: item.id || item._id,
          name: item.name || item.title,
          price: item.discountedPrice || item.price,
          quantity: item.quantity,
          includeInstallation: item.includeInstallation || false,
          installationFee: item.includeInstallation ? (item.installationFee || 49.99) : 0
        })),
        subtotal: cartItems.reduce((sum, item) => sum + (item.discountedPrice || item.price) * item.quantity, 0),
        tax: 0,
        shipping: 0,
        total: totalAmount
      };

      // Calculate installation total
      const installationTotal = cartItems
        .filter(item => item.includeInstallation)
        .reduce((sum, item) => sum + (item.installationFee || 49.99) * item.quantity, 0);
      
      orderDetails.total = orderDetails.subtotal + installationTotal;

      // Send approval request
      const response = await fetch('/api/orders/request-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerEmail: user?.email || 'guest@example.com',
          adminEmail,
          orderDetails,
          userId: user?.id || 'guest'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send approval request');
      }

      const data = await response.json();
      setOrderNumber(data.orderNumber);
      setStep('success');
    } catch (err) {
      setError(err.message || 'An error occurred while processing your request');
      console.error('Approval request error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('email');
    setAdminEmail('');
    setError('');
    onClose();
  };

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-3 text-xl font-bold text-gray-900">Request Sent Successfully!</h2>
            <p className="mt-2 text-sm text-gray-500">
              An approval request has been sent to {adminEmail} for Order #{orderNumber}.
              The administrator will review your order shortly.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Request Approval</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Administrator's Email
            </label>
            <input
              type="email"
              id="adminEmail"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="admin@example.com"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter the email address of the person who will approve this order.
            </p>
          </div>

          <div className="mt-6 flex justify-between items-center">
            <button
              type="button"
              onClick={onContinueWithoutApproval}
              disabled={isSubmitting}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Continue without approval
            </button>
            <div className="space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !adminEmail}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Approval Request'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
