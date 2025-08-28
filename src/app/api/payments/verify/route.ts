import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import crypto from 'crypto';
import { prisma } from '@/server/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderId 
    } = await request.json();

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Update order status and reduce stock
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update order and reduce stock in a transaction
    await prisma.$transaction(async (tx: any) => {
      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CONFIRMED',
          paymentId: razorpay_payment_id,
        }
      });

      // Reduce stock for each item
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Payment verified and order confirmed' 
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
