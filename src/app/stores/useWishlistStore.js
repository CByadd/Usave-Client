"use client";

import { create } from 'zustand';
import { apiService } from '../services/api/apiClient';
import { isAuthenticated } from '../lib/auth';

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

// Save wishlist to localStorage
const saveWishlistToStorage = (items) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving wishlist to localStorage:', err);
  }
};

export const useWishlistStore = create((set, get) => ({
  wishlistItems: [],
  isLoading: false,
  isSyncing: false,
  error: null,
  hasLoadedWishlist: false,

  // Load wishlist from API (for authenticated users) or localStorage
  loadWishlist: async () => {
    set({ isLoading: true, error: null });

    try {
      let loadedItems = [];

      // If authenticated, load from API
      if (isAuthenticated()) {
        try {
          const response = await apiService.wishlist.get();
          if (response.success && response.data?.items) {
            // API has data, use it
            loadedItems = response.data.items;
            set({ wishlistItems: loadedItems, isLoading: false });
            // Also save to localStorage for offline access
            saveWishlistToStorage(loadedItems);
            return { items: loadedItems };
          }
        } catch (err) {
          // API failed, try localStorage
          console.log('API wishlist unavailable, loading from localStorage');
          loadedItems = loadWishlistFromStorage();
        }
      } else {
        // Not authenticated, load from localStorage
        loadedItems = loadWishlistFromStorage();
      }

      set({ wishlistItems: loadedItems, isLoading: false });
      return { items: loadedItems };
    } catch (err) {
      console.error('Error loading wishlist:', err);
      set({ 
        error: 'Failed to load wishlist',
        isLoading: false 
      });
      return { items: [] };
    }
  },

  // Add to wishlist
  addToWishlist: async (productOrId) => {
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

      const { wishlistItems } = get();

      // Check if already in wishlist
      if (wishlistItems.some(item => 
        item.productId === productId || item.id === productId || item.product?.id === productId
      )) {
        set({ isLoading: false });
        return { success: true, alreadyInWishlist: true };
      }

      // Add to local state immediately
      const newItem = {
        id: `wishlist_${Date.now()}_${productId}`,
        productId: productId,
        ...(productData && {
          product: productData,
          title: productData.title || productData.name,
          image: productData.image,
          discountedPrice: productData.discountedPrice || productData.price,
          originalPrice: productData.originalPrice || productData.price,
          price: productData.discountedPrice || productData.originalPrice || productData.price,
        }),
      };

      const newItems = [...wishlistItems, newItem];
      set({ wishlistItems: newItems, isLoading: false });
      saveWishlistToStorage(newItems);

      // Try to sync with API if authenticated
      if (isAuthenticated()) {
        try {
          const response = await apiService.wishlist.addItem(productId);
          if (response.success) {
            // Reload from API to get server-side updates
            await get().loadWishlist();
            return { success: true };
          }
        } catch (err) {
          // API failed, but localStorage is updated
          console.log('API add to wishlist unavailable, saved to localStorage');
        }
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to add item to wishlist';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      return { success: false, error: errorMessage };
    }
  },

  // Remove from wishlist
  removeFromWishlist: async (productId) => {
    set({ isLoading: true, error: null });

    try {
      const { wishlistItems } = get();
      
      // Remove from local state immediately
      const newItems = wishlistItems.filter(
        item => !(item.productId === productId || item.id === productId || item.product?.id === productId)
      );
      
      set({ wishlistItems: newItems, isLoading: false });
      saveWishlistToStorage(newItems);

      // Try to sync with API if authenticated
      if (isAuthenticated()) {
        try {
          const response = await apiService.wishlist.removeItem(productId);
          if (response.success) {
            // Reload from API
            await get().loadWishlist();
            return { success: true };
          }
        } catch (err) {
          // Check if error is about item not found
          const errorMessage = err.response?.data?.error || err.message || '';
          if (errorMessage.includes('not found') || errorMessage.includes('Wishlist item not found')) {
            // Item was only in localStorage, removal successful
            return { success: true };
          }
          console.log('API remove from wishlist unavailable, removed from localStorage');
        }
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to remove item from wishlist';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      return { success: false, error: errorMessage };
    }
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

  // Check if item is in wishlist
  isInWishlist: (productId) => {
    const { wishlistItems } = get();
    return wishlistItems.some(
      item => item.productId === productId || item.id === productId || item.product?.id === productId
    );
  },

  // Get wishlist count
  getWishlistCount: () => {
    const { wishlistItems } = get();
    return wishlistItems.length;
  },
}));

// Client-side initialization
if (typeof window !== 'undefined') {
  setTimeout(() => {
    const store = useWishlistStore.getState();
    if (!store.hasLoadedWishlist && isAuthenticated()) {
      useWishlistStore.setState({ hasLoadedWishlist: true });
      store.loadWishlist();
    }
  }, 100);
}

// Export a hook that matches the old API for compatibility
export const useWishlist = () => {
  const wishlistItems = useWishlistStore((state) => state.wishlistItems);
  const isLoading = useWishlistStore((state) => state.isLoading);
  const isSyncing = useWishlistStore((state) => state.isSyncing);
  const error = useWishlistStore((state) => state.error);
  const addToWishlist = useWishlistStore((state) => state.addToWishlist);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const loadWishlist = useWishlistStore((state) => state.loadWishlist);
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
    isInWishlist,
    getWishlistCount,
  };
};

