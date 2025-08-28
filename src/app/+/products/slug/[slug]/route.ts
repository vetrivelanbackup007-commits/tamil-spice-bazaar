import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}
