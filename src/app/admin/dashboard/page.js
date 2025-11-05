'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isAuthenticated } from '../../lib/auth';
import { apiService } from '../../services/api/apiClient';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    const authenticated = isAuthenticated();
    setUser(currentUser);
    
    if (!authenticated || (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'SUPER_ADMIN')) {
      router.push('/admin/login');
      return;
    }
    
    fetchOrders();
    
    // Set up polling for order updates every 5 seconds
    const pollInterval = setInterval(() => {
      fetchOrders();
    }, 5000);
    
    return () => clearInterval(pollInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.orders.getAll();
      if (response.success) {
        setOrders(response.data?.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId) => {
    try {
      const response = await apiService.orders.approve(orderId, 'Approved by admin');
      if (response.success) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Error approving order:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0B4866]"></div>
      </div>
    );
  }

  if (!isAuthenticated() || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <a
            href="/admin/login"
            onClick={(e) => {
              e.preventDefault();
              localStorage.removeItem('authToken');
              localStorage.removeItem('userData');
              router.push('/admin/login');
            }}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign out
          </a>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900">Pending Orders</h2>
            </div>
            <div className="border-t border-gray-200">
              {orders.length === 0 ? (
                <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                  No pending orders
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <li key={order.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#0B4866] truncate">
                            Order #{order.orderNumber || order.id}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {order.items.length} items • ${order.total.toFixed(2)}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <button
                            onClick={() => handleApprove(order.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
