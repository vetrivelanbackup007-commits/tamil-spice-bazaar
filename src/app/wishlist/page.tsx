'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useWishlist } from '@/contexts/wishlist';
import { useCart } from '@/contexts/cart';
import Link from 'next/link';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import AnimatedCard from '@/components/ui/AnimatedCard';
import SpiceButton from '@/components/ui/SpiceButton';

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, removeItem, clearWishlist, isLoaded } = useWishlist();
  const { addItem: addToCart } = useCart();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin?callbackUrl=/wishlist');
      return;
    }
  }, [session, status]);

  const handleAddToCart = (item: any) => {
    const cartItem = {
      id: item.id,
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image
    };
    addToCart(cartItem);
  };

  if (status === 'loading' || !isLoaded) {
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Wishlist</h1>
          <p className="text-gray-600">Save your favorite spices for later</p>
        </div>

        {items.length === 0 ? (
          <AnimatedCard className="p-12 text-center">
            <FiHeart className="mx-auto text-6xl text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your Wishlist is Empty</h2>
            <p className="text-gray-600 mb-6">
              Discover amazing Tamil Nadu spices and add them to your wishlist
            </p>
            <Link href="/shop">
              <SpiceButton>Start Shopping</SpiceButton>
            </Link>
          </AnimatedCard>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">{items.length} item{items.length > 1 ? 's' : ''} in your wishlist</p>
              <button
                onClick={clearWishlist}
                className="text-red-600 hover:text-red-700 flex items-center space-x-1"
              >
                <FiTrash2 />
                <span>Clear All</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item, index) => (
                <AnimatedCard key={item.id} delay={index * 0.1}>
                  <div className="relative">
                    {/* Remove from wishlist button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <FiHeart className="w-4 h-4 fill-current text-red-500" />
                    </button>

                    {/* Product Image */}
                    <div className="aspect-square bg-gray-200 rounded-t-lg overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiHeart className="text-4xl text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <Link href={`/products/${item.slug}`}>
                        <h3 className="font-semibold text-gray-800 mb-2 hover:text-orange-600 transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-lg font-bold text-orange-600 mb-4">
                        ₹{(item.price / 100).toFixed(2)}
                      </p>

                      {/* Actions */}
                      <div className="space-y-2">
                        <SpiceButton
                          onClick={() => handleAddToCart(item)}
                          className="w-full flex items-center justify-center space-x-2"
                          size="sm"
                        >
                          <FiShoppingCart />
                          <span>Add to Cart</span>
                        </SpiceButton>
                        <Link href={`/products/${item.slug}`}>
                          <button className="w-full px-4 py-2 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors">
                            View Details
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
