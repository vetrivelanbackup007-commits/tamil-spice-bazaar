'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import { useCart } from '@/contexts/cart';
import Script from 'next/script';

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const { items } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin?callbackUrl=/checkout');
      return;
    }

    if (items.length === 0) {
      router.push('/cart');
      return;
    }
  }, [session, status, items, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!session || items.length === 0) {
    return null;
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <CheckoutForm />
        </div>
      </div>
    </>
  );
}
