"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api/apiClient';
import { isAuthenticated } from '../lib/auth';

const CartContext = createContext(null);

// Calculate totals from cart items
const calculateTotals = (items) => {
  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.discountedPrice || item.product?.originalPrice || 
                  item.discountedPrice || item.originalPrice || item.price || 0;
    return sum + (price * item.quantity);
  }, 0);
  
  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal + tax + shipping;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { subtotal, tax, shipping, total, itemCount };
};


export const useCart = () => {
  const context = useContext(CartContext);
  
  // If context is available, use it (works in both SSR and client)
  if (context) {
    return context;
  }
  
  // Context is not available - return safe defaults
  // This can happen during SSR if provider hasn't rendered yet, or if setup is wrong
  const defaults = {
    cartItems: [],
    totals: { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 },
    isLoading: false,
    isSyncing: false,
    error: null,
    addToCart: async () => ({ success: false, error: 'Cart not available' }),
    removeFromCart: async () => ({ success: false, error: 'Cart not available' }),
    updateQuantity: async () => ({ success: false, error: 'Cart not available' }),
    clearCart: async () => ({ success: false, error: 'Cart not available' }),
    loadCart: async () => ({ items: [], totals: { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 } }),
    isInCart: () => false,
    getItemQuantity: () => 0,
    getCartCount: () => 0,
  };
  
  // Only warn on client side (not during SSR/build)
  if (typeof window !== 'undefined') {
    console.warn('useCart must be used within a CartProvider. Make sure Providers wrap your app.');
  }
  
  return defaults;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const syncTimeoutRef = useRef(null);
  const hasLoadedCart = useRef(false);

  // Load cart from API (for authenticated users only)
  const loadCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let loadedItems = [];
      let loadedTotals = { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 };

      // Only load from API if authenticated
      if (isAuthenticated()) {
        try {
          const response = await apiService.cart.get();
          if (response.success && response.data?.items) {
            // API has data, use it
            loadedItems = response.data.items;
            loadedTotals = calculateTotals(loadedItems);
            setCartItems(loadedItems);
            setTotals(loadedTotals);
            return { items: loadedItems, totals: loadedTotals };
          }
        } catch (err) {
          // API failed
          console.log('API cart unavailable');
          loadedItems = [];
          loadedTotals = { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 };
          setCartItems(loadedItems);
          setTotals(loadedTotals);
        }
      } else {
        // Not authenticated, empty cart
        loadedItems = [];
        loadedTotals = { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 };
        setCartItems(loadedItems);
        setTotals(loadedTotals);
      }

      return { items: loadedItems, totals: loadedTotals };
    } catch (err) {
      console.error('Error loading cart:', err);
      setError('Failed to load cart');
      return { items: [], totals: { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 } };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark component as mounted on client (after hydration) and load cart
  useEffect(() => {
    setIsMounted(true);
    
    // Load cart from API on mount if authenticated (only once)
    if (!hasLoadedCart.current && typeof window !== 'undefined') {
      hasLoadedCart.current = true;
      loadCart();
    }
  }, [loadCart]);

  // Calculate totals whenever cart changes
  useEffect(() => {
    if (isMounted) {
      setTotals(calculateTotals(cartItems));
    }
  }, [cartItems, isMounted]);

  // Sync with API - debounced (not actively used, but available for future sync needs)
  const syncWithAPI = useCallback(async (items) => {
    if (!isAuthenticated() || isSyncing) return;

    // Clear any pending sync
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Debounce sync to avoid too many API calls
    syncTimeoutRef.current = setTimeout(async () => {
      setIsSyncing(true);
      try {
        // Sync with API - fetch latest cart state
        const response = await apiService.cart.get();
        if (response.success && response.data?.items) {
          // Update cart with API data
          setCartItems(response.data.items);
          setTotals(calculateTotals(response.data.items));
        }
      } catch (err) {
        // API sync failed
        console.log('API sync unavailable');
      } finally {
        setIsSyncing(false);
      }
    }, 500);
  }, [isSyncing]);

  // Add to cart - works for both authenticated and unauthenticated users
  const addToCart = useCallback(async (productOrId, quantity = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      // Determine product ID and product data
      let productId;
      let productData;
      
      if (typeof productOrId === 'object' && productOrId !== null) {
        productId = productOrId.id || productOrId.productId;
        productData = productOrId;
      } else {
        productId = productOrId;
        productData = null;
      }

      if (!productId) {
        throw new Error('Product ID is required');
      }

      // If authenticated, try to add via API first
      if (isAuthenticated()) {
        try {
          const response = await apiService.cart.addItem(productId, quantity);
          if (response.success) {
            // Reload from API to get server-side updates
            await loadCart();
            return { success: true };
          } else {
            // API failed, but still add to local cart
            console.log('API add failed, adding to local cart');
          }
        } catch (err) {
          // API failed, but still add to local cart
          console.log('API unavailable, adding to local cart');
        }
      }

      // Add to local cart (works for both authenticated and unauthenticated)
      setCartItems(prevItems => {
        const existingItem = prevItems.find(
          item => item.productId === productId || item.id === productId || item.product?.id === productId
        );

        if (existingItem) {
          // Update quantity of existing item
          return prevItems.map(item =>
            (item.productId === productId || item.id === productId || item.product?.id === productId)
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // Add new item to cart
          const newItem = productData
            ? {
                id: productId,
                productId: productId,
                product: productData,
                quantity: quantity,
                price: productData.discountedPrice || productData.originalPrice || productData.price || 0,
                discountedPrice: productData.discountedPrice,
                originalPrice: productData.originalPrice || productData.price,
              }
            : {
                id: productId,
                productId: productId,
                quantity: quantity,
              };
          return [...prevItems, newItem];
        }
      });

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to add item to cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [loadCart]);

  // Remove from cart - works for both authenticated and unauthenticated users
  const removeFromCart = useCallback(async (productId) => {
    setIsLoading(true);
    setError(null);

    try {
      // If authenticated, try to remove via API first
      if (isAuthenticated()) {
        try {
          const response = await apiService.cart.removeItem(productId);
          if (response.success) {
            // Reload from API to get server-side updates
            await loadCart();
            return { success: true };
          } else {
            // Even if API says item not found, that's okay - remove from local cart
            console.log('API remove failed, removing from local cart');
          }
        } catch (err) {
          // Check if error is about item not found
          const errorMessage = err.response?.data?.error || err.message || '';
          if (errorMessage.includes('not found') || errorMessage.includes('Cart item not found')) {
            // Item not found in API, remove from local cart
            console.log('Item not found in API, removing from local cart');
          } else {
            // Other API errors - still remove from local cart
            console.log('API unavailable, removing from local cart');
          }
        }
      }

      // Remove from local cart (works for both authenticated and unauthenticated)
      setCartItems(prevItems =>
        prevItems.filter(
          item => item.productId !== productId && item.id !== productId && item.product?.id !== productId
        )
      );

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to remove item from cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [loadCart]);

  // Update item quantity - works for both authenticated and unauthenticated users
  const updateQuantity = useCallback(async (productId, quantity) => {
    if (quantity <= 0) {
      return await removeFromCart(productId);
    }

    setIsLoading(true);
    setError(null);

    try {
      // If authenticated, try to update via API
      if (isAuthenticated()) {
        try {
          // Note: API might not have updateQuantity endpoint, so we'll just update locally
          // and sync on next loadCart
          await loadCart();
        } catch (err) {
          // API failed, continue with local update
          console.log('API unavailable, updating local cart');
        }
      }

      // Update local cart (works for both authenticated and unauthenticated)
      setCartItems(prevItems =>
        prevItems.map(item =>
          (item.productId === productId || item.id === productId || item.product?.id === productId)
            ? { ...item, quantity: quantity }
            : item
        )
      );

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to update quantity';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [removeFromCart, loadCart]);

  // Clear cart - works for both authenticated and unauthenticated users
  const clearCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // If authenticated, try to clear via API
      if (isAuthenticated()) {
        try {
          const response = await apiService.cart.clear?.();
          if (response?.success) {
            await loadCart();
            return { success: true };
          } else {
            // API failed, clear local cart
            console.log('API clear failed, clearing local cart');
          }
        } catch (err) {
          // API failed, clear local cart
          console.log('API unavailable, clearing local cart');
        }
      }

      // Clear local cart (works for both authenticated and unauthenticated)
      setCartItems([]);
      setTotals({ subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 });

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to clear cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [loadCart]);

  // Check if item is in cart
  const isInCart = useCallback((productId) => {
    return cartItems.some(
      item => item.productId === productId || item.id === productId || item.product?.id === productId
    );
  }, [cartItems]);

  // Get item quantity
  const getItemQuantity = useCallback((productId) => {
    const item = cartItems.find(
      item => item.productId === productId || item.id === productId || item.product?.id === productId
    );
    return item ? item.quantity : 0;
  }, [cartItems]);

  // Get cart count
  const getCartCount = useCallback(() => {
    return totals.itemCount || cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [totals, cartItems]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  const value = {
    cartItems,
    totals,
    isLoading,
    isSyncing,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    loadCart,
    isInCart,
    getItemQuantity,
    getCartCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
