'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Star, CheckCircle2 } from 'lucide-react';
import { apiService as api } from '../../services/api/apiClient';
import OptimizedImage from '../shared/OptimizedImage';
import { showToast } from '../../lib/ui';

const INITIAL_RATING = 5;

const buildStarArray = (rating, onSelect, disabled) =>
  [...Array(5)].map((_, index) => {
    const starValue = index + 1;
    const active = starValue <= rating;
    return (
      <button
        key={starValue}
        type="button"
        className={`text-xl transition-colors ${active ? 'text-yellow-400' : 'text-gray-300'} ${
          disabled ? 'cursor-not-allowed opacity-70' : 'hover:text-yellow-400'
        }`}
        onClick={() => !disabled && onSelect(starValue)}
        aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
        disabled={disabled}
      >
        {active ? '★' : '☆'}
      </button>
    );
  });

export default function ReviewOrderModal({ isOpen, onClose, order, onSubmitted }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [activeView, setActiveView] = useState('form'); // form | success
  const [submittingId, setSubmittingId] = useState(null);

  const loadReviewableItems = async () => {
    if (!order) return;
    try {
      setLoading(true);
      setItems([]);
      const response = await api.reviews.getEligible(order.id);
      const reviewables = response?.data?.items || [];
      const hydrated = reviewables.map((entry) => {
        const review = entry.item.review || {};
        return {
          orderId: entry.orderId,
          orderItemId: entry.item.id,
          productId: entry.item.product?.id,
          product: entry.item.product,
          quantity: entry.item.quantity || 1,
          rating: review.rating || INITIAL_RATING,
          comment: review.comment || '',
          submitted: false,
          status: review.status || 'PENDING',
        };
      });
      setItems(hydrated);
      setActiveView(hydrated.length === 0 ? 'success' : 'form');
    } catch (error) {
      console.error('Failed to load reviewable items:', error);
      showToast(error?.message || 'Failed to load review items', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && order) {
      loadReviewableItems();
    } else {
      setItems([]);
      setActiveView('form');
      setSubmittingId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, order?.id]);

  const pendingItems = useMemo(() => items.filter((item) => !item.submitted), [items]);

  const handleRatingChange = (orderItemId, rating) => {
    setItems((prev) =>
      prev.map((item) => (item.orderItemId === orderItemId ? { ...item, rating } : item))
    );
  };

  const handleCommentChange = (orderItemId, comment) => {
    setItems((prev) =>
      prev.map((item) => (item.orderItemId === orderItemId ? { ...item, comment } : item))
    );
  };

  const handleSubmit = async (item) => {
    if (!item.productId) {
      showToast('Cannot submit review: product missing.', 'error');
      return;
    }
    try {
      setSubmittingId(item.orderItemId);
      await api.reviews.submit({
        orderId: item.orderId,
        orderItemId: item.orderItemId,
        productId: item.productId,
        rating: item.rating,
        title: item.comment?.split('\n')[0]?.slice(0, 80) || undefined,
        comment: item.comment,
      });

      showToast('Review submitted! We will publish it after approval.', 'success');
      setItems((prev) =>
        prev.map((entry) =>
          entry.orderItemId === item.orderItemId
            ? { ...entry, submitted: true, status: 'PENDING' }
            : entry
        )
      );

      if (typeof onSubmitted === 'function') {
        onSubmitted();
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to submit review. Please try again.';
      showToast(message, 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleClose = () => {
    setItems([]);
    setActiveView('form');
    setSubmittingId(null);
    onClose();
  };

  const allSubmitted = pendingItems.length === 0 && items.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="review-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        >
          <motion.div
            key="review-modal"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl"
          >
            <button
              className="absolute right-4 top-4 rounded-full bg-white p-2 text-gray-500 shadow hover:text-gray-700"
              onClick={handleClose}
              aria-label="Close review modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col gap-6 p-6 sm:p-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Share your experience</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Tell us what you loved about your recent purchase. Your feedback helps other
                  shoppers make confident decisions.
                </p>
              </div>

              {loading ? (
                <div className="flex h-48 items-center justify-center text-gray-500">
                  Loading items...
                </div>
              ) : activeView === 'success' || allSubmitted ? (
                <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-emerald-700">Thank you!</h3>
                    <p className="text-sm text-emerald-700">
                      Your reviews are on their way to our team for approval. Once approved, they
                      will appear on the product pages.
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="rounded-full bg-[#0B4866] px-5 py-2 text-sm font-semibold text-white shadow hover:bg-[#093b54]"
                  >
                    Close
                  </button>
                </div>
              ) : pendingItems.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-center text-sm text-gray-600">
                  All items from this order already have reviews awaiting approval.
                </div>
              ) : (
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                  {pendingItems.map((item) => (
                    <div
                      key={item.orderItemId}
                      className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-6"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="w-full max-w-[120px] self-start rounded-xl bg-white p-3 shadow">
                          {item.product?.image ? (
                            <OptimizedImage
                              src={item.product.image}
                              alt={item.product.title || 'Product'}
                              width={100}
                              height={100}
                              className="h-24 w-full rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-24 w-full items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="text-base font-semibold text-gray-900">
                              {item.product?.title || 'Product'}
                            </h3>
                            <p className="text-xs text-gray-500">
                              Quantity: {item.quantity} · Order #{order?.orderNumber || 'N/A'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Your rating:</span>
                            <div className="flex gap-1">
                              {buildStarArray(item.rating, (rating) =>
                                handleRatingChange(item.orderItemId, rating)
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                              Share your thoughts
                            </label>
                            <textarea
                              value={item.comment}
                              onChange={(event) =>
                                handleCommentChange(item.orderItemId, event.target.value)
                              }
                              placeholder="What did you like? How is the quality? Fit? Finish?"
                              rows={4}
                              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-[#0B4866] focus:outline-none focus:ring-2 focus:ring-[#0B4866]/30"
                            />
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleSubmit(item)}
                              disabled={submittingId === item.orderItemId}
                              className="inline-flex items-center rounded-full bg-[#0B4866] px-5 py-2 text-sm font-semibold text-white shadow hover:bg-[#093b54] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {submittingId === item.orderItemId ? 'Submitting...' : 'Submit review'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}











