"use client";

import { create } from 'zustand';
import { apiService } from '../services/api/apiClient';
import { isAuthenticated } from '../lib/auth';
import { useWishlistStore } from './useWishlistStore';

const CART_STORAGE_KEY = 'usave_cart';

// Helper function to safely parse number
const safeParseNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const parsed = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Calculate totals from cart items
const calculateTotals = (items) => {
  if (!items || !Array.isArray(items)) {
    return { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 };
  }

  const subtotal = items.reduce((sum, item) => {
    if (!item) return sum;
    
    // Try to get price from multiple possible locations
    const price = safeParseNumber(
      item.product?.discountedPrice || 
      item.product?.originalPrice || 
      item.product?.price ||
      item.discountedPrice || 
      item.originalPrice || 
      item.price
    );
    
    // Ensure quantity is a valid number
    const quantity = safeParseNumber(item.quantity, 1);
    
    const itemTotal = price * quantity;
    return sum + (isNaN(itemTotal) ? 0 : itemTotal);
  }, 0);
  
  const tax = safeParseNumber(subtotal * 0.1); // 10% tax
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = safeParseNumber(subtotal + tax + shipping);
  const itemCount = items.reduce((sum, item) => {
    const quantity = safeParseNumber(item?.quantity, 0);
    return sum + quantity;
  }, 0);

  return { 
    subtotal: isNaN(subtotal) ? 0 : subtotal,
    tax: isNaN(tax) ? 0 : tax,
    shipping: isNaN(shipping) ? 0 : shipping,
    total: isNaN(total) ? 0 : total,
    itemCount: isNaN(itemCount) ? 0 : itemCount
  };
};

// Normalize cart item to ensure all numeric fields are valid numbers
const normalizeCartItem = (item) => {
  if (!item) return null;
  
  return {
    ...item,
    quantity: safeParseNumber(item.quantity, 1),
    price: safeParseNumber(item.price || item.product?.price),
    discountedPrice: safeParseNumber(item.discountedPrice || item.product?.discountedPrice),
    originalPrice: safeParseNumber(item.originalPrice || item.product?.originalPrice),
    product: item.product ? {
      ...item.product,
      originalPrice: safeParseNumber(item.product.originalPrice || item.product.price || item.product.regularPrice),
      discountedPrice: safeParseNumber(item.product.discountedPrice || item.product.salePrice || item.product.originalPrice || item.product.price),
      price: safeParseNumber(item.product.discountedPrice || item.product.salePrice || item.product.originalPrice || item.product.price || item.product.regularPrice),
      regularPrice: safeParseNumber(item.product.regularPrice || item.product.originalPrice || item.product.price),
      salePrice: safeParseNumber(item.product.salePrice || item.product.discountedPrice),
      stockQuantity: safeParseNumber(item.product.stockQuantity ?? item.product.stock ?? 0),
      stock: safeParseNumber(item.product.stock ?? item.product.stockQuantity ?? 0),
      rating: safeParseNumber(item.product.rating),
      reviews: safeParseNumber(item.product.reviews),
    } : undefined,
  };
};

// Load cart from localStorage
const loadCartFromStorage = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const items = JSON.parse(stored);
      // Normalize all items to ensure numeric fields are valid
      return Array.isArray(items) ? items.map(normalizeCartItem).filter(Boolean) : [];
    }
  } catch (err) {
    console.error('Error loading cart from localStorage:', err);
  }
  return [];
};

