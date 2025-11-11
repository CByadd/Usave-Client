'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, MapPin, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../stores/useAuthStore';
import { useCart } from '../stores/useCartStore';
import { useCheckout } from '../stores/useCheckoutStore';
import SuccessModal from '../components/shared/SuccessModal';
import { apiService } from '../services/api/apiClient';
import OptimizedImage from '../components/shared/OptimizedImage';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuth();
  const { cartItems, totals, loadCart, clearCart } = useCart();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [saveAddress, setSaveAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const {
    shippingOption,
    warranty,
    deliveryDate,
    deliveryTime,
    cartExpanded,
    formData,
    errors,
    isSubmitting,
    showApprovalModal,
    showErrorModal,
    showSuccessModal,
    errorMessage,
    orderId,
    setShippingOption,
    setWarranty,
    setDeliveryDate,
    setDeliveryTime,
    toggleCartExpanded,
    setCartExpanded,
    setFormData,
    updateFormField,
    setErrors,
    setFieldError,
    setIsSubmitting,
    showApproval,
    hideApproval,
    showError,
    hideError,
    showSuccess,
    hideSuccess,
  } = useCheckout();

  useEffect(() => {
    const initialize = async () => {
      checkAuth();
      
      if (!isAuthenticated) {
        router.push('/');
        return;
      }
      
      // Load cart and addresses
      await loadCart();
      await loadSavedAddresses();
    };
    initialize();
  }, [router, isAuthenticated, checkAuth, loadCart]);

  const loadSavedAddresses = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoadingAddresses(true);
      const response = await apiService.user.getAddresses();
      if (response.success && response.data?.addresses) {
        const addresses = response.data.addresses;
        setSavedAddresses(addresses);
        
        // Auto-select default address if exists
        const defaultAddress = addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          fillAddressForm(defaultAddress);
        } else {
          setSelectedAddressId('new');
          resetAddressForm();
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fillAddressForm = (address) => {
    const updatedForm = {
      ...formData,
      firstName: address.firstName || '',
      lastName: address.lastName || '',
      company: address.company || '',
      address1: address.address1 || '',
      address2: address.address2 || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || 'Australia',
      phone: address.phone || user?.phone || '',
    };
    setFormData(updatedForm);
  };

  const resetAddressForm = () => {
    const updatedForm = {
      ...formData,
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Australia',
      phone: user?.phone || '',
    };
    setFormData(updatedForm);
  };

  const handleSavedAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);

    if (addressId === 'new') {
      resetAddressForm();
      return;
    }

    const selectedAddress = savedAddresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      fillAddressForm(selectedAddress);
    }
  };

  // Initialize form data from user
  useEffect(() => {
    if (user && !formData.firstName) {
      updateFormField('firstName', user.firstName || '');
      updateFormField('lastName', user.lastName || '');
      updateFormField('email', user.email || '');
      updateFormField('phone', user.phone || '');
      updateFormField('country', 'Australia');
    }
  }, [user]);

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    
    if (cartItems.length === 0) {
      router.push('/cart');
      return;
    }
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
  const finalTotal = totals.total + shippingCost;

  const handleInputChange = (field, value) => {
    updateFormField(field, value);
    // Clear error for this field
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.firstName || !formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName || !formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone || !formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        newErrors.phone = 'Phone number must be at least 10 digits';
      } else if (!/^[\d\s()+-]+$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    if (!formData.address1 || !formData.address1.trim()) {
      newErrors.address1 = 'Street address is required';
    } else if (formData.address1.trim().length < 5) {
      newErrors.address1 = 'Please enter a complete street address';
    }

    if (!formData.city || !formData.city.trim()) {
      newErrors.city = 'City is required';
    } else if (formData.city.trim().length < 2) {
      newErrors.city = 'Please enter a valid city name';
    }

    if (!formData.state || !formData.state.trim()) {
      newErrors.state = 'State/Province is required';
    } else if (formData.state.trim().length < 2) {
      newErrors.state = 'Please enter a valid state/province';
    }

    if (!formData.postalCode || !formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else {
      const postalCode = formData.postalCode.replace(/\s/g, '');
      if (!/^\d{4,10}$/.test(postalCode)) {
        newErrors.postalCode = 'Please enter a valid postal code (4-10 digits)';
      }
    }

    if (!formData.country || !formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    // Delivery date/time validation (only for delivery option)
    if (shippingOption === 'delivery') {
      if (!deliveryDate || !deliveryDate.trim()) {
        newErrors.deliveryDate = 'Please select a delivery date';
      } else {
        // Check if date is in the future
        const selectedDate = new Date(deliveryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          newErrors.deliveryDate = 'Delivery date must be today or in the future';
        }
      }

      if (!deliveryTime || !deliveryTime.trim()) {
        newErrors.deliveryTime = 'Please select a delivery time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitForApproval = async () => {
    if (!validateForm()) {
      return;
    }

    // Prepare data for approval modal
    const orderItems = cartItems.map(item => {
      const product = item.product || item;
      const productId = item.productId || item.id || product.id;
      const price = product.discountedPrice || product.price || product.salePrice || item.discountedPrice || item.price || item.originalPrice || 0;
      const image = product.image || product.images?.[0] || item.image || item.product?.image || item.product?.images?.[0] || '';
      const color = item.color || item.options?.color || null;
      const size = item.size || item.options?.size || null;
      const includeInstallation = item.includeInstallation || item.options?.includeInstallation || false;
      
      return {
        id: productId,
        productId: productId,
        name: product.title || product.name || item.name || item.title,
        price: price,
        quantity: item.quantity || 1,
        image: image,
        color: color,
        size: size,
        includeInstallation: includeInstallation,
        product: {
          id: productId,
          title: product.title || product.name || item.name || item.title,
          image: image,
        },
      };
    });

    const shippingAddress = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      company: formData.company || '',
      address1: formData.address1,
      address2: formData.address2 || '',
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode,
      country: formData.country,
      phone: formData.phone,
      email: formData.email,
    };

    const customerInfo = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
    };

    const customerName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();

    // Show owner email input modal for owner approval flow
    showApproval({
      cartItems: orderItems,
      totalAmount: finalTotal,
      flowType: 'owner',
      shippingAddress: shippingAddress,
      customerInfo,
      customerName,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      subtotal: totals.subtotal,
      tax: totals.tax,
      shipping: shippingCost,
      warranty: warrantyCost,
      onContinueWithoutApproval: handlePlaceOrder,
    });
  };

  const handleSaveAddress = async (addressData) => {
    if (!saveAddress || !isAuthenticated) return;
    
    try {
      await apiService.user.addAddress({
        ...addressData,
        type: 'shipping',
        isDefault: savedAddresses.length === 0, // Make first address default
      });
      console.log('Address saved successfully');
    } catch (error) {
      console.error('Error saving address:', error);
      // Don't block order placement if address save fails
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare order items from cart
      const orderItems = cartItems.map(item => {
        const product = item.product || item;
        const productId = item.productId || item.id || product.id;
        const price = product.discountedPrice || product.price || product.salePrice || item.discountedPrice || item.price || item.originalPrice || 0;
        const image = product.image || product.images?.[0] || item.image || item.product?.image || item.product?.images?.[0] || '';
        // Include color, size, and installation options from cart item
        const color = item.color || item.options?.color || null;
        const size = item.size || item.options?.size || null;
        const includeInstallation = item.includeInstallation || item.options?.includeInstallation || false;
        
        return {
          productId: String(productId),
          quantity: item.quantity || 1,
          price: price,
          color: color,
          size: size,
          includeInstallation: includeInstallation,
          product: {
            id: String(productId),
            title: product.title || product.name || item.title || item.name || 'Product',
            image: image
          }
        };
      });

      // Prepare shipping address
      const shippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company || '',
        address1: formData.address1,
        address2: formData.address2 || '',
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        phone: formData.phone,
        email: formData.email,
      };

      const customerInfo = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      };

      const customerName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();

      // Save address if requested
      if (saveAddress && selectedAddressId === 'new') {
        await handleSaveAddress(shippingAddress);
      }

      // Calculate totals
      const subtotal = totals.subtotal;
      const tax = totals.tax;
      const shipping = shippingCost;
      const warrantyFee = warrantyCost;
      const total = subtotal + tax + shipping + warrantyFee;

      // Use request-approval endpoint for direct admin submission
      const response = await fetch('/api/orders/request-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerEmail: null,
          adminEmail: null, // Will be fetched from backend
          orderDetails: {
            items: orderItems,
            subtotal,
            tax,
            shipping,
            warranty: warrantyFee,
            total,
            shippingAddress,
            billingAddress: shippingAddress,
            deliveryDate: shippingOption === 'delivery' ? deliveryDate : null,
            deliveryTime: shippingOption === 'delivery' ? deliveryTime : null,
            customer: customerInfo,
            customerName,
            customerEmail: formData.email,
            customerPhone: formData.phone,
          },
          userId: user?.id || 'guest',
          requiresOwnerApproval: false, // Direct to admin
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create order');
      }

      // Use the response data
      const orderResponse = {
        success: responseData.success,
        data: {
          order: {
            id: responseData.data.orderId,
            orderNumber: responseData.data.orderNumber,
          },
        },
        message: responseData.message,
      };

      if (orderResponse.success) {
        // Save shipping address to user's saved addresses (optional - don't block order creation)
        if (isAuthenticated && user?.id) {
          try {
            // Check if user service exists before calling
            if (apiService.user && typeof apiService.user.addAddress === 'function') {
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
            }
          } catch (error) {
            console.error('Failed to save address:', error);
            // Don't block order creation if address save fails
          }
        }

        // Clear cart after successful order
        try {
          await clearCart();
          console.log('Cart cleared after successful order');
        } catch (error) {
          console.error('Failed to clear cart:', error);
          // Don't block redirect if cart clear fails
        }

        // Redirect to orders page
        const orderId = orderResponse.data?.order?.id || responseData.data?.orderId;
        showSuccess(orderId);
        router.push('/orders');
      } else {
        throw new Error(orderResponse.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      showError(error.message || 'Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
      hideApproval();
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
                <h2 className="text-xl font-semibold text-[#0F4C81] flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </h2>
              </div>

              {/* Saved Addresses Selector */}
              {savedAddresses.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Saved addresses
                  </p>
                  {loadingAddresses ? (
                    <p className="text-sm text-gray-500">Loading saved addresses...</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => handleSavedAddressSelect('new')}
                        className={`w-full text-left border-2 rounded-lg p-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81] ${
                          selectedAddressId === 'new'
                            ? 'border-[#0F4C81] bg-blue-50 shadow-sm'
                            : 'border-gray-200 hover:border-[#0F4C81]'
                        }`}
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-[#0F4C81] mb-3">
                          <Plus size={18} />
                        </div>
                        <p className="text-sm font-semibold text-gray-900">Use a new address</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Enter a different shipping address.
                        </p>
                      </button>

                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => handleSavedAddressSelect(addr.id)}
                            className={`w-full text-left border-2 rounded-lg p-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81] ${
                              isSelected
                                ? 'border-[#0F4C81] bg-blue-50 shadow-sm'
                                : 'border-gray-200 hover:border-[#0F4C81]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {addr.firstName} {addr.lastName}
                                </p>
                                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                  {addr.address1}
                                  {addr.address2 ? `, ${addr.address2}` : ''}
                                  <br />
                                  {addr.city}, {addr.state} {addr.postalCode}
                                  <br />
                                  {addr.country}
                                </p>
                                {addr.phone && (
                                  <p className="text-xs text-gray-600 mt-2">
                                    Phone: {addr.phone}
                                  </p>
                                )}
                              </div>
                              {addr.isDefault && (
                                <span className="inline-flex items-center rounded-full bg-[#0F4C81]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#0F4C81]">
                                  Default
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Save Address Checkbox (only show for new address) */}
              {selectedAddressId === 'new' && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="mt-1 h-4 w-4 text-[#0B4866] focus:ring-[#0B4866] border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Save this address to my account for future orders
                    </span>
                  </label>
                </div>
              )}

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
                    placeholder="+61 XXX XXX XXX"
                    required
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.company || ''}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
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
                    Apartment, Suite, etc. (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.address2}
                    onChange={(e) => handleInputChange('address2', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                    placeholder="Apt 4B, Suite 200, etc."
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
                  <div key={option.id}>
                    <label
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
                    
                    {/* Delivery Schedule - Show when delivery option is selected */}
                    {option.id === 'delivery' && shippingOption === 'delivery' && (
                      <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                        <h3 className="text-sm font-semibold text-[#0F4C81] mb-2">Delivery Schedule</h3>
                        <p className="text-xs text-gray-600 mb-3">Choose a date & time you want your product to be delivered</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {/* Date Picker */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Date *
                            </label>
                            <input
                              type="date"
                              value={deliveryDate}
                              onChange={(e) => {
                                setDeliveryDate(e.target.value);
                                // Clear error when user selects a date
                                if (errors.deliveryDate) {
                                  const newErrors = { ...errors };
                                  delete newErrors.deliveryDate;
                                  setErrors(newErrors);
                                }
                              }}
                              min={new Date().toISOString().split('T')[0]}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] ${
                                errors.deliveryDate ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="Select a date"
                              required={shippingOption === 'delivery'}
                            />
                            {errors.deliveryDate && (
                              <p className="text-red-500 text-xs mt-1">{errors.deliveryDate}</p>
                            )}
                          </div>
                          
                          {/* Time Picker */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Time *
                            </label>
                            <input
                              type="time"
                              value={deliveryTime}
                              onChange={(e) => {
                                setDeliveryTime(e.target.value);
                                // Clear error when user selects a time
                                if (errors.deliveryTime) {
                                  const newErrors = { ...errors };
                                  delete newErrors.deliveryTime;
                                  setErrors(newErrors);
                                }
                              }}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] ${
                                errors.deliveryTime ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="Select a time"
                              required={shippingOption === 'delivery'}
                            />
                            {errors.deliveryTime && (
                              <p className="text-red-500 text-xs mt-1">{errors.deliveryTime}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Extended Warranty */}
            {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
            </div> */}
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
                        <div key={item.id} className="flex flex-col space-y-2 pb-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex space-x-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <OptimizedImage
                                src={item.product?.image || item.product?.images?.[0] || item.image || item.product?.image || '/placeholder.svg'}
                                alt={item.product?.title || item.product?.name || item.title || item.name || 'Product'}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm text-gray-900 truncate">{item.product?.title || item.product?.name || item.title || item.name || 'Product'}</h3>
                              <p className="text-xs text-gray-600">Qty: {item.quantity || 1}</p>
                              {item.color && (
                                <p className="text-xs text-gray-600">Color: {item.color}</p>
                              )}
                              {item.size && (
                                <p className="text-xs text-gray-600">Size: {item.size}</p>
                              )}
                              <div className="flex items-center space-x-2 mt-1">
                                {(item.product?.originalPrice || item.originalPrice || 0) > (item.product?.discountedPrice || item.product?.price || item.discountedPrice || item.price || 0) && (
                                  <span className="text-xs line-through text-gray-400">
                                    ${(item.product?.originalPrice || item.originalPrice || 0).toFixed(2)}
                                  </span>
                                )}
                                <span className="text-sm font-bold text-gray-900">
                                  ${((item.product?.discountedPrice || item.product?.price || item.product?.salePrice || item.discountedPrice || item.price || item.originalPrice || 0) * (item.quantity || 1)).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Installation Indicator */}
                          {(item.includeInstallation || item.options?.includeInstallation) && (
                            <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded text-[#0B4866] text-xs">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="font-medium">Installation Service</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 py-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Subtotal</span>
                    <span>${totals.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Tax</span>
                    <span>${totals.tax}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Shipping</span>
                    <span>${shippingCost}</span>
                  </div>
                  {/* {warrantyCost > 0 && (
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Warranty</span>
                      <span>${warrantyCost}</span>
                    </div>
                  )} */}
                </div>

                <div className="flex justify-between text-lg font-bold text-gray-900 py-4 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-[#0F4C81]">${finalTotal}</span>
                </div>

                <button 
                  onClick={() => {
                    if (validateForm()) {
                      handleSubmitForApproval();
                    }
                  }}
                  className="w-full bg-white border-2 border-[#0F4C81] text-[#0F4C81] py-3 rounded-lg font-semibold hover:bg-[#0F4C81] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Submit for Approval'}
                </button>
                <button 
                  onClick={() => {
                    if (validateForm()) {
                      handlePlaceOrder();
                    }
                  }}
                  className="w-full bg-[#0F4C81] text-white py-3 rounded-lg font-semibold hover:bg-[#0D3F6A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
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


      <SuccessModal
        isOpen={showErrorModal}
        onClose={() => hideError()}
        type="error"
        title="Order Failed"
        message={errorMessage}
        primaryAction={() => hideError()}
        primaryActionLabel="OK"
      />
    </>
  );
}
