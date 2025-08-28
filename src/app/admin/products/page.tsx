'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import { FiEdit, FiTrash2, FiPlus, FiPackage, FiSearch, FiFilter } from "react-icons/fi";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  category: string;
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products.map(p => p.category)));
  const formatINR = (price: number) => `₹${(price / 100).toFixed(2)}`;
  
  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <FiPackage className="text-orange-600" />
                  Product Management
                </h1>
                <p className="mt-2 text-gray-600">
                  Manage your Tamil spice inventory, pricing, and product details
                </p>
              </div>
              <Link href="/admin/products/new" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <FiPlus /> Add New Product
              </Link>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <FiFilter className="text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiPackage className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Products</p>
                  <p className="text-2xl font-semibold text-gray-900">{products.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">In Stock</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {products.filter(p => p.stock > 0).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold">!</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Low Stock</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {products.filter(p => p.stock <= 10 && p.stock > 0).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-bold">×</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {products.filter(p => p.stock === 0).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">All Products</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                              <span className="text-orange-600 font-semibold text-lg">
                                {product.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatINR(product.price)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.stock} units</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.stock > 10 
                            ? 'bg-green-100 text-green-800'
                            : product.stock > 0
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link 
                            href={`/admin/products/${product.id}`}
                            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center gap-1"
                          >
                            <FiEdit className="w-3 h-3" /> Edit
                          </Link>
                          <button 
                            onClick={() => deleteProduct(product.id)}
                            className="px-3 py-1 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50 flex items-center gap-1"
                          >
                            <FiTrash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProducts.length === 0 && !loading && (
                <div className="text-center py-12">
                  <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {products.length === 0 ? 'No products' : 'No products match your search'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {products.length === 0 
                      ? 'Get started by creating your first spice product.'
                      : 'Try adjusting your search or filter criteria.'
                    }
                  </p>
                  {products.length === 0 && (
                    <div className="mt-6">
                      <Link 
                        href="/admin/products/new"
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
                      >
                        <FiPlus className="w-4 h-4" /> Add Product
                      </Link>
                    </div>
                  )}
                </div>
              )}
              {loading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading products...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
