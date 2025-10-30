"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { CheckCircle, XCircle, Clock, AlertCircle, Eye, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';
import OptimizedImage from '../components/shared/OptimizedImage';

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const { openLoginModal } = useUI();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    fetchOrders();
  }, [isAuthenticated, openLoginModal]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = isAdmin 
        ? await apiService.orders.getAll()
        : await apiService.orders.getAll();
        console.log("Orders response:", response.data);

      
      if (response.success) {
       setOrders(response.data.orders || []);
      } else {
        setError(response.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId) => {
    try {
      setIsProcessing(true);
      const response = await apiService.orders.approve(orderId, approvalNotes);
      
      if (response.success) {
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: 'APPROVED', approvalNotes }
            : order
        ));
        setSelectedOrder(null);
        setApprovalNotes('');
      } else {
        setError(response.message || 'Failed to approve order');
      }
    } catch (error) {
      console.error('Error approving order:', error);
      setError('Failed to approve order');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (orderId) => {
    try {
      setIsProcessing(true);
      const response = await apiService.orders.reject(orderId, approvalNotes);
      
      if (response.success) {
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: 'REJECTED', approvalNotes }
            : order
        ));
        setSelectedOrder(null);
        setApprovalNotes('');
      } else {
        setError(response.message || 'Failed to reject order');
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      setError('Failed to reject order');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestReapproval = async (orderId) => {
    try {
      setIsProcessing(true);
      const response = await apiService.orders.requestReapproval(orderId, approvalNotes);
      
      if (response.success) {
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: 'PENDING_APPROVAL', approvalNotes }
            : order
        ));
        setSelectedOrder(null);
        setApprovalNotes('');
      } else {
        setError(response.message || 'Failed to request re-approval');
      }
    } catch (error) {
      console.error('Error requesting re-approval:', error);
      setError('Failed to request re-approval');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <Clock className="text-yellow-500" size={20} />;
      case 'APPROVED':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'REJECTED':
        return <XCircle className="text-red-500" size={20} />;
      case 'CONFIRMED':
        return <CheckCircle className="text-blue-500" size={20} />;
      default:
        return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B4866] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin ? 'Order Management' : 'My Orders'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isAdmin ? 'Manage and approve customer orders' : 'Track your order status'}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="text-red-400 mr-3 mt-0.5" size={20} />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Clock size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">
                {isAdmin ? 'No orders have been placed yet.' : 'You haven\'t placed any orders yet.'}
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                        {order.paymentStatus && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 
                            order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            Payment: {order.paymentStatus}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Order #{order.orderNumber}</h3>
                        <p className="text-sm text-gray-600">Placed on {formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-gray-900">
                        ${order.total?.toFixed(2) || order.totalAmount}
                      </span>
                      {order.status === 'APPROVED' && order.paymentStatus === 'PENDING' && !isAdmin && (
                        <a
                          href={`/payment/${order.id}`}
                          className="ml-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Pay Now
                        </a>
                      )}
                      <button
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Eye size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                {selectedOrder?.id === order.id && (
                  <div className="px-6 py-4 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Order Items */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Order Items</h4>
                        <div className="space-y-3">
                          {order.items?.map((item, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                                {item.product?.image && (
                                  <OptimizedImage
                                    src={item.product.image}
                                    alt={item.product.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{item.product?.name}</p>
                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                              </div>
                              <p className="text-sm font-medium text-gray-900">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Shipping Address</h4>
                        <div className="text-sm text-gray-600">
                          <p>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                          <p>{order.shippingAddress?.address1}</p>
                          {order.shippingAddress?.address2 && <p>{order.shippingAddress.address2}</p>}
                          <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
                          <p>{order.shippingAddress?.phone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && order.status === 'PENDING_APPROVAL' && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Admin Actions</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Approval Notes
                            </label>
                            <textarea
                              value={approvalNotes}
                              onChange={(e) => setApprovalNotes(e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                              placeholder="Add notes about this order..."
                            />
                          </div>
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleApprove(order.id)}
                              disabled={isProcessing}
                              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {isProcessing ? 'Processing...' : 'Approve Order'}
                            </button>
                            <button
                              onClick={() => handleReject(order.id)}
                              disabled={isProcessing}
                              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {isProcessing ? 'Processing...' : 'Reject Order'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* User Actions */}
                    {!isAdmin && order.status === 'REJECTED' && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Request Re-approval</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Additional Notes
                            </label>
                            <textarea
                              value={approvalNotes}
                              onChange={(e) => setApprovalNotes(e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                              placeholder="Add any additional information..."
                            />
                          </div>
                          <button
                            onClick={() => handleRequestReapproval(order.id)}
                            disabled={isProcessing}
                            className="bg-[#0B4866] text-white px-4 py-2 rounded-lg hover:bg-[#094058] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isProcessing ? 'Processing...' : 'Request Re-approval'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
