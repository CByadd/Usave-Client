"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

// Default values for SSR/prerendering
const defaultCheckoutValue = {
  checkoutStep: 1,
  isProcessing: false,
  error: null,
  orderId: null,
  shippingInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postcode: '',
      country: 'Australia'
    },
    deliveryInstructions: ''
  },
  billingInfo: {
    sameAsShipping: true,
    firstName: '',
    lastName: '',
    company: '',
    address: {
      street: '',
      city: '',
      state: '',
      postcode: '',
      country: 'Australia'
    }
  },
  paymentInfo: {
    method: 'card',
    card: {
      number: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      nameOnCard: ''
    },
    saveCard: false
  },
  orderSummary: {
    items: [],
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    discountCode: '',
    total: 0
  },
  updateShippingInfo: () => {},
  updateBillingInfo: () => {},
  updatePaymentInfo: () => {},
  applyDiscountCode: () => Promise.resolve({ success: false }),
  removeDiscountCode: () => {},
  nextStep: () => Promise.resolve(false),
  previousStep: () => {},
  processOrder: () => Promise.resolve({ success: false }),
  resetCheckout: () => {},
  clearError: () => {},
  validateShippingInfo: () => false,
  validateBillingInfo: () => false,
  validatePaymentInfo: () => false
};

const CheckoutContext = createContext(defaultCheckoutValue);

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  // Context should always be available (initialized with default value)
  return context || defaultCheckoutValue;
};

