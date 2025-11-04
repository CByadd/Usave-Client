// Simple wishlist module - no context needed
import { apiService } from '../services/api/apiClient';
import { isAuthenticated } from './auth';

// Wishlist state (local)
let wishlistItems = [];

// Fetch wishlist from API
export const fetchWishlist = async () => {
  if (!isAuthenticated()) {
    wishlistItems = [];
    return [];
  }

  try {
    const response = await apiService.wishlist.get();
    if (response.success && response.data) {
      wishlistItems = response.data.items || [];
      return wishlistItems;
    }
  } catch (err) {
    console.error('Error fetching wishlist:', err);
  }
  return wishlistItems;
};

// Add to wishlist
export const addToWishlist = async (productId) => {
  if (!isAuthenticated()) {
    return { success: false, error: 'Please login to add items to wishlist' };
  }

  try {
    const response = await apiService.wishlist.addItem(productId);
    if (response.success) {
      await fetchWishlist(); // Refresh wishlist
      return { success: true };
    } else {
      return { success: false, error: response.message || 'Failed to add to wishlist' };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.error || err.message || 'Failed to add item to wishlist';
    return { success: false, error: errorMessage };
  }
};

// Remove from wishlist
export const removeFromWishlist = async (productId) => {
  if (!isAuthenticated()) {
    return { success: false, error: 'Please login' };
  }

  try {
    const response = await apiService.wishlist.removeItem(productId);
    if (response.success) {
      await fetchWishlist(); // Refresh wishlist
      return { success: true };
    } else {
      return { success: false, error: response.message || 'Failed to remove item' };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.error || err.message || 'Failed to remove item';
    return { success: false, error: errorMessage };
  }
};

// Toggle wishlist
export const toggleWishlist = async (product) => {
  const productId = product?.id || product?.productId;
  if (!productId) {
    return { success: false, error: 'Product ID is required' };
  }

  if (isInWishlist(productId)) {
    return await removeFromWishlist(productId);
  } else {
    return await addToWishlist(productId);
  }
};

// Get wishlist items
export const getWishlistItems = () => wishlistItems;

// Get wishlist count
export const getWishlistCount = () => wishlistItems.length || 0;

// Check if item is in wishlist
export const isInWishlist = (productId) => {
  return wishlistItems.some(item => item.productId === productId || item.product?.id === productId);
};

