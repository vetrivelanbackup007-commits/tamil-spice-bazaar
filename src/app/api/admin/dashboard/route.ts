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

    // Get current date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Fetch dashboard statistics
    const [
      totalOrders,
      totalRevenue,
      totalUsers,
      totalProducts,
      pendingOrders,
      todayOrders,
      monthlyRevenue,
      lowStockProducts,
      totalAffiliates,
      recentOrders
    ] = await Promise.all([
      // Total orders
      prisma.order.count(),
      
      // Total revenue (sum of all completed orders)
      prisma.order.aggregate({
        where: { status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] } },
        _sum: { total: true }
      }),
      
      // Total users
      prisma.user.count(),
      
      // Total products
      prisma.product.count(),
      
      // Pending orders
      prisma.order.count({
        where: { status: 'PENDING' }
      }),
      
      // Today's orders
      prisma.order.count({
        where: {
          createdAt: { gte: startOfToday }
        }
      }),
      
      // Monthly revenue
      prisma.order.aggregate({
        where: {
          status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: startOfMonth }
        },
        _sum: { total: true }
      }),
      
      // Low stock products (stock < 10)
      prisma.product.count({
        where: { stock: { lt: 10 } }
      }),
      
      // Total affiliates
      prisma.affiliate.count(),
      
      // Recent orders with user info
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      })
    ]);

    // Calculate monthly growth (mock calculation for now)
    const monthlyGrowth = 15.5; // You can implement proper calculation based on previous month

    const stats = {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      totalUsers,
      totalProducts,
      pendingOrders,
      monthlyGrowth,
      todayOrders,
      lowStockProducts,
      totalAffiliates,
      monthlyRevenue: monthlyRevenue._sum.total || 0
    };

    const formattedRecentOrders = recentOrders.map(order => ({
      id: order.id,
      customerName: order.user?.name || 'Guest',
      total: order.total,
      status: order.status,
      createdAt: order.createdAt.toISOString()
    }));

    return NextResponse.json({
      stats,
      recentOrders: formattedRecentOrders
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