export const CheckoutProvider = ({ children }) => {
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review, 4: Complete
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  
  // Checkout data
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postcode: '',
      country: 'Australia'
    },
    deliveryInstructions: ''
  });
  
  const [billingInfo, setBillingInfo] = useState({
    sameAsShipping: true,
    firstName: '',
    lastName: '',
    company: '',
    address: {
      street: '',
      city: '',
      state: '',
      postcode: '',
      country: 'Australia'
    }
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'card', // card, paypal, bank_transfer
    card: {
      number: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      nameOnCard: ''
    },
    saveCard: false
  });
  
  const [orderSummary, setOrderSummary] = useState({
    items: [],
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    discountCode: '',
    total: 0
  });

  const { user, isAuthenticated } = useAuth();
  const { cartItems, totals, clearCart } = useCart();
  const router = useRouter();

  // Initialize checkout with user data and cart
  useEffect(() => {
    if (user && isAuthenticated) {
      setShippingInfo(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.addresses?.find(addr => addr.isDefault)?.address || prev.address
      }));
      
      setBillingInfo(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        address: user.addresses?.find(addr => addr.isDefault)?.address || prev.address
      }));
    }
  }, [user, isAuthenticated]);

  // Update order summary when cart changes
  useEffect(() => {
    setOrderSummary(prev => ({
      ...prev,
      items: cartItems,
      subtotal: totals.subtotal,
      tax: totals.tax,
      shipping: totals.shipping,
      total: totals.total
    }));
  }, [cartItems, totals]);

  // Mock API calls - replace with actual API integration
  const mockApiCall = async (endpoint, data) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    switch (endpoint) {
      case 'create-order':
        return {
          success: true,
          order: {
            id: 'ORD-' + Date.now(),
            status: 'pending',
            createdAt: new Date().toISOString(),
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        };
        
      case 'process-payment':
        // Simulate payment processing
        const isSuccess = Math.random() > 0.1; // 90% success rate
        return {
          success: isSuccess,
          paymentId: isSuccess ? 'PAY-' + Date.now() : null,
          error: isSuccess ? null : 'Payment failed. Please try again.'
        };
        
      case 'send-confirmation':
        return {
          success: true,
          emailSent: true
        };
        
      default:
        return {
          success: false,
          error: 'Unknown endpoint'
        };
    }
  };

  // Validate shipping information
  const validateShippingInfo = () => {
    const required = ['firstName', 'lastName', 'email', 'phone'];
    const addressRequired = ['street', 'city', 'state', 'postcode'];
    
    for (const field of required) {
      if (!shippingInfo[field]) {
        setError(`Please fill in your ${field}`);
        return false;
      }
    }
    
    for (const field of addressRequired) {
      if (!shippingInfo.address[field]) {
        setError(`Please fill in your ${field}`);
        return false;
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Phone validation (Australian format)
    const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
    if (!phoneRegex.test(shippingInfo.phone.replace(/\s/g, ''))) {
      setError('Please enter a valid Australian phone number');
      return false;
    }
    
    return true;
  };

  // Validate billing information
  const validateBillingInfo = () => {
    if (billingInfo.sameAsShipping) {
      return true;
    }
    
    const required = ['firstName', 'lastName'];
    const addressRequired = ['street', 'city', 'state', 'postcode'];
    
    for (const field of required) {
      if (!billingInfo[field]) {
        setError(`Please fill in billing ${field}`);
        return false;
      }
    }
    
    for (const field of addressRequired) {
      if (!billingInfo.address[field]) {
        setError(`Please fill in billing ${field}`);
        return false;
      }
    }
    
    return true;
  };

  // Validate payment information
  const validatePaymentInfo = () => {
    if (paymentInfo.method === 'card') {
      const required = ['number', 'expiryMonth', 'expiryYear', 'cvv', 'nameOnCard'];
      
      for (const field of required) {
        if (!paymentInfo.card[field]) {
          setError(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
          return false;
        }
      }
      
      // Card number validation (basic)
      const cardNumber = paymentInfo.card.number.replace(/\s/g, '');
      if (cardNumber.length < 13 || cardNumber.length > 19) {
        setError('Please enter a valid card number');
        return false;
      }
      
      // CVV validation
      if (paymentInfo.card.cvv.length < 3 || paymentInfo.card.cvv.length > 4) {
        setError('Please enter a valid CVV');
        return false;
      }
      
      // Expiry date validation
      const currentDate = new Date();
      const expiryDate = new Date(2000 + parseInt(paymentInfo.card.expiryYear), parseInt(paymentInfo.card.expiryMonth) - 1);
      if (expiryDate < currentDate) {
        setError('Card has expired');
        return false;
      }
    }
    
    return true;
  };

  // Update shipping information
  const updateShippingInfo = (updates) => {
    setError(null);
    setShippingInfo(prev => ({ ...prev, ...updates }));
  };

  // Update billing information
  const updateBillingInfo = (updates) => {
    setError(null);
    setBillingInfo(prev => ({ ...prev, ...updates }));
  };

  // Update payment information
  const updatePaymentInfo = (updates) => {
    setError(null);
    setPaymentInfo(prev => ({ ...prev, ...updates }));
  };

  // Apply discount code
  const applyDiscountCode = async (code) => {
    setError(null);
    setIsProcessing(true);
    
    try {
      // Mock discount validation
      const validCodes = {
        'SAVE10': { type: 'percentage', value: 10, minAmount: 100 },
        'FREESHIP': { type: 'shipping', value: 0, minAmount: 0 },
        'WELCOME20': { type: 'percentage', value: 20, minAmount: 200 }
      };

      const discount = validCodes[code.toUpperCase()];
      
      if (!discount) {
        setError('Invalid discount code');
        return { success: false, error: 'Invalid discount code' };
      }

      if (orderSummary.subtotal < discount.minAmount) {
        setError(`Minimum order amount of $${discount.minAmount} required for this discount code`);
        return { success: false, error: `Minimum order amount of $${discount.minAmount} required` };
      }

      let discountAmount = 0;
      if (discount.type === 'percentage') {
        discountAmount = (orderSummary.subtotal * discount.value) / 100;
      } else if (discount.type === 'shipping') {
        discountAmount = orderSummary.shipping;
      }

      setOrderSummary(prev => ({
        ...prev,
        discount: discountAmount,
        discountCode: code.toUpperCase(),
        total: prev.subtotal + prev.tax + prev.shipping - discountAmount
      }));

      return { success: true, discount };
    } catch (error) {
      const errorMessage = 'Failed to apply discount code. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove discount code
  const removeDiscountCode = () => {
    setError(null);
    setOrderSummary(prev => ({
      ...prev,
      discount: 0,
      discountCode: '',
      total: prev.subtotal + prev.tax + prev.shipping
    }));
  };

  // Proceed to next step
  const nextStep = async () => {
    setError(null);
    
    try {
      switch (checkoutStep) {
        case 1:
          if (!validateShippingInfo()) {
            return false;
          }
          break;
        case 2:
          if (!validateBillingInfo() || !validatePaymentInfo()) {
            return false;
          }
          break;
        case 3:
          // Final validation before processing
          if (!validateShippingInfo() || !validateBillingInfo() || !validatePaymentInfo()) {
            return false;
          }
          break;
      }
      
      setCheckoutStep(prev => prev + 1);
      return true;
    } catch (error) {
      setError('Validation failed. Please check your information.');
      return false;
    }
  };

  // Go back to previous step
  const previousStep = () => {
    setError(null);
    setCheckoutStep(prev => Math.max(1, prev - 1));
  };

  // Process order
  const processOrder = async () => {
    setError(null);
    setIsProcessing(true);
    
    try {
      // Final validation
      if (!validateShippingInfo() || !validateBillingInfo() || !validatePaymentInfo()) {
        return { success: false, error: 'Please complete all required fields' };
      }

      // Create order
      const orderResponse = await mockApiCall('create-order', {
        items: orderSummary.items,
        shippingInfo,
        billingInfo,
        paymentInfo,
        orderSummary
      });

      if (!orderResponse.success) {
        throw new Error(orderResponse.error || 'Failed to create order');
      }

      // Process payment
      const paymentResponse = await mockApiCall('process-payment', {
        orderId: orderResponse.order.id,
        paymentInfo,
        amount: orderSummary.total
      });

      if (!paymentResponse.success) {
        throw new Error(paymentResponse.error || 'Payment failed');
      }

      // Send confirmation email
      await mockApiCall('send-confirmation', {
        orderId: orderResponse.order.id,
        email: shippingInfo.email
      });

      // Clear cart
      clearCart();
      
      // Set order ID and move to completion step
      setOrderId(orderResponse.order.id);
      setCheckoutStep(4);
      
      return { 
        success: true, 
        orderId: orderResponse.order.id,
        paymentId: paymentResponse.paymentId
      };
    } catch (error) {
      const errorMessage = error.message || 'Order processing failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset checkout
  const resetCheckout = () => {
    setCheckoutStep(1);
    setError(null);
    setOrderId(null);
    setIsProcessing(false);
    
    // Reset forms to initial state
    setShippingInfo({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: {
        street: '',
        city: '',
        state: '',
        postcode: '',
        country: 'Australia'
      },
      deliveryInstructions: ''
    });
    
    setBillingInfo({
      sameAsShipping: true,
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      company: '',
      address: {
        street: '',
        city: '',
        state: '',
        postcode: '',
        country: 'Australia'
      }
    });
    
    setPaymentInfo({
      method: 'card',
      card: {
        number: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        nameOnCard: ''
      },
      saveCard: false
    });
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    // State
    checkoutStep,
    isProcessing,
    error,
    orderId,
    shippingInfo,
    billingInfo,
    paymentInfo,
    orderSummary,
    
    // Actions
    updateShippingInfo,
    updateBillingInfo,
    updatePaymentInfo,
    applyDiscountCode,
    removeDiscountCode,
    nextStep,
    previousStep,
    processOrder,
    resetCheckout,
    clearError,
    
    // Validation
    validateShippingInfo,
    validateBillingInfo,
    validatePaymentInfo
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};










