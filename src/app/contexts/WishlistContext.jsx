"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize wishlist from localStorage
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem('wishlistItems');
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist));
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setError('Failed to load wishlist');
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error);
    }
  }, [wishlistItems]);

  // Add item to wishlist
  const addToWishlist = (product) => {
    setError(null);
    try {
      const existingItem = wishlistItems.find(item => item.id === product.id);
      
      if (existingItem) {
        setError('Item already in wishlist');
        return { success: false, message: 'Item already in wishlist' };
      }

      const wishlistItem = {
        id: product.id,
        title: product.title,
        image: product.image,
        originalPrice: product.originalPrice,
        discountedPrice: product.discountedPrice,
        inStock: product.inStock,
        category: product.category,
        description: product.description,
        maxQuantity: product.maxQuantity || 10,
        rating: product.rating,
        reviews: product.reviews,
        addedAt: new Date().toISOString()
      };

      setWishlistItems([...wishlistItems, wishlistItem]);
      return { success: true, message: 'Added to wishlist' };
    } catch (error) {
      const errorMessage = 'Failed to add item to wishlist';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = (productId) => {
    setError(null);
    try {
      setWishlistItems(wishlistItems.filter(item => item.id !== productId));
      return { success: true };
    } catch (error) {
      const errorMessage = 'Failed to remove item from wishlist';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Clear entire wishlist
  const clearWishlist = () => {
    setError(null);
    try {
      setWishlistItems([]);
      localStorage.removeItem('wishlistItems');
      return { success: true };
    } catch (error) {
      const errorMessage = 'Failed to clear wishlist';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Check if item is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  // Get wishlist count
  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  // Toggle wishlist item
  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      return removeFromWishlist(product.id);
    } else {
      return addToWishlist(product);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    // State
    wishlistItems,
    isLoading,
    error,
    
    // Actions
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistCount,
    toggleWishlist,
    clearError
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
