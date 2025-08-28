'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import { 
  FiPackage, 
  FiTruck, 
  FiCheckCircle, 
  FiClock, 
  FiX, 
  FiEye,
  FiEdit,
  FiFilter,
  FiDownload
} from 'react-icons/fi';
import Link from 'next/link';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
  };
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  } | null;
  items: OrderItem[];
  shippingAddress: string;
  paymentId: string | null;
}

const statusConfig = {
  PENDING: { icon: FiClock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending' },
  CONFIRMED: { icon: FiCheckCircle, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Confirmed' },
  PACKED: { icon: FiPackage, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Packed' },
  SHIPPED: { icon: FiTruck, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Shipped' },
  DELIVERED: { icon: FiCheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Delivered' },
  CANCELLED: { icon: FiX, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled' },
};

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(searchParams?.get('status') || 'ALL');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') {
        params.set('status', selectedStatus);
      }
      
      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchOrders();
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    } finally {
      setUpdating(null);
    }
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;
  };

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                  <p className="mt-2 text-gray-600">Process and track customer orders</p>
                </div>
                <div className="flex space-x-3">
                  <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    <FiDownload className="mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center space-x-4">
              <FiFilter className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filter by status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="ALL">All Orders</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PACKED">Packed</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        </div>
                      </td>
                    </tr>
                  ) : orders.length > 0 ? (
                    orders.map((order) => {
                      const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || FiClock;
                      const statusStyle = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING;
                      const nextStatus = getNextStatus(order.status);
                      
                      return (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order.id.slice(-8)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {order.user?.name || 'Guest'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.user?.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₹{(order.total / 100).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.color}`}>
                              <StatusIcon className="mr-1.5 h-3 w-3" />
                              {statusStyle.label}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Link href={`/admin/orders/${order.id}`} className="text-orange-600 hover:text-orange-900">
                                <FiEye className="h-4 w-4" />
                              </Link>
                              {nextStatus && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, nextStatus)}
                                  disabled={updating === order.id}
                                  className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                  title={`Mark as ${nextStatus}`}
                                >
                                  {updating === order.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                  ) : (
                                    <FiEdit className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <FiPackage className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p>No orders found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
