"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../stores/useAuthStore';
import { ArrowLeft, Package, MapPin, CreditCard, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { apiService as api } from '../../services/api/apiClient';
import OptimizedImage from '../../components/shared/OptimizedImage';

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id;
  const { user, isAuthenticated, checkAuth } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

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

    if (orderId) {
      fetchOrderDetails();
    }
  }, [mounted, isAuthenticated, orderId, router]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError('');
      const response = await api.orders.getById(orderId);

      if (response.success) {
        const orderData = response.data?.order || response.data;
        // Check if user has access to this order
        const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
        if (!isAdmin && orderData.userId !== user?.id) {
          setError('You do not have access to this order');
          return;
        }
        setOrder(orderData);
      } else {
        setError(response.message || 'Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError(error.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  // Hierarchical status system
  const ORDER_STATUS_HIERARCHY = [
    { value: 'SUBMITTED', label: 'Submitted', description: 'Order submitted' },
    { value: 'OWNER_APPROVAL', label: 'Owner Approval', description: 'Pending manager approval' },
    { value: 'ADMIN_APPROVAL', label: 'Admin Review', description: 'Under review by our team' },
    { value: 'PAYMENT', label: 'Payment', description: 'Waiting for payment confirmation' },
    { value: 'PROCESSING', label: 'Processing', description: 'Preparing for shipment' },
    { value: 'SHIPPED', label: 'Shipped', description: 'Order is on its way' },
    { value: 'DELIVERED', label: 'Delivered', description: 'Order delivered successfully' },
  ];

  const getStatusInfo = (status, order) => {
    // Check for exception statuses first
    if (order?.ownerRejected || status === 'REJECTED') {
      return {
        currentIndex: -1,
        label: 'Rejected',
        description: order?.ownerRejected ? 'Rejected by Owner' : 'Rejected by Admin',
        badgeClass: 'bg-red-100 text-red-800 border-red-200',
      };
    }

    if (status === 'CANCELLED') {
      return {
        currentIndex: -1,
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
      currentIndex = 1; // Pulsing Owner Approval
    } else if ((!order?.requiresOwnerApproval || order?.ownerApproved) && !order?.adminApproved && status === 'PENDING_APPROVAL') {
      completedIndex = 1;
      currentIndex = 2; // Pulsing Admin Review
    } else if (status === 'APPROVED' || (order?.adminApproved && order?.paymentStatus !== 'COMPLETED' && order?.paymentStatus !== 'PAID')) {
      completedIndex = 2;
      currentIndex = 3; // Pulsing Payment
    } else if (status === 'CONFIRMED' || status === 'PAYMENT_CONFIRMED' || status === 'PROCESSING') {
      completedIndex = 3;
      currentIndex = 4; // Pulsing Processing
    } else if (status === 'SHIPPED') {
      completedIndex = 4;
      currentIndex = 5; // Pulsing Shipped
    } else if (status === 'DELIVERED' || status === 'COMPLETED') {
      completedIndex = 6;
      currentIndex = null; // Everything complete
    }

    const currentMeta = currentIndex !== null ? ORDER_STATUS_HIERARCHY[currentIndex] : ORDER_STATUS_HIERARCHY[completedIndex];

    return {
      currentIndex,
      completedIndex,
      label: currentMeta.label,
      description: currentMeta.description,
      badgeClass: (currentIndex || completedIndex) <= 2
        ? 'bg-amber-100 text-amber-800 border-amber-200'
        : (currentIndex || completedIndex) === 3
          ? 'bg-blue-100 text-blue-800 border-blue-200'
          : 'bg-emerald-100 text-emerald-800 border-emerald-200',
    };
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    switch (paymentStatus) {
      case 'PENDING':
        return { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'COMPLETED':
      case 'PAID':
        return { label: 'Paid', className: 'bg-green-100 text-green-800 border-green-200' };
      case 'FAILED':
        return { label: 'Failed', className: 'bg-red-100 text-red-800 border-red-200' };
      default:
        return { label: paymentStatus || 'Unknown', className: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading state on initial mount
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B4866] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view order details.</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/orders')}
            className="px-4 py-2 bg-[#0B4866] text-white rounded-lg hover:bg-[#094058] transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
          <button
            onClick={() => router.push('/orders')}
            className="px-4 py-2 bg-[#0B4866] text-white rounded-lg hover:bg-[#094058] transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status, order);
  const paymentBadge = getPaymentStatusBadge(order.paymentStatus);
  const items = order.items || [];
  const shippingAddress = order.shippingAddress || {};
  const billingAddress = order.billingAddress || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/orders')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#0B4866] mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Orders</span>
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-[#0F4C81] mb-2">
                Order #{order.orderNumber || `ORD${order.id.slice(-6).toUpperCase()}`}
              </h1>
              <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${paymentBadge.className}`}>
                {paymentBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* Premium Status Flow Visualizer */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h2 className="text-xl font-bold text-[#0F172A]">Track Order</h2>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${statusInfo.badgeClass}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>

          {/* Desktop View (Horizontal) */}
          <div className="hidden md:block">
            <div className="relative flex items-center justify-between px-2">
              {/* Progress Bar Background */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full"></div>

              {/* Active Progress Bar */}
              <div
                className="absolute top-1/2 left-0 h-1 bg-[#0ACF83] -translate-y-1/2 z-0 transition-all duration-1000 ease-in-out rounded-full"
                style={{ width: `${((statusInfo.currentIndex !== null ? statusInfo.currentIndex : statusInfo.completedIndex) / (ORDER_STATUS_HIERARCHY.length - 1)) * 100}%` }}
              ></div>

              {ORDER_STATUS_HIERARCHY.map((step, idx) => {
                const isCompleted = statusInfo.completedIndex >= idx;
                const isCurrent = statusInfo.currentIndex === idx;

                return (
                  <div key={idx} className="relative z-10 flex flex-col items-center group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isCompleted
                      ? 'bg-[#0ACF83] text-white shadow-lg shadow-emerald-500/20'
                      : isCurrent
                        ? 'bg-[#0B4866] text-white ring-4 ring-[#0B4866]/10 scale-110 shadow-lg'
                        : 'bg-white text-slate-300 border-2 border-slate-100 shadow-sm'
                      }`}>
                      {isCompleted ? (
                        <CheckCircle size={20} />
                      ) : (
                        <span className="text-sm font-bold">{idx + 1}</span>
                      )}
                    </div>
                    <div className="absolute top-12 flex flex-col items-center min-w-[80px]">
                      <span className={`text-[10px] font-black uppercase tracking-widest text-center whitespace-nowrap ${isCurrent ? 'text-[#0B4866]' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                        }`}>
                        {step.label}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] text-slate-500 font-medium mt-1 animate-pulse">
                          Current Stage
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Spacer for label height */}
            <div className="h-12"></div>
          </div>

          {/* Mobile View (Vertical) */}
          <div className="md:hidden space-y-0 relative">
            {/* Vertical Line */}
            <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-slate-100 z-0"></div>

            {/* Active Vertical Line (Partial) */}
            <div
              className="absolute left-5 top-2 w-0.5 bg-[#0ACF83] z-0 transition-all duration-1000 ease-in-out"
              style={{
                height: `${((statusInfo.currentIndex !== null ? statusInfo.currentIndex : statusInfo.completedIndex) / (ORDER_STATUS_HIERARCHY.length - 1)) * 95}%`
              }}
            ></div>

            {ORDER_STATUS_HIERARCHY.map((step, idx) => {
              const isCompleted = statusInfo.completedIndex >= idx;
              const isCurrent = statusInfo.currentIndex === idx;

              return (
                <div key={idx} className="relative z-10 flex items-start gap-4 pb-8 last:pb-0">
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-500 ${isCompleted
                    ? 'bg-[#0ACF83] text-white shadow-md'
                    : isCurrent
                      ? 'bg-[#0B4866] text-white ring-4 ring-[#0B4866]/10 scale-105 shadow-md'
                      : 'bg-white text-slate-300 border-2 border-slate-100'
                    }`}>
                    {isCompleted ? (
                      <CheckCircle size={18} />
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex flex-col pt-1">
                    <span className={`text-xs font-black uppercase tracking-widest ${isCurrent ? 'text-[#0B4866]' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                      }`}>
                      {step.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                      {step.description}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] text-[#0B4866] font-bold mt-1 animate-pulse">
                        CURRENT STAGE
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
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

        {/* Order Items */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Package className="h-6 w-6 text-[#0B4866]" />
            Order Items ({items.length})
          </h2>
          <div className="space-y-4">
            {items.map((item, index) => {
              const product = item.product || {};
              const productName = product.title || product.name || 'Product';
              const productImage = product.image || product.images?.[0] || '';
              const itemPrice = item.price || 0;
              const quantity = item.quantity || 1;
              // Get color and size from item - could be stored directly or in options
              const color = item.color || item.options?.color || null;
              const size = item.size || item.options?.size || null;
              const includeInstallation = item.includeInstallation || item.options?.includeInstallation || false;

              return (
                <div key={item.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {productImage ? (
                        <OptimizedImage
                          src={productImage}
                          alt={productName}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{productName}</h3>

                      {/* Configuration Options */}
                      <div className="flex flex-wrap gap-4 mb-3 text-sm">
                        {(() => {
                          // Only show color if product has multiple color options (more than 1)
                          const colorVariantsCount = Array.isArray(product.colorVariants) ? product.colorVariants.length : 0;
                          const hasBaseColor = product.color ? 1 : 0;
                          const totalColorOptions = colorVariantsCount + hasBaseColor;
                          const shouldShowColor = color && totalColorOptions > 1;
                          return shouldShowColor ? (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-700">Color:</span>
                              <span className="text-gray-600">{typeof color === 'string' ? color : (color.value || color.name || JSON.stringify(color))}</span>
                            </div>
                          ) : null;
                        })()}
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">Quantity:</span>
                          <span className="text-gray-600">{quantity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">Price:</span>
                          <span className="text-gray-600">${itemPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Installation Indicator */}
                      {includeInstallation && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 inline-flex">
                            <svg className="w-4 h-4 text-[#0B4866]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm text-[#0B4866] font-medium">Professional Installation Service Included</span>
                          </div>
                        </div>
                      )}

                      {/* Item Total */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-600">Item Total</span>
                        <span className="text-lg font-bold text-gray-900">
                          ${(itemPrice * quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#0B4866]" />
              Shipping Address
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              {shippingAddress.firstName || shippingAddress.lastName ? (
                <>
                  <p className="font-medium text-gray-900">
                    {shippingAddress.firstName} {shippingAddress.lastName}
                  </p>
                  {shippingAddress.company && (
                    <p>{shippingAddress.company}</p>
                  )}
                  <p>{shippingAddress.address1}</p>
                  {shippingAddress.address2 && (
                    <p>{shippingAddress.address2}</p>
                  )}
                  <p>
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                  </p>
                  {shippingAddress.country && (
                    <p>{shippingAddress.country}</p>
                  )}
                  {shippingAddress.phone && (
                    <p className="mt-2">Phone: {shippingAddress.phone}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-500">No shipping address provided</p>
              )}
            </div>
          </div>

          {/* Billing Address */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#0B4866]" />
              Billing Address
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              {billingAddress.firstName || billingAddress.lastName ? (
                <>
                  <p className="font-medium text-gray-900">
                    {billingAddress.firstName} {billingAddress.lastName}
                  </p>
                  {billingAddress.company && (
                    <p>{billingAddress.company}</p>
                  )}
                  <p>{billingAddress.address1}</p>
                  {billingAddress.address2 && (
                    <p>{billingAddress.address2}</p>
                  )}
                  <p>
                    {billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}
                  </p>
                  {billingAddress.country && (
                    <p>{billingAddress.country}</p>
                  )}
                  {billingAddress.phone && (
                    <p className="mt-2">Phone: {billingAddress.phone}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Same as shipping address</p>
              )}
            </div>
          </div>
        </div>

        {/* Delivery Schedule */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#0B4866]" />
            Delivery Schedule
          </h2>
          {order.deliveryDate || order.deliveryTime ? (
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <span className="text-gray-600 w-24 font-medium">Date:</span>
                <span className="text-gray-900">
                  {order.deliveryDate
                    ? new Date(order.deliveryDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                    : 'TBD'
                  }
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-gray-600 w-24 font-medium">Time:</span>
                <span className="text-gray-900">{order.deliveryTime || 'TBD'}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">TBD</p>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#0B4866]" />
            Order Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">${(order.subtotal || 0).toFixed(2)}</span>
            </div>
            {order.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST (10%)</span>
                <span className="font-medium text-gray-900">${(order.tax || 0).toFixed(2)}</span>
              </div>
            )}
            {order.shipping > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-gray-900">${(order.shipping || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-[#0B4866]">
                  ${(order.total || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          {order.paymentMethod && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-gray-600" />
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium text-gray-900">{order.paymentMethod}</span>
              </div>
            </div>
          )}

          {/* Approval Notes */}
          {order.approvalNotes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Admin Notes</h3>
              <p className="text-sm text-gray-600">{order.approvalNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

