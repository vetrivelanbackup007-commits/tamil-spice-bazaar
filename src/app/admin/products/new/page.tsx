import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import ProductForm from "@/components/forms/ProductForm";
import { redirect } from "next/navigation";
import { FiArrowLeft, FiPackage } from "react-icons/fi";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NewProductPage() {
  async function onSaved() {
    "use server";
    redirect("/admin/products");
  }

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/admin/products">
              <Button variant="outline" className="mb-4 flex items-center gap-2">
                <FiArrowLeft /> Back to Products
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FiPackage className="text-orange-600" />
              Add New Spice Product
            </h1>
            <p className="mt-2 text-gray-600">
              Create a new spice product for your Tamil Nadu collection
            </p>
          </div>

          {/* Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <ProductForm onSaved={onSaved} />
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
