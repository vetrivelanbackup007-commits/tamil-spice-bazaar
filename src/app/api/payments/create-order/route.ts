import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import Razorpay from 'razorpay';
import { prisma } from '@/server/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, shippingAddress, total } = await request.json();

    // Validate items and calculate total
    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 });
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });
      }

      const itemTotal = product.price * item.quantity;
      calculatedTotal += itemTotal;
      
      validatedItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      });
    }

    if (Math.abs(calculatedTotal - total) > 1) { // Allow 1 paise difference for rounding
      return NextResponse.json({ error: 'Total mismatch' }, { status: 400 });
    }

    // Create Razorpay order (instantiate SDK lazily to avoid build-time env checks)
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
    const razorpayOrder = await razorpay.orders.create({
      amount: total, // amount in paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    });

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        total,
        shippingAddress: JSON.stringify(shippingAddress),
        razorpayOrderId: razorpayOrder.id,
        status: 'PENDING',
        items: {
          create: validatedItems
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: total,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
