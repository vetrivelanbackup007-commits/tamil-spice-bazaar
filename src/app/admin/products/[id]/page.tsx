import { prisma } from "@/server/db";
import ProductForm from "@/components/forms/ProductForm";
import { notFound, redirect } from "next/navigation";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return notFound();

  async function onSaved() {
    "use server";
    redirect("/admin/products");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-heading font-semibold">Edit Product</h1>
      <div className="mt-6">
        <ProductForm initial={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: Math.round(product.price / 100),
          stock: product.stock,
          category: product.category || "",
          tags: product.tags ? JSON.parse(product.tags) : [],
          images: product.images ? JSON.parse(product.images) : [],
          affiliateCommission: product.affiliateCommission,
        }} onSaved={onSaved} />
      </div>
    </div>
  );
}
