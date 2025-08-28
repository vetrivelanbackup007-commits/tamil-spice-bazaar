'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useWishlist } from '@/contexts/wishlist';
import { FiHeart } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface WishlistButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    slug: string;
    images?: string;
  };
  className?: string;
}

export default function WishlistButton({ product, className = '' }: WishlistButtonProps) {
  const { data: session } = useSession();
  const { addItem, removeItem, isInWishlist } = useWishlist();
  const [loading, setLoading] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const handleToggleWishlist = async () => {
    if (!session) {
      // Redirect to sign in
      window.location.href = '/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname);
      return;
    }

    setLoading(true);

    try {
      const images = product.images ? JSON.parse(product.images) : [];
      const wishlistItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        slug: product.slug,
        image: images[0] || undefined
      };

      if (inWishlist) {
        await removeItem(product.id);
      } else {
        await addItem(wishlistItem);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleToggleWishlist}
      disabled={loading}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`p-2 rounded-full transition-all duration-200 ${
        inWishlist
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500 border border-gray-200'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <FiHeart 
        className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`}
        fill={inWishlist ? 'currentColor' : 'none'}
      />
    </motion.button>
  );
}
