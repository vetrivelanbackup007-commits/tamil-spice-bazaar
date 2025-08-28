"use client";
import React from "react";
import Button from "@/components/ui/Button";
import { FiUpload, FiX } from "react-icons/fi";

export type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  price: number; // rupees
  stock: number;
  category?: string;
  tags?: string[];
  images?: string[];
  affiliateCommission?: number;
};

export default function ProductForm({ initial, onSaved }: { initial?: Partial<ProductFormValues>; onSaved?: () => void }) {
  const [values, setValues] = React.useState<ProductFormValues>({
    name: initial?.name || "",
    slug: initial?.slug || "",
    description: initial?.description || "",
    price: initial?.price || 0,
    stock: initial?.stock || 0,
    category: initial?.category || "",
    tags: initial?.tags || [],
    images: initial?.images || [],
    affiliateCommission: initial?.affiliateCommission || 0,
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onSaved?.();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setValues(v => ({ 
      ...v, 
      name, 
      slug: v.slug || generateSlug(name) 
    }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
              value={values.name} 
              onChange={(e) => handleNameChange(e.target.value)} 
              placeholder="e.g., Premium Red Chili Powder"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug *</label>
            <input 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
              value={values.slug} 
              onChange={(e) => setValues((v) => ({ ...v, slug: e.target.value }))} 
              placeholder="premium-red-chili-powder"
              required 
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea 
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
            value={values.description} 
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))} 
            placeholder="Describe the spice, its origin, flavor profile, and uses..."
            required 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select 
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            value={values.category} 
            onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}
          >
            <option value="">Select a category</option>
            <option value="whole-spices">Whole Spices</option>
            <option value="powder-spices">Powder Spices</option>
            <option value="spice-blends">Spice Blends</option>
            <option value="seeds">Seeds</option>
            <option value="herbs">Herbs</option>
            <option value="specialty">Specialty Items</option>
          </select>
        </div>
      </div>

      {/* Pricing & Inventory */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Pricing & Inventory</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
            <input 
              type="number" 
              min="0" 
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
              value={values.price} 
              onChange={(e) => setValues((v) => ({ ...v, price: Number(e.target.value) }))} 
              placeholder="299.00"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
            <input 
              type="number" 
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
              value={values.stock} 
              onChange={(e) => setValues((v) => ({ ...v, stock: Number(e.target.value) }))} 
              placeholder="100"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Affiliate Commission (%)</label>
            <input 
              type="number" 
              min="0" 
              max="50"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
              value={values.affiliateCommission} 
              onChange={(e) => setValues((v) => ({ ...v, affiliateCommission: Number(e.target.value) }))} 
              placeholder="5.0"
            />
          </div>
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Product Images</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
          <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Upload product images
              </span>
              <span className="mt-1 block text-sm text-gray-500">
                PNG, JPG, GIF up to 10MB each
              </span>
            </label>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" />
          </div>
          <Button type="button" variant="outline" className="mt-4">
            Choose Files
          </Button>
        </div>
      </div>

      {/* Tags Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Tags</h3>
        <div>
          <input 
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
            placeholder="Add tags separated by commas (e.g., spicy, authentic, tamil-nadu)"
            onChange={(e) => {
              const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
              setValues(v => ({ ...v, tags }));
            }}
          />
          <p className="mt-1 text-sm text-gray-500">Tags help customers find your products</p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        {error && <p className="text-sm text-red-600 mr-auto">{error}</p>}
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-orange-600 hover:bg-orange-700 text-white" 
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Product"}
        </Button>
      </div>
    </form>
  );
}
