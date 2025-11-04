// Simple cart module - no context needed
import { apiService } from '../services/api/apiClient';
import { isAuthenticated } from './auth';

// Cart state (local)
let cartItems = [];
let totals = { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 };

// Calculate totals from cart items
const calculateTotals = (items) => {
  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.discountedPrice || item.product?.originalPrice || 0;
    return sum + (price * item.quantity);
  }, 0);
  
  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal + tax + shipping;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { subtotal, tax, shipping, total, itemCount };
};

// Fetch cart from API
export const fetchCart = async () => {
  if (!isAuthenticated()) {
    cartItems = [];
    totals = { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 };
    return { items: [], totals };
  }

  try {
    const response = await apiService.cart.get();
    if (response.success && response.data) {
      cartItems = response.data.items || [];
      totals = calculateTotals(cartItems);
      return { items: cartItems, totals };
    }
  } catch (err) {
    console.error('Error fetching cart:', err);
    return { items: [], totals: { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 } };
  }
  return { items: cartItems, totals };
};

// Add to cart
export const addToCart = async (productId, quantity = 1) => {
  if (!isAuthenticated()) {
    return { success: false, error: 'Please login to add items to cart' };
  }

  try {
    const response = await apiService.cart.addItem(productId, quantity);
    if (response.success) {
      await fetchCart(); // Refresh cart
      return { success: true };
    } else {
      return { success: false, error: response.message || 'Failed to add to cart' };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.error || err.message || 'Failed to add item to cart';
    return { success: false, error: errorMessage };
  }
};

// Remove from cart
export const removeFromCart = async (productId) => {
  if (!isAuthenticated()) {
    return { success: false, error: 'Please login' };
  }

  try {
    const response = await apiService.cart.removeItem(productId);
    if (response.success) {
      await fetchCart(); // Refresh cart
      return { success: true };
    } else {
      return { success: false, error: response.message || 'Failed to remove item' };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.error || err.message || 'Failed to remove item';
    return { success: false, error: errorMessage };
  }
};

// Get cart items
export const getCartItems = () => cartItems;

// Get cart totals
export const getCartTotals = () => totals;

// Get cart count
export const getCartCount = () => totals.itemCount || 0;

// Check if item is in cart
export const isInCart = (productId) => {
  return cartItems.some(item => item.productId === productId || item.product?.id === productId);
};

// Get item quantity
export const getItemQuantity = (productId) => {
  const item = cartItems.find(item => item.productId === productId || item.product?.id === productId);
  return item ? item.quantity : 0;
};

