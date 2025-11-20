'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { config } from '../../../lib/config';
import AdminOrderEditor from '../../../components/admin/AdminOrderEditor';
import OptimizedImage from '../../../components/shared/OptimizedImage';
import QuickViewModal from '../../../components/product/QuickViewModal';
import { CheckCircle2, XCircle, AlertCircle, Loader2, Edit, ThumbsUp, FileText, X as XIcon, Eye } from 'lucide-react';

export const dynamic = 'force-dynamic';

function OwnerApproveOrderPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [action, setAction] = useState(''); // 'approved' or 'rejected'
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const orderId = params.id;
  const token = searchParams.get('token');

  useEffect(() => {
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

    fetchOrderDetails();
  }, [orderId, token]);

  // Load existing notes when order is fetched
  useEffect(() => {
    if (order?.ownerApprovalNotes) {
      setApprovalNotes(order.ownerApprovalNotes);
    } else if (typeof window !== 'undefined') {
      // Try to load from localStorage as backup
      const savedNotes = localStorage.getItem(`order_${orderId}_notes`);
      if (savedNotes) {
        setApprovalNotes(savedNotes);
      }
    }
  }, [order, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${config.api.baseURL}/orders/${orderId}?token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch order details');
      }

      const data = await response.json();
      if (data.success) {
        const orderData = data.data?.order || data.data;
        setOrder(orderData);
        
        // Check if already processed
        if (orderData.ownerApproved || orderData.ownerRejected) {
          setSuccess(true);
          setAction(orderData.ownerApproved ? 'approved' : 'rejected');
        }
      } else {
        throw new Error(data.message || 'Failed to fetch order details');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.message || 'Failed to load order details. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderUpdate = (updatedOrder) => {
    setOrder(updatedOrder);
  };

  const handleApprove = async () => {
    if (!orderId || !token) {
      setError('Missing order ID or token');
      return;
    }

    showAlert({
      title: 'Approve Order',
      message: 'Are you sure you want to approve this order?',
      type: 'warning',
      confirmText: 'Approve',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          setProcessing(true);
          setGlobalLoading(true, 'Approving order...');
          setError('');

          // Get notes from state or localStorage
          let notesToSend = approvalNotes.trim() || null;
          if (!notesToSend && typeof window !== 'undefined') {
            const savedNotes = localStorage.getItem(`order_${orderId}_notes`);
            notesToSend = savedNotes || null;
          }
          
          const response = await fetch(`${config.api.baseURL}/orders/${orderId}/owner-approve`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token,
              approved: true,
              approvalNotes: notesToSend,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to approve order');
          }

          const data = await response.json();
          if (data.success) {
            setOrder(data.data.order);
            setSuccess(true);
            setAction('approved');
            setApprovalNotes('');
            setShowNotesModal(false);
            // Clear localStorage notes
            if (typeof window !== 'undefined') {
              localStorage.removeItem(`order_${orderId}_notes`);
            }
            showAlert({
              title: 'Success',
              message: 'Order approved successfully!',
              type: 'success',
              confirmText: 'OK',
            });
          } else {
            throw new Error(data.message || 'Failed to approve order');
          }
        } catch (err) {
          console.error('Error approving order:', err);
          showAlert({
            title: 'Error',
            message: err.message || 'Failed to approve order',
            type: 'error',
            confirmText: 'OK',
          });
          setError(err.message || 'Failed to approve order');
        } finally {
          setProcessing(false);
          setGlobalLoading(false);
        }
      },
    });
  };

  const handleReject = async () => {
    if (!orderId || !token) {
      setError('Missing order ID or token');
      return;
    }

    if (!rejectionNotes.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessing(true);
      setError('');

      const response = await fetch(`${config.api.baseURL}/orders/${orderId}/owner-approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          approved: false,
          rejectionNotes: rejectionNotes.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject order');
      }

      const data = await response.json();
      if (data.success) {
        setOrder(data.data.order);
        setSuccess(true);
        setAction('rejected');
        setShowRejectForm(false);
        setRejectionNotes('');
        // Clear localStorage notes
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`order_${orderId}_notes`);
        }
      } else {
        throw new Error(data.message || 'Failed to reject order');
      }
    } catch (err) {
      console.error('Error rejecting order:', err);
      setError(err.message || 'Failed to reject order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    if (order?.ownerApproved) {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    if (order?.ownerRejected) {
      return 'bg-red-100 text-red-800 border-red-300';
    }
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  const getStatusLabel = () => {
    if (order?.ownerApproved) return 'Approved';
    if (order?.ownerRejected) return 'Rejected';
    return 'Pending';
  };

  const formatItems = (items) => {
    if (!items || items.length === 0) return 'No items';
    return items.map(item => item.product?.title || item.name || 'Product').join(', ');
  };

  const calculateTotal = () => {
    if (!order) return 0;
    const subtotal = order.subtotal || 0;
    const tax = order.tax || 0;
    const shipping = order.shipping || 0;
    return subtotal + tax + shipping;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-[#0B4866] animate-spin mx-auto mb-4" />
          <p className="mt-4 text-lg font-medium text-gray-900">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-[#0B4866] text-white px-4 py-2 rounded-lg hover:bg-[#0a3d55]"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  if (success || (order && (order.ownerApproved || order.ownerRejected))) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center">
              {action === 'approved' || order?.ownerApproved ? (
                <>
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Approved</h1>
                  <p className="text-gray-600 mb-6">
                    This order has been approved and will be sent to admin for final processing.
                    {order?.ownerApprovalNotes && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-left">
                        <p className="text-sm font-medium text-green-800 mb-1">Approval Notes:</p>
                        <p className="text-sm text-green-700">{order.ownerApprovalNotes}</p>
                      </div>
                    )}
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Rejected</h1>
                  <p className="text-gray-600 mb-6">
                    This order has been rejected. It will not be sent to admin.
                    {order?.ownerRejectionNotes && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                        <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                        <p className="text-sm text-red-700">{order.ownerRejectionNotes}</p>
                      </div>
                    )}
                  </p>
                </>
              )}
              <button
                onClick={() => router.push('/')}
                className="w-full bg-[#0B4866] text-white px-4 py-2 rounded-lg hover:bg-[#0a3d55]"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you are looking for could not be found or the link is invalid.</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-[#0B4866] text-white px-4 py-2 rounded-lg hover:bg-[#0a3d55]"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const items = order.items || [];
  const orderTotal = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-[#0B4866] mb-6">Order Approval</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Order Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            {/* Product Images */}
            <div className="flex gap-2 flex-shrink-0">
              {items.slice(0, 4).map((item, index) => (
                <div key={index} className="relative group w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.product?.image ? (
                    <>
                      <OptimizedImage
                        src={item.product.image}
                        alt={item.product.title || 'Product'}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setQuickViewProduct(item.product)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        title="Quick View"
                      >
                        <Eye size={20} className="text-white" />
                      </button>
                    </>
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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(order.status)}`}>
                      {getStatusLabel()}
                    </span>
                  </div>

                  {/* Order Number */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Order #{order.orderNumber}
                  </h3>

                  {/* Items */}
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Items:</span> {formatItems(items)}
                  </p>

                  {/* Delivery Date */}
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Delivery Date:</span> TBD
                  </p>

                  {/* Rejection Reason (if rejected) */}
                  {order.ownerRejected && order.ownerRejectionNotes && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs font-medium text-red-800 mb-1">Rejected Reason:</p>
                      <p className="text-sm text-red-700">{order.ownerRejectionNotes}</p>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      Total Order: ${orderTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={handleApprove}
                    disabled={processing || order.ownerApproved || order.ownerRejected}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
                  >
                    <ThumbsUp size={16} />
                    Approve
                  </button>

                  <button
                    onClick={() => setShowRejectForm(true)}
                    disabled={processing || order.ownerApproved || order.ownerRejected}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>

                  <button
                    onClick={() => setShowNotesModal(true)}
                    disabled={processing || order.ownerApproved || order.ownerRejected}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
                  >
                    <FileText size={16} />
                    Add Note
                  </button>

                  <button
                    onClick={() => setShowEditModal(!showEditModal)}
                    className="px-4 py-2 bg-[#0B4866] text-white rounded-lg font-medium hover:bg-[#094058] transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
                  >
                    <Edit size={16} />
                    Edit Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Order Modal */}
        {showEditModal && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Edit Order</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon size={20} />
              </button>
            </div>
            <AdminOrderEditor order={order} onOrderUpdate={handleOrderUpdate} ownerToken={token} />
          </div>
        )}

        {/* Shipping Address */}
        {(order.shippingAddress || order.billingAddress) && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipping Address</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {order.shippingAddress && typeof order.shippingAddress === 'object' ? (
                <div className="text-sm text-gray-700 space-y-1">
                  <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                </div>
              ) : (
                <p className="text-sm text-gray-700">{JSON.stringify(order.shippingAddress)}</p>
              )}
            </div>
          </div>
        )}

        {/* Customer Notes */}
        {order.notes && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Notes</h3>
            <p className="text-gray-700">{order.notes}</p>
          </div>
        )}

        {/* Notes Modal */}
        {showNotesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Blur overlay background */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowNotesModal(false);
              }}
            />
            {/* Modal content */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Approval Notes</h3>
                <button
                  onClick={() => {
                    setShowNotesModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XIcon size={20} />
                </button>
              </div>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent mb-4"
                placeholder="Add any notes for this approval..."
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowNotesModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      setProcessing(true);
                      setError('');
                      
                      // Store notes in localStorage as backup, and update local state
                      // Notes will be sent when approving/rejecting
                      const notesToSave = approvalNotes.trim() || null;
                      
                      // Update local order state to show notes immediately
                      setOrder(prevOrder => ({
                        ...prevOrder,
                        ownerApprovalNotes: notesToSave
                      }));
                      
                      // Store in localStorage as backup
                      if (typeof window !== 'undefined') {
                        localStorage.setItem(`order_${orderId}_notes`, notesToSave || '');
                      }
                      
                      setShowNotesModal(false);
                      setError('');
                    } catch (err) {
                      console.error('Error saving notes:', err);
                      setError(err.message || 'Failed to save notes');
                    } finally {
                      setProcessing(false);
                    }
                  }}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-[#0B4866] text-white rounded-lg font-medium hover:bg-[#0a3d55] disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {processing ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick View Modal */}
        {quickViewProduct && (
          <QuickViewModal
            product={quickViewProduct}
            isOpen={!!quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
            previewOnly={true}
          />
        )}

        {/* Reject Form Modal */}
        {showRejectForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Blur overlay background */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowRejectForm(false);
                setRejectionNotes('');
                setError('');
              }}
            />
            {/* Modal content */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Reject Order</h3>
                <button
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectionNotes('');
                    setError('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XIcon size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">Please provide a reason for rejecting this order:</p>
              <textarea
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                placeholder="Enter rejection reason..."
                required
              />
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectionNotes('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing || !rejectionNotes.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {processing ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Display saved notes */}
        {order?.ownerApprovalNotes && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Saved Notes</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">{order.ownerApprovalNotes}</p>
            </div>
          </div>
        )}

        {/* Info Note */}
        <div className="bg-[#0B4866]/10 border border-[#0B4866]/30 rounded-lg p-4">
          <p className="text-sm text-[#0B4866]">
            <strong>Note:</strong> After approval, this order will be sent to admin for final review. 
            If you reject this order, it will not proceed to admin.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OwnerApproveOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-[#0B4866] animate-spin mx-auto" />
          <p className="mt-4 text-lg font-medium text-gray-900">Loading...</p>
        </div>
      </div>
    }>
      <OwnerApproveOrderPageContent />
    </Suspense>
  );
}
