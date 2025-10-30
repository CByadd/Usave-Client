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

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0  bg-black/40 backdrop-blur-sm"
        onClick={closeCartDrawer}
      />
    

      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
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

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
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

                    <div className="mt-2 flex items-center justify-between">
                      {/* Price */}
                      <div className="text-sm font-semibold text-gray-900">
                        ${item.discountedPrice}.00
                      </div>

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
          <div className="border-t border-gray-200 p-6">
            {/* Total */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-xl font-bold text-[#0B4866]">
                ${getCartTotal().toFixed(2)}
              </span>
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
  );
};

export default CartDrawer;
