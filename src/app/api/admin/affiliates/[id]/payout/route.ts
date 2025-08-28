import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/server/db';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const affiliateId = params.id;

    // Get affiliate with orders
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
      include: {
        orders: {
          where: { 
            status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] },
            paidOut: { not: true }
          }
        }
      }
    });

    if (!affiliate) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
    }

    // Calculate total earnings
    const totalRevenue = affiliate.orders.reduce((sum, order) => sum + order.total, 0);
    const totalEarnings = Math.floor(totalRevenue * (affiliate.commissionRate / 100));

    if (totalEarnings <= 0) {
      return NextResponse.json({ error: 'No earnings to pay out' }, { status: 400 });
    }

    // Create payout record and mark orders as paid out
    await prisma.$transaction(async (tx) => {
      // Create payout record
      await tx.affiliatePayout.create({
        data: {
          affiliateId,
          amount: totalEarnings,
          status: 'COMPLETED',
          paidAt: new Date()
        }
      });

      // Mark orders as paid out
      await tx.order.updateMany({
        where: {
          id: { in: affiliate.orders.map(o => o.id) }
        },
        data: { paidOut: true }
      });
    });

    return NextResponse.json({ 
      success: true, 
      amount: totalEarnings,
      message: 'Payout processed successfully' 
    });

  } catch (error) {
    console.error('Payout processing error:', error);
    return NextResponse.json({ error: 'Failed to process payout' }, { status: 500 });
  }
}
