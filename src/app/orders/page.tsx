'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiX, FiEye } from 'react-icons/fi';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
  };
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const statusConfig = {
  PENDING: { icon: FiClock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending' },
  CONFIRMED: { icon: FiCheckCircle, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Confirmed' },
  PACKED: { icon: FiPackage, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Packed' },
  SHIPPED: { icon: FiTruck, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Shipped' },
  DELIVERED: { icon: FiCheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Delivered' },
  CANCELLED: { icon: FiX, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled' },
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin?callbackUrl=/orders');
      return;
    }

    fetchOrders();
  }, [session, status]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }
      
      setOrders(data.orders);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
          <p className="text-gray-600 mt-2">Track and manage your orders</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <FiPackage className="mx-auto text-6xl text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping to see your orders here.</p>
            <Link href="/shop" className="bg-orange-500 text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || FiClock;
              const statusStyle = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING;
              
              return (
                <div key={order.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Order #{order.id.slice(-8)}</h3>
                        <p className="text-gray-600">
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center px-3 py-1 rounded-full ${statusStyle.bg}`}>
                          <StatusIcon className={`mr-2 ${statusStyle.color}`} />
                          <span className={`font-medium ${statusStyle.color}`}>{statusStyle.label}</span>
                        </div>
                        <Link 
                          href={`/orders/${order.id}`}
                          className="flex items-center text-orange-600 hover:text-orange-700 font-medium"
                        >
                          <FiEye className="mr-1" />
                          View
                        </Link>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="text-sm text-gray-600">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''}
                          </p>
                          <div className="text-sm text-gray-500">
                            {order.items.slice(0, 2).map((item, index) => (
                              <span key={item.id}>
                                {item.product.name}
                                {index < Math.min(order.items.length, 2) - 1 && ', '}
                              </span>
                            ))}
                            {order.items.length > 2 && ` and ${order.items.length - 2} more`}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">₹{(order.total / 100).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
