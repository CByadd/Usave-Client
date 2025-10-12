"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, CreditCard, Truck, Shield, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCheckout } from '../context/CheckoutContext';
import { CheckoutPageSkeleton } from '../components/shared/LoadingSkeletons';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { cartItems, totals } = useCart();
  const {
    checkoutStep,
    shippingInfo,
    billingInfo,
    paymentInfo,
    orderSummary,
    updateShippingInfo,
    updateBillingInfo,
    updatePaymentInfo,
    applyDiscountCode,
    removeDiscountCode,
    nextStep,
    previousStep,
    processOrder,
    isProcessing,
    error,
    orderId
  } = useCheckout();

  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
    if (cartItems.length === 0 && !orderId) {
      router.push('/');
    }
  }, [isAuthenticated, cartItems.length, orderId, router]);

  const handleDiscountCodeSubmit = async (e) => {
    e.preventDefault();
    if (discountCode.trim()) {
      const result = await applyDiscountCode(discountCode);
      if (result.success) {
        setDiscountApplied(true);
      }
    }
  };

  const handleRemoveDiscount = () => {
    removeDiscountCode();
    setDiscountCode('');
    setDiscountApplied(false);
  };

  const handleProcessOrder = async () => {
    const result = await processOrder();
    if (result.success) {
      // Order completed successfully
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Please sign in to continue</h1>
          <Link href="/" className="text-[#0B4866] hover:underline">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  // Show loading skeleton while processing
  if (isProcessing) {
    return <CheckoutPageSkeleton />;
  }

  if (cartItems.length === 0 && !orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h1>
          <Link href="/" className="text-[#0B4866] hover:underline">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  // Order completion page
  if (orderId) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
              <p className="text-gray-600">
                Thank you for your order. We've sent a confirmation email to {user?.email}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">${orderSummary.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Delivery:</span>
                  <span className="font-medium">7-10 business days</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Link
                href="/"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </Link>
              <Link
                href="/orders"
                className="px-6 py-3 bg-[#0B4866] text-white rounded-lg hover:bg-[#094058] transition-colors"
              >
                View Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= checkoutStep
                      ? 'bg-[#0B4866] text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                <div className="ml-2 mr-4">
                  <p className={`text-sm font-medium ${
                    step <= checkoutStep ? 'text-[#0B4866]' : 'text-gray-600'
                  }`}>
                    {step === 1 && 'Shipping'}
                    {step === 2 && 'Payment'}
                    {step === 3 && 'Review'}
                    {step === 4 && 'Complete'}
                  </p>
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 ${
                    step < checkoutStep ? 'bg-[#0B4866]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Shipping Information */}
            {checkoutStep === 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.firstName}
                      onChange={(e) => updateShippingInfo({ firstName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.lastName}
                      onChange={(e) => updateShippingInfo({ lastName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => updateShippingInfo({ email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => updateShippingInfo({ phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.address.street}
                    onChange={(e) => updateShippingInfo({ 
                      address: { ...shippingInfo.address, street: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.address.city}
                      onChange={(e) => updateShippingInfo({ 
                        address: { ...shippingInfo.address, city: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <select
                      value={shippingInfo.address.state}
                      onChange={(e) => updateShippingInfo({ 
                        address: { ...shippingInfo.address, state: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      required
                    >
                      <option value="">Select State</option>
                      <option value="NSW">New South Wales</option>
                      <option value="VIC">Victoria</option>
                      <option value="QLD">Queensland</option>
                      <option value="WA">Western Australia</option>
                      <option value="SA">South Australia</option>
                      <option value="TAS">Tasmania</option>
                      <option value="ACT">Australian Capital Territory</option>
                      <option value="NT">Northern Territory</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postcode *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.address.postcode}
                      onChange={(e) => updateShippingInfo({ 
                        address: { ...shippingInfo.address, postcode: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    value={shippingInfo.deliveryInstructions}
                    onChange={(e) => updateShippingInfo({ deliveryInstructions: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                    placeholder="Any special delivery instructions..."
                  />
                </div>

                <button
                  onClick={nextStep}
                  className="w-full bg-[#0B4866] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#094058] transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 2: Payment Information */}
            {checkoutStep === 2 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Information</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Method
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentInfo.method === 'card'}
                        onChange={(e) => updatePaymentInfo({ method: e.target.value })}
                        className="mr-3"
                      />
                      <CreditCard size={20} className="mr-3 text-gray-600" />
                      <span>Credit/Debit Card</span>
                    </label>
                  </div>
                </div>

                {paymentInfo.method === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name on Card *
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.card.nameOnCard}
                        onChange={(e) => updatePaymentInfo({ 
                          card: { ...paymentInfo.card, nameOnCard: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.card.number}
                        onChange={(e) => updatePaymentInfo({ 
                          card: { ...paymentInfo.card, number: e.target.value }
                        })}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Month *
                        </label>
                        <select
                          value={paymentInfo.card.expiryMonth}
                          onChange={(e) => updatePaymentInfo({ 
                            card: { ...paymentInfo.card, expiryMonth: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                          required
                        >
                          <option value="">Month</option>
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                              {String(i + 1).padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Year *
                        </label>
                        <select
                          value={paymentInfo.card.expiryYear}
                          onChange={(e) => updatePaymentInfo({ 
                            card: { ...paymentInfo.card, expiryYear: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                          required
                        >
                          <option value="">Year</option>
                          {Array.from({ length: 10 }, (_, i) => (
                            <option key={i} value={String(new Date().getFullYear() + i).slice(-2)}>
                              {new Date().getFullYear() + i}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.card.cvv}
                        onChange={(e) => updatePaymentInfo({ 
                          card: { ...paymentInfo.card, cvv: e.target.value }
                        })}
                        placeholder="123"
                        maxLength={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={previousStep}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Back to Shipping
                  </button>
                  <button
                    onClick={nextStep}
                    className="flex-1 bg-[#0B4866] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#094058] transition-colors"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review Order */}
            {checkoutStep === 3 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Your Order</h2>
                
                {/* Shipping Address */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Shipping Address</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">{shippingInfo.firstName} {shippingInfo.lastName}</p>
                    <p>{shippingInfo.email}</p>
                    <p>{shippingInfo.phone}</p>
                    <p>{shippingInfo.address.street}</p>
                    <p>{shippingInfo.address.city}, {shippingInfo.address.state} {shippingInfo.address.postcode}</p>
                    {shippingInfo.deliveryInstructions && (
                      <p className="mt-2 text-sm text-gray-600">
                        <strong>Instructions:</strong> {shippingInfo.deliveryInstructions}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Method</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">Credit/Debit Card</p>
                    <p>**** **** **** {paymentInfo.card.number.slice(-4)}</p>
                    <p>{paymentInfo.card.nameOnCard}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={previousStep}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Back to Payment
                  </button>
                  <button
                    onClick={handleProcessOrder}
                    disabled={isProcessing}
                    className="flex-1 bg-[#0B4866] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#094058] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processing...' : 'Complete Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ${(item.discountedPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Discount Code */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                {!discountApplied ? (
                  <form onSubmit={handleDiscountCodeSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="Discount code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600">Discount applied: {orderSummary.discountCode}</span>
                    <button
                      onClick={handleRemoveDiscount}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${orderSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (GST)</span>
                  <span className="font-medium">${orderSummary.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {orderSummary.shipping === 0 ? 'Free' : `$${orderSummary.shipping.toFixed(2)}`}
                  </span>
                </div>
                {orderSummary.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({orderSummary.discountCode})</span>
                    <span>-${orderSummary.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total</span>
                    <span>${orderSummary.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Security badges */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Shield size={16} />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Truck size={16} />
                    <span>Fast Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

