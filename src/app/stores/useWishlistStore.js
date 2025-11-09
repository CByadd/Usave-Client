"use client";

import { create } from 'zustand';
import { apiService } from '../services/api/apiClient';
import { isAuthenticated } from '../lib/auth';
import { useCartStore } from './useCartStore';

const WISHLIST_STORAGE_KEY = 'usave_wishlist';

// Load wishlist from localStorage
const loadWishlistFromStorage = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Error loading wishlist from localStorage:', err);
  }
  return [];
};

// Debounced save to localStorage to avoid blocking
let saveTimeout = null;
const saveWishlistToStorage = (items) => {
  if (typeof window === 'undefined') return;
  
  // Clear any pending saves
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  // Debounce the save by 100ms
  saveTimeout = setTimeout(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Error saving wishlist to localStorage:', err);
    }
  }, 100);
};

export const useWishlistStore = create((set, get) => {
  // Initialize from localStorage synchronously for immediate rendering
  const initialItems = typeof window !== 'undefined' ? loadWishlistFromStorage() : [];

  return {
    wishlistItems: initialItems,
    isLoading: false,
    isSyncing: false,
    error: null,
    hasLoadedWishlist: typeof window !== 'undefined', // Mark as loaded if we have localStorage data
    isInitializing: false, // Prevent multiple simultaneous initializations

  // Load wishlist from API (for authenticated users) or localStorage
  loadWishlist: async (forceReload = false) => {
    const { isInitializing, hasLoadedWishlist, wishlistItems } = get();
    
    // Prevent multiple simultaneous loads
    if (isInitializing && !forceReload) {
      return { items: wishlistItems };
    }

    // If already loaded and not forcing reload, just return current state
    if (hasLoadedWishlist && !forceReload) {
      return { items: wishlistItems };
    }

    set({ isInitializing: true, error: null });

    try {
      let loadedItems = [];

      // Load from current state first (already loaded from localStorage)
      const currentItems = get().wishlistItems;
      if (currentItems && currentItems.length > 0) {
        loadedItems = currentItems;
      } else {
        // If no items in state, load from localStorage
        loadedItems = loadWishlistFromStorage();
        // Update state immediately with localStorage data
        set({ wishlistItems: loadedItems, isLoading: false });
      }

      // If authenticated and we need to sync, show loading state
      if (isAuthenticated() && forceReload) {
        set({ isLoading: true });
      }

      // If authenticated, sync from API in the background (non-blocking)
      if (isAuthenticated()) {
        const syncWithAPI = async () => {
          try {
            if (forceReload) {
              set({ isLoading: true });
            }
            const response = await apiService.wishlist.get();
            if (response.success && response.data?.items) {
              const apiItems = response.data.items;
              // Only update if API has different data
              const currentIds = new Set(loadedItems.map(item => String(item.id || item.productId)));
              const apiIds = new Set(apiItems.map(item => String(item.id || item.productId)));
              const hasChanges = apiItems.length !== loadedItems.length || 
                ![...apiIds].every(id => currentIds.has(id));
              
              if (hasChanges) {
                loadedItems = apiItems;
                saveWishlistToStorage(loadedItems);
                set({ wishlistItems: loadedItems });
              }
            }
          } catch (err) {
            // API sync failed silently - localStorage is primary source
            console.debug('[Wishlist] API sync failed, using localStorage data:', err.message);
          } finally {
            set({ isLoading: false });
          }
        };

        // Sync in background without blocking (only if forceReload, otherwise delay more)
        if (forceReload) {
          await syncWithAPI();
        } else {
          if (typeof window !== 'undefined' && window.requestIdleCallback) {
            window.requestIdleCallback(syncWithAPI, { timeout: 2000 });
          } else {
            setTimeout(syncWithAPI, 100);
          }
        }
      }

      set({ 
        wishlistItems: loadedItems,
        isLoading: false,
        isInitializing: false,
        hasLoadedWishlist: true
      });
      return { items: loadedItems };
    } catch (err) {
      console.error('Error loading wishlist:', err);
      set({ 
        error: 'Failed to load wishlist',
        isLoading: false,
        isInitializing: false
      });
      return { items: [] };
    }
  },

  // Add to wishlist with optimistic updates
  addToWishlist: async (productOrId) => {
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
      return { success: false, error: 'Product ID is required' };
    }

    const { wishlistItems } = get();

    // Normalize productId to string for consistent comparison
    const pid = String(productId);
    
    // Check if already in wishlist
    if (wishlistItems.some(item => 
      String(item.productId) === pid || String(item.id) === pid || String(item.product?.id) === pid
    )) {
      return { success: true, alreadyInWishlist: true };
    }

    // OPTIMISTIC UPDATE: Add to local state immediately (don't wait for API)
    const uniqueId = `wishlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${productId}`;
    const newItem = {
      id: uniqueId,
      productId: String(productId),
      ...(productData && {
        product: {
          id: String(productData.id || productId),
          productId: String(productData.productId || productId),
          title: productData.title || productData.name || '',
          name: productData.name || productData.title || '',
          slug: productData.slug || '',
          image: productData.image || productData.images?.[0] || '',
          images: Array.isArray(productData.images) ? productData.images : (productData.image ? [productData.image] : []),
          description: productData.description || '',
          originalPrice: typeof productData.originalPrice === 'number' ? productData.originalPrice : (productData.originalPrice || productData.price || productData.regularPrice || 0),
          discountedPrice: typeof productData.discountedPrice === 'number' ? productData.discountedPrice : (productData.discountedPrice || productData.salePrice || productData.originalPrice || productData.price || 0),
          price: typeof productData.price === 'number' ? productData.price : (productData.discountedPrice || productData.salePrice || productData.originalPrice || productData.price || productData.regularPrice || 0),
          regularPrice: typeof productData.regularPrice === 'number' ? productData.regularPrice : (productData.regularPrice || productData.originalPrice || productData.price || 0),
          salePrice: typeof productData.salePrice === 'number' ? productData.salePrice : (productData.salePrice || productData.discountedPrice || 0),
          stockQuantity: typeof productData.stockQuantity === 'number' ? productData.stockQuantity : (productData.stockQuantity ?? productData.stock ?? 0),
          stock: typeof productData.stock === 'number' ? productData.stock : (productData.stock ?? productData.stockQuantity ?? 0),
          inStock: productData.inStock !== false && productData.inStock !== null && productData.inStock !== undefined,
          category: productData.category || productData.categoryId || '',
          categoryId: productData.categoryId || productData.category || '',
          tags: Array.isArray(productData.tags) ? productData.tags : [],
          rating: typeof productData.rating === 'number' ? productData.rating : (productData.rating || 0),
          reviews: typeof productData.reviews === 'number' ? productData.reviews : (productData.reviews || productData.reviewCount || 0),
          reviewCount: typeof productData.reviewCount === 'number' ? productData.reviewCount : (productData.reviewCount || productData.reviews || 0),
          ...productData,
        },
        title: productData.title || productData.name || '',
        name: productData.name || productData.title || '',
        image: productData.image || productData.images?.[0] || '',
        discountedPrice: typeof productData.discountedPrice === 'number' ? productData.discountedPrice : (productData.discountedPrice || productData.salePrice || productData.originalPrice || productData.price || 0),
        originalPrice: typeof productData.originalPrice === 'number' ? productData.originalPrice : (productData.originalPrice || productData.price || productData.regularPrice || 0),
        price: typeof productData.price === 'number' ? productData.price : (productData.discountedPrice || productData.salePrice || productData.originalPrice || productData.price || productData.regularPrice || 0),
      }),
    };

    const newItems = [...wishlistItems, newItem];
    
    // Update state immediately (optimistic update)
    set({ wishlistItems: newItems, isLoading: false });
    saveWishlistToStorage(newItems);

    // Remove from cart if it exists there (mutual exclusivity)
    try {
      const cartStore = useCartStore.getState();
      const isInCart = cartStore.isInCart(pid);
      if (isInCart) {
        // Remove from cart (don't await - let it run in background)
        cartStore.removeFromCart(pid).catch((err) => {
          console.debug('[Wishlist] Failed to remove from cart:', err.message);
        });
      }
    } catch (err) {
      // Silently fail if cart store is not available
      console.debug('[Wishlist] Could not check/remove from cart:', err.message);
    }

    // Sync with API in background (non-blocking)
    if (isAuthenticated()) {
      // Don't await - let it run in background
      apiService.wishlist.addItem(productId).catch((err) => {
        // If API fails, keep the item in localStorage
        console.debug('API add to wishlist failed, kept in localStorage:', err.message);
      });
    }

    return { success: true };
  },

  // Remove from wishlist with optimistic updates
  removeFromWishlist: async (productId) => {
    const { wishlistItems } = get();
    
    // Normalize productId to string for consistent comparison
    const pid = String(productId);
    
    // OPTIMISTIC UPDATE: Remove from local state immediately
    const newItems = wishlistItems.filter(
      item => !(String(item.productId) === pid || String(item.id) === pid || String(item.product?.id) === pid)
    );
    
    // Update state immediately (optimistic update)
    set({ wishlistItems: newItems, isLoading: false });
    saveWishlistToStorage(newItems);

    // Sync with API in background (non-blocking)
    if (isAuthenticated()) {
      // Don't await - let it run in background
      apiService.wishlist.removeItem(productId).catch((err) => {
        // If API fails, item is already removed from localStorage
        const errorMessage = err.response?.data?.error || err.message || '';
        if (!errorMessage.includes('not found') && !errorMessage.includes('Wishlist item not found')) {
          console.debug('API remove from wishlist failed, already removed from localStorage:', err.message);
        }
      });
    }

    return { success: true };
  },

  // Toggle wishlist (add if not present, remove if present)
  toggleWishlist: async (productOrId) => {
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
      return { success: false, error: 'Product ID is required' };
    }

    const { wishlistItems, isInWishlist } = get();
    const inWishlist = isInWishlist(productId);

    if (inWishlist) {
      return await get().removeFromWishlist(productId);
    } else {
      return await get().addToWishlist(productData || productId);
    }
  },

  // Sync local wishlist items to the authenticated user's account
  syncLocalToServer: async () => {
    if (!isAuthenticated()) {
      return { success: false, error: 'Not authenticated' };
    }

    const { wishlistItems } = get();
    if (!wishlistItems || wishlistItems.length === 0) {
      // Nothing to sync, but ensure we pull the server state
      await get().loadWishlist(true);
      return { success: true };
    }

    set({ isSyncing: true });

    try {
      // Fetch existing wishlist from API to avoid duplicate adds
      let existingIds = new Set();
      try {
        const response = await apiService.wishlist.get();
        if (response?.success && Array.isArray(response.data?.items)) {
          existingIds = new Set(
            response.data.items
              .map((item) => {
                const id = item?.productId || item?.id || item?.product?.id;
                return id ? String(id) : null;
              })
              .filter(Boolean)
          );
        }
      } catch (err) {
        console.debug('[Wishlist] Failed to load existing wishlist before sync:', err.message);
      }

      const itemsToSync = wishlistItems.filter((item) => {
        const productId = item?.productId || item?.id || item?.product?.id;
        if (!productId) {
          return false;
        }
        const key = String(productId);
        return !existingIds.has(key);
      });

      if (itemsToSync.length > 0) {
        await Promise.allSettled(
          itemsToSync.map(async (item) => {
            const productId = item?.productId || item?.id || item?.product?.id;
            if (!productId) return;
            try {
              await apiService.wishlist.addItem(productId);
            } catch (err) {
              console.debug('[Wishlist] Failed to sync wishlist item, keeping locally:', err.message);
            }
          })
        );
      }

      // Reload wishlist to ensure local state matches server data
      await get().loadWishlist(true);

      set({ isSyncing: false });
      return { success: true };
    } catch (err) {
      console.error('[Wishlist] Failed to sync local wishlist:', err);
      set({ isSyncing: false, error: err.message || 'Failed to sync wishlist' });
      return { success: false, error: err.message || 'Failed to sync wishlist' };
    }
  },

  // Clear wishlist
  clearWishlist: async () => {
    set({ isLoading: true, error: null });

    try {
      set({ wishlistItems: [], isLoading: false });
      saveWishlistToStorage([]);

      // Try to sync with API if authenticated
      if (isAuthenticated()) {
        try {
          const response = await apiService.wishlist.clear?.();
          if (response?.success) {
            await get().loadWishlist();
            return { success: true };
          }
        } catch (err) {
          console.log('API clear wishlist unavailable, cleared localStorage');
        }
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to clear wishlist';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      return { success: false, error: errorMessage };
    }
  },

  // Check if item is in wishlist (with type-safe comparison)
  isInWishlist: (productId) => {
    const { wishlistItems } = get();
    const pid = String(productId); // Normalize to string for consistent comparison
    return wishlistItems.some(
      item => String(item.productId) === pid || String(item.id) === pid || String(item.product?.id) === pid
    );
  },

  // Get wishlist count
  getWishlistCount: () => {
    const { wishlistItems } = get();
    return wishlistItems.length;
  },
  }
});

