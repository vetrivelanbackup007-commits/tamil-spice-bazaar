'use client';

import { useState, useCallback } from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Route } from 'next';
 // Simple debounce utility to remove lodash dependency
 function debounce<T extends (...args: any[]) => void>(fn: T, wait: number) {
   let timeout: ReturnType<typeof setTimeout> | null = null;
   return (...args: Parameters<T>) => {
     if (timeout) clearTimeout(timeout);
     timeout = setTimeout(() => fn(...args), wait);
   };
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

interface ProductSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  filterOptions: FilterOptions;
  loading?: boolean;
}

export default function ProductSearch({ onFiltersChange, filterOptions, loading }: ProductSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams?.get('q') ?? '',
    category: searchParams?.get('category') ?? 'all',
    minPrice: searchParams?.get('minPrice') ?? '',
    maxPrice: searchParams?.get('maxPrice') ?? '',
    sortBy: searchParams?.get('sortBy') ?? 'createdAt',
    sortOrder: searchParams?.get('sortOrder') ?? 'desc'
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((newFilters: SearchFilters) => {
      onFiltersChange(newFilters);
      updateURL(newFilters);
    }, 300),
    [onFiltersChange]
  );

  const updateURL = (newFilters: SearchFilters) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        params.set(key, value);
      }
    });

    const newURL = params.toString() ? `/shop?${params.toString()}` : '/shop';
    router.push(newURL as Route, { scroll: false });
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (key === 'query') {
      debouncedSearch(newFilters);
    } else {
      onFiltersChange(newFilters);
      updateURL(newFilters);
    }
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      query: '',
      category: 'all',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    router.push('/shop');
  };

  const hasActiveFilters = filters.category !== 'all' || filters.minPrice || filters.maxPrice;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      {/* Search Bar */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for spices, masalas, and more..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-3 rounded-md border transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <FiFilter />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-white text-orange-500 text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </button>
      </div>

      {/* Sort Options */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="createdAt">Newest First</option>
            <option value="price">Price</option>
            <option value="name">Name</option>
            <option value="stock">Stock</option>
          </select>
          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="desc">High to Low</option>
            <option value="asc">Low to High</option>
          </select>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 text-orange-600 hover:text-orange-700"
          >
            <FiX />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="border-t pt-4 grid md:grid-cols-3 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {filterOptions.categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name} ({cat.count})
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (₹)</label>
            <input
              type="number"
              placeholder={`Min: ${filterOptions.priceRange.min}`}
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              min={filterOptions.priceRange.min}
              max={filterOptions.priceRange.max}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (₹)</label>
            <input
              type="number"
              placeholder={`Max: ${filterOptions.priceRange.max}`}
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              min={filterOptions.priceRange.min}
              max={filterOptions.priceRange.max}
            />
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
          <span className="ml-2 text-gray-600">Searching...</span>
        </div>
      )}
    </div>
  );
}
