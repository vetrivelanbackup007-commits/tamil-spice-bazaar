"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Button from "@/components/ui/Button"
import { useCart } from "@/contexts/cart"
import { formatINR } from "@/lib/currency"

export default function CartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { items, removeItem, updateQuantity, getTotalPrice, isLoaded } = useCart()

  if (status === "loading" || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="section">
          <div className="container">
            <div className="max-w-md mx-auto text-center">
              <div className="text-6xl mb-6">🛒</div>
              <h1 className="mb-4">Sign In Required</h1>
              <p className="text-gray-600 mb-8">
                Please sign in to view your cart and manage your items.
              </p>
              <Link href="/auth/signin">
                <Button size="large">Sign In</Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="section">
          <div className="container">
            <div className="max-w-md mx-auto text-center">
              <div className="text-6xl mb-6">🛒</div>
              <h1 className="mb-4">Your Cart is Empty</h1>
              <p className="text-gray-600 mb-8">
                Start shopping to add some delicious Tamil spices to your cart!
              </p>
              <Link href="/products">
                <Button size="large">Browse Products</Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="section">
        <div className="container">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-4 pb-6 border-b border-gray-200 last:border-b-0">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-gray-600">{formatINR(item.price)}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">{formatINR(item.price * item.quantity)}</p>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-red-600 hover:text-red-800 text-sm mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>{formatINR(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>{formatINR(getTotalPrice())}</span>
                    </div>
                  </div>
                </div>
                
                <Link href="/checkout">
                  <Button size="large" className="w-full">
                    Proceed to Checkout • ₹{(getTotalPrice() / 100).toFixed(2)}
                  </Button>
                </Link>
                
                <Link href="/shop" className="block text-center mt-4 text-orange-600 hover:text-orange-800">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
