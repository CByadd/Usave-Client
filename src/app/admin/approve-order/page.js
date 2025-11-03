'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api/apiClient';
import AdminOrderEditor from '../../components/admin/AdminOrderEditor';

export const dynamic = 'force-dynamic';

function ApproveOrderPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (orderId && isAuthenticated) {
      fetchOrder();
    } else if (!isAuthenticated) {
      setError('Please log in to continue');
    } else if (!orderId) {
      setError('Order ID is missing');
    }
  }, [orderId, isAuthenticated]);

  const fetchOrder = async () => {
    try {
      const response = await apiService.orders.getById(orderId);
      if (response.success) {
        setOrder(response.data);
      } else {
        setError('Order not found');
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
    if (!confirm('Are you sure you want to approve this order?')) return;
    
    setProcessing(true);
    try {
      const response = await apiService.orders.approve(orderId, approvalNotes);
      if (response.success) {
        alert('Order approved successfully!');
        router.push('/admin/dashboard');
      } else {
        setError(response.message || 'Failed to approve order');
      }
    } catch (err) {
      console.error('Error approving order:', err);
      setError('Failed to approve order');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    const notes = prompt('Please provide a reason for rejection:');
    if (!notes) return;

    setProcessing(true);
    try {
      const response = await apiService.orders.reject(orderId, notes);
      if (response.success) {
        alert('Order rejected');
        router.push('/admin/dashboard');
      } else {
        setError(response.message || 'Failed to reject order');
      }
    } catch (err) {
      console.error('Error rejecting order:', err);
      setError('Failed to reject order');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    
    setProcessing(true);
    try {
      // Note: Delete endpoint might not exist, adjust based on your API
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        alert('Order deleted successfully');
        router.push('/admin/dashboard');
      } else {
        setError('Failed to delete order');
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      setError('Failed to delete order');
    } finally {
      setProcessing(false);
    }
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

