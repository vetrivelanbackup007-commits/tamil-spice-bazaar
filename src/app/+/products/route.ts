import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { ProductSchema } from "@/lib/validation";
import { rupeesToPaise } from "@/lib/currency";
import { verifyToken } from "@/server/auth";

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  const parsedProducts = products.map(p => ({
    ...p,
    tags: p.tags ? JSON.parse(p.tags) : [],
    images: p.images ? JSON.parse(p.images) : []
  }));
  return NextResponse.json({ products: parsedProducts });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("tsb_token")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = ProductSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { name, slug, description, price, stock, category, tags, images, affiliateCommission } = parsed.data;

  try {
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: rupeesToPaise(price),
        stock,
        category,
        tags: JSON.stringify(tags || []),
        images: JSON.stringify(images || []),
        affiliateCommission: affiliateCommission ?? 0,
      },
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
