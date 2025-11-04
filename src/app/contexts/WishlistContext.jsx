"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api/apiClient';
import { isAuthenticated } from '../lib/auth';

const WishlistContext = createContext(null);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  
  // If context is available, use it (works in both SSR and client)
  if (context) {
    return context;
  }
  
  // Context is not available - return safe defaults
  // This can happen during SSR if provider hasn't rendered yet, or if setup is wrong
  const defaults = {
    wishlistItems: [],
    isLoading: false,
    isSyncing: false,
    error: null,
    addToWishlist: async () => ({ success: false, error: 'Please login to add items to wishlist' }),
    removeFromWishlist: async () => ({ success: false, error: 'Please login to manage wishlist' }),
    toggleWishlist: async () => ({ success: false, error: 'Please login to manage wishlist' }),
    clearWishlist: async () => ({ success: false, error: 'Please login to manage wishlist' }),
    loadWishlist: async () => {},
    isInWishlist: () => false,
    getWishlistCount: () => 0,
  };
  
  // Only warn on client side (not during SSR/build)
  if (typeof window !== 'undefined') {
    console.warn('useWishlist must be used within a WishlistProvider. Make sure Providers wrap your app.');
  }
  
  return defaults;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const syncTimeoutRef = useRef(null);
  const hasLoadedWishlist = useRef(false);

  // Load wishlist from API (for authenticated users)
  const loadWishlist = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // If authenticated, load from API
      if (isAuthenticated()) {
        try {
          const response = await apiService.wishlist.get();
          if (response.success && response.data?.items) {
            // API has data, use it
            setWishlistItems(response.data.items);
            return { items: response.data.items };
          }
        } catch (err) {
          // API failed
          console.log('API wishlist unavailable');
          setWishlistItems([]);
        }
      } else {
        // Not authenticated, empty wishlist
        setWishlistItems([]);
      }
      return { items: wishlistItems };
    } catch (err) {
      console.error('Error loading wishlist:', err);
      setError('Failed to load wishlist');
      return { items: [] };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark component as mounted on client (after hydration) and load wishlist
  useEffect(() => {
    setIsMounted(true);
    
    // Load wishlist from API on mount if authenticated (only once)
    if (!hasLoadedWishlist.current && typeof window !== 'undefined') {
      hasLoadedWishlist.current = true;
      loadWishlist();
    }
  }, [loadWishlist]);

  // Add to wishlist
  const addToWishlist = useCallback(async (productOrId) => {
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

      // Check if already in wishlist
      if (wishlistItems.some(item => 
        item.productId === productId || item.id === productId || item.product?.id === productId
      )) {
        return { success: true, alreadyInWishlist: true };
      }

      // Update local state immediately
      setWishlistItems(prevItems => {
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
        return [...prevItems, newItem];
      });

      // Try to sync with API if authenticated
      if (isAuthenticated()) {
        try {
          const response = await apiService.wishlist.addItem(productId);
          if (response.success) {
            // Reload from API to get server-side updates
            await loadWishlist();
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
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [wishlistItems, loadWishlist]);

  // Remove from wishlist
  const removeFromWishlist = useCallback(async (productId) => {
    setIsLoading(true);
    setError(null);

    try {
      // Update local state immediately
      setWishlistItems(prevItems => {
        return prevItems.filter(
          item => !(item.productId === productId || item.id === productId || item.product?.id === productId)
        );
      });

      // Try to sync with API if authenticated
      if (isAuthenticated()) {
        try {
          const response = await apiService.wishlist.removeItem(productId);
          // Even if API says item not found, that's okay - it might have been only in localStorage
          if (!response.success && response.error && response.error.includes('not found')) {
            // Item was only in localStorage, removal successful
            return { success: true };
          }
          if (response.success) {
            // Reload from API
            await loadWishlist();
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
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [loadWishlist]);

  // Check if item is in wishlist
  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some(
      item => item.productId === productId || item.id === productId || item.product?.id === productId
    );
  }, [wishlistItems]);

  // Toggle wishlist (add if not present, remove if present)
  const toggleWishlist = useCallback(async (productOrId) => {
    // Determine product ID
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

    // Check if already in wishlist
    const inWishlist = wishlistItems.some(
      item => item.productId === productId || item.id === productId || item.product?.id === productId
    );

    if (inWishlist) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productData || productId);
    }
  }, [wishlistItems, addToWishlist, removeFromWishlist]);

  // Clear wishlist
  const clearWishlist = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setWishlistItems([]);

      // Try to sync with API if authenticated
      if (isAuthenticated()) {
        try {
          const response = await apiService.wishlist.clear?.();
          if (response?.success) {
            await loadWishlist();
            return { success: true };
          }
        } catch (err) {
          console.log('API clear wishlist unavailable, cleared localStorage');
        }
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to clear wishlist';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [loadWishlist]);

  // Get wishlist count
  const getWishlistCount = useCallback(() => {
    return wishlistItems.length;
  }, [wishlistItems]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  const value = {
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

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;

