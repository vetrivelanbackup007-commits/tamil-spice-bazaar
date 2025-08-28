'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiX } from 'react-icons/fi';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string;
  };
}

interface Order {
  id: string;
  total: number;
  status: string;
  shippingAddress: string;
  paymentId: string;
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

function OrderDetailContent({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const success = searchParams?.get('success');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchOrder();
  }, [session, status, params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch order');
      }
      
      setOrder(data.order);
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/orders" className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600">
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || FiClock;
  const statusStyle = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING;
  const shippingAddress = JSON.parse(order.shippingAddress);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <FiCheckCircle className="mr-2" />
              <span>Payment successful! Your order has been confirmed.</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">Order #{order.id.slice(-8)}</h1>
                <p className="opacity-90">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              <div className={`flex items-center px-3 py-1 rounded-full ${statusStyle.bg}`}>
                <StatusIcon className={`mr-2 ${statusStyle.color}`} />
                <span className={`font-medium ${statusStyle.color}`}>{statusStyle.label}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => {
                const images = JSON.parse(item.product.images || '[]');
                return (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-md mr-4 flex items-center justify-center">
                        {images.length > 0 ? (
                          <img src={images[0]} alt={item.product.name} className="w-full h-full object-cover rounded-md" />
                        ) : (
                          <FiPackage className="text-gray-400 text-xl" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-gray-600">₹{(item.price / 100).toFixed(2)} each</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{((item.price * item.quantity) / 100).toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold mb-3">Shipping Address</h3>
                <div className="text-gray-600">
                  <p>{shippingAddress.name}</p>
                  <p>{shippingAddress.line1}</p>
                  {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
                  <p>{shippingAddress.city}, {shippingAddress.state}</p>
                  <p>{shippingAddress.postalCode}, {shippingAddress.country}</p>
                  <p>Phone: {shippingAddress.phone}</p>
                </div>
              </div>

              {/* Order Total */}
              <div>
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{(order.total / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{(order.total / 100).toFixed(2)}</span>
                  </div>
                </div>
                {order.paymentId && (
                  <div className="mt-4 text-sm text-gray-600">
                    <p>Payment ID: {order.paymentId}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t">
            <div className="flex justify-between">
              <Link href="/orders" className="text-orange-600 hover:text-orange-700 font-medium">
                ← Back to Orders
              </Link>
              <Link href="/shop" className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OrderDetailContent params={params} />
    </Suspense>
  );
}
