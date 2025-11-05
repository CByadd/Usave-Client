'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getCurrentUser, isAuthenticated } from '../../../../lib/auth';
import { apiService } from '../../../../services/api/apiClient';
import { config } from '../../../../lib/config';
import AdminOrderEditor from '../../../../components/admin/AdminOrderEditor';
import { showAlert, setLoading } from '../../../../lib/ui';

export const dynamic = 'force-dynamic';

function ApproveOrderPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [sendingPaymentInfo, setSendingPaymentInfo] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: '',
    accountNumber: '',
    routingNumber: '',
    bankName: '',
    paypalEmail: '',
    instructions: '',
    dueDate: '',
    paymentUrl: '',
  });

  const orderId = params.id;
  const token = searchParams.get('token');

  useEffect(() => {
    const currentUser = getCurrentUser();
    const authenticated = isAuthenticated();
    setUser(currentUser);
    
    if (!orderId) {
      setError('Order ID is missing');
      setLoading(false);
      return;
    }

    if (!token) {
      setError('Access token is missing from URL');
      setLoading(false);
      return;
    }

    // Validate token and fetch order
    // Note: This page can be accessed with just the token (from email link)
    // Admin login is optional but recommended for better security
    validateTokenAndFetchOrder();
    
    // Set up polling for order updates every 5 seconds
    const pollInterval = setInterval(() => {
      if (orderId) {
        validateTokenAndFetchOrder();
      }
    }, 5000);
    
    return () => clearInterval(pollInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, token, router]);

  const validateTokenAndFetchOrder = async () => {
    try {
      // Fetch order using the order ID and token from URL
      // The backend should validate the token
      const authToken = localStorage.getItem('authToken');
      // Use the config's baseURL which already includes /api
      const baseUrl = config.api.baseURL.endsWith('/api') 
        ? config.api.baseURL 
        : `${config.api.baseURL}/api`;
      const response = await fetch(
        `${baseUrl}/orders/${orderId}?token=${token}`,
        {
          headers: {
            'Authorization': authToken ? `Bearer ${authToken}` : '',
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrder(data.data?.order || data.data);
          setTokenValid(true);
        } else {
          setError('Order not found or invalid token');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to load order details');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderUpdate = (updatedOrder) => {
    setOrder(updatedOrder);
  };

  const handleApprove = async () => {
    showAlert({
      title: 'Approve Order',
      message: 'Are you sure you want to approve this order?',
      type: 'warning',
      confirmText: 'Approve',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setProcessing(true);
        setLoading(true, 'Approving order...');
        try {
          const response = await apiService.orders.approve(orderId, approvalNotes);
          if (response.success) {
            // Refresh order data to get updated status
            await validateTokenAndFetchOrder();
            showAlert({
              title: 'Success',
              message: 'Order approved successfully! You can now send payment information to the customer.',
              type: 'success',
              confirmText: 'OK',
            });
            // Don't redirect - stay on page to show Send Payment Info button
          } else {
            showAlert({
              title: 'Error',
              message: response.message || 'Failed to approve order',
              type: 'error',
              confirmText: 'OK',
            });
            setError(response.message || 'Failed to approve order');
          }
        } catch (err) {
          console.error('Error approving order:', err);
          showAlert({
            title: 'Error',
            message: 'Failed to approve order',
            type: 'error',
            confirmText: 'OK',
          });
          setError('Failed to approve order');
        } finally {
          setProcessing(false);
          setLoading(false);
        }
      },
    });
  };

  const handleReject = async () => {
    const notes = window.prompt('Please provide a reason for rejection:');
    if (!notes) return;

    setProcessing(true);
    setLoading(true, 'Rejecting order...');
    try {
      const response = await apiService.orders.reject(orderId, notes);
      if (response.success) {
        showAlert({
          title: 'Order Rejected',
          message: 'Order has been rejected successfully.',
          type: 'success',
          confirmText: 'OK',
          onConfirm: () => router.push('/admin/dashboard'),
        });
      } else {
        showAlert({
          title: 'Error',
          message: response.message || 'Failed to reject order',
          type: 'error',
          confirmText: 'OK',
        });
        setError(response.message || 'Failed to reject order');
      }
    } catch (err) {
      console.error('Error rejecting order:', err);
      showAlert({
        title: 'Error',
        message: 'Failed to reject order',
        type: 'error',
        confirmText: 'OK',
      });
      setError('Failed to reject order');
    } finally {
      setProcessing(false);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    showAlert({
      title: 'Delete Order',
      message: 'Are you sure you want to delete this order? This action cannot be undone.',
      type: 'error',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setProcessing(true);
        setLoading(true, 'Deleting order...');
        try {
          const response = await fetch(`/api/orders/${orderId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });
          
          if (response.ok) {
            showAlert({
              title: 'Success',
              message: 'Order deleted successfully',
              type: 'success',
              confirmText: 'OK',
              onConfirm: () => router.push('/admin/dashboard'),
            });
          } else {
            showAlert({
              title: 'Error',
              message: 'Failed to delete order',
              type: 'error',
              confirmText: 'OK',
            });
            setError('Failed to delete order');
          }
        } catch (err) {
          console.error('Error deleting order:', err);
          showAlert({
            title: 'Error',
            message: 'Failed to delete order',
            type: 'error',
            confirmText: 'OK',
          });
          setError('Failed to delete order');
        } finally {
          setProcessing(false);
          setLoading(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-900">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Order Review</h1>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {order && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Order #{order.orderNumber}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Status: <span className="font-semibold capitalize">{order.status}</span></span>
                  <span>Total: <span className="font-semibold">${order.total?.toFixed(2)}</span></span>
                </div>
              </div>

              {/* Admin Order Editor with Add/Edit/Delete functionality */}
              <AdminOrderEditor order={order} onOrderUpdate={handleOrderUpdate} />

              {(order.shippingAddress || order.billingAddress) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipping Address</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {order.shippingAddress && typeof order.shippingAddress === 'object' ? (
                      <div className="text-sm text-gray-700 space-y-1">
                        <p>{order.shippingAddress.fullName || order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                        <p>{order.shippingAddress.addressLine1 || order.shippingAddress.address1}</p>
                        {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                        <p>{order.shippingAddress.country}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700">{JSON.stringify(order.shippingAddress)}</p>
                    )}
                  </div>
                </div>
              )}

              {order.notes && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Notes</h3>
                  <p className="text-gray-700">{order.notes}</p>
                </div>
              )}

              <div className="mb-6">
                <label htmlFor="approvalNotes" className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Notes (Optional)
                </label>
                <textarea
                  id="approvalNotes"
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Add any notes for this approval..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleApprove}
                  disabled={processing || order.status !== 'PENDING_APPROVAL'}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                >
                  {processing ? 'Processing...' : 'Approve Order'}
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing || order.status !== 'PENDING_APPROVAL'}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                >
                  {processing ? 'Processing...' : 'Reject Order'}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={processing}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ApproveOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-900">Loading...</p>
        </div>
      </div>
    }>
      <ApproveOrderPageContent />
    </Suspense>
  );
}

