'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, Mail } from 'lucide-react';

export default function ReApprovalModal({
  isOpen,
  onClose,
  order,
  onDirectSubmit,
}) {
  const [ownerEmail, setOwnerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('email');
  const [orderNumber, setOrderNumber] = useState('');
  const [flowType, setFlowType] = useState('owner'); // 'owner' or 'direct'

  if (!isOpen || !order) return null;

  const handleOwnerSubmit = async (e) => {
    e.preventDefault();
    if (!ownerEmail) {
      setError('Please enter owner email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Prepare order details from existing order
      const orderDetails = {
        items: order.items?.map((item) => ({
          id: item.productId || item.id || item.product?.id,
          productId: item.productId || item.id || item.product?.id,
          name: item.product?.title || item.name || 'Unknown Product',
          price: item.price || item.product?.discountedPrice || 0,
          quantity: item.quantity || 1,
          product: {
            id: item.productId || item.id || item.product?.id,
            title: item.product?.title || item.name || 'Unknown Product',
            image: item.product?.image || '',
          },
        })) || [],
        subtotal: order.subtotal || 0,
        tax: order.tax || 0,
        shipping: order.shipping || 0,
        warranty: 0, // Warranty is included in total
        total: order.total || 0,
        shippingAddress: order.shippingAddress || {},
      };

      const response = await fetch('/api/orders/request-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerEmail: ownerEmail,
          adminEmail: null, // Admin email will be fetched from backend
          orderDetails,
          userId: order.userId || 'guest',
          requiresOwnerApproval: true, // Flow 2 - owner approval first
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send approval request');
      }

      const data = await response.json();
      setOrderNumber(data.data?.orderNumber || data.orderNumber || '');
      setStep('success');
      
      // Call success callback after a short delay to show success message
      setTimeout(() => {
        if (onDirectSubmit) {
          onDirectSubmit(data);
        }
      }, 2000);
    } catch (err) {
      setError(err.message || 'An error occurred while processing your request');
      console.error('Reapproval request error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Prepare order details from existing order
      const orderDetails = {
        items: order.items?.map((item) => ({
          id: item.productId || item.id || item.product?.id,
          productId: item.productId || item.id || item.product?.id,
          name: item.product?.title || item.name || 'Unknown Product',
          price: item.price || item.product?.discountedPrice || 0,
          quantity: item.quantity || 1,
          product: {
            id: item.productId || item.id || item.product?.id,
            title: item.product?.title || item.name || 'Unknown Product',
            image: item.product?.image || '',
          },
        })) || [],
        subtotal: order.subtotal || 0,
        tax: order.tax || 0,
        shipping: order.shipping || 0,
        warranty: 0, // Warranty is included in total
        total: order.total || 0,
        shippingAddress: order.shippingAddress || {},
      };

      const response = await fetch('/api/orders/request-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerEmail: null,
          adminEmail: null, // Admin email will be fetched from backend
          orderDetails,
          userId: order.userId || 'guest',
          requiresOwnerApproval: false, // Direct to admin
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit order');
      }

      const data = await response.json();
      setOrderNumber(data.data?.orderNumber || data.orderNumber || '');
      setStep('success');
      
      // Call success callback after a short delay to show success message
      setTimeout(() => {
        if (onDirectSubmit) {
          onDirectSubmit(data);
        }
      }, 2000);
    } catch (err) {
      setError(err.message || 'An error occurred while processing your request');
      console.error('Direct submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('email');
    setOwnerEmail('');
    setError('');
    setOrderNumber('');
    setFlowType('owner');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            key="modal"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 250, damping: 20 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>

            {step === 'success' ? (
              <div className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="w-14 h-14 text-green-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {flowType === 'owner' ? 'Request Sent Successfully!' : 'Order Submitted Successfully!'}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {flowType === 'owner' 
                    ? `An approval request has been sent to ${ownerEmail} for Order #${orderNumber}. The owner will review your order first, then it will be sent to admin.`
                    : `Your order #${orderNumber} has been submitted directly to admin for approval.`
                  }
                </p>
                <button
                  onClick={handleClose}
                  className="mt-6 px-5 py-2.5 bg-[#0B4866] text-white rounded-lg font-medium cursor-pointer transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Re-Send Approval Request</h2>
                <p className="text-sm text-gray-500 mb-5">
                  Choose how you want to resubmit this order for approval.
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Flow 2: Owner Approval First */}
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Mail className="w-5 h-5 text-[#0B4866]" />
                      <h3 className="font-semibold text-gray-900">Submit to Owner First (Flow 2)</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Enter the owner's email address. The owner will review first, then it will be sent to admin.
                    </p>
                    <form onSubmit={handleOwnerSubmit}>
                      <div className="mb-4">
                        <label
                          htmlFor="ownerEmail"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Owner's Email *
                        </label>
                        <input
                          type="email"
                          id="ownerEmail"
                          value={ownerEmail}
                          onChange={(e) => setOwnerEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B4866] transition"
                          placeholder="owner@example.com"
                          required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Enter the owner's email address who needs to approve first. After owner approval, the order will be sent to admin.
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting || !ownerEmail}
                        className="w-full px-4 py-2 text-sm rounded-lg bg-[#0B4866] text-white font-medium hover:bg-[#0a3d55] transition ease-in-out focus:ring-2 disabled:opacity-50"
                        onClick={() => setFlowType('owner')}
                      >
                        {isSubmitting ? 'Sending...' : 'Submit to Owner'}
                      </button>
                    </form>
                  </div>

                  {/* Direct to Admin */}
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-[#0B4866]" />
                      <h3 className="font-semibold text-gray-900">Submit Directly to Admin</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Submit this order directly to admin for approval without owner review. Admin email will be fetched automatically.
                    </p>
                    <button
                      onClick={() => {
                        setFlowType('direct');
                        handleDirectSubmit();
                      }}
                      disabled={isSubmitting}
                      className="w-full px-4 py-2 text-sm rounded-lg bg-white border-2 border-[#0B4866] text-[#0B4866] font-medium hover:bg-[#0B4866] hover:text-white transition ease-in-out focus:ring-2 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit to Admin'}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end items-center mt-6">
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