// Client-side initialization - load from localStorage immediately, sync with API in background
if (typeof window !== 'undefined') {
  // Initialize immediately with localStorage data (already done in store creation)
  // Then sync with API in background if authenticated
  const initWishlist = () => {
    const store = useWishlistStore.getState();
    if (!store.hasLoadedWishlist && !store.isInitializing) {
      store.loadWishlist();
    }
  };
  
  // Use requestIdleCallback for non-blocking initialization
  if (window.requestIdleCallback) {
    window.requestIdleCallback(initWishlist, { timeout: 1000 });
  } else {
    setTimeout(initWishlist, 50);
  }
}

// Export a hook with optimized selectors to prevent unnecessary re-renders
export const useWishlist = () => {
  // Use individual selectors to prevent re-renders when unrelated state changes
  const wishlistItems = useWishlistStore((state) => state.wishlistItems);
  const isLoading = useWishlistStore((state) => state.isLoading);
  const isSyncing = useWishlistStore((state) => state.isSyncing);
  const error = useWishlistStore((state) => state.error);
  const addToWishlist = useWishlistStore((state) => state.addToWishlist);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const loadWishlist = useWishlistStore((state) => state.loadWishlist);
  const syncLocalToServer = useWishlistStore((state) => state.syncLocalToServer);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);
  const getWishlistCount = useWishlistStore((state) => state.getWishlistCount);

  return {
    wishlistItems,
    isLoading,
    isSyncing,
    error,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    loadWishlist,
    syncLocalToServer,
    isInWishlist,
    getWishlistCount,
  };
};

// Optimized hook for just checking if item is in wishlist (prevents unnecessary re-renders)
export const useIsInWishlist = (productId) => {
  return useWishlistStore((state) => {
    if (!productId) return false;
    const pid = String(productId);
    return state.wishlistItems.some(
      item => String(item.productId) === pid || String(item.id) === pid || String(item.product?.id) === pid
    );
  });
};

