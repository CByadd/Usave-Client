"use client";

import { create } from 'zustand';
import { apiService } from '../services/api/apiClient';
import { isAuthenticated } from '../lib/auth';

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

// Save cart to localStorage with retry mechanism
const saveCartToStorage = (items, retries = 3) => {
  if (typeof window === 'undefined') return;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const serialized = JSON.stringify(items);
      localStorage.setItem(CART_STORAGE_KEY, serialized);
      
      // Verify the save was successful
      const verification = localStorage.getItem(CART_STORAGE_KEY);
      if (verification === serialized) {
        console.log('[Cart] Successfully saved to localStorage');
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
          // Clear old cart data and try once more
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
      
      // Normalize productId to string for consistent comparison
      const pid = String(productId);

      // Check stock availability if product data is available
      if (productData) {
        const stockQuantity = productData.stockQuantity ?? productData.stock ?? 0;
        const inStock = productData.inStock !== false && productData.inStock !== null;
        const hasStock = inStock && stockQuantity > 0;
        
        if (!hasStock) {
          set({ isLoading: false });
          return { success: false, error: 'This product is out of stock' };
        }

        // Check if adding quantity would exceed available stock
        const { cartItems } = get();
        const existingItem = cartItems.find(
          item => String(item.productId) === pid || String(item.id) === pid || String(item.product?.id) === pid
        );
        const currentQuantity = existingItem ? existingItem.quantity : 0;
        const newQuantity = currentQuantity + quantity;
        
        if (newQuantity > stockQuantity) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: `Only ${stockQuantity} item(s) available in stock` 
          };
        }
      }

      const { cartItems } = get();
      const existingItem = cartItems.find(
        item => String(item.productId) === pid || String(item.id) === pid || String(item.product?.id) === pid
      );

      let newItems;
      if (existingItem) {
        // Update quantity of existing item - ensure quantity is a valid number
        const currentQuantity = safeParseNumber(existingItem.quantity, 1);
        const addQuantity = safeParseNumber(quantity, 1);
        const newQuantity = currentQuantity + addQuantity;
        
        // If product data is provided, ensure we update all product details
        let updatedItem = { ...existingItem, quantity: newQuantity };
        
        if (productData) {
          // Update product details if provided
          updatedItem = {
            ...updatedItem,
            product: {
              ...existingItem.product,
              id: productData.id || existingItem.product?.id || productId,
              productId: productData.productId || existingItem.product?.productId || productId,
              title: productData.title || productData.name || existingItem.product?.title || existingItem.title || '',
              name: productData.name || productData.title || existingItem.product?.name || existingItem.title || '',
              slug: productData.slug || existingItem.product?.slug || '',
              image: productData.image || productData.images?.[0] || existingItem.product?.image || existingItem.image || '',
              images: Array.isArray(productData.images) ? productData.images : (existingItem.product?.images || []),
              description: productData.description || existingItem.product?.description || '',
              originalPrice: safeParseNumber(productData.originalPrice || productData.price || productData.regularPrice || existingItem.product?.originalPrice || existingItem.originalPrice),
              discountedPrice: safeParseNumber(productData.discountedPrice || productData.salePrice || productData.originalPrice || productData.price || existingItem.product?.discountedPrice || existingItem.discountedPrice),
              price: safeParseNumber(productData.discountedPrice || productData.salePrice || productData.originalPrice || productData.price || productData.regularPrice || existingItem.product?.price || existingItem.price),
              regularPrice: safeParseNumber(productData.regularPrice || productData.originalPrice || productData.price || existingItem.product?.regularPrice || existingItem.originalPrice),
              salePrice: safeParseNumber(productData.salePrice || productData.discountedPrice || existingItem.product?.salePrice || existingItem.discountedPrice),
              stockQuantity: safeParseNumber(productData.stockQuantity ?? productData.stock ?? existingItem.product?.stockQuantity ?? existingItem.stockQuantity ?? 0),
              stock: safeParseNumber(productData.stock ?? productData.stockQuantity ?? existingItem.product?.stock ?? existingItem.stockQuantity ?? 0),
              inStock: productData.inStock !== undefined ? (productData.inStock !== false && productData.inStock !== null) : (existingItem.product?.inStock ?? existingItem.inStock ?? true),
              category: productData.category || productData.categoryId || existingItem.product?.category || existingItem.category || '',
              categoryId: productData.categoryId || productData.category || existingItem.product?.categoryId || existingItem.category || '',
              tags: Array.isArray(productData.tags) ? productData.tags : (existingItem.product?.tags || []),
              rating: safeParseNumber(productData.rating ?? existingItem.product?.rating),
              reviews: safeParseNumber(productData.reviews ?? existingItem.product?.reviews),
              ...productData,
            },
            // Update root level fields
            title: productData.title || productData.name || existingItem.title || '',
            name: productData.name || productData.title || existingItem.title || '',
            image: productData.image || productData.images?.[0] || existingItem.image || '',
            price: safeParseNumber(productData.discountedPrice || productData.salePrice || productData.originalPrice || productData.price || productData.regularPrice || existingItem.price || existingItem.product?.price),
            discountedPrice: safeParseNumber(productData.discountedPrice || productData.salePrice || productData.originalPrice || productData.price || existingItem.discountedPrice || existingItem.product?.discountedPrice),
            originalPrice: safeParseNumber(productData.originalPrice || productData.price || productData.regularPrice || existingItem.originalPrice || existingItem.product?.originalPrice),
            regularPrice: safeParseNumber(productData.regularPrice || productData.originalPrice || productData.price || existingItem.originalPrice || existingItem.product?.regularPrice),
            salePrice: safeParseNumber(productData.salePrice || productData.discountedPrice || existingItem.discountedPrice || existingItem.product?.salePrice),
            stockQuantity: safeParseNumber(productData.stockQuantity ?? productData.stock ?? existingItem.stockQuantity ?? existingItem.product?.stockQuantity ?? 0),
            stock: safeParseNumber(productData.stock ?? productData.stockQuantity ?? existingItem.stockQuantity ?? existingItem.product?.stock ?? 0),
            inStock: productData.inStock !== undefined ? (productData.inStock !== false && productData.inStock !== null) : (existingItem.inStock ?? true),
          };
        } else {
          // Just ensure price fields are valid numbers
          updatedItem = {
            ...updatedItem,
            price: safeParseNumber(existingItem.price || existingItem.product?.price),
            discountedPrice: safeParseNumber(existingItem.discountedPrice || existingItem.product?.discountedPrice),
            originalPrice: safeParseNumber(existingItem.originalPrice || existingItem.product?.originalPrice),
          };
        }
        
        newItems = cartItems.map(item =>
          (String(item.productId) === pid || String(item.id) === pid || String(item.product?.id) === pid)
            ? updatedItem
            : item
        );
      } else {
        // Add new item to cart with complete product details
        const newItem = productData
          ? {
              id: pid,
              productId: pid,
              // Store complete product object with all details properly mapped
              product: {
                id: String(productData.id || pid),
                productId: String(productData.productId || pid),
                title: productData.title || productData.name || '',
                name: productData.name || productData.title || '',
                slug: productData.slug || '',
                image: productData.image || productData.images?.[0] || '',
                images: Array.isArray(productData.images) ? productData.images : (productData.image ? [productData.image] : []),
                description: productData.description || '',
                originalPrice: safeParseNumber(productData.originalPrice || productData.price || productData.regularPrice),
                discountedPrice: safeParseNumber(productData.discountedPrice || productData.salePrice || productData.originalPrice || productData.price),
                price: safeParseNumber(productData.discountedPrice || productData.salePrice || productData.originalPrice || productData.price || productData.regularPrice),
                regularPrice: safeParseNumber(productData.regularPrice || productData.originalPrice || productData.price),
                salePrice: safeParseNumber(productData.salePrice || productData.discountedPrice),
                stockQuantity: safeParseNumber(productData.stockQuantity ?? productData.stock ?? 0),
                stock: safeParseNumber(productData.stock ?? productData.stockQuantity ?? 0),
                inStock: productData.inStock !== false && productData.inStock !== null && productData.inStock !== undefined,
                category: productData.category || productData.categoryId || '',
                categoryId: productData.categoryId || productData.category || '',
                tags: Array.isArray(productData.tags) ? productData.tags : [],
                rating: safeParseNumber(productData.rating),
                reviews: safeParseNumber(productData.reviews),
                // Preserve any other product fields
                ...productData
              },
              // Also store commonly used fields at root level for easy access
              title: productData.title || productData.name || '',
              name: productData.name || productData.title || '',
              image: productData.image || productData.images?.[0] || '',
              quantity: safeParseNumber(quantity, 1),
              price: safeParseNumber(productData.discountedPrice || productData.salePrice || productData.originalPrice || productData.price || productData.regularPrice),
              discountedPrice: safeParseNumber(productData.discountedPrice || productData.salePrice || productData.originalPrice || productData.price),
              originalPrice: safeParseNumber(productData.originalPrice || productData.price || productData.regularPrice),
              regularPrice: safeParseNumber(productData.regularPrice || productData.originalPrice || productData.price),
              salePrice: safeParseNumber(productData.salePrice || productData.discountedPrice),
              stockQuantity: safeParseNumber(productData.stockQuantity ?? productData.stock ?? 0),
              stock: safeParseNumber(productData.stock ?? productData.stockQuantity ?? 0),
              inStock: productData.inStock !== false && productData.inStock !== null && productData.inStock !== undefined,
            }
          : {
              id: pid,
              productId: pid,
              quantity: safeParseNumber(quantity, 1),
              price: 0,
              discountedPrice: 0,
              originalPrice: 0,
            };
        newItems = [...cartItems, newItem];
      }

      const newTotals = calculateTotals(newItems);
      
      // Save to localStorage FIRST (before state update for reliability)
      // localStorage is the primary storage, API is just for syncing
      const saved = saveCartToStorage(newItems);
      if (!saved) {
        console.warn('[Cart] Failed to save to localStorage, but continuing with state update');
      }
      
      set({ 
        cartItems: newItems, 
        totals: newTotals,
        isLoading: false 
      });
      
      // If authenticated, try to sync to database (async, non-blocking, don't fail if it doesn't work)
      if (isAuthenticated()) {
        // Use requestIdleCallback if available, otherwise setTimeout
        const saveToDb = async () => {
          try {
          await get().saveCart();
          } catch (err) {
            // Silently fail - localStorage is the primary storage
            // Only log if it's a meaningful error
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
      
      // Check stock availability if product data is available
      const product = itemToUpdate.product || itemToUpdate;
      if (product.stockQuantity !== undefined || product.stock !== undefined || product.inStock !== undefined) {
        const stockQuantity = product.stockQuantity ?? product.stock ?? 0;
        const inStock = product.inStock !== false && product.inStock !== null;
        const hasStock = inStock && stockQuantity > 0;
        
        if (!hasStock) {
          set({ isLoading: false });
          return { success: false, error: 'This product is out of stock' };
        }
        
        if (quantity > stockQuantity) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: `Only ${stockQuantity} item(s) available in stock` 
          };
        }
      }
      
      // Update local cart - ensure quantity is a valid number
      const safeQuantity = safeParseNumber(quantity, 1);
      const newItems = cartItems.map(item =>
        (String(item.productId) === pid || String(item.id) === pid || String(item.product?.id) === pid)
          ? { 
              ...item, 
              quantity: safeQuantity,
              // Ensure price fields are valid numbers
              price: safeParseNumber(item.price || item.product?.price),
              discountedPrice: safeParseNumber(item.discountedPrice || item.product?.discountedPrice),
              originalPrice: safeParseNumber(item.originalPrice || item.product?.originalPrice),
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

  // Get cart count
  getCartCount: () => {
    const { totals, cartItems } = get();
    return totals.itemCount || cartItems.reduce((sum, item) => sum + item.quantity, 0);
  },
  
  // Force save to localStorage (manual trigger)
  forceSaveToLocalStorage: () => {
    const { cartItems } = get();
    return saveCartToStorage(cartItems);
  },
  };
};

export const useCartStore = create(storeCreator);

// Add subscription to auto-save to localStorage on cart changes
if (typeof window !== 'undefined') {
  useCartStore.subscribe(
    (state) => state.cartItems,
    (cartItems) => {
      // Only save if cart has actually changed (not during initial load)
      const currentState = useCartStore.getState();
      if (currentState.hasLoadedCart && cartItems) {
        try {
          saveCartToStorage(cartItems);
        } catch (err) {
          console.error('[Cart] Auto-save to localStorage failed:', err);
        }
      }
    },
    { equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b) }
  );
}

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
