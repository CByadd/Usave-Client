'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ import router
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle2, X } from 'lucide-react';

export default function ApprovalModal({
  isOpen,
  onClose,
  onContinueWithoutApproval,
  cartItems = [],
  totalAmount = 0,
}) {
  const router = useRouter(); // ✅ initialize router
  const { user } = useAuth();
  const [adminEmail, setAdminEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('email');
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
      const orderDetails = {
        items: cartItems.map((item) => ({
          id: item.id || item._id,
          name: item.name || item.title,
          price: item.discountedPrice || item.price,
          quantity: item.quantity,
          includeInstallation: item.includeInstallation || false,
          installationFee: item.includeInstallation ? item.installationFee || 49.99 : 0,
        })),
        subtotal: cartItems.reduce(
          (sum, item) => sum + (item.discountedPrice || item.price) * item.quantity,
          0
        ),
        tax: 0,
        shipping: 0,
        total: totalAmount,
      };

      const installationTotal = cartItems
        .filter((item) => item.includeInstallation)
        .reduce((sum, item) => sum + (item.installationFee || 49.99) * item.quantity, 0);

      orderDetails.total = orderDetails.subtotal + installationTotal;

      const response = await fetch('/api/orders/request-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerEmail: user?.email || 'guest@example.com',
          adminEmail,
          orderDetails,
          userId: user?.id || 'guest',
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
    setAdminEmail('');
    setError('');
    onClose();
    router.push('/orders'); // ✅ redirect to orders page
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
                  Request Sent Successfully!
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  An approval request has been sent to <span className="font-medium">{adminEmail}</span> for
                  Order #{orderNumber}. The administrator will review your order shortly.
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
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Request Approval</h2>
                <p className="text-sm text-gray-500 mb-5">
                  Send this order for administrator approval before checkout.
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-5">
                    <label
                      htmlFor="adminEmail"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Administrator's Email
                    </label>
                    <input
                      type="email"
                      id="adminEmail"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                      placeholder="admin@example.com"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Enter the approver's email address.
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-6">
                    <button
                      type="button"
                      onClick={onContinueWithoutApproval}
                      disabled={isSubmitting}
                      className="text-sm font-medium text-[#0B4866] hover:cursor-pointer hover:underline transition disabled:opacity-50"
                    >
                      Continue without approval
                    </button>
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
                        disabled={isSubmitting || !adminEmail}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
