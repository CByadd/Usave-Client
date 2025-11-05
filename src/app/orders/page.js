"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../stores/useAuthStore';
import { RefreshCw, Edit, CreditCard, AlertCircle } from 'lucide-react';
import { apiService as api } from '../services/api/apiClient';
import OptimizedImage from '../components/shared/OptimizedImage';
import Link from 'next/link';
import ReApprovalModal from '../components/orders/ReApprovalModal';
import { showAlert, setLoading as setGlobalLoading } from '../lib/ui';

export default function OrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReApprovalModal, setShowReApprovalModal] = useState(false);
  const [selectedOrderForReapproval, setSelectedOrderForReapproval] = useState(null);
  const [mounted, setMounted] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!mounted) return;
    
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchOrders();
  }, [mounted, isAuthenticated, router]);

  const fetchOrders = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await api.orders.getAll();
      
      if (response.success) {
        let filteredOrders = response.data?.orders || response.data || [];
        if (!isAdmin) {
          filteredOrders = filteredOrders.filter(order => order.userId === user?.id);
        }
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
      setIsProcessing(true);
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
      setIsProcessing(false);
      setGlobalLoading(false);
    }
  };

  const handleReApprovalSuccess = () => {
    // Refresh orders list after successful re-approval
    fetchOrders();
    setShowReApprovalModal(false);
    setSelectedOrderForReapproval(null);
  };

  const handleProceedToPay = (orderId) => {
    router.push(`/payment/${orderId}`);
  };

  const handleEditOrder = (orderId) => {
    // For rejected orders, allow editing
    const order = orders.find(o => o.id === orderId);
    if (order?.status === 'REJECTED') {
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

  // Filter orders based on active filter
  const getFilteredOrders = () => {
    switch (activeFilter) {
      case 'pending':
        // Include orders pending owner approval, pending admin approval, or owner approved waiting for admin
        return orders.filter(o => 
          o.status === 'PENDING_APPROVAL' || 
          (o.requiresOwnerApproval && !o.ownerApproved && !o.ownerRejected) ||
          (o.ownerApproved && !o.adminApproved)
        );
      case 'approved':
        return orders.filter(o => o.status === 'APPROVED' || o.adminApproved);
      case 'rejected':
        // Include orders rejected by owner or admin
        return orders.filter(o => o.status === 'REJECTED' || o.ownerRejected || o.adminRejected);
      case 'unpaid':
        return orders.filter(o => (o.status === 'APPROVED' || o.adminApproved) && o.paymentStatus === 'PENDING');
      case 'paid':
        return orders.filter(o => o.paymentStatus === 'PAID');
      default:
        return orders;
    }
  };

  // Group orders by status for display
  const groupedOrders = {
    pending: orders.filter(o => 
      o.status === 'PENDING_APPROVAL' || 
      (o.requiresOwnerApproval && !o.ownerApproved && !o.ownerRejected) ||
      (o.ownerApproved && !o.adminApproved)
    ),
    approved: orders.filter(o => o.status === 'APPROVED' || o.adminApproved),
    rejected: orders.filter(o => o.status === 'REJECTED' || o.ownerRejected || o.adminRejected),
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          {/* Status Filter Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            {['all', 'pending', 'approved', 'rejected'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  activeFilter === filter
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
                <OrderCard key={order.id} order={order} onProceedToPay={handleProceedToPay} onEditOrder={handleEditOrder} onReSendApproval={handleRequestReapproval} />
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
                    />
                  ))}
                </div>
              </div>
            )}

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
function OrderCard({ order, onProceedToPay, onEditOrder, onReSendApproval }) {

  const getStatusBadge = (status, order) => {
    // Check owner approval states first
    if (order?.ownerRejected) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (order?.ownerApproved && !order?.adminApproved) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (order?.requiresOwnerApproval && !order?.ownerApproved && !order?.ownerRejected) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    
    // Regular status badges
    switch (status) {
      case 'PENDING_APPROVAL':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status, order) => {
    // Check owner approval states first
    if (order?.ownerRejected) {
      return 'Rejected by Owner';
    }
    if (order?.ownerApproved && !order?.adminApproved) {
      return 'Owner Approved - Waiting for Admin';
    }
    if (order?.requiresOwnerApproval && !order?.ownerApproved && !order?.ownerRejected) {
      return 'Pending Owner Approval';
    }
    
    // Regular status labels
    switch (status) {
      case 'PENDING_APPROVAL':
        // If it requires owner approval but owner hasn't approved yet, show pending owner
        if (order?.requiresOwnerApproval && !order?.ownerApproved) {
          return 'Pending Owner Approval';
        }
        return 'Pending Admin Approval';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status;
    }
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Product Images */}
        <div className="flex gap-2 flex-shrink-0">
          {items.slice(0, 4).map((item, index) => (
            <div key={index} className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {item.product?.image ? (
                <OptimizedImage
                  src={item.product.image}
                  alt={item.product.title || item.product.name || 'Product'}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>
          ))}
          {items.length > 4 && (
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-600 font-medium">
              +{items.length - 4}
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Status Badge */}
              <div className="mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(status, order)}`}>
                  {getStatusLabel(status, order)}
                </span>
              </div>

              {/* Order Number */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Order #{order.orderNumber || `ORD${order.id.slice(-6).toUpperCase()}`}
              </h3>

              {/* Items */}
              <p className="text-sm text-gray-600 mb-2 truncate">
                {formatItems(items)}
              </p>

              {/* Delivery Date */}
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Delivery Date:</span> TBD
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
            <div className="flex flex-col gap-2 flex-shrink-0">
              {/* Proceed to Pay - for approved orders with pending payment */}
              {status === 'APPROVED' && order.paymentStatus === 'PENDING' && (
                <button
                  onClick={() => onProceedToPay(order.id)}
                  className="px-6 py-2 bg-[#0F4C81] text-white rounded-lg font-medium hover:bg-[#0D3F6A] transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
                >
                  <CreditCard size={16} />
                  Proceed to Pay
                </button>
              )}

              {/* Re-Send Approval - for pending and rejected orders */}
              {(status === 'PENDING_APPROVAL' || status === 'REJECTED') && (
                <button
                  onClick={() => onReSendApproval(order.id)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
                >
                  <RefreshCw size={16} />
                  Re-Send Approval
                </button>
              )}

              {/* Edit Order - for pending, rejected, and approved orders */}
              {(status === 'PENDING_APPROVAL' || status === 'REJECTED' || status === 'APPROVED') && (
                <button
                  onClick={() => onEditOrder(order.id)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
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
