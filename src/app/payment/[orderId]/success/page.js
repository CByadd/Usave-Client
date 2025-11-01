"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { CheckCircle, Package, Truck, Home, FileText, Download } from 'lucide-react';
import OptimizedImage from '../../../components/shared/OptimizedImage';
import api from '../../../services/api/apiClient';
import Link from 'next/link';
import confetti from 'canvas-confetti';

const PaymentSuccessPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const orderId = params.orderId;

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    // Trigger confetti animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    fetchOrder();

    return () => clearInterval(interval);
  }, [orderId, isAuthenticated]);

  const fetchOrder = async () => {
    try {
      const response = await api.orders.getById(orderId);
      if (response.data) {
        setOrder(response.data);
      }
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    // In production, generate and download PDF invoice
    alert('Invoice download will be implemented with PDF generation');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B4866] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce">
            <CheckCircle className="text-green-600" size={48} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-xl text-gray-600">Thank you for your order</p>
        </div>

        {/* Order Confirmation Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* Order Number */}
          <div className="text-center pb-6 border-b border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Order Number</p>
            <p className="text-2xl font-bold text-[#0B4866]">{order?.orderNumber}</p>
          </div>

          {/* Order Status Timeline */}
          <div className="py-8 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h2>
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
                <div className="h-full bg-green-500 w-1/3 transition-all duration-500"></div>
              </div>

              {/* Step 1: Payment Confirmed */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white mb-2">
                  <CheckCircle size={20} />
                </div>
                <p className="text-xs font-medium text-gray-900">Payment</p>
                <p className="text-xs text-gray-500">Confirmed</p>
              </div>

              {/* Step 2: Processing */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-2">
                  <Package size={20} />
                </div>
                <p className="text-xs font-medium text-gray-600">Processing</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>

              {/* Step 3: Shipped */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-2">
                  <Truck size={20} />
                </div>
                <p className="text-xs font-medium text-gray-600">Shipped</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>

              {/* Step 4: Delivered */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-2">
                  <Home size={20} />
                </div>
                <p className="text-xs font-medium text-gray-600">Delivered</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="py-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Shipping Address</h3>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{order?.shippingAddress.firstName} {order?.shippingAddress.lastName}</p>
                  <p>{order?.shippingAddress.address1}</p>
                  {order?.shippingAddress.address2 && <p>{order?.shippingAddress.address2}</p>}
                  <p>{order?.shippingAddress.city}, {order?.shippingAddress.state} {order?.shippingAddress.postalCode}</p>
                  <p>{order?.shippingAddress.country}</p>
                  <p className="mt-1">Phone: {order?.shippingAddress.phone}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Information</h3>
                <div className="text-sm text-gray-600">
                  <p className="mb-1">
                    <span className="font-medium">Payment Method:</span>{' '}
                    <span className="capitalize">{order?.paymentMethod.replace('_', ' ')}</span>
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Payment Status:</span>{' '}
                    <span className="text-green-600 font-medium">Paid</span>
                  </p>
                  <p>
                    <span className="font-medium">Total Amount:</span>{' '}
                    <span className="text-lg font-bold text-[#0B4866]">${order?.total.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="py-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Items Ordered</h2>
            <div className="space-y-4">
              {order?.items.map((item) => {
                const product = item.product || {};
                return (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    {product.image ? (
                      <OptimizedImage
                        src={product.image}
                        alt={product.title || 'Product'}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.title || 'Item'}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-600">${(item.price || 0).toFixed(2)} each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${((item.price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Total */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${order?.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (10%):</span>
                  <span className="font-medium">${order?.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                  <span>Total Paid:</span>
                  <span className="text-[#0B4866]">${order?.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <Download size={20} />
            Download Invoice
          </button>

          <Link
            href="/orders"
            className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <FileText size={20} />
            View All Orders
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-[#0B4866] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#094058] transition-colors"
          >
            <Home size={20} />
            Continue Shopping
          </Link>
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
          <p className="text-sm text-blue-700 mb-4">
            We've sent a confirmation email to <span className="font-medium">{user?.email}</span> with your order details.
            You'll receive another email when your order ships.
          </p>
          <p className="text-xs text-blue-600">
            Need help? Contact our support team at support@usave.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
