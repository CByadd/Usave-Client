// Simple cart module - no context needed
import { apiService } from '../services/api/apiClient';
import { isAuthenticated } from './auth';

// Cart state (local)
let cartItems = [];
let totals = { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 };

// localStorage key
const CART_STORAGE_KEY = 'usave_cart';

// Calculate totals from cart items
const calculateTotals = (items) => {
  const subtotal = items.reduce((sum, item) => {
    // Handle both API format (item.product) and localStorage format (direct properties)
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

// Fetch cart - loads from localStorage first, then syncs with API if authenticated
export const fetchCart = async () => {
  // Always load from localStorage first
  cartItems = loadCartFromStorage();
  totals = calculateTotals(cartItems);

  // If authenticated, try to sync with API
  if (isAuthenticated()) {
    try {
      const response = await apiService.cart.get();
      if (response.success && response.data && response.data.items) {
        // API has cart data, use it and update localStorage
        cartItems = response.data.items || [];
        saveCartToStorage(cartItems);
        totals = calculateTotals(cartItems);
        return { items: cartItems, totals };
      }
    } catch (err) {
      // API failed, use localStorage data
      console.log('API cart unavailable, using localStorage');
    }
  }

  totals = calculateTotals(cartItems);
  return { items: cartItems, totals };
};

// Add to cart - accepts product object or productId, quantity, and options (color, size)
export const addToCart = async (productOrId, quantity = 1, options = {}) => {
  // Load current cart
  await fetchCart();
  
  // Determine product ID and product data
  let productId;
  let productData;
  
  if (typeof productOrId === 'object' && productOrId !== null) {
    // Product object provided
    productId = productOrId.id || productOrId.productId;
    productData = productOrId;
  } else {
    // Just product ID provided
    productId = productOrId;
    productData = null;
  }

  if (!productId) {
    return { success: false, error: 'Product ID is required' };
  }

  // Extract and normalize options (color, size, installation, etc.)
  const { color, size, includeInstallation, ...otherOptions } = options;
  
  // Normalize color and size to string values for consistent comparison
  const normalizedColor = color ? (typeof color === 'string' ? color : (color.value || color.name || JSON.stringify(color))) : null;
  const normalizedSize = size ? (typeof size === 'string' ? size : (size.value || size.label || JSON.stringify(size))) : null;
  const installation = includeInstallation || false;
  
  // For authenticated users, try API first to validate stock
  // For non-authenticated users, save directly to localStorage
  if (isAuthenticated()) {
    try {
      const response = await apiService.cart.addItem(productId, quantity);
      if (response.success) {
        // API success - sync cart from API (it handles adding/updating)
        await fetchCart();
        return { success: true };
      } else if (response.error) {
        // API returned an error (e.g., out of stock) - don't add to cart
        console.log('API cart error:', response.error);
        return { success: false, error: response.error };
      }
    } catch (err) {
      // API failed (network error, etc.) - save to localStorage as fallback
      const errorMessage = err.response?.data?.error || err.message || 'Failed to sync with server';
      console.log('API cart unavailable, saving to localStorage. Error:', errorMessage);
      // Continue to localStorage save below
    }
  }

  // Save to localStorage (for non-authenticated users or API failures)
  // Check if item already exists in cart with same product ID AND same options
  const existingItemIndex = cartItems.findIndex(item => {
    const sameProduct = item.productId === productId || item.id === productId || 
                        item.product?.id === productId;
    if (!sameProduct) return false;
    
    // Check if options match (normalize stored values too)
    const itemColor = item.color || item.options?.color;
    const itemSize = item.size || item.options?.size;
    const itemInstallation = item.includeInstallation || item.options?.includeInstallation || false;
    const normalizedItemColor = itemColor ? (typeof itemColor === 'string' ? itemColor : (itemColor.value || itemColor.name || JSON.stringify(itemColor))) : null;
    const normalizedItemSize = itemSize ? (typeof itemSize === 'string' ? itemSize : (itemSize.value || itemSize.label || JSON.stringify(itemSize))) : null;
    
    const sameColor = (!normalizedColor && !normalizedItemColor) || (normalizedColor === normalizedItemColor);
    const sameSize = (!normalizedSize && !normalizedItemSize) || (normalizedSize === normalizedItemSize);
    const sameInstallation = installation === itemInstallation;
    
    return sameColor && sameSize && sameInstallation;
  });

  if (existingItemIndex >= 0) {
    // Update quantity of existing item with same options
    cartItems[existingItemIndex].quantity += quantity;
  } else {
    // Add new item with options
    const newItem = {
      id: `cart_${Date.now()}_${productId}_${Math.random().toString(36).substr(2, 9)}`,
      productId: productId,
      quantity: quantity,
      // Store normalized options at root level for easy access
      ...(normalizedColor && { color: normalizedColor }),
      ...(normalizedSize && { size: normalizedSize }),
      includeInstallation: installation,
      // Also store original options in options object for structured access
      options: {
        ...(normalizedColor && { color: normalizedColor }),
        ...(normalizedSize && { size: normalizedSize }),
        includeInstallation: installation,
        ...otherOptions,
      },
      ...(productData && {
        product: productData,
        // Also store direct properties for easier access
        title: productData.title || productData.name,
        image: productData.image,
        discountedPrice: productData.discountedPrice || productData.price,
        originalPrice: productData.originalPrice || productData.price,
        price: productData.discountedPrice || productData.originalPrice || productData.price,
      }),
    };
    cartItems.push(newItem);
  }

  // Save to localStorage
  saveCartToStorage(cartItems);
  totals = calculateTotals(cartItems);

  // If authenticated but API failed, return success with localOnly flag
  if (isAuthenticated()) {
    return { success: true, localOnly: true };
  }

  return { success: true };
};

// Remove from cart
export const removeFromCart = async (productId) => {
  // Load current cart
  await fetchCart();

  // Find and remove item
  const itemIndex = cartItems.findIndex(
    item => item.productId === productId || item.id === productId || 
            item.product?.id === productId
  );

  if (itemIndex >= 0) {
    cartItems.splice(itemIndex, 1);
    saveCartToStorage(cartItems);
    totals = calculateTotals(cartItems);

    // If authenticated, try to sync with API
    if (isAuthenticated()) {
      try {
        const response = await apiService.cart.removeItem(productId);
        if (response.success) {
          // Sync with API response if available
          await fetchCart();
          return { success: true };
        }
        // If API says item not found, that's okay - it might have been only in localStorage
        if (response.error && response.error.includes('not found')) {
          return { success: true };
        }
      } catch (err) {
        // Check if error is about item not found
        const errorMessage = err.response?.data?.error || err.message || '';
        if (errorMessage.includes('not found') || errorMessage.includes('Cart item not found')) {
          // Item was only in localStorage, removal successful
          return { success: true };
        }
        // Other API errors - localStorage is still updated
        console.log('API cart unavailable, removed from localStorage');
      }
    }

    return { success: true };
  }

  return { success: false, error: 'Item not found in cart' };
};

// Get cart items
export const getCartItems = () => {
  // Make sure cart is loaded
  if (cartItems.length === 0 && typeof window !== 'undefined') {
    cartItems = loadCartFromStorage();
    totals = calculateTotals(cartItems);
  }
  return cartItems;
};

// Get cart totals
export const getCartTotals = () => totals;

// Get cart count
export const getCartCount = () => totals.itemCount || 0;

// Check if item is in cart
export const isInCart = (productId) => {
  // Make sure cart is loaded
  if (cartItems.length === 0 && typeof window !== 'undefined') {
    cartItems = loadCartFromStorage();
  }
  return cartItems.some(item => 
    item.productId === productId || 
    item.id === productId || 
    item.product?.id === productId
  );
};

// Get item quantity
export const getItemQuantity = (productId) => {
  const item = cartItems.find(item => item.productId === productId || item.product?.id === productId);
  return item ? item.quantity : 0;
};

// Update item quantity
export const updateQuantity = async (productId, quantity) => {
  if (quantity <= 0) {
    return await removeFromCart(productId);
  }

  // Load current cart
  await fetchCart();

  const itemIndex = cartItems.findIndex(
    item => item.productId === productId || item.id === productId || 
            item.product?.id === productId
  );

  if (itemIndex >= 0) {
    cartItems[itemIndex].quantity = quantity;
    saveCartToStorage(cartItems);
    totals = calculateTotals(cartItems);

    // If authenticated, try to sync with API
    if (isAuthenticated()) {
      try {
        const response = await apiService.cart.update?.(productId, quantity);
        if (response?.success) {
          await fetchCart();
          return { success: true };
        }
      } catch (err) {
        console.log('API cart unavailable, updated localStorage');
      }
    }

    return { success: true };
  }

  return { success: false, error: 'Item not found in cart' };
};

// Clear cart
export const clearCart = async () => {
  cartItems = [];
  totals = { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 };
  saveCartToStorage([]);

  // If authenticated, try to sync with API
  if (isAuthenticated()) {
    try {
      const response = await apiService.cart.clear?.();
      if (response?.success) {
        await fetchCart();
        return { success: true };
      }
    } catch (err) {
      console.log('API cart unavailable, cleared localStorage');
    }
  }

  return { success: true };
};

// Initialize cart from localStorage on module load
if (typeof window !== 'undefined') {
  cartItems = loadCartFromStorage();
  totals = calculateTotals(cartItems);
}

