"use client";

import { create } from 'zustand';
import { apiService } from '../services/api/apiClient';
import { isAuthenticated } from '../lib/auth';

const CART_STORAGE_KEY = 'usave_cart';

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

// Load cart from localStorage
const loadCartFromStorage = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Error loading cart from localStorage:', err);
  }
  return [];
};

// Save cart to localStorage
const saveCartToStorage = (items) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving cart to localStorage:', err);
  }
};

// Save cart to database as single object (for authenticated users)
const saveCartToDatabase = async (items) => {
  if (!isAuthenticated()) return { success: false };
  
  try {
    // Save entire cart as a single object
    const cartData = {
      items: items,
      updatedAt: new Date().toISOString(),
    };
    
    // Use cart save endpoint (saves entire cart as single object)
    const response = await apiService.cart.save(cartData);
    
    if (response?.success) {
      return { success: true };
    }
    return { success: false, error: response?.error || 'Failed to save cart' };
  } catch (err) {
    console.log('Failed to save cart to database:', err);
    return { success: false, error: err.message };
  }
};

export const useCartStore = create((set, get) => ({
  cartItems: [],
  totals: { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 },
  isLoading: false,
  isSyncing: false,
  error: null,
  hasLoadedCart: false,

  // Load cart from API (for authenticated users) or localStorage
  loadCart: async () => {
    set({ isLoading: true, error: null });

    try {
      let loadedItems = [];
      let loadedTotals = { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 };

      // If authenticated, load from API
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
            // Also save to localStorage for offline access
            saveCartToStorage(loadedItems);
            return { items: loadedItems, totals: loadedTotals };
          } else if (response.success && response.data?.cart) {
            // If cart is stored as a single object
            loadedItems = response.data.cart.items || [];
            loadedTotals = calculateTotals(loadedItems);
            set({ 
              cartItems: loadedItems, 
              totals: loadedTotals,
              isLoading: false 
            });
            saveCartToStorage(loadedItems);
            return { items: loadedItems, totals: loadedTotals };
          }
        } catch (err) {
          // API failed, try localStorage
          console.log('API cart unavailable, loading from localStorage');
          loadedItems = loadCartFromStorage();
          loadedTotals = calculateTotals(loadedItems);
        }
      } else {
        // Not authenticated, load from localStorage
        loadedItems = loadCartFromStorage();
        loadedTotals = calculateTotals(loadedItems);
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

  // Save cart to database (for authenticated users)
  saveCart: async () => {
    const { cartItems } = get();
    
    if (!isAuthenticated()) {
      // Not authenticated, just save to localStorage
      saveCartToStorage(cartItems);
      return { success: true };
    }

    try {
      set({ isSyncing: true });
      const result = await saveCartToDatabase(cartItems);
      set({ isSyncing: false });
      return result;
    } catch (err) {
      set({ isSyncing: false });
      console.error('Error saving cart:', err);
      return { success: false, error: err.message };
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
      
      // Save to localStorage immediately
      saveCartToStorage(newItems);
      
      // If authenticated, save to database as single object
      if (isAuthenticated()) {
        // Debounce database save
        setTimeout(async () => {
          await get().saveCart();
        }, 500);
      }

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
      const { cartItems } = get();
      
      // Remove from local cart
      const newItems = cartItems.filter(
        item => item.productId !== productId && item.id !== productId && item.product?.id !== productId
      );
      const newTotals = calculateTotals(newItems);
      
      set({ 
        cartItems: newItems, 
        totals: newTotals,
        isLoading: false 
      });
      
      // Save to localStorage immediately
      saveCartToStorage(newItems);
      
      // If authenticated, save to database as single object
      if (isAuthenticated()) {
        // Debounce database save
        setTimeout(async () => {
          await get().saveCart();
        }, 500);
      }

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
      const { cartItems } = get();
      
      // Update local cart
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
      
      // Save to localStorage immediately
      saveCartToStorage(newItems);
      
      // If authenticated, save to database as single object
      if (isAuthenticated()) {
        // Debounce database save
        setTimeout(async () => {
          await get().saveCart();
        }, 500);
      }

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
      const emptyTotals = { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 };
      set({ 
        cartItems: [],
        totals: emptyTotals,
        isLoading: false 
      });
      
      // Clear localStorage
      saveCartToStorage([]);
      
      // If authenticated, save to database as single object
      if (isAuthenticated()) {
        await get().saveCart();
      }

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

// Client-side initialization
if (typeof window !== 'undefined') {
  setTimeout(() => {
    const store = useCartStore.getState();
    if (!store.hasLoadedCart) {
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
