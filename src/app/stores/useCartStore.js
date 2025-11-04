"use client";

import { create } from 'zustand';
import { apiService } from '../services/api/apiClient';
import { isAuthenticated } from '../lib/auth';

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

export const useCartStore = create((set, get) => ({
  cartItems: [],
  totals: { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 },
  isLoading: false,
  isSyncing: false,
  error: null,
  hasLoadedCart: false,

  // Load cart from API (for authenticated users only)
  loadCart: async () => {
    set({ isLoading: true, error: null });

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
            set({ 
              cartItems: loadedItems, 
              totals: loadedTotals,
              isLoading: false 
            });
            return { items: loadedItems, totals: loadedTotals };
          }
        } catch (err) {
          // API failed
          console.log('API cart unavailable');
          loadedItems = [];
          loadedTotals = { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 };
        }
      } else {
        // Not authenticated, empty cart
        loadedItems = [];
        loadedTotals = { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 };
      }

      set({ 
        cartItems: loadedItems, 
        totals: loadedTotals,
        isLoading: false 
      });
      return { items: loadedItems, totals: loadedTotals };
    } catch (err) {
      console.error('Error loading cart:', err);
      set({ 
        error: 'Failed to load cart',
        isLoading: false 
      });
      return { items: [], totals: { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 } };
    }
  },

  // Add to cart - works for both authenticated and unauthenticated users
  addToCart: async (productOrId, quantity = 1) => {
    set({ isLoading: true, error: null });

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
            await get().loadCart();
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
      const { cartItems } = get();
      const existingItem = cartItems.find(
        item => item.productId === productId || item.id === productId || item.product?.id === productId
      );

      let newItems;
      if (existingItem) {
        // Update quantity of existing item
        newItems = cartItems.map(item =>
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
        newItems = [...cartItems, newItem];
      }

      const newTotals = calculateTotals(newItems);
      set({ 
        cartItems: newItems, 
        totals: newTotals,
        isLoading: false 
      });

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to add item to cart';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      return { success: false, error: errorMessage };
    }
  },

  // Remove from cart - works for both authenticated and unauthenticated users
  removeFromCart: async (productId) => {
    set({ isLoading: true, error: null });

    try {
      // If authenticated, try to remove via API first
      if (isAuthenticated()) {
        try {
          const response = await apiService.cart.removeItem(productId);
          if (response.success) {
            // Reload from API to get server-side updates
            await get().loadCart();
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
      const { cartItems } = get();
      const newItems = cartItems.filter(
        item => item.productId !== productId && item.id !== productId && item.product?.id !== productId
      );
      const newTotals = calculateTotals(newItems);
      
      set({ 
        cartItems: newItems, 
        totals: newTotals,
        isLoading: false 
      });

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to remove item from cart';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      return { success: false, error: errorMessage };
    }
  },

  // Update item quantity - works for both authenticated and unauthenticated users
  updateQuantity: async (productId, quantity) => {
    if (quantity <= 0) {
      return await get().removeFromCart(productId);
    }

    set({ isLoading: true, error: null });

    try {
      // If authenticated, try to update via API
      if (isAuthenticated()) {
        try {
          // Note: API might not have updateQuantity endpoint, so we'll just update locally
          // and sync on next loadCart
          await get().loadCart();
        } catch (err) {
          // API failed, continue with local update
          console.log('API unavailable, updating local cart');
        }
      }

      // Update local cart (works for both authenticated and unauthenticated)
      const { cartItems } = get();
      const newItems = cartItems.map(item =>
        (item.productId === productId || item.id === productId || item.product?.id === productId)
          ? { ...item, quantity: quantity }
          : item
      );
      const newTotals = calculateTotals(newItems);
      
      set({ 
        cartItems: newItems, 
        totals: newTotals,
        isLoading: false 
      });

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to update quantity';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      return { success: false, error: errorMessage };
    }
  },

  // Clear cart - works for both authenticated and unauthenticated users
  clearCart: async () => {
    set({ isLoading: true, error: null });

    try {
      // If authenticated, try to clear via API
      if (isAuthenticated()) {
        try {
          const response = await apiService.cart.clear?.();
          if (response?.success) {
            await get().loadCart();
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
      const emptyTotals = { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 };
      set({ 
        cartItems: [],
        totals: emptyTotals,
        isLoading: false 
      });

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to clear cart';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      return { success: false, error: errorMessage };
    }
  },

  // Check if item is in cart
  isInCart: (productId) => {
    const { cartItems } = get();
    return cartItems.some(
      item => item.productId === productId || item.id === productId || item.product?.id === productId
    );
  },

  // Get item quantity
  getItemQuantity: (productId) => {
    const { cartItems } = get();
    const item = cartItems.find(
      item => item.productId === productId || item.id === productId || item.product?.id === productId
    );
    return item ? item.quantity : 0;
  },

  // Get cart count
  getCartCount: () => {
    const { totals, cartItems } = get();
    return totals.itemCount || cartItems.reduce((sum, item) => sum + item.quantity, 0);
  },
}));

// Client-side initialization component
if (typeof window !== 'undefined') {
  // Use a small delay to ensure auth is ready
  setTimeout(() => {
    const store = useCartStore.getState();
    if (!store.hasLoadedCart && isAuthenticated()) {
      useCartStore.setState({ hasLoadedCart: true });
      store.loadCart();
    }
  }, 100);
}

// Export a hook that matches the old API for compatibility
export const useCart = () => {
  const cartItems = useCartStore((state) => state.cartItems);
  const totals = useCartStore((state) => state.totals);
  const isLoading = useCartStore((state) => state.isLoading);
  const isSyncing = useCartStore((state) => state.isSyncing);
  const error = useCartStore((state) => state.error);
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const loadCart = useCartStore((state) => state.loadCart);
  const isInCart = useCartStore((state) => state.isInCart);
  const getItemQuantity = useCartStore((state) => state.getItemQuantity);
  const getCartCount = useCartStore((state) => state.getCartCount);

  return {
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
};

