"use client";
import React, { useState } from 'react';
import { Plus, Minus, Trash2, Search, X } from 'lucide-react';
import { apiService } from '../../services/api';
import productService from '../../services/productService';
import OptimizedImage from '../shared/OptimizedImage';

const AdminOrderEditor = ({ order, onOrderUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSearch = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await productService.searchProducts(query);
      setSearchResults(response.data.products || []);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddItem = async (product) => {
    setError('');
    setSuccess('');
    try {
      const response = await apiService.orders.addItemToOrder(order.id, product.id, 1);
      if (response.success) {
        onOrderUpdate(response.data);
        setSuccess(`Added ${product.title} to order`);
        setSearchQuery('');
        setSearchResults([]);
      } else {
        setError(response.message || 'Failed to add item');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item');
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    setError('');
    setSuccess('');
    try {
      const response = await apiService.orders.updateOrderItemQuantity(order.id, itemId, newQuantity);
      if (response.success) {
        onOrderUpdate(response.data);
        setSuccess('Quantity updated');
      } else {
        setError(response.message || 'Failed to update quantity');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!confirm('Remove this item from the order?')) return;
    
    setError('');
    setSuccess('');
    try {
      const response = await apiService.orders.removeItemFromOrder(order.id, itemId);
      if (response.success) {
        onOrderUpdate(response.data);
        setSuccess('Item removed');
      } else {
        setError(response.message || 'Failed to remove item');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Edit Order Items</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {isEditing ? 'Done Editing' : 'Edit Items'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Order Items List */}
      <div className="space-y-3 mb-4">
        {order.items.map((item) => {
          const product = item.product || {};
          return (
            <div key={item.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
              {product.image ? (
                <OptimizedImage
                  src={product.image}
                  alt={product.title || 'Product'}
                  width={60}
                  height={60}
                  className="w-15 h-15 object-cover rounded"
                />
              ) : (
                <div className="w-15 h-15 bg-gray-100 rounded" />
              )}
              
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">{product.title || 'Item'}</h5>
                <p className="text-sm text-gray-600">${(item.price || 0).toFixed(2)} each</p>
              </div>

              {isEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    className="p-1 rounded-full border border-gray-300 hover:bg-gray-50"
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  
                  <span className="text-sm font-medium w-8 text-center">
                    {item.quantity}
                  </span>
                  
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    className="p-1 rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    <Plus size={16} />
                  </button>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="ml-2 p-1 text-red-500 hover:text-red-700"
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ) : (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  <p className="font-medium text-gray-900">${((item.price || 0) * item.quantity).toFixed(2)}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Item Search */}
      {isEditing && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Add Item to Order</h4>
          
          <div className="relative">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <Search className="ml-3 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder="Search products to add..."
                className="flex-1 px-3 py-2 focus:outline-none text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="px-3 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleAddItem(product)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                  >
                    <OptimizedImage
                      src={product.image}
                      alt={product.title}
                      width={40}
                      height={40}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{product.title}</p>
                      <p className="text-xs text-gray-600">${product.discountedPrice}</p>
                    </div>
                    <Plus size={18} className="text-blue-600" />
                  </div>
                ))}
              </div>
            )}

            {isSearching && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-sm text-gray-600">
                Searching...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Totals */}
      <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium">${(order.subtotal || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax (10%):</span>
          <span className="font-medium">${(order.tax || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-2">
          <span>Total:</span>
          <span className="text-blue-600">${(order.total || 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderEditor;
