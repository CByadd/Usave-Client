"use client";
import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Minus, Heart, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../stores/useCartStore';
import { useWishlist } from '../stores/useWishlistStore';
import { isAuthenticated } from '../lib/auth';
import { showToast, openAuthDrawer } from '../lib/ui';

const CartPage = () => {
  const router = useRouter();
  const { 
    cartItems, 
    totals, 
    isLoading, 
    error, 
    updateQuantity, 
    removeFromCart, 
    loadCart 
  } = useCart();
  const { addToWishlist } = useWishlist();

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await handleRemove(itemId);
      return;
    }
    const item = cartItems.find(i => i.id === itemId || i.productId === itemId);
    if (!item) return;
    
    try {
      const result = await updateQuantity(item.productId || item.id, newQuantity);
      if (!result.success) {
        showToast(result.error || 'Failed to update quantity', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update quantity', 'error');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      const result = await removeFromCart(itemId);
      if (result.success) {
        await loadCart();
        showToast('Item removed from cart', 'success');
      } else {
        showToast(result.error || 'Failed to remove item', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to remove item', 'error');
    }
  };

  const handleCheckout = () => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      // Not authenticated - open auth drawer with redirect to checkout
      openAuthDrawer('login', '/checkout');
      showToast('Please login to proceed to checkout', 'info');
    } else {
      // Authenticated - proceed to checkout
      router.push('/checkout');
    }
  };

  const handleAddToWishlist = async (item) => {
    try {
      const productId = item.productId || item.id;
      const result = await addToWishlist(productId);
      if (result.success) {
        await handleRemove(item.id);
        showToast('Item moved to wishlist', 'success');
      } else {
        showToast(result.error || 'Failed to add to wishlist', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to add to wishlist', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#0B4866] mb-2">Your Cart</h1>
          <p className="text-gray-600">Your cart: {totals.itemCount} {totals.itemCount === 1 ? 'Item' : 'Items'}</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {cartItems.length === 0 ? (
          // Empty cart
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingBag size={64} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Link
              href="/"
              className="bg-[#0B4866] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#094058] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full">
            {/* Cart Items - Left Side */}
            <div className="lg:col-span-2 space-y-4 w-full overflow-hidden">
              {cartItems.map((item) => {
                const product = item.product || item;
                const itemId = item.id || item.productId;
                return (
                  <div key={itemId} className="bg-gray-50 rounded-lg p-4 sm:p-6 w-full overflow-hidden">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-full sm:w-auto">
                        <Link href={`/products/${product.id || itemId}`}>
                          <div className="w-full sm:w-24 h-24 bg-white rounded-lg overflow-hidden mx-auto sm:mx-0">
                            <Image
                              src={product.image || item.image}
                              alt={product.title || item.title}
                              width={96}
                              height={96}
                              className="w-full h-full object-contain p-2"
                            />
                          </div>
                        </Link>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-2">
                          <div className="flex-1 min-w-0">
                            <Link href={`/products/${product.id || itemId}`}>
                              <h3 className="text-[#0B4866] font-medium hover:underline mb-1 break-words text-sm sm:text-base">
                                {product.title || item.title}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-1 text-sm text-yellow-500 mb-2">
                              {product.rating && (
                                <>
                                  {"★".repeat(Math.floor(product.rating))}
                                  {"☆".repeat(5 - Math.floor(product.rating))}
                                  <span className="text-gray-600 ml-1">({product.reviews || 0})</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-left sm:text-right flex-shrink-0">
                            {(product.originalPrice || item.originalPrice) > (product.discountedPrice || product.price || item.discountedPrice || item.price) && (
                              <div className="text-xs sm:text-sm text-gray-500 line-through">
                                ${(product.originalPrice || item.originalPrice).toFixed(2)}
                              </div>
                            )}
                            <div className="text-lg sm:text-xl font-semibold text-[#0B4866]">
                              ${((product.discountedPrice || product.price || item.discountedPrice || item.price) * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`h-2 w-2 rounded-full ${
                            (product.inStock !== false && item.inStock !== false) ? "bg-green-500" : "bg-red-500"
                          }`} />
                          <span className="text-sm text-gray-600">
                            {(product.inStock !== false && item.inStock !== false) ? "In Stock" : "Out of Stock"}
                          </span>
                        </div>

                        {/* Quantity and Size */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Quantity:</span>
                            <span className="text-sm font-medium">{item.quantity}</span>
                          </div>
                          {item.size && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Size:</span>
                              <span className="text-sm font-medium">{item.size}</span>
                            </div>
                          )}
                          {item.color && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Color:</span>
                              <span className="text-sm font-medium">{item.color}</span>
                            </div>
                          )}
                          {item.includeInstallation && (
                            <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-lg">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm text-green-700 font-medium">Installation Included (${item.installationFee || 0} × {item.quantity})</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 flex-wrap">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                            <button
                              onClick={() => handleUpdateQuantity(itemId, item.quantity - 1)}
                              className="px-3 py-1 hover:bg-gray-100 transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={16} />
                            </button>
                            <span className="px-2 text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(itemId, item.quantity + 1)}
                              className="px-3 py-1 hover:bg-gray-100 transition-colors"
                              disabled={item.quantity >= (product.maxQuantity || item.maxQuantity || 10)}
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          {/* Add to Wishlist */}
                          <button
                            onClick={() => handleAddToWishlist(item)}
                            className="flex items-center gap-2 text-sm text-[#0B4866] hover:underline"
                          >
                            <Heart size={16} />
                            Add to Wishlist
                          </button>

                          {/* Remove */}
                          <button
                            onClick={() => handleRemove(itemId)}
                            className="flex items-center gap-2 text-sm text-red-600 hover:underline"
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary - Right Side */}
            <div className="lg:col-span-1 w-full">
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 sticky top-24 w-full overflow-hidden">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Products</span>
                    <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Excluding TAX</span>
                    <span className="font-medium">${totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-[#0B4866]">${totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-[#0B4866] text-white py-3 rounded-lg font-medium hover:bg-[#094058] transition-colors mb-3"
                >
                  Proceed to Checkout
                </button>

                <Link
                  href="/"
                  className="block text-center text-sm text-[#0B4866] hover:underline"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
