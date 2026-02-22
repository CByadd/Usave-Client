"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../stores/useAuthStore';
import { RefreshCw, Edit, CreditCard, AlertCircle, Eye, Star } from 'lucide-react';
import { apiService as api } from '../services/api/apiClient';
import OptimizedImage from '../components/shared/OptimizedImage';
import Link from 'next/link';
import ReApprovalModal from '../components/orders/ReApprovalModal';
import { useReviewStore } from '../stores/useReviewStore';
import { showAlert, setLoading as setGlobalLoading } from '../lib/ui';
import {
  getPendingReviewCount,
  isOrderReviewEligible,
  REVIEWABLE_PAYMENT_STATUSES,
  normalisePaymentStatus,
} from '../utils/reviews';

export default function OrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isRequestingReapproval, setIsRequestingReapproval] = useState(false);
  const [showReApprovalModal, setShowReApprovalModal] = useState(false);
  const [selectedOrderForReapproval, setSelectedOrderForReapproval] = useState(null);
  const { openReviewModal } = useReviewStore();
  const [mounted, setMounted] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    fetchOrders();
  }, [mounted, isAuthenticated, router]);

  const reviewableOrders = useMemo(
    () => orders.filter(isOrderReviewEligible),
    [orders]
  );

  const outstandingReviewCount = useMemo(() => {
    return reviewableOrders.reduce((total, order) => {
      const pendingCount = getPendingReviewCount(order);
      return total + (pendingCount === null ? 1 : pendingCount);
    }, 0);
  }, [reviewableOrders]);

  const nextReviewOrder = reviewableOrders[0] || null;

  const fetchOrders = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError('');
      const response = await api.orders.getAll();

      if (response.success) {
        let filteredOrders = response.data?.orders || response.data || [];
        setOrders(filteredOrders);
      } else {
        setError(response.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReapproval = async (orderId) => {
    console.log('handleRequestReapproval called with orderId:', orderId);
    try {
      setIsRequestingReapproval(true);
      setGlobalLoading(true, 'Loading order details...');
      setError('');

      // Fetch full order details including items
      console.log('Fetching order details for:', orderId);
      const orderResponse = await api.orders.getById(orderId);
      console.log('Order response:', orderResponse);

      if (orderResponse.success) {
        const order = orderResponse.data?.order || orderResponse.data;
        console.log('Setting order for reapproval:', order);
        setSelectedOrderForReapproval(order);
        setShowReApprovalModal(true);
        console.log('Modal should be open now');
      } else {
        const errorMsg = orderResponse.message || 'Failed to fetch order details';
        console.error('Failed to fetch order:', errorMsg);
        setError(errorMsg);
        showAlert({
          title: 'Error',
          message: errorMsg,
          type: 'error',
          confirmText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to fetch order details';
      setError(errorMsg);
      showAlert({
        title: 'Error',
        message: errorMsg,
        type: 'error',
        confirmText: 'OK',
      });
    } finally {
      setIsRequestingReapproval(false);
      setGlobalLoading(false);
    }
  };

  const handleReApprovalSuccess = () => {
    // Refresh orders list after successful re-approval
    fetchOrders();
    setShowReApprovalModal(false);
    setSelectedOrderForReapproval(null);
  };

  const handleOpenReviewModal = (order) => {
    openReviewModal(order, handleReviewSubmitted);
  };

  const handleReviewSubmitted = () => {
    fetchOrders();
  };

  const handleProceedToPay = (orderId) => {
    router.push(`/payment/${orderId}`);
  };

  const handleEditOrder = (orderId) => {
    // For rejected orders (by owner or admin), allow editing
    const order = orders.find(o => o.id === orderId);
    if (order?.status === 'REJECTED' || order?.ownerRejected || order?.adminRejected) {
      // Redirect to checkout to edit order
      router.push(`/checkout?editOrder=${orderId}`);
    } else {
      // For pending orders, show details
      showAlert({
        title: 'Order Information',
        message: 'Order editing is available for rejected orders. Please wait for approval or rejection.',
        type: 'info',
        confirmText: 'OK',
      });
    }
  };

  // Helper functions for mutually exclusive states
  const isRejected = (o) => o.status === 'REJECTED' || o.status === 'CANCELLED' || o.ownerRejected || o.adminRejected;
  const isCompleted = (o) => !isRejected(o) && ['DELIVERED', 'COMPLETED'].includes(o.status);
  const isProcessing = (o) => !isRejected(o) && !isCompleted(o) && ['SHIPPED', 'PROCESSING', 'CONFIRMED', 'PAYMENT_CONFIRMED'].includes(o.status);
  const isApproved = (o) => !isRejected(o) && !isCompleted(o) && !isProcessing(o) && (o.status === 'APPROVED' || o.adminApproved);
  const isPending = (o) => !isRejected(o) && !isCompleted(o) && !isProcessing(o) && !isApproved(o) && (o.status === 'PENDING_APPROVAL' || o.status === 'PENDING' || (o.requiresOwnerApproval && !o.ownerApproved) || !o.adminApproved);

  // Group orders by strictly exclusive status for display
  const groupedOrders = {
    pending: orders.filter(isPending),
    approved: orders.filter(isApproved),
    rejected: orders.filter(isRejected),
    processing: orders.filter(isProcessing),
    completed: orders.filter(isCompleted),
  };

  // Filter orders based on active filter
  const getFilteredOrders = () => {
    switch (activeFilter) {
      case 'pending':
        return groupedOrders.pending;
      case 'approved':
        return groupedOrders.approved;
      case 'rejected':
        return groupedOrders.rejected;
      case 'completed':
        return groupedOrders.completed;
      case 'unpaid':
        return orders.filter(o => {
          const paymentStatus = normalisePaymentStatus(o.paymentStatus);
          return (o.status === 'APPROVED' || isApproved(o)) && paymentStatus === 'PENDING';
        });
      case 'paid':
        return orders.filter(o => {
          const paymentStatus = normalisePaymentStatus(o.paymentStatus);
          return REVIEWABLE_PAYMENT_STATUSES.has(paymentStatus);
        });
      default:
        // 'all' - return all orders without any filtering
        return orders;
    }
  };

  // Show loading state on initial mount to prevent hydration mismatch
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B4866] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view your orders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-[#0F4C81]">My Orders</h1>
            <div className="flex items-center gap-4">
              <Link
                href="/orders?filter=unpaid"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveFilter('unpaid');
                }}
                className="text-[#0F4C81] hover:text-[#0D3F6A] font-medium text-sm"
              >
                Unpaid Orders
              </Link>
              <Link
                href="/orders?filter=paid"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveFilter('paid');
                }}
                className="text-[#0F4C81] hover:text-[#0D3F6A] font-medium text-sm"
              >
                Paid Orders
              </Link>
            </div>
          </div>

          {reviewableOrders.length > 0 && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-amber-900">
                      {outstandingReviewCount > 1
                        ? `${outstandingReviewCount} items are ready for your review`
                        : 'Share your thoughts about your latest order'}
                    </h2>
                    <p className="mt-1 text-sm text-amber-800">
                      Let other shoppers know what you think. Reviews help us improve and unlock future perks
                      for your account.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => nextReviewOrder && handleOpenReviewModal(nextReviewOrder)}
                  className="inline-flex items-center justify-center rounded-full bg-[#0B4866] px-5 py-2 text-sm font-semibold text-white shadow hover:bg-[#093b54] disabled:opacity-60"
                  disabled={!nextReviewOrder}
                >
                  Review now
                </button>
              </div>
            </div>
          )}

          {/* Status Filter Tabs */}
          <div className="flex gap-2 border-b border-gray-200 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            {['all', 'pending', 'approved', 'rejected'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap rounded-3xl mb-2 flex-shrink-0 ${activeFilter === filter
                  ? 'bg-[#0F4C81] text-white border-b-2 border-[#0F4C81]'
                  : 'text-gray-600 hover:text-[#0F4C81] hover:bg-gray-100'
                  }`}
              >
                {filter === 'all' ? 'All Orders' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Orders`}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-600" size={20} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Filtered View (when a filter is active) */}
        {activeFilter !== 'all' && activeFilter !== 'pending' && activeFilter !== 'approved' && activeFilter !== 'rejected' && (
          <div className="space-y-4">
            {getFilteredOrders().length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-600">No orders found for this filter.</p>
              </div>
            ) : (
              getFilteredOrders().map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onProceedToPay={handleProceedToPay}
                  onEditOrder={handleEditOrder}
                  onReSendApproval={handleRequestReapproval}
                  onReviewOrder={handleOpenReviewModal}
                />
              ))
            )}
          </div>
        )}

        {/* Grouped View by Status */}
        {activeFilter === 'all' && (
          <>
            {/* Pending Orders Section */}
            {groupedOrders.pending.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Pending Orders</h2>
                <div className="space-y-4">
                  {groupedOrders.pending.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onProceedToPay={handleProceedToPay}
                      onEditOrder={handleEditOrder}
                      onReSendApproval={handleRequestReapproval}
                      onReviewOrder={handleOpenReviewModal}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Approved Orders Section */}
            {groupedOrders.approved.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Approved Orders</h2>
                <div className="space-y-4">
                  {groupedOrders.approved.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onProceedToPay={handleProceedToPay}
                      onEditOrder={handleEditOrder}
                      onReSendApproval={handleRequestReapproval}
                      onReviewOrder={handleOpenReviewModal}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Rejected Orders Section */}
            {groupedOrders.rejected.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Rejected Orders</h2>
                <div className="space-y-4">
                  {groupedOrders.rejected.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onProceedToPay={handleProceedToPay}
                      onEditOrder={handleEditOrder}
                      onReSendApproval={handleRequestReapproval}
                      onReviewOrder={handleOpenReviewModal}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Processing Orders Section */}
            {groupedOrders.processing.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Processing Orders</h2>
                <div className="space-y-4">
                  {groupedOrders.processing.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onProceedToPay={handleProceedToPay}
                      onEditOrder={handleEditOrder}
                      onReSendApproval={handleRequestReapproval}
                      onReviewOrder={handleOpenReviewModal}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Orders Section */}
            {groupedOrders.completed.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Completed Orders</h2>
                <div className="space-y-4">
                  {groupedOrders.completed.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onProceedToPay={handleProceedToPay}
                      onEditOrder={handleEditOrder}
                      onReSendApproval={handleRequestReapproval}
                      onReviewOrder={handleOpenReviewModal}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Orders - Orders that don't fit any category */}
            {(() => {
              const otherOrders = orders.filter(o => {
                const isPending = groupedOrders.pending.includes(o);
                const isApproved = groupedOrders.approved.includes(o);
                const isRejected = groupedOrders.rejected.includes(o);
                const isProcessing = groupedOrders.processing.includes(o);
                const isCompleted = groupedOrders.completed.includes(o);
                return !isPending && !isApproved && !isRejected && !isProcessing && !isCompleted;
              });

              return otherOrders.length > 0 ? (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Other Orders</h2>
                  <div className="space-y-4">
                    {otherOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onProceedToPay={handleProceedToPay}
                        onEditOrder={handleEditOrder}
                        onReSendApproval={handleRequestReapproval}
                        onReviewOrder={handleOpenReviewModal}
                      />
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* No Orders Message */}
            {orders.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-600">You haven't placed any orders yet.</p>
              </div>
            )}
          </>
        )}

        {/* Single Status View */}
        {['pending', 'approved', 'rejected'].includes(activeFilter) && (
          <div className="space-y-4">
            {groupedOrders[activeFilter].length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-600">No {activeFilter} orders found.</p>
              </div>
            ) : (
              groupedOrders[activeFilter].map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onProceedToPay={handleProceedToPay}
                  onEditOrder={handleEditOrder}
                  onReSendApproval={handleRequestReapproval}
                  onReviewOrder={handleOpenReviewModal}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Re-Approval Modal */}
      <ReApprovalModal
        isOpen={showReApprovalModal}
        onClose={() => {
          setShowReApprovalModal(false);
          setSelectedOrderForReapproval(null);
        }}
        order={selectedOrderForReapproval}
        onDirectSubmit={handleReApprovalSuccess}
      />
    </div>
  );
}

// Order Card Component
function OrderCard({ order, onProceedToPay, onEditOrder, onReSendApproval, onReviewOrder }) {
  const router = useRouter();

  // Hierarchical status system
  const ORDER_STATUS_HIERARCHY = [
    { value: 'SUBMITTED', label: 'Submitted', description: 'Order submitted for approval' },
    { value: 'OWNER_APPROVAL', label: 'Owner Approval', description: 'Pending approval from your manager/owner' },
    { value: 'ADMIN_APPROVAL', label: 'Admin Review', description: 'Order is being reviewed by our team' },
    { value: 'APPROVED', label: 'Approved', description: 'Order approved, waiting for payment' },
    { value: 'PROCESSING', label: 'Processing', description: 'Being prepared for shipment' },
    { value: 'SHIPPED', label: 'Shipped', description: 'Order is on its way' },
    { value: 'DELIVERED', label: 'Delivered', description: 'Order has been delivered' },
  ];

  const getStatusInfo = (status, order) => {
    // Check for exception statuses first
    if (order?.ownerRejected || status === 'REJECTED') {
      return {
        currentIndex: -1,
        completedIndex: -1,
        label: 'Rejected',
        description: order?.ownerRejected ? 'Rejected by Owner' : 'Rejected by Admin',
        badgeClass: 'bg-red-100 text-red-800 border-red-200',
      };
    }

    if (status === 'CANCELLED') {
      return {
        currentIndex: -1,
        completedIndex: -1,
        label: 'Cancelled',
        description: 'Order has been cancelled',
        badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
      };
    }

    let completedIndex = 0; // SUBMITTED
    let currentIndex = 1;

    // Check progress based on flags and status
    if (order?.requiresOwnerApproval && !order?.ownerApproved && !order?.ownerRejected) {
      completedIndex = 0;
      currentIndex = 1; // Owner Approval
    } else if ((!order?.requiresOwnerApproval || order?.ownerApproved) && !order?.adminApproved && status === 'PENDING_APPROVAL') {
      completedIndex = 1;
      currentIndex = 2; // Admin Review
    } else if (status === 'APPROVED' || (order?.adminApproved && order?.paymentStatus !== 'COMPLETED' && order?.paymentStatus !== 'PAID')) {
      completedIndex = 2;
      currentIndex = 3; // Payment
    } else if (status === 'CONFIRMED' || status === 'PAYMENT_CONFIRMED' || status === 'PROCESSING') {
      completedIndex = 3;
      currentIndex = 4; // Processing
    } else if (status === 'SHIPPED') {
      completedIndex = 4;
      currentIndex = 5; // Shipped
    } else if (status === 'DELIVERED' || status === 'COMPLETED') {
      completedIndex = 6;
      currentIndex = null; // Everything complete
    }

    const currentMeta = currentIndex !== null ? ORDER_STATUS_HIERARCHY[currentIndex] : ORDER_STATUS_HIERARCHY[completedIndex];
    const displayIndex = currentIndex !== null ? currentIndex : completedIndex;

    return {
      currentIndex: displayIndex,
      label: currentMeta.label,
      description: currentMeta.description,
      badgeClass: displayIndex <= 2
        ? 'bg-amber-100 text-amber-800 border-amber-200'
        : displayIndex === 3
          ? 'bg-blue-100 text-blue-800 border-blue-200'
          : 'bg-emerald-100 text-emerald-800 border-emerald-200',
    };
  };

  const formatItems = (items) => {
    if (!items || items.length === 0) return 'No items';
    return items.map(item => {
      const productName = item.product?.title || item.product?.name || 'Item';
      return productName;
    }).join(', ');
  };

  const getOrderTotal = (order) => {
    if (order.total) return order.total;
    if (order.subtotal) {
      return order.subtotal + (order.tax || 0) + (order.shipping || 0);
    }
    return 0;
  };

  const getOriginalTotal = (order) => {
    if (!order.items) return null;
    return order.items.reduce((sum, item) => {
      const originalPrice = item.product?.originalPrice || item.product?.price || item.price;
      return sum + (originalPrice * item.quantity);
    }, 0);
  };

  const orderTotal = getOrderTotal(order);
  const originalTotal = getOriginalTotal(order);
  const items = order.items || [];
  const status = order.status;
  const statusInfo = getStatusInfo(status, order);
  const pendingReviewCount = getPendingReviewCount(order);
  const canReview = isOrderReviewEligible(order);

  const visibleImages =
  items.length > 4 ? items.slice(0, 3) : items;

const remainingCount = items.length - 3;

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-100 p-6 shadow-md hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
        {/* Product Images */}
      {/* Product Images */}
<div
  className={`
    grid gap-2 flex-shrink-0
    ${
      items.length === 1
        ? "grid-cols-1 w-28 h-28"
        : items.length === 2
        ? "grid-cols-2 w-28 h-28"
        : "grid-cols-2 w-28 h-28"
    }
  `}
>
  {visibleImages.map((item, index) => (
    <div
      key={index}
      className={`
        relative rounded-xl overflow-hidden bg-gray-100
        ring-1 ring-black/5
        ${
          items.length === 1
            ? "col-span-1"
            : items.length === 3 && index === 0
            ? "row-span-2"
            : ""
        }
      `}
    >
      {item.product?.image ? (
        <OptimizedImage
          src={item.product.image}
          alt={item.product.title || item.product.name || "Product"}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
      )}
    </div>
  ))}

  {/* +X stacked image */}
  {items.length > 4 && (
    <div className="relative rounded-xl overflow-hidden bg-gray-900 ring-1 ring-black/5">
      <OptimizedImage
        src={items[3]?.product?.image}
        alt="More products"
        fill
        className="object-cover opacity-40"
      />
      <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-semibold backdrop-blur-sm">
        +{remainingCount}
      </div>
    </div>
  )}
</div>

        {/* Order Details */}
        <div className="flex-1 min-w-0 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 w-full">
            <div className="flex-1 min-w-0 w-full sm:w-auto">
              {/* Simplified Status Label and Progress */}
              <div className="mb-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-sm ${statusInfo.badgeClass}`}>
                      {statusInfo.label.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      Step {statusInfo.currentIndex + 1} of 7
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {statusInfo.description}
                  </p>

                  {/* Mini Progress Bar */}
                  <div className="w-full h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-[#0ACF83] transition-all duration-500"
                      style={{ width: `${((statusInfo.currentIndex + (statusInfo.currentIndex >= 0 ? 1 : 0)) / 7) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Order Number */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Order #{order.orderNumber || `ORD${order.id.slice(-6).toUpperCase()}`}
              </h3>

              {/* Items */}
              <p className="text-sm text-gray-600 mb-2 break-words">
                {formatItems(items)}
              </p>

              {/* Delivery Date */}
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Delivery Date:</span>{' '}
                {order.deliveryDate
                  ? `${new Date(order.deliveryDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}${order.deliveryTime ? ` at ${order.deliveryTime}` : ''}`
                  : 'TBD'
                }
              </p>

              {/* Rejection Reason (for rejected orders) */}
              {status === 'REJECTED' && order.approvalNotes && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-medium text-red-800 mb-1">Rejected Reason:</p>
                  <p className="text-sm text-red-700">{order.approvalNotes}</p>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-2">
                {originalTotal && originalTotal > orderTotal && (
                  <span className="text-sm text-gray-400 line-through">
                    ${originalTotal.toFixed(2)}
                  </span>
                )}
                <span className="text-lg font-bold text-gray-900">
                  ${orderTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 flex-shrink-0 w-full sm:w-auto">
              {/* View Order - always visible */}
              <button
                onClick={() => router.push(`/orders/${order.id}`)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-[#0B4866] text-white rounded-lg font-medium hover:bg-[#094058] transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm whitespace-nowrap"
              >
                <Eye size={16} />
                View Order
              </button>

              {canReview && (
                <button
                  onClick={() => onReviewOrder?.(order)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 border border-[#0B4866]/20 text-[#0B4866] rounded-lg font-medium hover:bg-[#0B4866]/10 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm whitespace-nowrap"
                >
                  <Star size={16} />
                  {pendingReviewCount && pendingReviewCount > 1
                    ? `Review ${pendingReviewCount} items`
                    : 'Review Items'}
                </button>
              )}

              {/* Proceed to Pay - for approved orders with pending payment */}
              {/* {status === 'APPROVED' && order.paymentStatus === 'PENDING' && (
                <button
                  onClick={() => onProceedToPay(order.id)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-[#0F4C81] text-white rounded-lg font-medium hover:bg-[#0D3F6A] transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm whitespace-nowrap"
                >
                  <CreditCard size={16} />
                  Proceed to Pay
                </button>
              )} */}

              {/* Re-Send Approval - for rejected orders only */}
              {status === 'REJECTED' && (
                <button
                  onClick={() => onReSendApproval(order.id)}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm whitespace-nowrap"
                >
                  <RefreshCw size={16} />
                  Re-Send Approval
                </button>
              )}

              {/* Edit Order - for rejected orders only */}
              {(status === 'REJECTED' || order?.ownerRejected || order?.adminRejected) && (
                <button
                  onClick={() => onEditOrder(order.id)}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm whitespace-nowrap"
                >
                  <Edit size={16} />
                  Edit Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
