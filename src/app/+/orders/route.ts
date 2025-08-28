import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { CreateOrderSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateOrderSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { items, shippingAddress } = parsed.data;
    const products = await prisma.product.findMany({ where: { id: { in: items.map((i) => i.productId) } } });
    if (products.length !== items.length) return NextResponse.json({ error: "Invalid products" }, { status: 400 });

    const orderItems = items.map((i) => {
      const p = products.find((pr) => pr.id === i.productId)!;
      return { productId: p.id, quantity: i.quantity, price: p.price };
    });

    const total = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);

    const order = await prisma.order.create({
      data: {
        items: { create: orderItems },
        total,
        shippingAddress: JSON.stringify(shippingAddress),
      },
      include: { items: true },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
