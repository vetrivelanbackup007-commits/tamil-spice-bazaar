"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/types";

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  totalCount: number;
  totalPrice: number;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("tsb_cart");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("tsb_cart", JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (productId: string) => setItems((prev) => prev.filter((i) => i.productId !== productId));
  
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) => 
      prev.map((item) => 
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };
  
  const clearCart = () => setItems([]);

  const totalCount = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const getTotalPrice = () => totalPrice;

  const value = { 
    items, 
    addItem, 
    removeItem, 
    updateQuantity,
    clearCart, 
    getTotalPrice,
    totalCount, 
    totalPrice,
    isLoaded
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
