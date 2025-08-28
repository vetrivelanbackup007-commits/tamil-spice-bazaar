'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import { 
  FiPackage, 
  FiTruck, 
  FiCheckCircle, 
  FiClock, 
  FiX, 
  FiArrowLeft,
  FiUser,
  FiMapPin,
  FiCreditCard,
  FiEdit3
} from 'react-icons/fi';
import Link from 'next/link';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    image: string;
  };
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
  } | null;
  items: OrderItem[];
  shippingAddress: string;
  paymentId: string | null;
  razorpayOrderId: string | null;
}

const statusConfig = {
  PENDING: { icon: FiClock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending' },
  CONFIRMED: { icon: FiCheckCircle, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Confirmed' },
  PACKED: { icon: FiPackage, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Packed' },
  SHIPPED: { icon: FiTruck, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Shipped' },
  DELIVERED: { icon: FiCheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Delivered' },
  CANCELLED: { icon: FiX, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled' },
};

const statusFlow = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      
      if (response.ok) {
        setOrder(data);
      } else {
        console.error('Failed to fetch order:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchOrder();
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getAvailableStatuses = (currentStatus: string) => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex === -1) return [];
    
    return statusFlow.slice(currentIndex + 1);
  };

  if (loading) {
    return (
      <AdminProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AdminProtectedRoute>
    );
  }

  if (!order) {
    return (
      <AdminProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <FiPackage className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">Order not found</p>
            <Link href="/admin/orders" className="text-orange-600 hover:text-orange-800 mt-2 inline-block">
              Back to Orders
            </Link>
          </div>
        </div>
      </AdminProtectedRoute>
    );
  }

  const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || FiClock;
  const statusStyle = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING;
  const availableStatuses = getAvailableStatuses(order.status);

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Link href="/admin/orders" className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
                    <FiArrowLeft className="h-5 w-5" />
                  </Link>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Order #{order.id.slice(-8)}</h1>
                    <p className="mt-2 text-gray-600">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.color}`}>
                  <StatusIcon className="mr-2 h-4 w-4" />
                  {statusStyle.label}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <FiPackage className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-gray-600">Price: ₹{(item.price / 100).toFixed(2)} each</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₹{((item.price * item.quantity) / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Order Total */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">₹{(order.total / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details Sidebar */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiUser className="mr-2" />
                  Customer
                </h3>
                <div className="space-y-2">
                  <p className="font-medium">{order.user?.name || 'Guest'}</p>
                  <p className="text-gray-600">{order.user?.email}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiMapPin className="mr-2" />
                  Shipping Address
                </h3>
                <p className="text-gray-600 whitespace-pre-line">{order.shippingAddress}</p>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiCreditCard className="mr-2" />
                  Payment
                </h3>
                <div className="space-y-2">
                  {order.paymentId && (
                    <p className="text-sm text-gray-600">
                      Payment ID: {order.paymentId}
                    </p>
                  )}
                  {order.razorpayOrderId && (
                    <p className="text-sm text-gray-600">
                      Razorpay Order: {order.razorpayOrderId}
                    </p>
                  )}
                  <p className="font-medium text-green-600">
                    {order.paymentId ? 'Paid' : 'Pending Payment'}
                  </p>
                </div>
              </div>

              {/* Status Actions */}
              {availableStatuses.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiEdit3 className="mr-2" />
                    Update Status
                  </h3>
                  <div className="space-y-2">
                    {availableStatuses.map((status) => {
                      const config = statusConfig[status as keyof typeof statusConfig];
                      return (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(status)}
                          disabled={updating}
                          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                        >
                          {updating ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                          ) : (
                            <>
                              {config && <config.icon className="mr-2 h-4 w-4" />}
                              Mark as {config?.label || status}
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
