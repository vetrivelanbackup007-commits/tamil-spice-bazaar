import Link from "next/link";
import Button from "@/components/ui/Button";
import { formatINR } from "@/lib/currency";
import AddToCartButton from "@/components/shop/AddToCartButton";
import { headers } from "next/headers";

export default async function ProductsPage() {
  const hdrs = headers();
  const protocol = hdrs.get("x-forwarded-proto") ?? "http";
  const host = hdrs.get("host");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (host ? `${protocol}://${host}` : "http://localhost:3000");
  const res = await fetch(`${baseUrl}/api/products`, { cache: "no-store" });
  const data = await res.json();
  const products = data.products as Array<{ id: string; slug: string; name: string; price: number; description?: string }>;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="section bg-gradient-to-b from-gray-50 to-white">
        <div className="container">
          <div className="text-center">
            <h1 className="mb-4">Premium Tamil Spices</h1>
            <p className="text-large text-gray-600 max-w-2xl mx-auto">
              Discover our complete collection of authentic spices from Tamil Nadu, each carefully selected for exceptional quality and flavor.
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section">
        <div className="container">
          {products.length > 0 ? (
            <div className="grid grid-3 gap-8">
              {products.map((product) => (
                <div key={product.id} className="card group">
                  <div className="aspect-square bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center relative overflow-hidden">
                    <div className="text-4xl opacity-60 group-hover:scale-110 transition-transform duration-300">
                      🌶️
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      {product.description || "Premium quality spice from Tamil Nadu"}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold">{formatINR(product.price)}</span>
                      <Link href={`/products/${product.slug}`}>
                        <Button size="small" variant="secondary">
                          Learn More
                        </Button>
                      </Link>
                    </div>
                    <AddToCartButton 
                      id={product.id} 
                      name={product.name} 
                      price={product.price} 
                      label="Add to Cart"
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌶️</div>
              <h3 className="text-xl font-semibold mb-2">No products available</h3>
              <p className="text-gray-600">Check back soon for our premium spice collection.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
