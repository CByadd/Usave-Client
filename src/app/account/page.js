'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isAuthenticated } from '../lib/auth';
import { apiService } from '../services/api/apiClient';
import OptimizedImage from '../components/shared/OptimizedImage';
import Link from 'next/link';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    const authenticated = isAuthenticated();
    
    if (!authenticated || !currentUser) {
      router.push('/');
      return;
    }

    setUser(currentUser);
    setLoading(false);
    loadOrders();
  }, [router]);

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await apiService.orders.getAll();
      if (response.success) {
        setOrders(response.data?.orders || []);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-900">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                </div>
                {user.role && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{user.role.toLowerCase()}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/orders"
                  className="block px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-center"
                >
                  View Orders
                </Link>
                <Link
                  href="/wishlist"
                  className="block px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-center"
                >
                  View Wishlist
                </Link>
                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                  <Link
                    href="/admin/dashboard"
                    className="block px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-center"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
            <Link
              href="/orders"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All
            </Link>
          </div>

          {ordersLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">You have no orders yet.</p>
              <Link
                href="/products"
                className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <Link
                  key={order.id}
                  href={`/orders?orderId=${order.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Order #{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${order.total?.toFixed(2)}</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        order.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        order.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

