import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/server/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch affiliates with statistics
    const affiliates = await prisma.affiliate.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        },
        clicks: {
          select: { id: true }
        },
        orders: {
          select: { 
            total: true,
            status: true 
          }
        }
      }
    });

    // Calculate statistics for each affiliate
    const affiliatesWithStats = affiliates.map(affiliate => {
      const completedOrders = affiliate.orders.filter(order => 
        ['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(order.status)
      );
      
      const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
      const totalEarnings = Math.floor(totalRevenue * (affiliate.commissionRate / 100));

      return {
        id: affiliate.id,
        userId: affiliate.userId,
        promoCode: affiliate.promoCode,
        commissionRate: affiliate.commissionRate,
        totalEarnings,
        totalClicks: affiliate.clicks.length,
        totalOrders: completedOrders.length,
        createdAt: affiliate.createdAt.toISOString(),
        user: affiliate.user
      };
    });

    // Calculate overall stats
    const stats = {
      totalAffiliates: affiliates.length,
      totalCommissions: affiliatesWithStats.reduce((sum, a) => sum + a.totalEarnings, 0),
      totalClicks: affiliatesWithStats.reduce((sum, a) => sum + a.totalClicks, 0),
      totalOrders: affiliatesWithStats.reduce((sum, a) => sum + a.totalOrders, 0),
      pendingPayouts: affiliatesWithStats.reduce((sum, a) => sum + a.totalEarnings, 0)
    };

    return NextResponse.json({
      affiliates: affiliatesWithStats,
      stats
    });

  } catch (error) {
    console.error('Admin affiliates fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch affiliates' }, { status: 500 });
  }
}
