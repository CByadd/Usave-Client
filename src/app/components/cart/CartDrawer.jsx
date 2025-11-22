"use client";
import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../stores/useCartStore';
import { useUIStore } from '../../stores/useUIStore';
import { useAnimationStore } from '../../stores/useAnimationStore';
import { isAuthenticated } from '../../lib/auth';
import { openAuthDrawer } from '../../lib/ui';

const CartDrawer = () => {
  const { 
    cartItems, 
    totals, 
    isLoading, 
    updateQuantity, 
    removeFromCart, 
    loadCart,
    getCartCount
  } = useCart();
  
  // Use UI store for drawer state
  const isCartDrawerOpen = useUIStore((state) => state.isCartDrawerOpen);
  const closeCartDrawer = useUIStore((state) => state.closeCartDrawer);
  const { getAnimationConfig } = useAnimationStore();
  const drawerConfig = getAnimationConfig('drawer');
  
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState({});

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, [loadCart]);
  

  // Listen for custom events for backward compatibility
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onOpen = () => {
      useUIStore.getState().openCartDrawer();
    };
    const onClose = () => {
      useUIStore.getState().closeCartDrawer();
    };
    document.body.addEventListener('usave:openCart', onOpen);
    document.body.addEventListener('usave:closeCart', onClose);
    return () => {
      document.body.removeEventListener('usave:openCart', onOpen);
      document.body.removeEventListener('usave:closeCart', onClose);
    };
  }, []);

  const handleQuantityChange = async (productId, newQuantity) => {
    console.log('[CartDrawer] handleQuantityChange - productId:', productId, 'newQuantity:', newQuantity);
    if (newQuantity < 1) {
      console.log('[CartDrawer] handleQuantityChange - removing item');
      await handleRemoveItem(productId);
      return;
    }

    setIsUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error('[CartDrawer] Error updating quantity:', error);
    } finally {
      setIsUpdating(prev => ({ ...prev, [productId]: false }));
    }
    console.log('[CartDrawer] handleQuantityChange - completed');
  };

  const handleRemoveItem = async (productId) => {
    console.log('[CartDrawer] handleRemoveItem clicked - productId:', productId);
    setIsUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('[CartDrawer] Error removing item:', error);
    } finally {
      setIsUpdating(prev => ({ ...prev, [productId]: false }));
    }
    console.log('[CartDrawer] handleRemoveItem - completed');
  };

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    if (isCartDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isCartDrawerOpen]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isCartDrawerOpen && (
        <motion.div
          key="cart-drawer"
          className="fixed inset-0 z-[150] overflow-hidden"
          initial="closed"
          animate="open"
          exit="closed"
          variants={{
            open: { transition: { staggerChildren: 0.05 } },
            closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
          }}
        >
          {/* Backdrop */}
          <motion.div
            variants={{
              open: { opacity: 1 },
              closed: { opacity: 0 },
            }}
            transition={{ 
              duration: drawerConfig.backdrop.duration, 
              ease: drawerConfig.backdrop.ease 
            }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            style={{ willChange: 'opacity' }}
            onClick={(e) => {
              console.log('[CartDrawer] Backdrop clicked');
              if (e) {
                e.preventDefault();
                e.stopPropagation();
              }
              closeCartDrawer();
              // Fallback: dispatch close event
              if (typeof document !== 'undefined') {
                try {
                  document.body.dispatchEvent(new CustomEvent('usave:closeCart'));
                  console.log('[CartDrawer] Dispatched usave:closeCart event');
                } catch (err) {
                  console.error('[CartDrawer] Error dispatching close event:', err);
                }
              }
            }}
          />

          {/* Drawer */}
          <motion.div
            variants={{
              open: { x: 0 },
              closed: { x: '100%' },
            }}
            transition={drawerConfig.panel}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ willChange: 'transform' }}
          >

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-[#0B4866]" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              Shopping Cart ({getCartCount() || 0})
            </h2>
          </div>
          <button
            type="button"
            onClick={(e) => {
              console.log('[CartDrawer] Close button clicked');
              if (e) {
                e.preventDefault();
                e.stopPropagation();
              }
              console.log('[CartDrawer] closeCartDrawer type:', typeof closeCartDrawer);
              if (typeof closeCartDrawer === 'function') {
                closeCartDrawer();
                console.log('[CartDrawer] closeCartDrawer called');
              }
              // Fallback: dispatch close event
              if (typeof document !== 'undefined') {
                try {
                  document.body.dispatchEvent(new CustomEvent('usave:closeCart'));
                  console.log('[CartDrawer] Dispatched usave:closeCart event');
                } catch (err) {
                  console.error('[CartDrawer] Error dispatching close event:', err);
                }
              }
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Container */}
        <div className="flex flex-col h-[calc(100vh-72px)]">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
              {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Add some items to get started</p>
                <Link
                  href="/products"
                  onClick={(e) => {
                  if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                  if (typeof closeCartDrawer === 'function') {
                    closeCartDrawer();
                  }
                  if (typeof document !== 'undefined') {
                    try {
                      document.body.dispatchEvent(new CustomEvent('usave:closeCart'));
                    } catch {}
                  }
                }}
                  className="inline-block bg-[#0B4866] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#094058] transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
              {cartItems.map((item) => {
                const product = item.product || item;
                
                // Helper function to get readable size value
                const getReadableSize = () => {
                  const sizeValue = item.size || item.options?.size;
                  if (!sizeValue) return null;
                  
                  // If it's "base-variant-1", try to get actual size from product
                  if (sizeValue === 'base-variant-1' || sizeValue.startsWith('base-variant')) {
                    // Check if product has size variants
                    if (product.sizeVariants && Array.isArray(product.sizeVariants)) {
                      const baseVariant = product.sizeVariants.find(v => v.id === 'base-variant-1');
                      if (baseVariant && baseVariant.size) return baseVariant.size;
                    }
                    // Fallback to product dimensions or standard
                    if (product.dimensions?.width && product.dimensions?.height) {
                      return `${product.dimensions.width}x${product.dimensions.height}`;
                    }
                    if (product.dimensions?.width) {
                      return `${product.dimensions.width}`;
                    }
                    // Don't show if it's just the base variant ID
                    return null;
                  }
                  
                  // If it looks like an ID (long alphanumeric), try to find the variant
                  if (sizeValue.length > 20 && product.sizeVariants && Array.isArray(product.sizeVariants)) {
                    const variant = product.sizeVariants.find(v => v.id === sizeValue);
                    if (variant && variant.size) return variant.size;
                  }
                  
                  // Return the value as-is if it looks like a readable size
                  return sizeValue;
                };
                
                // Helper function to get readable color value
                const getReadableColor = () => {
                  const colorValue = item.color || item.options?.color;
                  if (!colorValue) return null;
                  
                  // If it looks like an ID (long alphanumeric string), try to find the variant
                  if (colorValue.length > 20 && product.colorVariants && Array.isArray(product.colorVariants)) {
                    const variant = product.colorVariants.find(v => v.id === colorValue);
                    if (variant && variant.color) return variant.color;
                  }
                  
                  // Check if it's a valid color name (not unknown, n/a, or empty)
                  const trimmedColor = colorValue.trim();
                  if (trimmedColor === '' || 
                      trimmedColor.toLowerCase() === 'unknown' || 
                      trimmedColor.toLowerCase() === 'n/a') {
                    return null;
                  }
                  
                  // Return the value as-is if it looks like a readable color
                  return colorValue;
                };
                
                const displaySize = getReadableSize();
                const displayColor = getReadableColor();
                const colorVariantsCount = Array.isArray(product.colorVariants) ? product.colorVariants.length : 0;
                const hasBaseColor = product.color ? 1 : 0;
                const totalColorOptions = colorVariantsCount + hasBaseColor;
                const shouldShowColor = displayColor && totalColorOptions > 1;
                
                return (
                <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-lg"
                      loading="lazy"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.id}`}
                      onClick={(e) => {
                  if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                  if (typeof closeCartDrawer === 'function') {
                    closeCartDrawer();
                  }
                  if (typeof document !== 'undefined') {
                    try {
                      document.body.dispatchEvent(new CustomEvent('usave:closeCart'));
                    } catch {}
                  }
                }}
                      className="text-sm font-medium text-gray-900 hover:text-[#0B4866] line-clamp-2"
                    >
                      {item.title}
                    </Link>
                    
                    <div className="mt-1 text-sm text-gray-500 space-y-1">
                      {displaySize && (
                        <div>Size: <span className="font-medium">{displaySize}</span></div>
                      )}
                      {shouldShowColor && (
                        <div>Color: <span className="font-medium">{displayColor}</span></div>
                      )}
                      {(item.includeInstallation || item.options?.includeInstallation) && (
                        <div className="flex items-center gap-1 text-[#0B4866] bg-blue-50 px-2 py-0.5 rounded mt-1 inline-flex text-xs">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="font-medium">Installation</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Item Price:</span>
                        <span className="text-sm font-medium">${item.discountedPrice * item.quantity}.00</span>
                      </div>
                      {item.includeInstallation && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Installation ({item.quantity} × ${item.installationFee}):</span>
                          <span className="text-sm font-medium">${(item.installationFee * item.quantity).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-gray-100 pt-1">
                        <span className="text-sm font-semibold">Subtotal:</span>
                        <span className="text-sm font-semibold">
                          ${(item.discountedPrice * item.quantity + (item.includeInstallation ? item.installationFee * item.quantity : 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={isUpdating[item.id]}
                          className="p-1 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Minus size={16} />
                        </button>
                        
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={isUpdating[item.id]}
                          className="p-1 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={isUpdating[item.id]}
                      className="mt-2 text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-50"
                    >
                      <Trash2 size={14} className="inline mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
                );
              })}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              {/* Order Summary */}
              <div className="space-y-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
              
              {cartItems.some(item => item.includeInstallation) && (
                <div className="bg-[#0B4866]/10 p-3 rounded-lg">
                  <p className="text-sm text-[#0B4866] flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h.01a1 1 0 100-2H10V9z" clipRule="evenodd" />
                    </svg>
                    Installation service included for selected items
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm">
                    ${cartItems.reduce((sum, item) => sum + (item.discountedPrice * item.quantity), 0).toFixed(2)}
                  </span>
                </div>
                
                {cartItems.some(item => item.includeInstallation) && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Installation:</span>
                    <span className="text-sm">
                      ${cartItems
                        .filter(item => item.includeInstallation)
                        .reduce((sum, item) => sum + (item.installationFee * item.quantity), 0)
                        .toFixed(2)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-xl font-bold text-[#0B4866]">
                    ${totals.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  // Check if user is authenticated
                  if (!isAuthenticated()) {
                    // Not authenticated - open auth drawer with redirect to checkout
                    closeCartDrawer();
                    openAuthDrawer('login', '/checkout');
                  } else {
                    // Authenticated - proceed to checkout
                    closeCartDrawer();
                    router.push('/checkout');
                  }
                }}
                className="block w-full bg-[#0B4866] text-white py-3 rounded-lg font-medium text-center hover:bg-[#094058] transition-colors"
              >
                Proceed to Checkout
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Close drawer first
                  if (typeof closeCartDrawer === 'function') {
                    closeCartDrawer();
                  }
                  if (typeof document !== 'undefined') {
                    try {
                      document.body.dispatchEvent(new CustomEvent('usave:closeCart'));
                    } catch {}
                  }
                  // Navigate to cart page
                  router.push('/cart');
                }}
                className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium text-center hover:bg-gray-50 transition-colors"
              >
                View Cart
              </button>
            </div>
          </div>
          )}
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
