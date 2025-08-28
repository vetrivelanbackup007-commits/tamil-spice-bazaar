"use client";
import React from "react";
import { CartProvider } from "@/contexts/cart";
import { WishlistProvider } from "@/contexts/wishlist";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <WishlistProvider>{children}</WishlistProvider>
    </CartProvider>
  );
}
