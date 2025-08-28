"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useCart } from "@/contexts/cart";

type AddToCartButtonProps = {
  id: string;
  name: string;
  price: number;
  className?: string;
  label?: string;
  variant?: "primary" | "secondary" | "accent" | "outline";
  size?: "small" | "medium" | "large";
};

export default function AddToCartButton({ 
  id, 
  name, 
  price, 
  className, 
  label = "Add to Cart", 
  variant = "primary",
  size = "medium"
}: AddToCartButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { addItem } = useCart();
  const [loading, setLoading] = useState(false);
  
  const handleAddToCart = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setLoading(true);
    try {
      addItem({ productId: id, name, price, quantity: 1 });
      // Optional: Show success message
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleAddToCart}
      disabled={loading}
    >
      {loading ? 'Adding...' : label}
    </Button>
  );
}
