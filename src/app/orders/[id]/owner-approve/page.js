'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { config } from '../../../lib/config';
import { apiService } from '../../../services/api/apiClient';
import { API_ENDPOINTS, APP_ROUTES, FALLBACK_URLS, buildApiUrl } from '../../../lib/urls';
import AdminOrderEditor from '../../../components/admin/AdminOrderEditor';
import OptimizedImage from '../../../components/shared/OptimizedImage';
import QuickViewModal from '../../../components/product/QuickViewModal';
import { CheckCircle2, XCircle, AlertCircle, Loader2, Edit, ThumbsUp, FileText, X as XIcon, Eye, Package } from 'lucide-react';
import { showAlert, setLoading as setGlobalLoading } from '../../../lib/ui';

export const dynamic = 'force-dynamic';

function OwnerApproveOrderPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Helper function to get production URL, replacing localhost if needed
  const getProductionUrl = (path = '/') => {
    if (typeof window === 'undefined') return path;

    const currentUrl = window.location.href;
    const currentOrigin = window.location.origin;

    // If on localhost, replace with production URL
    if (currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1')) {
      const productionUrl = config.urls.client || FALLBACK_URLS.clientProduction;
      return `${productionUrl}${path}`;
    }

    // Otherwise, use current domain
    return `${currentOrigin}${path}`;
  };

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

      // Use fetch with token query parameter for owner approval pages
      // This doesn't require authentication token, uses query param token instead
      // Use config.api.baseURL which correctly handles environment
      const response = await fetch(`${buildApiUrl(API_ENDPOINTS.orders.getById(orderId))}?token=${token}`, {
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

          // Use fetch with correct baseURL for owner approval
          // Use config.api.baseURL which correctly handles environment
          const response = await fetch(buildApiUrl(API_ENDPOINTS.orders.ownerApprove(orderId)), {
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

      // Use fetch with correct baseURL for owner approval
      // Use config.api.baseURL which correctly handles environment
      const response = await fetch(buildApiUrl(API_ENDPOINTS.orders.ownerApprove(orderId)), {
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
            onClick={() => {
              // Redirect to production URL, replacing localhost if needed
              const url = getProductionUrl('/');
              if (typeof window !== 'undefined') {
                window.location.href = url;
              } else {
                router.push(APP_ROUTES.home);
              }
            }}
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
                onClick={() => {
                  // Use window.location to ensure we stay on the same domain
                  if (typeof window !== 'undefined') {
                    window.location.href = APP_ROUTES.home;
                  } else {
                    router.push(APP_ROUTES.home);
                  }
                }}
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
            onClick={() => {
              // Redirect to production URL, replacing localhost if needed
              const url = getProductionUrl('/');
              if (typeof window !== 'undefined') {
                window.location.href = url;
              } else {
                router.push(APP_ROUTES.home);
              }
            }}
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

  // Status hierarchy for owner view
  const STATUS_FLOW = [
    { label: 'Submitted', active: true },
    { label: 'Owner Approval', active: !order.ownerApproved && !order.ownerRejected, current: !order.ownerApproved && !order.ownerRejected },
    { label: 'Admin Review', active: order.ownerApproved && !order.adminApproved, current: order.ownerApproved && !order.adminApproved },
    { label: 'Processing', active: order.adminApproved },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header with Glassmorphism Effect */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Order Approval</h1>
              <p className="text-slate-500 mt-1">Review and manage this order for your organization</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${getStatusBadge(order.status)}`}>
                {getStatusLabel()}
              </span>
            </div>
          </div>

          {/* Status Flow Visualizer */}
          <div className="mt-8 flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
            {STATUS_FLOW.map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${step.active
                  ? step.current ? 'bg-[#0B4866] text-white ring-4 ring-[#0B4866]/10 lg:scale-110 shadow-lg' : 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white text-slate-300 border border-slate-200 shadow-sm'
                  }`}>
                  {step.active && !step.current ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <span className="text-sm font-bold">{idx + 1}</span>
                  )}
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-wider mt-3 transition-colors duration-300 ${step.active ? step.current ? 'text-[#0B4866]' : 'text-emerald-600' : 'text-slate-400'
                  }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Action Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-[#0B4866]/5 px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-bold text-[#0B4866] flex items-center gap-2">
                  <Package size={20} />
                  Order Summary
                </h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-6 mb-8">
                  {/* Product Images Stack */}
                  <div className="flex -space-x-4">
                    {items.slice(0, 3).map((item, index) => (
                      <div key={index} className="relative w-20 h-20 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ring-4 ring-white">
                        {item.product?.image ? (
                          <OptimizedImage
                            src={item.product.image}
                            alt={item.product.title || 'Product'}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                            <Package size={24} />
                          </div>
                        )}
                      </div>
                    ))}
                    {items.length > 3 && (
                      <div className="w-20 h-20 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 font-bold ring-4 ring-white">
                        +{items.length - 3}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Order #{order.orderNumber}</h3>
                    <p className="text-slate-500 text-sm mb-4">{items.length} items in this order</p>
                    <div className="flex items-center gap-6">
                      <div className="text-2xl font-black text-[#0B4866] tracking-tight">
                        ${orderTotal.toFixed(2)}
                      </div>
                      <div className="h-8 w-px bg-slate-200"></div>
                      <div className="text-sm text-slate-500">
                        <span className="block font-medium text-slate-400 uppercase text-[10px] tracking-widest mb-0.5">Delivery</span>
                        {order.deliveryDate
                          ? new Date(order.deliveryDate).toLocaleDateString()
                          : 'TBD'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-100">
                  <button
                    onClick={handleApprove}
                    disabled={processing || order.ownerApproved || order.ownerRejected}
                    className="flex-1 min-w-[140px] px-6 py-3 bg-[#0ACF83] hover:bg-[#09B874] text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 disabled:bg-slate-200 disabled:shadow-none transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                  >
                    <ThumbsUp size={18} />
                    Approve Order
                  </button>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    disabled={processing || order.ownerApproved || order.ownerRejected}
                    className="px-6 py-3 bg-white border-2 border-slate-200 hover:border-red-200 hover:text-red-600 text-slate-600 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                  <button
                    onClick={() => setShowNotesModal(true)}
                    disabled={processing || order.ownerApproved || order.ownerRejected}
                    className="px-6 py-3 bg-white border-2 border-slate-200 hover:border-amber-200 hover:text-amber-600 text-slate-600 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <FileText size={18} />
                    Notes
                  </button>
                  <button
                    onClick={() => setShowEditModal(!showEditModal)}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
                  >
                    <Edit size={18} />
                    Edit Items
                  </button>
                </div>
              </div>
            </div>

            {/* Edit Order Section Overlay */}
            {showEditModal && (
              <div className="bg-white rounded-2xl border-2 border-[#0B4866]/20 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="bg-[#0B4866] px-6 py-4 flex items-center justify-between text-white">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Edit size={20} />
                    Edit Order Contents
                  </h2>
                  <button onClick={() => setShowEditModal(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
                    <XIcon size={20} />
                  </button>
                </div>
                <div className="p-6">
                  <AdminOrderEditor order={order} onOrderUpdate={handleOrderUpdate} ownerToken={token} orderId={orderId} />
                </div>
              </div>
            )}

            {/* Content Details */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
                <Package size={20} className="text-[#0B4866]" />
                Items Details
              </h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0">
                      {item.product?.image ? (
                        <OptimizedImage src={item.product.image} alt={item.product.title} width={64} height={64} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300"><Package size={20} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{item.product?.title || item.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">${(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Sidebar Info Cards */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#0B4866]/5 rounded-bl-full -mr-8 -mt-8"></div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Organization Details</h3>

              <div className="space-y-6">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Shipping To</div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    {order.shippingAddress && typeof order.shippingAddress === 'object' ? (
                      <div className="text-sm text-slate-700 leading-relaxed font-medium">
                        <p className="text-slate-900 font-bold mb-1">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                        <p>{order.shippingAddress.address1}</p>
                        {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                        <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">Address details unavailable</p>
                    )}
                  </div>
                </div>

                {order.notes && (
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Order Notes</div>
                    <p className="text-sm text-slate-600 bg-amber-50/50 border border-amber-100 rounded-xl p-4 leading-relaxed">
                      {order.notes}
                    </p>
                  </div>
                )}

                {/* Display saved notes */}
                {order.ownerApprovalNotes && (
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">My Approval Notes</div>
                    <p className="text-sm text-slate-600 bg-blue-50 border border-blue-100 rounded-xl p-4 leading-relaxed">
                      {order.ownerApprovalNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Instruction Card */}
            <div className="bg-gradient-to-br from-[#0B4866] to-[#0F4C81] rounded-2xl p-6 text-white shadow-lg shadow-blue-900/10">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="text-white/80" />
                Next Steps
              </h3>
              <ul className="text-sm space-y-3 font-medium text-white/90">
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
                  Review the items and organizational spending guidelines.
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
                  Edit items if certain products need modification.
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
                  Approved orders proceed to final Admin confirmation.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Notes Modal */}
        {showNotesModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowNotesModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Approval Notes</h3>
                <button onClick={() => setShowNotesModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-all">
                  <XIcon size={20} />
                </button>
              </div>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B4866] focus:border-transparent mb-6 text-sm placeholder:text-slate-400"
                placeholder="Include internal context or approval reasons..."
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      setProcessing(true);
                      const notesToSave = approvalNotes.trim() || null;
                      setOrder(prevOrder => ({ ...prevOrder, ownerApprovalNotes: notesToSave }));
                      if (typeof window !== 'undefined') {
                        localStorage.setItem(`order_${orderId}_notes`, notesToSave || '');
                      }
                      setShowNotesModal(false);
                    } catch (err) {
                      console.error('Error saving notes:', err);
                      setError(err.message || 'Failed to save notes');
                    } finally {
                      setProcessing(false);
                    }
                  }}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-[#0B4866] text-white rounded-xl font-bold hover:bg-[#0a3d55] disabled:bg-slate-300 transition-all shadow-md shadow-blue-900/10"
                >
                  {processing ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick View Modal */}
        {quickViewProduct && (
          <QuickViewModal product={quickViewProduct} isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} previewOnly={true} />
        )}

        {/* Reject Form Modal */}
        {showRejectForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowRejectForm(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Reject Order</h3>
                <button onClick={() => setShowRejectForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-all">
                  <XIcon size={20} />
                </button>
              </div>
              <p className="text-sm text-slate-500 mb-4">Please provide a reason for rejecting this order:</p>
              <textarea
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent mb-6 text-sm placeholder:text-slate-400"
                placeholder="Why is this order being rejected?"
                required
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing || !rejectionNotes.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:bg-slate-300 transition-all shadow-md shadow-red-900/10"
                >
                  {processing ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}
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
