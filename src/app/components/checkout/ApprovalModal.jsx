'use client';

import { useState,useEffect } from 'react';
import { useRouter } from 'next/navigation'; // ✅ import router
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUser } from '../../lib/auth';
import { CheckCircle2, X } from 'lucide-react';

export default function ApprovalModal({
  isOpen,
  onClose,
  onContinueWithoutApproval,
  cartItems = [],
  totalAmount = 0,
  flowType = 'owner',
  shippingAddress = null,
  customerInfo = null,
  customerName = '',
  customerEmail = '',
  customerPhone = '',
  subtotal = 0,
  tax = 0,
  shipping = 0,
  warranty = 0,
}) {
  const router = useRouter(); // ✅ initialize router
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    setUser(getCurrentUser());
  }, []);
  const [ownerEmail, setOwnerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('email');
  const [orderNumber, setOrderNumber] = useState('');
  const [currentFlowType, setCurrentFlowType] = useState(flowType); // 'owner' or 'direct'
  
  // Update flow type when prop changes
  useEffect(() => {
    setCurrentFlowType(flowType);
  }, [flowType]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ownerEmail) {
      setError('Please enter owner email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Use provided values or calculate from cart items
      const calculatedSubtotal = subtotal || cartItems.reduce(
        (sum, item) => sum + (item.discountedPrice || item.price || item.product?.discountedPrice || item.product?.originalPrice || 0) * (item.quantity || 1),
        0
      );
      
      const calculatedTax = tax || 0;
      const calculatedShipping = shipping || 0;
      const calculatedWarranty = warranty || 0;
      const calculatedTotal = totalAmount || (calculatedSubtotal + calculatedTax + calculatedShipping + calculatedWarranty);

      const resolvedCustomerInfo = customerInfo || {
        firstName: shippingAddress?.firstName || '',
        lastName: shippingAddress?.lastName || '',
        email: customerEmail || shippingAddress?.email || user?.email || '',
        phone: customerPhone || shippingAddress?.phone || '',
      };

      const resolvedCustomerName = customerName
        || `${resolvedCustomerInfo.firstName || ''} ${resolvedCustomerInfo.lastName || ''}`.trim();
      const resolvedCustomerEmail = customerEmail || resolvedCustomerInfo.email || user?.email || '';
      const resolvedCustomerPhone = customerPhone || resolvedCustomerInfo.phone || '';

      const orderDetails = {
        items: cartItems.map((item) => ({
          id: item.productId || item.id || item.product?.id || item._id,
          productId: item.productId || item.id || item.product?.id,
          name: item.name || item.title || item.product?.title,
          price: item.discountedPrice || item.price || item.product?.discountedPrice || item.product?.originalPrice,
          quantity: item.quantity || 1,
          product: {
            id: item.productId || item.id || item.product?.id,
            title: item.name || item.title || item.product?.title,
            image: item.image || item.product?.image || '',
          },
        })),
        subtotal: calculatedSubtotal,
        tax: calculatedTax,
        shipping: calculatedShipping,
        warranty: calculatedWarranty,
        total: calculatedTotal,
        shippingAddress: shippingAddress || {},
        billingAddress: shippingAddress || {},
        customer: resolvedCustomerInfo,
        customerName: resolvedCustomerName,
        customerEmail: resolvedCustomerEmail,
        customerPhone: resolvedCustomerPhone,
      };

      // For owner approval flow, only send owner email - admin email comes from backend
      const response = await fetch('/api/orders/request-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerEmail: ownerEmail,
          adminEmail: null, // Admin email will be fetched from backend
          orderDetails,
          userId: user?.id || 'guest',
          requiresOwnerApproval: true, // This is owner approval flow
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

  // ✅ Modified handleClose: resets state & redirects to /orders
  const handleClose = () => {
    setStep('email');
    setOwnerEmail('');
    setError('');
    onClose();
    if (step === 'success') {
      router.push('/orders'); // ✅ redirect to orders page
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[10000] overflow-y-auto"
          onClick={handleClose}
        >
          <div className="min-h-screen px-4 flex items-center justify-center">
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              aria-hidden="true"
            />
            
            <motion.div
              key="modal"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 250, damping: 20 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10"
              onClick={(e) => e.stopPropagation()}
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
                  Request Sent Successfully!
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  An approval request has been sent to <span className="font-medium">{ownerEmail}</span> for
                  Order #{orderNumber}. The owner will review your order first, then it will be sent to admin.
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
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Request Owner Approval</h2>
                <p className="text-sm text-gray-500 mb-5">
                  Submit to owner first, then admin will review after owner approval.
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-5">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                      placeholder="owner@example.com"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Enter the owner's email address who needs to approve first. After owner approval, the order will be sent to admin.
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-6">
                    {/* <button
                      type="button"
                      onClick={onContinueWithoutApproval}
                      disabled={isSubmitting}
                      className="text-sm font-medium text-[#0B4866] hover:cursor-pointer hover:underline transition disabled:opacity-50"
                    >
                      Continue without approval
                    </button> */}
                    <div className="space-x-3">
                      <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !ownerEmail}
                        className="px-4 py-2 text-sm rounded-lg bg-[#0B4866] text-white font-medium hover:scale-102 transition ease-in-out focus:ring-2 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Sending...' : 'Send Request'}
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
