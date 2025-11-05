"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { fetchWishlist, getWishlistItems, removeFromWishlist } from '../lib/wishlist';
import { addToCart, fetchCart, getCartItems, isInCart } from '../lib/cart';
import { openCartDrawer, showToast } from '../lib/ui';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [movingToCart, setMovingToCart] = useState({});
  const router = useRouter();

  useEffect(() => {
    loadWishlist();
    loadCart();
  }, []);

  const loadWishlist = async () => {
    try {
      await fetchWishlist();
      setWishlistItems(getWishlistItems());
    } catch (err) {
      setError(err.message || 'Failed to load wishlist');
    }
  };

  const loadCart = async () => {
    try {
      await fetchCart();
      setCartItems(getCartItems());
    } catch (err) {
      console.error('Error loading cart:', err);
    }
  };

  const handleMoveToCart = async (item) => {
    const itemId = item.id || `wishlist_${item.productId || item.id}`;
    setMovingToCart(prev => ({ ...prev, [itemId]: true }));
    
    try {
      // Always use productId, not the wishlist item ID
      const productId = item.productId || item.product?.id || item.id;
      if (!productId) {
        showToast('Invalid product ID', 'error');
        return;
      }
      const result = await addToCart(productId, 1);
      
      if (result?.success) {
        await removeFromWishlist(productId);
        await loadWishlist();
        await loadCart();
        openCartDrawer();
        showToast('Item moved to cart', 'success');
      } else {
        showToast(result.error || 'Failed to add to cart', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to move to cart', 'error');
    } finally {
      setMovingToCart(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const result = await removeFromWishlist(productId);
      if (result.success) {
        await loadWishlist();
        showToast('Item removed from wishlist', 'success');
      } else {
        showToast(result.error || 'Failed to remove item', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to remove item', 'error');
    }
  };

  const handleContinueShopping = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#0B4866]">Wishlist</h1>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Heart size={64} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">Save your favorite items here to easily find them later.</p>
            <Link
              href="/"
              className="bg-[#0B4866] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#094058] transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4 w-full overflow-hidden">
            {wishlistItems.map((item) => {
              const product = item.product || item;
              const productId = item.productId || product.id || item.id;
              const itemId = item.id || `wishlist_${productId}`;
              const inCart = cartItems.some(c => c.productId === productId || c.product?.id === productId);
              return (
                <div key={itemId} className="bg-gray-50 rounded-lg p-4 sm:p-6 w-full overflow-hidden">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full">
                    <div className="flex-shrink-0 w-full sm:w-auto">
                      <Link href={`/products/${product.id || productId}`}>
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

                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-2">
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${product.id || productId}`}>
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
                            ${(product.discountedPrice || product.price || item.discountedPrice || item.price).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className={`h-2 w-2 rounded-full ${
                          (product.inStock !== false && item.inStock !== false) ? "bg-green-500" : "bg-red-500"
                        }`} />
                        <span className="text-sm text-gray-600">
                          {(product.inStock !== false && item.inStock !== false) ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Quantity:</span>
                          <span className="text-sm font-medium">1</span>
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
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 flex-wrap">
                        <button
                          onClick={() => handleMoveToCart(item)}
                          disabled={movingToCart[item.id] || inCart || (product.inStock === false && item.inStock === false)}
                          className="flex items-center gap-2 text-sm text-[#0B4866] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart size={16} />
                          {inCart ? 'In Cart' : 'Move to Cart'}
                        </button>

                        <button
                          onClick={() => handleRemoveItem(productId)}
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
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
