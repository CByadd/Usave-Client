"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCurrentUser, isAuthenticated } from '../../lib/auth';
import { CreditCard, Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import OptimizedImage from '../../components/shared/OptimizedImage';
import { apiService as api } from '../../services/api/apiClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const PaymentPage = () => {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const currentUser = getCurrentUser();
    const authenticated = isAuthenticated();
    setUser(currentUser);
    
    if (!authenticated) {
      router.push('/auth/login');
    }
  }, [router]);
  const orderId = params.orderId;

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Card details
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    fetchOrder();
  }, [orderId, isAuthenticated]);

  const fetchOrder = async () => {
    try {
      const response = await api.orders.getById(orderId);
      if (response.success) {
        const orderData = response.data;
        
        // Verify order is approved and payment is pending
        if (orderData.status !== 'APPROVED') {
          setError('This order must be approved before payment');
          return;
        }

        if (orderData.paymentStatus !== 'PENDING') {
          setError(orderData.paymentStatus === 'PAID' 
            ? 'This order has already been paid' 
            : 'This order is not available for payment');
          return;
        }

        // Verify order belongs to current user
        if (orderData.userId !== user?.id) {
          setError('Unauthorized access');
          return;
        }

        setOrder(orderData);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      setError('Failed to load order');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardInputChange = (field, value) => {
    let formattedValue = value;

    if (field === 'cardNumber') {
      // Format card number with spaces
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return;
    } else if (field === 'expiryDate') {
      // Format expiry date MM/YY
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
      if (formattedValue.length > 5) return;
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardDetails(prev => ({ ...prev, [field]: formattedValue }));
  };

  const validateCardDetails = () => {
    if (paymentMethod === 'card') {
      const cardNumber = cardDetails.cardNumber.replace(/\s/g, '');
      
      // Validate card number (Luhn algorithm check would be ideal but basic length check for now)
      if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
        setError('Please enter a valid card number (13-19 digits)');
        return false;
      }
      
      // Check if card number is all digits
      if (!/^\d+$/.test(cardNumber)) {
        setError('Card number must contain only digits');
        return false;
      }

      // Validate cardholder name
      if (!cardDetails.cardName.trim()) {
        setError('Cardholder name is required');
        return false;
      }
      if (cardDetails.cardName.trim().length < 3) {
        setError('Cardholder name must be at least 3 characters');
        return false;
      }

      // Validate expiry date
      if (cardDetails.expiryDate.length !== 5 || !cardDetails.expiryDate.includes('/')) {
        setError('Please enter a valid expiry date (MM/YY)');
        return false;
      }
      
      const [month, year] = cardDetails.expiryDate.split('/');
      const expiryMonth = parseInt(month, 10);
      const expiryYear = parseInt('20' + year, 10);
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      
      if (expiryMonth < 1 || expiryMonth > 12) {
        setError('Invalid expiry month');
        return false;
      }
      
      if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        setError('Card has expired');
        return false;
      }

      // Validate CVV
      if (cardDetails.cvv.length < 3 || cardDetails.cvv.length > 4) {
        setError('CVV must be 3 or 4 digits');
        return false;
      }
      if (!/^\d+$/.test(cardDetails.cvv)) {
        setError('CVV must contain only digits');
        return false;
      }
    }
    return true;
  };

  const handlePayment = async () => {
    setError('');

    // Validate based on payment method
    if (paymentMethod === 'card' && !validateCardDetails()) {
      return;
    }

    if (!order) {
      setError('Order not found');
      return;
    }

    // Verify order is still valid for payment
    if (order.status !== 'APPROVED') {
      setError('This order is not approved for payment');
      return;
    }

    if (order.paymentStatus !== 'PENDING') {
      setError('This order has already been paid');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing delay (remove in production)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, integrate with payment gateway here
      // Example: Stripe
      // const stripeResponse = await stripe.confirmPayment({
      //   elements,
      //   confirmParams: { return_url: `${window.location.origin}/payment/${orderId}/success` }
      // });
      // const paymentIntentId = stripeResponse.paymentIntent.id;

      // For now, use simulated payment intent ID
      const paymentIntentId = paymentMethod === 'card' 
        ? `card_${Date.now()}`
        : paymentMethod === 'paypal'
        ? `paypal_${Date.now()}`
        : `bank_transfer_${Date.now()}`;

      // Process payment on server
      const response = await api.orders.processPayment(
        orderId,
        paymentMethod,
        paymentIntentId
      );

      if (response.success) {
        // Redirect to success page
        router.push(`/payment/${orderId}/success`);
      } else {
        setError(response.message || 'Payment processing failed. Please try again.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Payment failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B4866] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Unavailable</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block bg-[#0B4866] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#094058] transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 text-[#0B4866] hover:text-[#094058] font-medium mb-4"
          >
            <ArrowLeft size={20} />
            Back to Order
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Complete Payment</h1>
          <p className="text-gray-600 mt-2">Order #{order?.orderNumber}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Security Badge */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <Lock className="text-green-600" size={24} />
              <div>
                <h3 className="font-semibold text-green-900">Secure Payment</h3>
                <p className="text-sm text-green-700">Your payment information is encrypted and secure</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="text-red-600" size={20} />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Payment Method Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#0B4866] transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-[#0B4866]"
                  />
                  <CreditCard className="text-gray-600" size={24} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Credit / Debit Card</p>
                    <p className="text-sm text-gray-600">Visa, Mastercard, Amex</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#0B4866] transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-[#0B4866]"
                  />
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
                    P
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">PayPal</p>
                    <p className="text-sm text-gray-600">Pay with your PayPal account</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#0B4866] transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-[#0B4866]"
                  />
                  <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center text-white font-bold text-xs">
                    B
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Bank Transfer</p>
                    <p className="text-sm text-gray-600">Direct bank transfer</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Card Details Form */}
            {paymentMethod === 'card' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Card Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      value={cardDetails.cardNumber}
                      onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      value={cardDetails.cardName}
                      onChange={(e) => handleCardInputChange('cardName', e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        value={cardDetails.expiryDate}
                        onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={cardDetails.cvv}
                        onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                        placeholder="123"
                        maxLength={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    P
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  You will be redirected to PayPal to complete your payment securely.
                </p>
              </div>
            )}

            {paymentMethod === 'bank_transfer' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Bank Transfer Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank Name:</span>
                    <span className="font-medium">Usave Bank</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Name:</span>
                    <span className="font-medium">Usave Pty Ltd</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">BSB:</span>
                    <span className="font-medium">123-456</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Number:</span>
                    <span className="font-medium">123456789</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-medium">{order?.orderNumber}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Please include the reference number in your transfer.
                </p>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-[#0B4866] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#094058] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock size={20} />
                  Pay ${order?.total.toFixed(2)}
                </>
              )}
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Order Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {order?.items.map((item) => {
                  const product = item.product || {};
                  return (
                    <div key={item.id} className="flex gap-3">
                      {product.image && (
                        <OptimizedImage
                          src={product.image}
                          alt={product.title || 'Product'}
                          width={60}
                          height={60}
                          className="w-15 h-15 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.title || 'Item'}
                        </p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium text-gray-900">
                          ${((item.price || 0) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${order?.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (10%):</span>
                  <span className="font-medium">${order?.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span className="text-[#0B4866]">${order?.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Shipping To:</h3>
                <div className="text-xs text-gray-600">
                  <p>{order?.shippingAddress.firstName} {order?.shippingAddress.lastName}</p>
                  <p>{order?.shippingAddress.address1}</p>
                  <p>{order?.shippingAddress.city}, {order?.shippingAddress.state} {order?.shippingAddress.postalCode}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
