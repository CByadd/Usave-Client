'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Edit } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import ApprovalModal from '../components/checkout/ApprovalModal';
import { createOrder } from '../actions/orderActions';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [shippingOption, setShippingOption] = useState('delivery-only');
  const [warranty, setWarranty] = useState('');
  const [cartExpanded, setCartExpanded] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartItems = [
    {
      id: 1,
      name: 'City Lounge 2 Seater',
      price: 1649,
      originalPrice: 1800,
      quantity: 1,
      size: '1',
      color: '1',
      rating: 13,
      inStock: true,
      image: '/placeholder.jpg'
    },
    {
      id: 2,
      name: 'City Lounge 2 MVP Big Seater',
      price: 1649,
      originalPrice: 1800,
      quantity: 1,
      size: '1',
      color: '1',
      rating: 13,
      inStock: true,
      image: '/placeholder.jpg'
    }
  ];

  const shippingOptions = [
    { id: 'delivery-only', label: 'Delivery only', price: 18 },
    { id: 'delivery-installation', label: 'Delivery & Installation', price: 25 },
    { id: 'installation', label: 'Installation', price: 7 },
    { id: 'pickup', label: 'Pick up on my own', price: 0 }
  ];

  const warrantyOptions = [
    { id: '1-year', label: '1 Year warranty', price: 25 },
    { id: '2-year', label: '2 Year warranty', price: 25 }
  ];

  const productsTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = shippingOptions.find(opt => opt.id === shippingOption)?.price || 0;
  const warrantyCost = warrantyOptions.find(opt => opt.id === warranty)?.price || 0;
  const tax = 145;
  const total = productsTotal + shippingCost + warrantyCost + tax;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-[#0F4C81] mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#0F4C81]">Shipping Address</h2>
              <button className="text-gray-400">
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#0F4C81]">Shipping Options</h2>
              <button className="text-gray-400">
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {shippingOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center justify-between p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="shipping"
                      value={option.id}
                      checked={shippingOption === option.id}
                      onChange={(e) => setShippingOption(e.target.value)}
                      className="w-4 h-4 text-[#0F4C81] focus:ring-[#0F4C81]"
                    />
                    <span className="ml-3 text-gray-900">{option.label}</span>
                  </div>
                  <span className="text-gray-900">
                    {option.price === 0 ? 'Free' : `$${option.price}.00`}
                  </span>
                </label>
              ))}
              <div className="flex items-center mt-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#0F4C81] focus:ring-[#0F4C81] border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Installation charges applicable</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#0F4C81]">Extended warranty</h2>
              <button className="text-gray-400">
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {warrantyOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center justify-between p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="warranty"
                      value={option.id}
                      checked={warranty === option.id}
                      onChange={(e) => setWarranty(e.target.value)}
                      className="w-4 h-4 text-[#0F4C81] focus:ring-[#0F4C81]"
                    />
                    <span className="ml-3 text-gray-900">{option.label}</span>
                  </div>
                  <span className="text-gray-900">${option.price}.00</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#0F4C81]">Order Summary</h2>
                <button className="text-[#0F4C81]">
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-4">
                <button
                  onClick={() => setCartExpanded(!cartExpanded)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="text-sm font-medium text-gray-700">
                    Your cart ( {cartItems.length} items)
                  </span>
                  {cartExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {cartExpanded && (
                  <div className="mt-4 space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex space-x-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="w-16 h-12 bg-[#C4A574] rounded"></div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.name}</h3>
                          <div className="flex items-center space-x-1 text-xs text-yellow-500">
                            {'★'.repeat(5)}
                            <span className="text-gray-600">({item.rating})</span>
                          </div>
                          <div className="text-xs text-green-600">
                            ● {item.inStock ? 'In Stock' : 'Out of Stock'}
                          </div>
                          <div className="text-xs text-gray-600">
                            Quantity: {item.quantity}
                          </div>
                          <div className="text-xs text-gray-600">
                            Size: {item.size}
                          </div>
                          <div className="text-xs text-gray-600">
                            Color: {item.color}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm line-through text-gray-400">
                              ${item.originalPrice}.00
                            </span>
                            <span className="text-lg font-bold text-gray-900">
                              ${item.price}.00
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 py-4 border-t border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Products</span>
                  <span>${productsTotal}.00</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Excluding TAX</span>
                  <span>${tax}.00</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold text-gray-900 py-4 border-t border-gray-200">
                <span>Total</span>
                <span>${total}.00</span>
              </div>

              <button 
                onClick={() => setShowApprovalModal(true)}
                className="w-full bg-[#0F4C81] text-white py-3 rounded-lg font-semibold hover:bg-[#0D3F6A] transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Get Approval'}
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      <ApprovalModal
      isOpen={showApprovalModal}
      onClose={() => setShowApprovalModal(false)}
      onContinueWithoutApproval={handleContinueWithoutApproval}
      orderDetails={{
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        })),
        subtotal: productsTotal,
        tax,
        shipping: shippingCost,
        total,
        shippingOption
      }}
      userId={user?.id}
      />
    </>
  );
}

async function handleContinueWithoutApproval() {
  setIsSubmitting(true);
  try {
    // Create order without approval
    const orderData = {
      items: cartItems,
      subtotal: productsTotal,
      tax,
      shipping: shippingCost,
      total,
      status: 'pending_payment',
      userId: user?.id,
      shippingOption
    };

    const result = await createOrder(orderData);
    
    if (result.error) {
      console.error('Order creation failed:', result.error);
      alert('Failed to create order. Please try again.');
      return;
    }

    // Redirect to payment page
    router.push(`/checkout/payment?orderId=${result.orderId}`);
  } catch (error) {
    console.error('Order submission error:', error);
    alert('An error occurred. Please try again.');
  } finally {
    setIsSubmitting(false);
    setShowApprovalModal(false);
  }
}
