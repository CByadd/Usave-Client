"use client";
import React, { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';
import { CheckoutPageSkeleton } from '../components/shared/LoadingSkeletons';
import { CreditCard, MapPin, User, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import OptimizedImage from '../components/shared/OptimizedImage';
import { apiService } from '../services/api';
import AdminOrderEditor from '../components/admin/AdminOrderEditor';
import RejectedOrderEditor from '../components/orders/RejectedOrderEditor';

const CheckoutPage = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { openLoginModal } = useUI();
  
  const [currentStep, setCurrentStep] = useState(1); // 1: Address, 2: Review & Submit, 3: Payment (after approval)
  const [isProcessing, setIsProcessing] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [shippingAddress, setShippingAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Australia',
    phone: user?.phone || ''
  });

  const [billingAddress, setBillingAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Australia',
    phone: user?.phone || ''
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [notes, setNotes] = useState('');
  const [sameAsShipping, setSameAsShipping] = useState(true);

  // Admin approval states
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal();
    }
  }, [isAuthenticated, openLoginModal]);

  useEffect(() => {
    if (sameAsShipping) {
      setBillingAddress(shippingAddress);
    }
  }, [shippingAddress, sameAsShipping]);

  const handleInputChange = (setter, field, value) => {
    setter(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        const requiredShipping = ['firstName', 'lastName', 'address1', 'city', 'state', 'postalCode', 'phone'];
        return requiredShipping.every(field => shippingAddress[field].trim() !== '');
      case 2:
        if (!sameAsShipping) {
          const requiredBilling = ['firstName', 'lastName', 'address1', 'city', 'state', 'postalCode', 'phone'];
          return requiredBilling.every(field => billingAddress[field].trim() !== '');
        }
        return true;
      case 3:
        return paymentMethod !== '';
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1) {
        // After address, go to review & submit
        setCurrentStep(2);
      } else if (currentStep === 2) {
        // After review, submit for approval
        handleSubmitOrder();
      }
      setError('');
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmitOrder = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      setError('Please complete all required fields');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const orderData = {
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        paymentMethod,
        notes,
        items: (cartItems || []).map(ci => ({ productId: ci.id, quantity: ci.quantity }))
      };

      const response = await apiService.orders.create(orderData);
      
      if (response.success) {
        setOrder(response.data);
        setCurrentStep(4);
        setSuccess('Order submitted successfully! It is now pending admin approval.');
        await clearCart();
      } else {
        setError(response.message || 'Failed to submit order');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      setError(error.response?.data?.message || 'Failed to submit order');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveOrder = async () => {
    if (!order) return;
    
    setIsApproving(true);
    try {
      const response = await apiService.orders.approve(order.id, approvalNotes);
      if (response.success) {
        setOrder(response.data);
        setSuccess('Order approved successfully!');
        setApprovalNotes('');
      } else {
        setError(response.message || 'Failed to approve order');
      }
    } catch (error) {
      console.error('Approval error:', error);
      setError(error.response?.data?.message || 'Failed to approve order');
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectOrder = async () => {
    if (!order || !approvalNotes.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    
    setIsApproving(true);
    try {
      const response = await apiService.orders.reject(order.id, approvalNotes);
      if (response.success) {
        setOrder(response.data);
        setSuccess('Order rejected');
        setApprovalNotes('');
      } else {
        setError(response.message || 'Failed to reject order');
      }
    } catch (error) {
      console.error('Rejection error:', error);
      setError(error.response?.data?.message || 'Failed to reject order');
    } finally {
      setIsApproving(false);
    }
  };

  const handleRequestReapproval = async () => {
    if (!order) return;
    
    setIsProcessing(true);
    try {
      const response = await apiService.orders.requestReapproval(order.id, notes);
      if (response.success) {
        setOrder(response.data);
        setSuccess('Order submitted for re-approval');
      } else {
        setError(response.message || 'Failed to request re-approval');
      }
    } catch (error) {
      console.error('Re-approval request error:', error);
      setError(error.response?.data?.message || 'Failed to request re-approval');
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

  if (!isAuthenticated) {
    return <CheckoutPageSkeleton />;
  }

  if (cartItems.length === 0 && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some items to your cart before checkout</p>
          <a href="/products" className="bg-[#0B4866] text-white px-6 py-3 rounded-lg hover:bg-[#094058] transition-colors">
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  const totals = getCartTotal();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${
                  currentStep >= step 
                    ? 'bg-[#0B4866] border-[#0B4866] text-white' 
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {step}
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className={`text-xs sm:text-sm font-medium ${
                    currentStep >= step ? 'text-[#0B4866]' : 'text-gray-500'
                  }`}>
                    {step === 1 && 'Address'}
                    {step === 2 && 'Review & Submit'}
                    {step === 3 && 'Payment'}
                  </p>
                </div>
                {step < 3 && (
                  <div className={`w-8 sm:w-16 h-0.5 ml-2 sm:ml-4 ${
                    currentStep > step ? 'bg-[#0B4866]' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600">{success}</p>
              </div>
            )}

            {/* Step 1: Shipping Address */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <MapPin className="mr-2" size={20} />
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input
                      type="text"
                      value={shippingAddress.firstName}
                      onChange={(e) => handleInputChange(setShippingAddress, 'firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={shippingAddress.lastName}
                      onChange={(e) => handleInputChange(setShippingAddress, 'lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                    <input
                      type="text"
                      value={shippingAddress.company}
                      onChange={(e) => handleInputChange(setShippingAddress, 'company', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
                    <input
                      type="text"
                      value={shippingAddress.address1}
                      onChange={(e) => handleInputChange(setShippingAddress, 'address1', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                    <input
                      type="text"
                      value={shippingAddress.address2}
                      onChange={(e) => handleInputChange(setShippingAddress, 'address2', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => handleInputChange(setShippingAddress, 'city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => handleInputChange(setShippingAddress, 'state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code *</label>
                    <input
                      type="text"
                      value={shippingAddress.postalCode}
                      onChange={(e) => handleInputChange(setShippingAddress, 'postalCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => handleInputChange(setShippingAddress, 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Billing Address */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <User className="mr-2" size={20} />
                  Billing Address
                </h2>
                
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Same as shipping address</span>
                  </label>
                </div>

                {!sameAsShipping && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                      <input
                        type="text"
                        value={billingAddress.firstName}
                        onChange={(e) => handleInputChange(setBillingAddress, 'firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                      <input
                        type="text"
                        value={billingAddress.lastName}
                        onChange={(e) => handleInputChange(setBillingAddress, 'lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                      <input
                        type="text"
                        value={billingAddress.company}
                        onChange={(e) => handleInputChange(setBillingAddress, 'company', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
                      <input
                        type="text"
                        value={billingAddress.address1}
                        onChange={(e) => handleInputChange(setBillingAddress, 'address1', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                      <input
                        type="text"
                        value={billingAddress.address2}
                        onChange={(e) => handleInputChange(setBillingAddress, 'address2', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        value={billingAddress.city}
                        onChange={(e) => handleInputChange(setBillingAddress, 'city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                      <input
                        type="text"
                        value={billingAddress.state}
                        onChange={(e) => handleInputChange(setBillingAddress, 'state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code *</label>
                      <input
                        type="text"
                        value={billingAddress.postalCode}
                        onChange={(e) => handleInputChange(setBillingAddress, 'postalCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                      <input
                        type="tel"
                        value={billingAddress.phone}
                        onChange={(e) => handleInputChange(setBillingAddress, 'phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <CreditCard className="mr-2" size={20} />
                  Payment Method
                </h2>
                
                <div className="space-y-4">
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <CreditCard className="mr-3" size={20} />
                    <span className="font-medium">Credit/Debit Card</span>
                  </label>
                  
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <span className="font-medium">PayPal</span>
                  </label>
                  
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={paymentMethod === 'bank'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <span className="font-medium">Bank Transfer</span>
                  </label>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                    placeholder="Any special instructions for your order..."
                  />
                </div>
              </div>
            )}

            {/* Step 4: Review & Approval */}
            {currentStep === 4 && order && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center">
                    {getStatusIcon(order.status)}
                    <span className="ml-2">Order Review</span>
                  </h2>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
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
                </div>

                {/* Order Details */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Order #{order.orderNumber}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                      <div className="text-sm text-gray-600">
                        <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                        <p>{order.shippingAddress.address1}</p>
                        {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                        <p>{order.shippingAddress.country}</p>
                        <p>{order.shippingAddress.phone}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Payment Method</h4>
                      <p className="text-sm text-gray-600 capitalize">{order.paymentMethod}</p>
                      {order.notes && (
                        <div className="mt-2">
                          <h5 className="font-medium text-gray-900">Notes:</h5>
                          <p className="text-sm text-gray-600">{order.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Admin Order Editor */}
                {isAdmin && (order.status === 'PENDING_APPROVAL' || order.status === 'REJECTED') && (
                  <AdminOrderEditor 
                    order={order} 
                    onOrderUpdate={(updatedOrder) => setOrder(updatedOrder)}
                  />
                )}

                {/* Admin Approval Section */}
                {isAdmin && order.status === 'PENDING_APPROVAL' && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-3">Admin Approval Required</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Approval Notes</label>
                        <textarea
                          value={approvalNotes}
                          onChange={(e) => setApprovalNotes(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                          placeholder="Add notes for approval or rejection..."
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleApproveOrder}
                          disabled={isApproving}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {isApproving ? 'Approving...' : 'Approve Order'}
                        </button>
                        <button
                          onClick={handleRejectOrder}
                          disabled={isApproving || !approvalNotes.trim()}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          {isApproving ? 'Rejecting...' : 'Reject Order'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* User Rejected Order Editor */}
                {!isAdmin && order.status === 'REJECTED' && (
                  <RejectedOrderEditor
                    order={order}
                    onOrderUpdate={(updatedOrder) => setOrder(updatedOrder)}
                    onResubmit={(updatedOrder) => {
                      setOrder(updatedOrder);
                      setSuccess('Order resubmitted for approval');
                    }}
                  />
                )}

                {/* Payment Section for Approved Orders */}
                {order.status === 'APPROVED' && order.paymentStatus === 'PENDING' && !isAdmin && (
                  <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="text-green-600" size={24} />
                      <h4 className="font-semibold text-green-900">Order Approved! Complete Payment</h4>
                    </div>
                    <p className="text-sm text-green-700 mb-4">
                      Your order has been approved. Please proceed to payment to complete your purchase.
                    </p>
                    <Link
                      href={`/payment/${order.id}`}
                      className="block w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-center hover:bg-green-700 transition-colors"
                    >
                      Proceed to Payment - ${order.total.toFixed(2)}
                    </Link>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {order.items.map((item) => {
                      const product = item.product || {};
                      return (
                        <div key={item.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                          {product.image ? (
                            <OptimizedImage
                              src={product.image}
                              alt={product.title || 'Product'}
                              width={60}
                              height={60}
                              className="w-15 h-15 object-cover rounded"
                            />
                          ) : (
                            <div className="w-15 h-15 bg-gray-100 rounded" />
                          )}
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{product.title || 'Item'}</h5>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">${(item.price || 0).toFixed(2)}</p>
                            <p className="text-sm text-gray-600">Total: ${(((item.price || 0) * item.quantity) || 0).toFixed(2)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={currentStep === 3 ? handleSubmitOrder : handleNextStep}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-[#0B4866] text-white rounded-lg hover:bg-[#094058] disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : currentStep === 3 ? 'Submit Order' : 'Next'}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow p-4 lg:p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              {cartItems.length > 0 && (
                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <OptimizedImage
                        src={item.image}
                        alt={item.title}
                        width={50}
                        height={50}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ${(item.discountedPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${totals.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="text-gray-900">${(totals * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">${totals > 100 ? '0.00' : '10.00'}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-4">
                  <span>Total</span>
                  <span>${(totals + (totals * 0.1) + (totals > 100 ? 0 : 10)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;