'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductSearch from '@/components/shop/ProductSearch';
import ProductCard from '@/components/shop/ProductCard';
import { FiPackage } from 'react-icons/fi';

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string;
  affiliateCommission: number;
}

interface SearchFilters {
  query: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  sortOrder: string;
}

interface FilterOptions {
  categories: Array<{ name: string; count: number }>;
  priceRange: { min: number; max: number };
}

function ShopPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    priceRange: { min: 0, max: 1000 }
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const initialFilters: SearchFilters = {
    query: searchParams?.get('q') || '',
    category: searchParams?.get('category') || 'all',
    minPrice: searchParams?.get('minPrice') || '',
    maxPrice: searchParams?.get('maxPrice') || '',
    sortBy: searchParams?.get('sortBy') || 'createdAt',
    sortOrder: searchParams?.get('sortOrder') || 'desc'
  };

  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  useEffect(() => {
    // Check for affiliate referral
    const ref = searchParams?.get('ref');
    if (ref) {
      // Record affiliate click
      fetch('/api/affiliates/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promoCode: ref })
      }).catch(console.error);
    }

    searchProducts(filters);
  }, []);

  const searchProducts = async (searchFilters: SearchFilters, page = 1) => {
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '') {
          params.set(key, value);
        }
      });
      
      params.set('page', page.toString());
      params.set('limit', '12');

      const response = await fetch(`/api/products/search?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search products');
      }

      setProducts(data.products);
      setPagination(data.pagination);
      setFilterOptions(data.filters);

    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    searchProducts(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    searchProducts(filters, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Premium Tamil Nadu Spices</h1>
          <p className="text-gray-600">Discover authentic flavors from the heart of Tamil Nadu</p>
        </div>

        <ProductSearch
          onFiltersChange={handleFiltersChange}
          filterOptions={filterOptions}
          loading={loading}
        />

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {loading ? 'Searching...' : `Showing ${products.length} of ${pagination.total} products`}
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-md mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 border rounded-md ${
                      page === pagination.page
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <FiPackage className="mx-auto text-6xl text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Products Found</h2>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or browse our categories
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ShopPageContent />
    </Suspense>
  );
}
