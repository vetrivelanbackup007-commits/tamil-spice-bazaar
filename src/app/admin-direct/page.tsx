'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { 
  FiPackage, 
  FiUsers, 
  FiDollarSign, 
  FiTrendingUp, 
  FiShoppingCart, 
  FiStar,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiTruck
} from 'react-icons/fi';
import Link from 'next/link';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  pendingOrders: number;
  monthlyGrowth: number;
  todayOrders: number;
  lowStockProducts: number;
  totalAffiliates: number;
  monthlyRevenue: number;
}

interface RecentOrder {
  id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboardDirect() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();
      
      if (response.ok) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <FiClock className="text-yellow-500" />;
      case 'CONFIRMED': return <FiCheckCircle className="text-blue-500" />;
      case 'SHIPPED': return <FiTruck className="text-orange-500" />;
      case 'DELIVERED': return <FiCheckCircle className="text-green-500" />;
      default: return <FiAlertCircle className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard (Direct Access)</h1>
            <p className="mt-2 text-gray-600">Tamil Spice Bazaar - Business Overview</p>
            <p className="mt-1 text-sm text-blue-600">
              Current User: {session?.user?.email} | Role: {session?.user?.role || 'No role'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : `₹${((stats?.totalRevenue || 0) / 100).toLocaleString()}`}
                </p>
                <p className="text-xs text-green-600 mt-1">+{stats?.monthlyGrowth || 0}% this month</p>
              </div>
              <FiDollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats?.totalOrders || 0}
                </p>
                <p className="text-xs text-blue-600 mt-1">{stats?.todayOrders || 0} today</p>
              </div>
              <FiShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats?.totalUsers || 0}
                </p>
                <p className="text-xs text-purple-600 mt-1">{stats?.totalAffiliates || 0} affiliates</p>
              </div>
              <FiUsers className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats?.totalProducts || 0}
                </p>
                <p className="text-xs text-red-600 mt-1">{stats?.lowStockProducts || 0} low stock</p>
              </div>
              <FiPackage className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pending Orders</h3>
              <FiAlertCircle className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {stats?.pendingOrders || 0}
            </div>
            <p className="text-sm text-gray-600 mb-4">Orders waiting for processing</p>
            <button className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors">
              Process Orders
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FiPackage className="h-5 w-5 text-orange-600 mr-3" />
                <span className="text-sm font-medium">Add New Product</span>
              </div>
              <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FiShoppingCart className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium">Manage Orders</span>
              </div>
              <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FiTrendingUp className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium">View Analytics</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Revenue</span>
                  <span className="font-medium">₹{((stats?.monthlyRevenue || 0) / 100).toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Orders</span>
                  <span className="font-medium">{stats?.todayOrders || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '60%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <span className="text-orange-600 text-sm font-medium">
                Pending: {stats?.pendingOrders || 0}
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{(order.total / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'SHIPPED' ? 'bg-orange-100 text-orange-800' :
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No recent orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
