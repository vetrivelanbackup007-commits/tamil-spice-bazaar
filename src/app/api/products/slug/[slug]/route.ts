import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsedProduct = {
    ...product,
    tags: product.tags ? JSON.parse(product.tags) : [],
    images: product.images ? JSON.parse(product.images) : []
  };
  return NextResponse.json({ product: parsedProduct });
}
