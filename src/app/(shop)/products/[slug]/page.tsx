import Link from "next/link";
import Button from "@/components/ui/Button";
import { formatINR } from "@/lib/currency";
import AddToCartButton from "@/components/shop/AddToCartButton";

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/products/slug/${params.slug}`, { cache: "no-store" });
  if (!res.ok) {
    return (
      <div className="section">
        <div className="container text-center">
          <div className="text-6xl mb-4">🌶️</div>
          <h1 className="mb-4">Product Not Found</h1>
          <p className="text-large text-gray-600 mb-8">The spice you're looking for doesn't exist.</p>
          <Link href="/products">
            <Button size="large">Browse All Spices</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const { product } = await res.json();

  return (
    <div className="min-h-screen bg-white">
      {/* Product Hero */}
      <section className="section">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Product Image */}
            <div className="aspect-square bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl flex items-center justify-center relative overflow-hidden">
              <div className="text-8xl opacity-60">🌶️</div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
            </div>
            
            {/* Product Info */}
            <div className="lg:pt-8">
              <h1 className="mb-4">{product.name}</h1>
              <p className="text-large text-gray-600 mb-6 leading-relaxed">
                {product.description || "Premium quality spice from Tamil Nadu, carefully selected for exceptional flavor and authenticity."}
              </p>
              
              <div className="mb-8">
                <div className="text-3xl font-bold mb-2">{formatINR(product.price)}</div>
                <p className="text-gray-600">Free shipping on orders over ₹500</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <AddToCartButton 
                  id={product.id} 
                  name={product.name} 
                  price={product.price} 
                  size="large"
                  className="flex-1 sm:flex-none sm:min-w-[200px]"
                />
                <Link href="/cart">
                  <Button variant="secondary" size="large" className="w-full sm:w-auto">
                    View Cart
                  </Button>
                </Link>
              </div>
              
              {/* Product Features */}
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>100% Natural & Authentic</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Sourced from Tamil Nadu</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Premium Quality Guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Product Details */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="mb-6 text-center">About This Spice</h2>
            <div className="card p-8">
              <p className="text-large text-gray-700 leading-relaxed mb-6">
                {product.description || "This premium spice is carefully sourced from the finest farms in Tamil Nadu, where traditional cultivation methods ensure exceptional quality and authentic flavor. Each batch is hand-selected and processed to maintain the natural oils and compounds that give our spices their distinctive taste and aroma."}
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Origin</h3>
                  <p className="text-gray-600">Tamil Nadu, India</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Processing</h3>
                  <p className="text-gray-600">Traditional sun-dried</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Storage</h3>
                  <p className="text-gray-600">Cool, dry place</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Shelf Life</h3>
                  <p className="text-gray-600">24 months</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
