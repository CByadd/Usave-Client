'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import ApprovalModal from '../components/checkout/ApprovalModal';
import SuccessModal from '../components/shared/SuccessModal';
import { apiService } from '../services/api/apiClient';
import OptimizedImage from '../components/shared/OptimizedImage';

export default function CheckoutPage() {
  const router = useRouter();
  const authContext = useAuth();
  const cartContext = useCart();
  
  const { user, isAuthenticated } = authContext || { user: null, isAuthenticated: false };
  const { cartItems = [], totals = { subtotal: 0, tax: 0, shipping: 0, total: 0 }, clearCart = async () => {} } = cartContext || {};
  const [shippingOption, setShippingOption] = useState('delivery-only');
  const [warranty, setWarranty] = useState('');
  const [cartExpanded, setCartExpanded] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Australia'
  });

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    console.log('[CheckoutPage] useEffect - isAuthenticated:', isAuthenticated, 'cartItems.length:', cartItems.length);
    
    if (!isAuthenticated) {
      console.log('[CheckoutPage] Not authenticated, redirecting to login');
      router.push('/auth/login');
      return;
    }
    
    // Check both cartItems array and localStorage as fallback
    let hasItems = cartItems.length > 0;
    if (!hasItems && typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          hasItems = Array.isArray(parsed) && parsed.length > 0;
          console.log('[CheckoutPage] Checked localStorage, found items:', hasItems);
        }
      } catch (error) {
        console.error('[CheckoutPage] Error reading localStorage:', error);
      }
    }
    
    if (!hasItems) {
      console.log('[CheckoutPage] Cart is empty, redirecting to cart');
      router.push('/cart');
      return;
    }
    
    console.log('[CheckoutPage] Checkout page ready, items:', cartItems.length);
  }, [isAuthenticated, cartItems.length, router]);

  const shippingOptions = [
    { id: 'delivery', label: 'Delivery', price: 18 },
    // { id: 'delivery-installation', label: 'Delivery & Installation', price: 25 },
    // { id: 'installation', label: 'Installation', price: 7 },
    { id: 'pickup', label: 'Pick up on my own', price: 0 }
  ];

  const warrantyOptions = [
    { id: '1-year', label: '1 Year warranty', price: 25 },
    { id: '2-year', label: '2 Year warranty', price: 25 }
  ];

  const shippingCost = shippingOptions.find(opt => opt.id === shippingOption)?.price || 0;
  const warrantyCost = warrantyOptions.find(opt => opt.id === warranty)?.price || 0;
  const finalTotal = totals.total + shippingCost + warrantyCost;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s()+-]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.address1.trim()) newErrors.address1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State/Province is required';
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^\d{4,10}$/.test(formData.postalCode.replace(/\s/g, ''))) {
      newErrors.postalCode = 'Please enter a valid postal code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueWithoutApproval = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare order items from cart
      const orderItems = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.discountedPrice,
        product: {
          id: item.id,
          title: item.title,
          image: item.image
        }
      }));

      // Prepare shipping address
      const shippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address1: formData.address1,
        address2: formData.address2 || '',
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        phone: formData.phone
      };

      // Calculate totals
      const subtotal = totals.subtotal;
      const tax = totals.tax;
      const shipping = shippingCost;
      const warrantyFee = warrantyCost;
      const total = subtotal + tax + shipping + warrantyFee;

      // Create order
      const orderData = {
        items: orderItems,
        subtotal,
        tax,
        shipping,
        warranty: warrantyFee,
        total,
        shippingAddress,
        shippingOption,
        warrantyOption: warranty,
        status: 'PENDING_APPROVAL',
        paymentStatus: 'PENDING'
      };

      const response = await apiService.orders.create(orderData);

      if (response.success) {
        // Save shipping address to user's saved addresses
        try {
          await apiService.user.addAddress({
            type: 'shipping',
            firstName: formData.firstName,
            lastName: formData.lastName,
            address1: formData.address1,
            address2: formData.address2,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
            phone: formData.phone,
            isDefault: false
          });
        } catch (error) {
          console.error('Failed to save address:', error);
          // Don't block order creation if address save fails
        }

        // Clear cart
        await clearCart();
        // Redirect to payment page after order is approved
        router.push(`/payment/${response.data?.order?.id || response.data?.id}`);
      } else {
        throw new Error(response.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      setErrorMessage(error.message || 'Failed to create order. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
      setShowApprovalModal(false);
    }
  };

  if (!isAuthenticated || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-[#0F4C81] mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#0F4C81]">Shipping Address</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address1}
                    onChange={(e) => handleInputChange('address1', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] ${
                      errors.address1 ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.address1 && (
                    <p className="text-red-500 text-xs mt-1">{errors.address1}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.address2}
                    onChange={(e) => handleInputChange('address2', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.state && (
                      <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] ${
                        errors.postalCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.postalCode && (
                      <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Options */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#0F4C81]">Shipping Options</h2>
              </div>
              <div className="space-y-3">
                {shippingOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                    style={{
                      borderColor: shippingOption === option.id ? '#0F4C81' : '#e5e7eb',
                      backgroundColor: shippingOption === option.id ? '#f0f7ff' : 'transparent'
                    }}
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
                    <span className="text-gray-900 font-medium">
                      {option.price === 0 ? 'Free' : `$${option.price}.00`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Extended Warranty */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#0F4C81]">Extended Warranty</h2>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                  style={{
                    borderColor: warranty === '' ? '#0F4C81' : '#e5e7eb',
                    backgroundColor: warranty === '' ? '#f0f7ff' : 'transparent'
                  }}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="warranty"
                      value=""
                      checked={warranty === ''}
                      onChange={(e) => setWarranty(e.target.value)}
                      className="w-4 h-4 text-[#0F4C81] focus:ring-[#0F4C81]"
                    />
                    <span className="ml-3 text-gray-900">No warranty</span>
                  </div>
                  <span className="text-gray-900 font-medium">Free</span>
                </label>
                {warrantyOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                    style={{
                      borderColor: warranty === option.id ? '#0F4C81' : '#e5e7eb',
                      backgroundColor: warranty === option.id ? '#f0f7ff' : 'transparent'
                    }}
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
                    <span className="text-gray-900 font-medium">${option.price}.00</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#0F4C81] mb-4">Order Summary</h2>

                <div className="mb-4">
                  <button
                    onClick={() => setCartExpanded(!cartExpanded)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      Your cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                    </span>
                    {cartExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {cartExpanded && (
                    <div className="mt-4 space-y-4 max-h-64 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex space-x-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <OptimizedImage
                              src={item.image}
                              alt={item.title}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-gray-900 truncate">{item.title}</h3>
                            <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              {item.originalPrice > item.discountedPrice && (
                                <span className="text-xs line-through text-gray-400">
                                  ${item.originalPrice.toFixed(2)}
                                </span>
                              )}
                              <span className="text-sm font-bold text-gray-900">
                                ${item.discountedPrice.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 py-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Subtotal</span>
                    <span>${totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Tax (10% GST)</span>
                    <span>${totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Shipping</span>
                    <span>${shippingCost.toFixed(2)}</span>
                  </div>
                  {warrantyCost > 0 && (
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Warranty</span>
                      <span>${warrantyCost.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-lg font-bold text-gray-900 py-4 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-[#0F4C81]">${finalTotal.toFixed(2)}</span>
                </div>

                <button 
                  onClick={() => {
                    if (validateForm()) {
                      setShowApprovalModal(true);
                    }
                  }}
                  className="w-full bg-[#0F4C81] text-white py-3 rounded-lg font-semibold hover:bg-[#0D3F6A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </button>

                {Object.keys(errors).length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm font-medium text-red-800">Please fix the errors above</p>
                      <p className="text-xs text-red-700 mt-1">All required fields must be filled correctly</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        onContinueWithoutApproval={handleContinueWithoutApproval}
        cartItems={cartItems}
        totalAmount={finalTotal}
      />

      <SuccessModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        type="error"
        title="Order Failed"
        message={errorMessage}
        primaryAction={() => setShowErrorModal(false)}
        primaryActionLabel="OK"
      />
    </>
  );
}