// Debounced save to localStorage to avoid blocking
let saveCartTimeout = null;
const saveCartToStorage = (items, retries = 3) => {
  if (typeof window === 'undefined') return;
  
  // Clear any pending saves
  if (saveCartTimeout) {
    clearTimeout(saveCartTimeout);
  }
  
  // Debounce the save by 150ms to batch rapid changes
  saveCartTimeout = setTimeout(() => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const serialized = JSON.stringify(items);
        localStorage.setItem(CART_STORAGE_KEY, serialized);
        
        // Verify the save was successful
        const verification = localStorage.getItem(CART_STORAGE_KEY);
        if (verification === serialized) {
          return true;
        } else {
          throw new Error('Save verification failed');
        }
      } catch (err) {
        console.error(`[Cart] Error saving cart to localStorage (attempt ${attempt}/${retries}):`, err);
        
        // If quota exceeded, try to clear old data
        if (err.name === 'QuotaExceededError' || err.code === 22) {
          console.warn('[Cart] localStorage quota exceeded, attempting to clear old data');
          try {
            localStorage.removeItem(CART_STORAGE_KEY);
            if (attempt < retries) {
              continue;
            }
          } catch (clearErr) {
            console.error('[Cart] Failed to clear localStorage:', clearErr);
          }
        }
        
        if (attempt === retries) {
          console.error('[Cart] Failed to save cart to localStorage after all retries');
          return false;
        }
      }
    }
    return false;
  }, 150);
  
  return true; // Return immediately, save happens in timeout
};

