"use client";
import React, { memo, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { fetchCart, getCartItems, getCartTotals, removeFromCart, addToCart } from '../../lib/cart';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '../../lib/auth';
import { showToast, openAuthDrawer } from '../../lib/ui';

const CartModal = memo(({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 });
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      loadCart();
    }
  }, [isOpen]);

  const loadCart = async () => {
    try {
      const { items, totals: cartTotals } = await fetchCart();
      setCartItems(items);
      setTotals(cartTotals);
    } catch (err) {
      setError(err.message || 'Failed to load cart');
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await handleRemove(itemId);
      return;
    }
    const item = cartItems.find(i => i.id === itemId || i.productId === itemId);
    if (!item) return;
    
    try {
      await removeFromCart(item.productId || item.id);
      await addToCart(item.productId || item.id, newQuantity);
      await loadCart();
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
      }
    } catch (err) {
      showToast(err.message || 'Failed to remove item', 'error');
    }
  };

  const handleCheckout = () => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      // Not authenticated - open auth drawer with redirect to checkout
      onClose();
      openAuthDrawer('login', '/checkout');
      showToast('Please login to proceed to checkout', 'info');
    } else {
      // Authenticated - proceed to checkout
      onClose();
      router.push('/checkout');
    }
  };

  const handleContinueShopping = () => {
    onClose();
    router.push('/');
  };

  const clearCart = async () => {
    // Remove all items
    for (const item of cartItems) {
      await removeFromCart(item.id || item.productId);
    }
    await loadCart();
    showToast('Cart cleared', 'success');
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}>
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[420px] lg:w-[40dvw] bg-white shadow-xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
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

        <div className="flex flex-col h-[calc(100vh-72px)]">
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {cartItems.length === 0 ? (
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
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const product = item.product || item;
                    const itemId = item.id || item.productId;
                    return (
                      <div key={itemId} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="flex-shrink-0">
                          <Link href={`/products/${product.id || itemId}`} onClick={onClose}>
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                              <Image
                                src={product.image || item.image}
                                alt={product.title || item.title}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </Link>
                        </div>

                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${product.id || itemId}`} onClick={onClose}>
                            <h3 className="text-sm font-medium text-gray-900 hover:text-[#0B4866] line-clamp-2">
                              {product.title || item.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-600 mt-1">
                            Category: {product.category || item.category}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm font-semibold text-gray-900">
                              ${((product.discountedPrice || product.price || item.discountedPrice || item.price) * item.quantity).toFixed(2)}
                            </span>
                            {(product.originalPrice || item.originalPrice) > (product.discountedPrice || product.price || item.discountedPrice || item.price) && (
                              <span className="text-sm text-gray-500 line-through">
                                ${(product.originalPrice || item.originalPrice).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(itemId, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(itemId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                            disabled={item.quantity >= (product.maxQuantity || item.maxQuantity || 10)}
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            ${((product.discountedPrice || product.price || item.discountedPrice || item.price) * item.quantity).toFixed(2)}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemove(itemId)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-gray-200 p-6 bg-gray-50">
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
