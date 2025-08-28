import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { ProductSchema } from "@/lib/validation";
import { rupeesToPaise } from "@/lib/currency";
import { verifyToken } from "@/server/auth";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("tsb_token")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = ProductSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data: any = { ...parsed.data };
  if (typeof data.price === "number") data.price = rupeesToPaise(data.price);
  try {
    const product = await prisma.product.update({ where: { id: params.id }, data });
    return NextResponse.json({ product });
  } catch (e) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("tsb_token")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