// Save cart to database as single object (for authenticated users)
const saveCartToDatabase = async (items) => {
  if (!isAuthenticated()) return { success: false };
  
  try {
    // Format items for API - ensure productId and quantity are present
    const formattedItems = items.map(item => {
      // Extract productId from various possible fields
      const productId = item.productId || item.id || item.product?.id;
      const quantity = item.quantity || 1;
      
      if (!productId) {
        throw new Error(`Missing product ID for cart item: ${JSON.stringify(item)}`);
      }
      
      return {
        productId: productId,
        quantity: quantity,
      };
    });
    
    // Save entire cart as a single object
    const cartData = {
      items: formattedItems,
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

// Create store with localStorage persistence middleware
const storeCreator = (set, get) => {
  // Initialize from localStorage synchronously for immediate rendering
  const initialItems = typeof window !== 'undefined' ? loadCartFromStorage() : [];
  const initialTotals = calculateTotals(initialItems);

  return {
    cartItems: initialItems,
    totals: initialTotals,
    isLoading: false,
    isSyncing: false,
    error: null,
    hasLoadedCart: typeof window !== 'undefined', // Mark as loaded if we have localStorage data
    isInitializing: false, // Prevent multiple simultaneous initializations
  
  // Internal method to update cart and auto-save to localStorage
  _updateCart: (items) => {
    const newTotals = calculateTotals(items);
    set({ 
      cartItems: items, 
      totals: newTotals
    });
    // Always save to localStorage immediately
    saveCartToStorage(items);
    return { items, totals: newTotals };
  },

  // Load cart from API (for authenticated users) or localStorage
  loadCart: async (forceReload = false) => {
    const { isInitializing, hasLoadedCart } = get();
    
    // Prevent multiple simultaneous loads
    if (isInitializing && !forceReload) {
      return { items: get().cartItems, totals: get().totals };
    }

    // If already loaded and not forcing reload, just return current state
    if (hasLoadedCart && !forceReload) {
      return { items: get().cartItems, totals: get().totals };
    }

    set({ isInitializing: true, isLoading: false, error: null });

    try {
      let loadedItems = [];
      let loadedTotals = { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 };

      // Always load from localStorage first (primary source) - already loaded synchronously
      const currentItems = get().cartItems;
      if (currentItems && currentItems.length > 0) {
        loadedItems = currentItems;
        loadedTotals = calculateTotals(loadedItems);
      } else {
        // If no items in state, load from localStorage
        loadedItems = loadCartFromStorage();
        loadedTotals = calculateTotals(loadedItems);
        // Update state immediately with localStorage data
        set({ cartItems: loadedItems, totals: loadedTotals });
      }

      // If authenticated, sync from API in the background (non-blocking)
      if (isAuthenticated()) {
        // Use requestIdleCallback or setTimeout to avoid blocking UI
        const syncWithAPI = async () => {
          try {
            const response = await apiService.cart.get();
            if (response.success && response.data?.items && Array.isArray(response.data.items) && response.data.items.length > 0) {
              const apiItems = response.data.items.map(normalizeCartItem).filter(Boolean);
              if (apiItems.length > 0) {
                // Only update if API has different data
                const currentIds = new Set(loadedItems.map(item => String(item.id || item.productId)));
                const apiIds = new Set(apiItems.map(item => String(item.id || item.productId)));
                const hasChanges = apiItems.length !== loadedItems.length || 
                  ![...apiIds].every(id => currentIds.has(id));
                
                if (hasChanges) {
                  loadedItems = apiItems;
                  loadedTotals = calculateTotals(loadedItems);
                  saveCartToStorage(loadedItems);
                  set({ cartItems: loadedItems, totals: loadedTotals });
                }
              }
            } else if (response.success && response.data?.cart?.items && Array.isArray(response.data.cart.items) && response.data.cart.items.length > 0) {
              const apiItems = response.data.cart.items.map(normalizeCartItem).filter(Boolean);
              if (apiItems.length > 0) {
                const currentIds = new Set(loadedItems.map(item => String(item.id || item.productId)));
                const apiIds = new Set(apiItems.map(item => String(item.id || item.productId)));
                const hasChanges = apiItems.length !== loadedItems.length || 
                  ![...apiIds].every(id => currentIds.has(id));
                
                if (hasChanges) {
                  loadedItems = apiItems;
                  loadedTotals = calculateTotals(loadedItems);
                  saveCartToStorage(loadedItems);
                  set({ cartItems: loadedItems, totals: loadedTotals });
                }
              }
            }
          } catch (err) {
            // API sync failed silently - localStorage is primary source
            console.debug('[Cart] API sync failed, using localStorage data:', err.message);
          }
        };

        // Sync in background without blocking
        if (typeof window !== 'undefined' && window.requestIdleCallback) {
          window.requestIdleCallback(syncWithAPI, { timeout: 2000 });
        } else {
          setTimeout(syncWithAPI, 100);
        }
      }

      set({ 
        cartItems: loadedItems, 
        totals: loadedTotals,
        isLoading: false,
        isInitializing: false,
        hasLoadedCart: true
      });
      return { items: loadedItems, totals: loadedTotals };
    } catch (err) {
      console.error('Error loading cart:', err);
      set({ 
        error: 'Failed to load cart',
        isLoading: false,
        isInitializing: false
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
  // Supports options (color, size) for product variants
  addToCart: async (productOrId, quantity = 1, options = {}) => {
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
      
      // Normalize productId to string for consistent comparison
      const pid = String(productId);
      
      // Extract and normalize options (color, size, etc.)
      const { color, size, ...otherOptions } = options;
      const normalizedColor = color ? (typeof color === 'string' ? color : (color.value || color.name || JSON.stringify(color))) : null;
      const normalizedSize = size ? (typeof size === 'string' ? size : (size.value || size.label || JSON.stringify(size))) : null;

      // Check stock availability if product data is available
      if (productData) {
        const stockQuantity = productData.stockQuantity ?? productData.stock ?? 0;
        const inStock = productData.inStock !== false && productData.inStock !== null;
        const hasStock = inStock && (stockQuantity > 0 || stockQuantity === 0); // Allow 0 stock if inStock is true
        
        if (!inStock || (stockQuantity > 0 && inStock === false)) {
          set({ isLoading: false });
          return { success: false, error: 'This product is out of stock' };
        }

        // Check if adding quantity would exceed available stock (only if stock is tracked)
        const { cartItems } = get();
        const existingItem = cartItems.find(item => {
          const sameProduct = String(item.productId) === pid || String(item.id) === pid || String(item.product?.id) === pid;
          if (!sameProduct) return false;
          // Check if options match
          const itemColor = item.color || item.options?.color;
          const itemSize = item.size || item.options?.size;
          const normalizedItemColor = itemColor ? (typeof itemColor === 'string' ? itemColor : (itemColor.value || itemColor.name || itemColor)) : null;
          const normalizedItemSize = itemSize ? (typeof itemSize === 'string' ? itemSize : (itemSize.value || itemSize.label || itemSize)) : null;
          const sameColor = (!normalizedColor && !normalizedItemColor) || (normalizedColor === normalizedItemColor);
          const sameSize = (!normalizedSize && !normalizedItemSize) || (normalizedSize === normalizedItemSize);
          return sameColor && sameSize;
        });
        const currentQuantity = existingItem ? existingItem.quantity : 0;
        const newQuantity = currentQuantity + quantity;
        
        if (stockQuantity > 0 && newQuantity > stockQuantity) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: `Only ${stockQuantity} item(s) available in stock` 
          };
        }
      }

      // OPTIMISTIC UPDATE: Update local state immediately
      const { cartItems } = get();
      const existingItemIndex = cartItems.findIndex(item => {
        const sameProduct = String(item.productId) === pid || String(item.id) === pid || String(item.product?.id) === pid;
        if (!sameProduct) return false;
        // Check if options match
        const itemColor = item.color || item.options?.color;
        const itemSize = item.size || item.options?.size;
        const normalizedItemColor = itemColor ? (typeof itemColor === 'string' ? itemColor : (itemColor.value || itemColor.name || itemColor)) : null;
        const normalizedItemSize = itemSize ? (typeof itemSize === 'string' ? itemSize : (itemSize.value || itemSize.label || itemSize)) : null;
        const sameColor = (!normalizedColor && !normalizedItemColor) || (normalizedColor === normalizedItemColor);
        const sameSize = (!normalizedSize && !normalizedItemSize) || (normalizedSize === normalizedItemSize);
        return sameColor && sameSize;
      });

      let newItems;
      if (existingItemIndex >= 0) {
        // Update quantity of existing item with same options
        const existingItem = cartItems[existingItemIndex];
        const currentQuantity = safeParseNumber(existingItem.quantity, 1);
        const addQuantity = safeParseNumber(quantity, 1);
        const newQuantity = currentQuantity + addQuantity;
        
        const updatedItem = {
          ...existingItem,
          quantity: newQuantity,
          // Update options if provided
          ...(normalizedColor && { color: normalizedColor }),
          ...(normalizedSize && { size: normalizedSize }),
          options: {
            ...(existingItem.options || {}),
            ...(normalizedColor && { color: normalizedColor }),
            ...(normalizedSize && { size: normalizedSize }),
            ...otherOptions,
          },
        };
        
        newItems = cartItems.map((item, index) =>
          index === existingItemIndex ? updatedItem : item
        );
      } else {
        // Add new item to cart with options
        const uniqueId = `cart_${Date.now()}_${pid}_${Math.random().toString(36).substr(2, 9)}`;
        const newItem = {
          id: uniqueId,
          productId: pid,
          quantity: safeParseNumber(quantity, 1),
          // Store options at root level for easy access
          ...(normalizedColor && { color: normalizedColor }),
          ...(normalizedSize && { size: normalizedSize }),
          // Also store in options object for structured access
          options: {
            ...(normalizedColor && { color: normalizedColor }),
            ...(normalizedSize && { size: normalizedSize }),
            ...otherOptions,
          },
          ...(productData && {
            product: productData,
            title: productData.title || productData.name || '',
            image: productData.image || productData.images?.[0] || '',
            discountedPrice: safeParseNumber(productData.discountedPrice || productData.price),
            originalPrice: safeParseNumber(productData.originalPrice || productData.price),
            price: safeParseNumber(productData.discountedPrice || productData.originalPrice || productData.price),
          }),
        };
        newItems = [...cartItems, newItem];
      }

      const newTotals = calculateTotals(newItems);
      
      // OPTIMISTIC UPDATE: Update state immediately (don't wait for localStorage/API)
      set({ 
        cartItems: newItems, 
        totals: newTotals,
        isLoading: false 
      });
      
      // Save to localStorage in background (debounced)
      saveCartToStorage(newItems);
      
      // Remove from wishlist if it exists there (mutual exclusivity)
      try {
        const wishlistStore = useWishlistStore.getState();
        const isInWishlist = wishlistStore.isInWishlist(pid);
        if (isInWishlist) {
          // Remove from wishlist (don't await - let it run in background)
          wishlistStore.removeFromWishlist(pid).catch((err) => {
            console.debug('[Cart] Failed to remove from wishlist:', err.message);
          });
        }
      } catch (err) {
        // Silently fail if wishlist store is not available
        console.debug('[Cart] Could not check/remove from wishlist:', err.message);
      }
      
      // If authenticated, try to sync to database in background (non-blocking)
      if (isAuthenticated()) {
        // Don't await - let it run in background
        const saveToDb = async () => {
          try {
            await get().saveCart();
          } catch (err) {
            // Silently fail - localStorage is the primary storage
            if (err.message && !err.message.includes('Network') && !err.message.includes('timeout')) {
              console.debug('[Cart] Failed to sync to database (localStorage saved):', err.message);
            }
          }
        };
        
        if (typeof window !== 'undefined' && window.requestIdleCallback) {
          window.requestIdleCallback(saveToDb, { timeout: 1000 });
        } else {
          setTimeout(saveToDb, 200);
        }
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
      
      // Normalize productId to string for consistent comparison
      const pid = String(productId);
      
      // Remove from local cart
      const newItems = cartItems.filter(
        item => String(item.productId) !== pid && String(item.id) !== pid && String(item.product?.id) !== pid
      );
      const newTotals = calculateTotals(newItems);
      
      // Save to localStorage FIRST (primary storage)
      const saved = saveCartToStorage(newItems);
      if (!saved) {
        console.warn('[Cart] Failed to save to localStorage after remove');
      }
      
      set({ 
        cartItems: newItems, 
        totals: newTotals,
        isLoading: false 
      });
      
      // If authenticated, try to sync to database (async, non-blocking, don't fail if it doesn't work)
      if (isAuthenticated()) {
        const saveToDb = async () => {
          try {
          await get().saveCart();
          } catch (err) {
            // Silently fail - localStorage is the primary storage
            if (err.message && !err.message.includes('Network') && !err.message.includes('timeout')) {
              console.warn('[Cart] Failed to sync to database (localStorage saved):', err.message);
            }
          }
        };
        
        if (typeof window !== 'undefined' && window.requestIdleCallback) {
          window.requestIdleCallback(saveToDb, { timeout: 1000 });
        } else {
          setTimeout(saveToDb, 300);
        }
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
      
      // Normalize productId to string for consistent comparison
      const pid = String(productId);
      
      // Find the item to update
      const itemToUpdate = cartItems.find(
        item => String(item.productId) === pid || String(item.id) === pid || String(item.product?.id) === pid
      );
      
      if (!itemToUpdate) {
        throw new Error('Item not found in cart');
      }
      
      // Fetch fresh product data from database to get current stock
      let freshProduct = null;
      try {
        const productResponse = await apiService.products.getById(pid);
        console.log('[Cart] Product API response:', {
          success: productResponse?.success,
          hasData: !!productResponse?.data,
          hasProduct: !!productResponse?.data?.product,
          dataKeys: productResponse?.data ? Object.keys(productResponse.data) : [],
          productData: productResponse?.data?.product || productResponse?.data
        });
        
        if (productResponse?.success && productResponse?.data?.product) {
          freshProduct = productResponse.data.product;
        } else if (productResponse?.success && productResponse?.data) {
          // Sometimes the product is directly in data
          freshProduct = productResponse.data;
        }
      } catch (fetchError) {
        // If fetch fails, fall back to stored product data
        console.warn('[Cart] Failed to fetch fresh product data, using stored data:', fetchError.message);
        freshProduct = itemToUpdate.product || itemToUpdate;
      }
      
      // Use fresh product data if available, otherwise fall back to stored data
      const product = freshProduct || itemToUpdate.product || itemToUpdate;
      
      // Check if we have a color/size variant selected and need to check variant stock
      let stockToCheck = product;
      const itemColor = itemToUpdate.color || itemToUpdate.options?.color;
      const itemSize = itemToUpdate.size || itemToUpdate.options?.size;
      
      // If product has variants, check the specific variant stock
      if (freshProduct && (itemColor || itemSize)) {
        // Check color variant stock
        if (itemColor && freshProduct.colorVariants && Array.isArray(freshProduct.colorVariants)) {
          const colorVariant = freshProduct.colorVariants.find(
            v => v.color === itemColor || v.id === itemColor
          );
          if (colorVariant && (colorVariant.inStock !== undefined || colorVariant.stockQuantity !== undefined)) {
            stockToCheck = colorVariant;
            console.log('[Cart] Using color variant stock:', colorVariant);
          }
        }
        
        // Check size variant stock (size variants take precedence if both exist)
        if (itemSize && freshProduct.sizeVariants && Array.isArray(freshProduct.sizeVariants)) {
          const sizeVariant = freshProduct.sizeVariants.find(
            v => v.size === itemSize || v.id === itemSize
          );
          if (sizeVariant && (sizeVariant.inStock !== undefined || sizeVariant.stockQuantity !== undefined)) {
            stockToCheck = sizeVariant;
            console.log('[Cart] Using size variant stock:', sizeVariant);
          }
        }
      }
      
      console.log('[Cart] Stock check for product:', {
        productId: pid,
        itemColor,
        itemSize,
        baseProduct: {
          inStock: product.inStock,
          stockQuantity: product.stockQuantity,
          stock: product.stock
        },
        stockToCheck: {
          inStock: stockToCheck.inStock,
          stockQuantity: stockToCheck.stockQuantity,
          stock: stockToCheck.stock
        },
        requestedQuantity: quantity
      });
      
      // Check stock availability - use same logic as server-side validation
      // If product is explicitly marked as out of stock, reject
      // Note: inStock can be true, null, or undefined - only reject if explicitly false
      if (stockToCheck.inStock === false) {
        console.log('[Cart] Product rejected: inStock is explicitly false');
        set({ isLoading: false });
        return { success: false, error: 'This product is out of stock' };
      }
      
      // If stockQuantity is tracked (greater than 0), check if we have enough
      // If stockQuantity is 0 or null, but inStock is not false, allow the purchase
      // (some products may not track stock or use a different inventory system)
      const stockQuantity = stockToCheck.stockQuantity ?? stockToCheck.stock ?? null;
      if (stockQuantity != null && stockQuantity > 0 && quantity > stockQuantity) {
        console.log('[Cart] Product rejected: quantity exceeds stockQuantity', {
          requestedQuantity: quantity,
          stockQuantity: stockQuantity
        });
        set({ isLoading: false });
        return { 
          success: false, 
          error: `Only ${stockQuantity} item(s) available in stock` 
        };
      }
      
      console.log('[Cart] Stock check passed, updating quantity');
      
      // Update local cart - ensure quantity is a valid number
      const safeQuantity = safeParseNumber(quantity, 1);
      const newItems = cartItems.map(item =>
        (String(item.productId) === pid || String(item.id) === pid || String(item.product?.id) === pid)
          ? { 
              ...item, 
              quantity: safeQuantity,
              // Update product data with fresh data if available
              product: freshProduct ? normalizeCartItem({ product: freshProduct }).product : item.product,
              // Ensure price fields are valid numbers (use fresh data if available)
              price: safeParseNumber(freshProduct?.discountedPrice || freshProduct?.price || item.price || item.product?.price),
              discountedPrice: safeParseNumber(freshProduct?.discountedPrice || item.discountedPrice || item.product?.discountedPrice),
              originalPrice: safeParseNumber(freshProduct?.originalPrice || freshProduct?.price || item.originalPrice || item.product?.originalPrice),
            }
          : item
      );
      const newTotals = calculateTotals(newItems);
      
      // Save to localStorage FIRST (primary storage)
      const saved = saveCartToStorage(newItems);
      if (!saved) {
        console.warn('[Cart] Failed to save to localStorage after quantity update');
      }
      
      set({ 
        cartItems: newItems, 
        totals: newTotals,
        isLoading: false 
      });
      
      // If authenticated, try to sync to database (async, non-blocking, don't fail if it doesn't work)
      if (isAuthenticated()) {
        const saveToDb = async () => {
          try {
          await get().saveCart();
          } catch (err) {
            // Silently fail - localStorage is the primary storage
            if (err.message && !err.message.includes('Network') && !err.message.includes('timeout')) {
              console.warn('[Cart] Failed to sync to database (localStorage saved):', err.message);
            }
          }
        };
        
        if (typeof window !== 'undefined' && window.requestIdleCallback) {
          window.requestIdleCallback(saveToDb, { timeout: 1000 });
        } else {
          setTimeout(saveToDb, 300);
        }
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
      
      // Clear localStorage FIRST
      const saved = saveCartToStorage([]);
      if (!saved) {
        console.warn('[Cart] Failed to clear localStorage');
      }
      
      set({ 
        cartItems: [],
        totals: emptyTotals,
        isLoading: false 
      });
      
      // If authenticated, save to database as single object
      if (isAuthenticated()) {
        try {
        await get().saveCart();
        } catch (err) {
          console.error('[Cart] Failed to clear cart in database:', err);
          // localStorage is already cleared, so we can continue
        }
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

  // Check if item is in cart (with type-safe comparison)
  isInCart: (productId) => {
    const { cartItems } = get();
    const pid = String(productId); // Normalize to string for consistent comparison
    return cartItems.some(
      item => String(item.productId) === pid || String(item.id) === pid || String(item.product?.id) === pid
    );
  },

  // Get item quantity
  getItemQuantity: (productId) => {
    const { cartItems } = get();
    const pid = String(productId); // Normalize to string for consistent comparison
    const item = cartItems.find(
      item => String(item.productId) === pid || String(item.id) === pid || String(item.product?.id) === pid
    );
    return item ? item.quantity : 0;
  },

  // Get cart count (number of unique products, not total quantity)
  getCartCount: () => {
    const { cartItems } = get();
    return cartItems.length;
  },
  
  // Get total quantity (sum of all item quantities)
  getTotalQuantity: () => {
    const { totals, cartItems } = get();
    return totals.itemCount || cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  },
  
  // Force save to localStorage (manual trigger)
  forceSaveToLocalStorage: () => {
    const { cartItems } = get();
    return saveCartToStorage(cartItems);
  },
  };
};

export const useCartStore = create(storeCreator);

// Removed auto-save subscription - we now save explicitly in actions to avoid double-saving

// Client-side initialization - load from localStorage immediately, sync with API in background
if (typeof window !== 'undefined') {
  // Initialize immediately with localStorage data (already done in store creation)
  // Then sync with API in background if authenticated
  const initCart = () => {
    const store = useCartStore.getState();
    if (!store.hasLoadedCart && !store.isInitializing) {
      store.loadCart();
    }
  };
  
  // Use requestIdleCallback for non-blocking initialization
  if (window.requestIdleCallback) {
    window.requestIdleCallback(initCart, { timeout: 1000 });
  } else {
    setTimeout(initCart, 50);
  }
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
  const getTotalQuantity = useCartStore((state) => state.getTotalQuantity);

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
    getTotalQuantity,
  };
};
