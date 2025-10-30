"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Minus, Heart, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

const CartPage = () => {
  const { 
    cartItems, 
    totals, 
    updateQuantity, 
    removeFromCart,
    error 
  } = useCart();
  const { addToWishlist } = useWishlist();
  const router = useRouter();

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const handleAddToWishlist = async (item) => {
    await addToWishlist(item);
    await removeFromCart(item.id);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items - Left Side */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
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
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-2 text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100 transition-colors"
                            disabled={item.quantity >= item.maxQuantity}
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
                          onClick={() => removeFromCart(item.id)}
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

            {/* Order Summary - Right Side */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
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
