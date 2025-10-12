"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Check if we should use mock API (for development)
  const useMockAPI = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL;
  const [error, setError] = useState(null);

  // Initialize cart from localStorage or API
  useEffect(() => {
    const initializeCart = async () => {
      try {
        if (useMockAPI) {
          // Use localStorage for mock API
          const savedCart = localStorage.getItem('cartItems');
          if (savedCart) {
            setCartItems(JSON.parse(savedCart));
          }
        } else {
          // Load cart from API
          const response = await apiService.cart.get();
          if (response.success) {
            setCartItems(response.data.items || []);
          }
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        setError('Failed to load cart');
      } finally {
        setIsInitialized(true);
      }
    };

    initializeCart();
  }, [useMockAPI]);

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);

  // Calculate cart totals
  const calculateTotals = () => {
    const subtotal = cartItems.reduce((total, item) => {
      return total + (item.discountedPrice * item.quantity);
    }, 0);

    const tax = subtotal * 0.1; // 10% GST
    const shipping = subtotal > 200 ? 0 : 29.95; // Free shipping over $200
    const total = subtotal + tax + shipping;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      itemCount: cartItems.reduce((count, item) => count + item.quantity, 0)
    };
  };

  const totals = calculateTotals();

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (useMockAPI) {
        // Mock API behavior
        const existingItemIndex = cartItems.findIndex(
          item => item.id === product.id
        );

        if (existingItemIndex > -1) {
          // Item exists, update quantity
          const updatedCart = [...cartItems];
          updatedCart[existingItemIndex].quantity += quantity;
          
          // Ensure quantity doesn't exceed stock limit (if applicable)
          if (updatedCart[existingItemIndex].maxQuantity && 
              updatedCart[existingItemIndex].quantity > updatedCart[existingItemIndex].maxQuantity) {
            updatedCart[existingItemIndex].quantity = updatedCart[existingItemIndex].maxQuantity;
            setError(`Maximum quantity available: ${updatedCart[existingItemIndex].maxQuantity}`);
          }
          
          setCartItems(updatedCart);
        } else {
          // New item
          const cartItem = {
            id: product.id,
            title: product.title,
            image: product.image,
            originalPrice: product.originalPrice,
            discountedPrice: product.discountedPrice,
            quantity: Math.min(quantity, product.maxQuantity || 10),
            inStock: product.inStock,
            maxQuantity: product.maxQuantity || 10,
            category: product.category,
            description: product.description,
            addedAt: new Date().toISOString()
          };
          
          setCartItems([...cartItems, cartItem]);
        }
      } else {
        // Real API call
        const response = await apiService.cart.addItem(product.id, quantity);
        if (response.success) {
          setCartItems(response.data.items || []);
        } else {
          setError(response.error || 'Failed to add item to cart');
        }
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add item to cart. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setError(null);
    
    try {
      setCartItems(cartItems.filter(item => item.id !== productId));
      return { success: true };
    } catch (error) {
      const errorMessage = 'Failed to remove item from cart. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update item quantity
  const updateQuantity = (productId, newQuantity) => {
    setError(null);
    
    try {
      if (newQuantity <= 0) {
        return removeFromCart(productId);
      }

      const updatedCart = cartItems.map(item => {
        if (item.id === productId) {
          // Check if quantity exceeds max available
          if (item.maxQuantity && newQuantity > item.maxQuantity) {
            setError(`Maximum quantity available: ${item.maxQuantity}`);
            return { ...item, quantity: item.maxQuantity };
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      setCartItems(updatedCart);
      return { success: true };
    } catch (error) {
      const errorMessage = 'Failed to update quantity. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Clear entire cart
  const clearCart = () => {
    setError(null);
    
    try {
      setCartItems([]);
      return { success: true };
    } catch (error) {
      const errorMessage = 'Failed to clear cart. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Check if item is in cart
  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  // Get item quantity in cart
  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  // Validate cart (check stock, prices, etc.)
  const validateCart = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock API call to validate cart
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const validationResults = cartItems.map(item => {
        // Mock validation - in real app, this would check against backend
        return {
          id: item.id,
          isValid: item.inStock,
          issues: item.inStock ? [] : ['Item is out of stock']
        };
      });

      const invalidItems = validationResults.filter(result => !result.isValid);
      
      if (invalidItems.length > 0) {
        const issues = invalidItems.flatMap(item => item.issues);
        setError(`Cart validation failed: ${issues.join(', ')}`);
        return { success: false, invalidItems };
      }

      return { success: true, validationResults };
    } catch (error) {
      const errorMessage = 'Failed to validate cart. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Apply discount code
  const applyDiscountCode = (code) => {
    setError(null);
    
    try {
      // Mock discount codes
      const validCodes = {
        'SAVE10': { type: 'percentage', value: 10, minAmount: 100 },
        'FREESHIP': { type: 'shipping', value: 0, minAmount: 0 },
        'WELCOME20': { type: 'percentage', value: 20, minAmount: 200 }
      };

      const discount = validCodes[code.toUpperCase()];
      
      if (!discount) {
        setError('Invalid discount code');
        return { success: false, error: 'Invalid discount code' };
      }

      if (totals.subtotal < discount.minAmount) {
        setError(`Minimum order amount of $${discount.minAmount} required for this discount code`);
        return { success: false, error: `Minimum order amount of $${discount.minAmount} required` };
      }

      return { success: true, discount };
    } catch (error) {
      const errorMessage = 'Failed to apply discount code. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    // State
    cartItems,
    isLoading,
    error,
    totals,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    validateCart,
    applyDiscountCode,
    clearError
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

