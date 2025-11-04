// Simple checkout module - no context needed
import { apiService } from '../services/api/apiClient';
import { getCartItems, getCartTotals } from './cart';

// Validation functions
export const validateShippingInfo = (info) => {
  if (!info.firstName || !info.lastName || !info.email || !info.phone) {
    return false;
  }
  if (!info.address.street || !info.address.city || !info.address.state || !info.address.postcode) {
    return false;
  }
  return true;
};

export const validateBillingInfo = (info) => {
  if (info.sameAsShipping) return true;
  if (!info.firstName || !info.lastName) {
    return false;
  }
  if (!info.address.street || !info.address.city || !info.address.state || !info.address.postcode) {
    return false;
  }
  return true;
};

export const validatePaymentInfo = (info) => {
  if (info.method === 'card') {
    if (!info.card.number || !info.card.expiryMonth || !info.card.expiryYear || !info.card.cvv || !info.card.nameOnCard) {
      return false;
    }
  }
  return true;
};

// Process order
export const processOrder = async (orderData) => {
  try {
    const response = await apiService.orders.create(orderData);
    if (response.success) {
      return { success: true, orderId: response.data?.orderId || response.orderId };
    } else {
      return { success: false, error: response.message || response.error || 'Failed to process order' };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.error || err.message || 'Failed to process order';
    return { success: false, error: errorMessage };
  }
};

// Get order summary
export const getOrderSummary = () => {
  const items = getCartItems();
  const totals = getCartTotals();
  
  return {
    items,
    subtotal: totals.subtotal,
    tax: totals.tax,
    shipping: totals.shipping,
    discount: 0,
    discountCode: '',
    total: totals.total
  };
};

