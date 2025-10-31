"use client";
import React, { useState } from 'react';
import { Plus, Minus, Trash2, AlertCircle } from 'lucide-react';
import api from '../../services/api/apiClient';
import OptimizedImage from '../shared/OptimizedImage';

const RejectedOrderEditor = ({ order, onOrderUpdate, onResubmit }) => {
  const [editedItems, setEditedItems] = useState(
    order.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      product: item.product
    }))
  );
  const [shippingAddress, setShippingAddress] = useState(order.shippingAddress);
  const [billingAddress, setBillingAddress] = useState(order.billingAddress);
  const [notes, setNotes] = useState(order.notes || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updated = [...editedItems];
    updated[index].quantity = newQuantity;
    setEditedItems(updated);
  };

  const handleRemoveItem = (index) => {
    if (editedItems.length === 1) {
      setError('Cannot remove the last item');
      return;
    }
    const updated = editedItems.filter((_, i) => i !== index);
    setEditedItems(updated);
  };

  const handleSaveItems = async () => {
    setError('');
    setSuccess('');
    try {
      const items = editedItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));
      
      const response = await api.orders.editOrderItems(order.id, items);
      if (response.success) {
        onOrderUpdate(response.data);
        setSuccess('Order items updated successfully');
      } else {
        setError(response.message || 'Failed to update items');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update items');
    }
  };

  const handleSaveAddresses = async () => {
    setError('');
    setSuccess('');
    try {
      const response = await api.orders.editOrderAddresses(
        order.id,
        shippingAddress,
        billingAddress
      );
      if (response.success) {
        onOrderUpdate(response.data);
        setSuccess('Addresses updated successfully');
      } else {
        setError(response.message || 'Failed to update addresses');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update addresses');
    }
  };

  const handleResubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const response = await api.orders.requestReapproval(order.id, notes);
      if (response.success) {
        onResubmit(response.data);
      } else {
        setError(response.message || 'Failed to resubmit order');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resubmit order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Rejection Notice */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h4 className="font-semibold text-red-900 mb-1">Order Rejected</h4>
            <p className="text-sm text-red-700 mb-2">
              {order.approvalNotes || 'Your order was rejected by the admin. Please review and make necessary changes before resubmitting.'}
            </p>
            <p className="text-xs text-red-600">
              You can edit the items, quantities, and addresses below, then resubmit for approval.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Edit Items */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
        
        <div className="space-y-3 mb-4">
          {editedItems.map((item, index) => {
            const product = item.product || {};
            return (
              <div key={index} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
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
                  <p className="text-sm text-gray-600">${(product.discountedPrice || 0).toFixed(2)} each</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(index, item.quantity - 1)}
                    className="p-1 rounded-full border border-gray-300 hover:bg-gray-50"
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  
                  <span className="text-sm font-medium w-8 text-center">
                    {item.quantity}
                  </span>
                  
                  <button
                    onClick={() => handleQuantityChange(index, item.quantity + 1)}
                    className="p-1 rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    <Plus size={16} />
                  </button>

                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="ml-2 p-1 text-red-500 hover:text-red-700"
                    disabled={editedItems.length === 1}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSaveItems}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Save Item Changes
        </button>
      </div>

      {/* Edit Addresses */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping & Billing</h3>
        
        <div className="grid md:grid-cols-2 gap-6 mb-4">
          {/* Shipping Address */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Shipping Address</h4>
            <div className="space-y-3">
              <input
                type="text"
                value={shippingAddress.address1}
                onChange={(e) => setShippingAddress({...shippingAddress, address1: e.target.value})}
                placeholder="Address Line 1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <input
                type="text"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                placeholder="City"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <input
                type="text"
                value={shippingAddress.postalCode}
                onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                placeholder="Postal Code"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Billing Address */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Billing Address</h4>
            <div className="space-y-3">
              <input
                type="text"
                value={billingAddress.address1}
                onChange={(e) => setBillingAddress({...billingAddress, address1: e.target.value})}
                placeholder="Address Line 1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <input
                type="text"
                value={billingAddress.city}
                onChange={(e) => setBillingAddress({...billingAddress, city: e.target.value})}
                placeholder="City"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <input
                type="text"
                value={billingAddress.postalCode}
                onChange={(e) => setBillingAddress({...billingAddress, postalCode: e.target.value})}
                placeholder="Postal Code"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveAddresses}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Save Address Changes
        </button>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes or explanations for the admin..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Resubmit Button */}
      <button
        onClick={handleResubmit}
        disabled={isSubmitting}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Resubmitting...' : 'Resubmit Order for Approval'}
      </button>
    </div>
  );
};

export default RejectedOrderEditor;
