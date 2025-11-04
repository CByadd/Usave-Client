"use client";
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { apiService } from '../lib/api';
import { useAuth } from './AuthContext';

// Default values for SSR/prerendering
const defaultCartValue = {
  cartItems: [],
  isLoading: false,
  error: null,
  totals: { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 },
  addToCart: async () => {},
  removeFromCart: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  isInCart: () => false,
  getItemQuantity: () => 0,
  toggleInstallation: () => {},
  getCartCount: () => 0,
  getCartTotal: () => 0,
  validateCart: () => true,
  applyDiscountCode: () => {},
  clearError: () => {},
};

// Initialize with default value to ensure context is always defined
const CartContext = createContext(defaultCartValue);

export const useCart = () => {
  const context = useContext(CartContext);
  // Context should always be available (initialized with default value)
  return context || defaultCartValue;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get auth context - useAuth always returns default values if not in provider
  const { isAuthenticated, user } = useAuth();
  
  // Force local cart storage for all users per requirements
  const useServerCart = false;

  // Initialize cart from localStorage - simple client-side only
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        console.log('[CartContext] Loading cart from localStorage:', parsed.length, 'items');
        setCartItems(parsed);
      }
    } catch (error) {
      console.error('[CartContext] Error loading cart:', error);
    }
  }, []);

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);

  // Calculate cart totals
  const calculateTotals = () => {
    const subtotal = cartItems.reduce((total, item) => {
      const itemTotal = item.discountedPrice * item.quantity;
      // Add installation fee if included
      const installationTotal = item.includeInstallation ? (item.installationFee || 0) * item.quantity : 0;
      return total + itemTotal + installationTotal;
    }, 0);

    const tax = subtotal * 0.1; // 10% GST
    const shipping = subtotal > 200 ? 0 : 29.95; // Free shipping over $200
    const total = subtotal + tax + shipping;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      itemCount: cartItems.reduce((count, item) => count + item.quantity, 0)
    };
  };

  const totals = calculateTotals();

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    console.log('[CartContext] addToCart called with:', product?.id, product?.title);
    setIsLoading(true);
    setError(null);
    
    try {
      if (!product || !product.id) {
        console.error('[CartContext] Invalid product:', product);
        setIsLoading(false);
        return { success: false, error: 'Invalid product' };
      }

      // Simple state update using functional form
      setCartItems(prevItems => {
        const existingItemIndex = prevItems.findIndex(
          item => item.id === product.id
        );

        let updatedCart;
        if (existingItemIndex > -1) {
          // Item exists, update quantity
          updatedCart = [...prevItems];
          updatedCart[existingItemIndex].quantity += quantity;
          
          // Ensure quantity doesn't exceed stock limit
          if (updatedCart[existingItemIndex].maxQuantity && 
              updatedCart[existingItemIndex].quantity > updatedCart[existingItemIndex].maxQuantity) {
            updatedCart[existingItemIndex].quantity = updatedCart[existingItemIndex].maxQuantity;
            setError(`Maximum quantity available: ${updatedCart[existingItemIndex].maxQuantity}`);
          }
          
          console.log('[CartContext] Updated cart item quantity, new cart length:', updatedCart.length);
        } else {
          // New item
          const cartItem = {
            id: product.id,
            title: product.title,
            image: product.image,
            originalPrice: product.originalPrice,
            discountedPrice: product.discountedPrice,
            quantity: Math.min(quantity, product.maxQuantity || 10),
            inStock: product.inStock !== false,
            maxQuantity: product.maxQuantity || 10,
            category: product.category,
            description: product.description,
            includeInstallation: product.includeInstallation || false,
            installationFee: product.includeInstallation ? (product.installationFee || 49.99) : 0,
            addedAt: new Date().toISOString()
          };
          
          updatedCart = [...prevItems, cartItem];
          console.log('[CartContext] Added new item to cart:', cartItem.title, 'new cart length:', updatedCart.length);
        }
        
        // Save to localStorage immediately
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('cartItems', JSON.stringify(updatedCart));
            console.log('[CartContext] Saved cart to localStorage, items:', updatedCart.length);
          } catch (error) {
            console.error('[CartContext] Error saving cart to localStorage:', error);
          }
        }
        
        return updatedCart;
      });
      
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      console.error('[CartContext] addToCart error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add item to cart. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    setError(null);
    try {
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
      return { success: true };
    } catch (error) {
      const errorMessage = 'Failed to remove item from cart. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, newQuantity) => {
    setError(null);
    try {
      if (newQuantity <= 0) {
        return removeFromCart(productId);
      }

      setCartItems(prevItems => {
        const updatedCart = prevItems.map(item => {
          if (item.id === productId) {
            if (item.maxQuantity && newQuantity > item.maxQuantity) {
              setError(`Maximum quantity available: ${item.maxQuantity}`);
              return { ...item, quantity: item.maxQuantity };
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
        return updatedCart;
      });
      return { success: true };
    } catch (error) {
      const errorMessage = 'Failed to update quantity. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    setError(null);
    try {
      setCartItems([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cartItems');
      }
      return { success: true };
    } catch (error) {
      return { success: true }; // Still succeed even if localStorage fails
    }
  };

  // Check if item is in cart
  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  // Get item quantity in cart
  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  // Toggle installation for an item
  const toggleInstallation = (productId, includeInstallation) => {
    setCartItems(prevItems => prevItems.map(item => 
      item.id === productId 
        ? { 
            ...item, 
            includeInstallation,
            installationFee: includeInstallation ? (item.installationFee || 49.99) : 0
          } 
        : item
    ));
  };

  // Validate cart (check stock, prices, etc.)
  const validateCart = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock API call to validate cart
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const validationResults = cartItems.map(item => {
        // Mock validation - in real app, this would check against backend
        return {
          id: item.id,
          isValid: item.inStock,
          issues: item.inStock ? [] : ['Item is out of stock']
        };
      });

      const invalidItems = validationResults.filter(result => !result.isValid);
      
      if (invalidItems.length > 0) {
        const issues = invalidItems.flatMap(item => item.issues);
        setError(`Cart validation failed: ${issues.join(', ')}`);
        return { success: false, invalidItems };
      }

      return { success: true, validationResults };
    } catch (error) {
      const errorMessage = 'Failed to validate cart. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Apply discount code
  const applyDiscountCode = (code) => {
    setError(null);
    
    try {
      // Mock discount codes
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

      if (totals.subtotal < discount.minAmount) {
        setError(`Minimum order amount of $${discount.minAmount} required for this discount code`);
        return { success: false, error: `Minimum order amount of $${discount.minAmount} required` };
      }

      return { success: true, discount };
    } catch (error) {
      const errorMessage = 'Failed to apply discount code. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Get cart count
  const getCartCount = () => {
    const count = cartItems.reduce((count, item) => count + item.quantity, 0);
    console.log('[CartContext] getCartCount called, cartItems:', cartItems.length, 'total quantity:', count);
    return count;
  };

  // Get cart total
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.discountedPrice * item.quantity);
    }, 0);
  };

  // Remove item from cart (alias for removeFromCart)
  const removeItem = removeFromCart;

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    // State
    cartItems,
    isLoading,
    error,
    totals,
    
    // Actions
    addToCart,
    removeFromCart,
    removeItem: removeFromCart, // alias
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    toggleInstallation,
    getCartCount,
    getCartTotal,
    validateCart,
    applyDiscountCode,
    clearError
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};


