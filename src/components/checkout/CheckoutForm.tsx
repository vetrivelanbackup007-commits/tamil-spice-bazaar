'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useCart } from '@/contexts/cart';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export default function CheckoutForm() {
  const { data: session } = useSession();
  const { items, getTotalPrice, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<ShippingAddress>({
    name: session?.user?.name || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: ''
  });

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const validateAddress = () => {
    const required = ['name', 'line1', 'city', 'state', 'postalCode', 'phone'];
    return required.every(field => address[field as keyof ShippingAddress]?.trim());
  };

  const handlePayment = async () => {
    if (!validateAddress()) {
      alert('Please fill in all required address fields');
      return;
    }

    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          })),
          shippingAddress: address,
          total: getTotalPrice()
        })
      });

      const orderData = await orderResponse.json();
      
      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Initialize Razorpay payment
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Tamil Spice Bazaar',
        description: 'Premium Tamil Nadu Spices',
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: session?.user?.name,
          email: session?.user?.email,
          contact: address.phone
        },
        theme: {
          color: '#D97706' // Saffron color
        },
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderData.orderId
              })
            });

            const verifyData = await verifyResponse.json();
            
            if (verifyResponse.ok) {
              clearCart();
              router.push(`/orders/${orderData.orderId}` as any);
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error('Payment error:', error);
      alert(error.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  const totalPrice = getTotalPrice();

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h2>
      
      {/* Order Summary */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between items-center py-2 border-b">
              <div>
                <span className="font-medium">{item.name}</span>
                <span className="text-gray-600 ml-2">x{item.quantity}</span>
              </div>
              <span className="font-semibold">₹{((item.price * item.quantity) / 100).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center py-2 text-lg font-bold">
            <span>Total</span>
            <span>₹{(totalPrice / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Full Name *"
            value={address.name}
            onChange={(e) => handleAddressChange('name', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <input
            type="tel"
            placeholder="Phone Number *"
            value={address.phone}
            onChange={(e) => handleAddressChange('phone', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Address Line 1 *"
            value={address.line1}
            onChange={(e) => handleAddressChange('line1', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent md:col-span-2"
          />
          <input
            type="text"
            placeholder="Address Line 2 (Optional)"
            value={address.line2}
            onChange={(e) => handleAddressChange('line2', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent md:col-span-2"
          />
          <input
            type="text"
            placeholder="City *"
            value={address.city}
            onChange={(e) => handleAddressChange('city', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="State *"
            value={address.state}
            onChange={(e) => handleAddressChange('state', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Postal Code *"
            value={address.postalCode}
            onChange={(e) => handleAddressChange('postalCode', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Country"
            value={address.country}
            onChange={(e) => handleAddressChange('country', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={loading || items.length === 0}
        className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 px-6 rounded-md font-semibold text-lg hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {loading ? 'Processing...' : `Pay ₹${(totalPrice / 100).toFixed(2)}`}
      </button>

      <div className="mt-4 text-sm text-gray-600 text-center">
        <p>Secure payment powered by Razorpay</p>
        <p>Supports UPI, Cards, Net Banking & Wallets</p>
      </div>
    </div>
  );
}
