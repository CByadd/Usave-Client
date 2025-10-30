"use client";
import React, { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useRouter } from 'next/navigation';

const CartModal = memo(({ isOpen, onClose }) => {
  const { 
    cartItems, 
    totals, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    error 
  } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  const handleContinueShopping = () => {
    onClose();
    router.push('/');
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[420px] lg:w-[40dvw] bg-white shadow-xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">
            Shopping Cart ({totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col h-[calc(100vh-72px)]">
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {cartItems.length === 0 ? (
            // Empty cart
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <ShoppingBag size={64} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
              <button
                onClick={handleContinueShopping}
                className="bg-[#0B4866] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#094058] transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Cart items */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      {/* Product image */}
                      <div className="flex-shrink-0">
                        <Link href={`/products/${item.id}`} onClick={onClose}>
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.title}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </Link>
                      </div>

                      {/* Product details */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.id}`} onClick={onClose}>
                          <h3 className="text-sm font-medium text-gray-900 hover:text-[#0B4866] line-clamp-2">
                            {item.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          Category: {item.category}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm font-semibold text-gray-900">
                            ${item.discountedPrice}
                          </span>
                          {item.originalPrice > item.discountedPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ${item.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                          disabled={item.quantity >= item.maxQuantity}
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Item total */}
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          ${(item.discountedPrice * item.quantity).toFixed(2)}
                        </div>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer with totals and actions */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                {/* Order summary */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (GST)</span>
                    <span className="font-medium">${totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {totals.shipping === 0 ? 'Free' : `$${totals.shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between text-base font-semibold">
                      <span>Total</span>
                      <span>${totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={clearCart}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="flex-1 bg-[#0B4866] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#094058] transition-colors"
                  >
                    Checkout
                  </button>
                </div>

                {/* Continue shopping link */}
                <div className="mt-4 text-center">
                  <button
                    onClick={handleContinueShopping}
                    className="text-sm text-[#0B4866] hover:underline"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

CartModal.displayName = 'CartModal';

export default CartModal;
