"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useUI } from '../context/UIContext';

const WishlistPage = () => {
  const { 
    wishlistItems, 
    removeFromWishlist, 
    clearWishlist,
    error 
  } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const { openCartDrawer } = useUI();
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);
  const [movingToCart, setMovingToCart] = useState({});

  React.useEffect(() => {
    setIsAnimating(false);
  }, []);

  const handleMoveToCart = async (item) => {
    setMovingToCart(prev => ({ ...prev, [item.id]: true }));
    
    const result = await addToCart(item);
    
    if (result.success) {
      await removeFromWishlist(item.id);
      openCartDrawer();
    }
    
    setMovingToCart(prev => ({ ...prev, [item.id]: false }));
  };

  const handleRemoveItem = async (productId) => {
    await removeFromWishlist(productId);
  };

  const handleContinueShopping = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#0B4866]">Wishlist</h1>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {wishlistItems.length === 0 ? (
          // Empty wishlist
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
          <div className="space-y-4">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-6">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <Link href={`/products/${item.id}`}>
                      <div className="w-24 h-24 bg-white rounded-lg overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={96}
                          height={96}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                    </Link>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Link href={`/products/${item.id}`}>
                          <h3 className="text-[#0B4866] font-medium hover:underline mb-1">
                            {item.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1 text-sm text-yellow-500 mb-2">
                          {item.rating && (
                            <>
                              {"★".repeat(Math.floor(item.rating))}
                              {"☆".repeat(5 - Math.floor(item.rating))}
                              <span className="text-gray-600 ml-1">({item.reviews || 0})</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {item.originalPrice > item.discountedPrice && (
                          <div className="text-sm text-gray-500 line-through">
                            ${item.originalPrice}.00
                          </div>
                        )}
                        <div className="text-xl font-semibold text-[#0B4866]">
                          ${item.discountedPrice}.00
                        </div>
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`h-2 w-2 rounded-full ${
                        item.inStock ? "bg-green-500" : "bg-red-500"
                      }`} />
                      <span className="text-sm text-gray-600">
                        {item.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>

                    {/* Quantity and Size */}
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

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                        <button
                          className="px-3 py-1 hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-2 text-sm font-medium">1</span>
                        <button
                          className="px-3 py-1 hover:bg-gray-100 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="flex items-center gap-2 text-sm text-red-600 hover:underline"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
