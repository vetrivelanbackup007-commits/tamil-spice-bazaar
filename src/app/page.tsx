import Link from "next/link";
import Reveal from "@/components/animated/Reveal";
import Button from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section-large bg-gradient-to-b from-white to-gray-50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h1 className="mb-6">
                Authentic Tamil Spices
                <span className="block text-gray-600">From Plants</span>
              </h1>
              <p className="text-large text-gray-600 mb-8 max-w-lg">
                Discover the rich flavors of Tamil Nadu with our carefully curated collection of premium spices. Fresh, authentic, and sustainably sourced.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="large" className="w-full sm:w-auto">
                    Shop Spices
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="secondary" size="large" className="w-full sm:w-auto">
                    Our Story
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square w-full max-w-md mx-auto bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl flex items-center justify-center">
                <div className="text-6xl">🌶️</div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-200 rounded-full opacity-60"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-green-200 rounded-full opacity-40"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="mb-4">Speaking Of Spices From Plants…</h2>
            <p className="text-large text-gray-600 max-w-2xl mx-auto">
              Our premium collection features the finest spices from Tamil Nadu, each carefully selected for quality and authenticity.
            </p>
          </div>
          <div className="grid grid-3 gap-8">
            {[
              { name: "Black Pepper", price: "₹299", emoji: "⚫" },
              { name: "Turmeric Powder", price: "₹199", emoji: "🟡" },
              { name: "Red Chili Powder", price: "₹249", emoji: "🔴" }
            ].map((product, idx) => (
              <div key={product.name} className="card group cursor-pointer" style={{animationDelay: `${idx * 0.1}s`}}>
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                  <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                    {product.emoji}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-4">Premium quality from Tamil Nadu</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{product.price}</span>
                    <Link href={`/products/${product.name.toLowerCase().replace(/\s+/g, "-")}`}>
                      <Button size="small">Learn More</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section bg-black text-white">
        <div className="container text-center">
          <h2 className="text-white mb-6">Our Mission</h2>
          <p className="text-large text-gray-300 max-w-3xl mx-auto mb-8">
            To bring you the authentic flavors of Tamil Nadu while supporting sustainable farming practices and local communities. Every spice tells a story of tradition, quality, and care.
          </p>
          <Link href="/about">
            <Button variant="secondary" size="large">
              Learn More About Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
