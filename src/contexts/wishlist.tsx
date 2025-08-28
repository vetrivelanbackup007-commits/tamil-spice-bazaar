'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  slug: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  totalCount: number;
  isLoaded: boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (session?.user) {
      loadWishlist();
    } else {
      setItems([]);
      setIsLoaded(true);
    }
  }, [session]);

  const loadWishlist = () => {
    try {
      const saved = localStorage.getItem(`wishlist_${session?.user?.id}`);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveWishlist = (newItems: WishlistItem[]) => {
    if (session?.user?.id) {
      try {
        localStorage.setItem(`wishlist_${session.user.id}`, JSON.stringify(newItems));
      } catch (error) {
        console.error('Failed to save wishlist:', error);
      }
    }
  };

  const addItem = async (item: WishlistItem) => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: item.id })
      });

      if (response.ok) {
        const newItems = [...items.filter(i => i.id !== item.id), item];
        setItems(newItems);
        saveWishlist(newItems);
      }
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
    }
  };

  const removeItem = async (productId: string) => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const newItems = items.filter(item => item.id !== productId);
        setItems(newItems);
        saveWishlist(newItems);
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.id === productId);
  };

  const clearWishlist = () => {
    setItems([]);
    if (session?.user?.id) {
      localStorage.removeItem(`wishlist_${session.user.id}`);
    }
  };

  const value = {
    items,
    addItem,
    removeItem,
    isInWishlist,
    clearWishlist,
    totalCount: items.length,
    isLoaded
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
