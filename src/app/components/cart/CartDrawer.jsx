"use client";
import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../../contexts/CartContext';
import { useUI } from '../../contexts/UIContext';
import OptimizedImage from '../shared/OptimizedImage';

const CartDrawer = () => {
  const { cartItems, updateQuantity, removeItem, getCartTotal, getCartCount } = useCart();
  const { isCartDrawerOpen, closeCartDrawer } = useUI();
  const [isUpdating, setIsUpdating] = useState({});

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      await removeItem(productId);
      return;
    }

    setIsUpdating(prev => ({ ...prev, [productId]: true }));
    await updateQuantity(productId, newQuantity);
    setIsUpdating(prev => ({ ...prev, [productId]: false }));
  };

  const handleRemoveItem = async (productId) => {
    setIsUpdating(prev => ({ ...prev, [productId]: true }));
    await removeItem(productId);
    setIsUpdating(prev => ({ ...prev, [productId]: false }));
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

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeCartDrawer}
      />
    

      
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-[#0B4866]" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              Shopping Cart ({getCartCount()})
            </h2>
          </div>
          <button
            onClick={closeCartDrawer}
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
                  onClick={closeCartDrawer}
                  className="inline-block bg-[#0B4866] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#094058] transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <OptimizedImage
                      src={item.image}
                      alt={item.title}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.id}`}
                      onClick={closeCartDrawer}
                      className="text-sm font-medium text-gray-900 hover:text-[#0B4866] line-clamp-2"
                    >
                      {item.title}
                    </Link>
                    
                    <div className="mt-1 text-sm text-gray-500">
                      {item.color && <span>{item.color}</span>}
                      {item.material && <span> • {item.material}</span>}
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
              ))}
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
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 flex items-center gap-2">
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
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/checkout"
                onClick={closeCartDrawer}
                className="block w-full bg-[#0B4866] text-white py-3 rounded-lg font-medium text-center hover:bg-[#094058] transition-colors"
              >
                Proceed to Checkout
              </Link>
              
              <Link
                href="/cart"
                onClick={closeCartDrawer}
                className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium text-center hover:bg-gray-50 transition-colors"
              >
                View Cart
              </Link>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
