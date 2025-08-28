import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/server/db';

// Simple in-memory cache with TTL to reduce DB load for frequent reports access
const CACHE_TTL_MS = 60 * 1000; // 60 seconds
type CachedEntry = { data: any; expires: number };
const reportCache = new Map<string, CachedEntry>();

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

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const cacheKey = `days:${days}`;

    // Serve from cache if fresh
    const now = Date.now();
    const cached = reportCache.get(cacheKey);
    if (cached && cached.expires > now) {
      return NextResponse.json(cached.data, {
        headers: { 'Cache-Control': 'private, max-age=60' }
      });
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Sales Report
    const [totalRevenue, totalOrders, previousRevenue, previousOrders] = await Promise.all([
      prisma.order.aggregate({
        where: {
          status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: startDate }
        },
        _sum: { total: true },
        _count: true
      }),
      prisma.order.count({
        where: {
          status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: startDate }
        }
      }),
      prisma.order.aggregate({
        where: {
          status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] },
          createdAt: { 
            gte: new Date(startDate.getTime() - (days * 24 * 60 * 60 * 1000)),
            lt: startDate
          }
        },
        _sum: { total: true }
      }),
      prisma.order.count({
        where: {
          status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] },
          createdAt: { 
            gte: new Date(startDate.getTime() - (days * 24 * 60 * 60 * 1000)),
            lt: startDate
          }
        }
      })
    ]);

    const revenue = totalRevenue._sum.total || 0;
    const orders = totalOrders;
    const prevRevenue = previousRevenue._sum.total || 0;
    const prevOrders = previousOrders;

    const revenueGrowth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
    const ordersGrowth = prevOrders > 0 ? ((orders - prevOrders) / prevOrders) * 100 : 0;
    const averageOrderValue = orders > 0 ? revenue / orders : 0;

    // Top Products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: startDate }
        }
      },
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    const topProductsWithNames = await Promise.all(
      topProducts.map(async (item) => {
        const [product, orderItems] = await Promise.all([
          prisma.product.findUnique({
            where: { id: item.productId },
            select: { name: true }
          }),
          prisma.orderItem.findMany({
            where: {
              productId: item.productId,
              order: {
                status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] },
                createdAt: { gte: startDate }
              }
            },
            select: { price: true, quantity: true }
          })
        ]);
        const revenue = orderItems.reduce((sum, oi) => sum + oi.price * oi.quantity, 0);
        return {
          id: item.productId,
          name: product?.name || 'Unknown Product',
          totalSold: item._sum.quantity || 0,
          revenue
        };
      })
    );

    // Low Stock Products
    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lt: 10 } },
      select: { id: true, name: true, stock: true },
      orderBy: { stock: 'asc' },
      take: 10
    });

    // Customer Report
    const [totalCustomers, newCustomers, previousCustomers] = await Promise.all([
      prisma.user.count({
        where: { role: 'USER' }
      }),
      prisma.user.count({
        where: {
          role: 'USER',
          createdAt: { gte: startDate }
        }
      }),
      prisma.user.count({
        where: {
          role: 'USER',
          createdAt: { 
            gte: new Date(startDate.getTime() - (days * 24 * 60 * 60 * 1000)),
            lt: startDate
          }
        }
      })
    ]);

    const customerGrowth = previousCustomers > 0 ? ((newCustomers - previousCustomers) / previousCustomers) * 100 : 0;

    // Affiliate Report
    const affiliates = await prisma.affiliate.findMany({
      include: {
        orders: {
          where: {
            status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] },
            createdAt: { gte: startDate }
          }
        }
      }
    });

    const totalCommissions = affiliates.reduce((sum, affiliate) => {
      const affiliateRevenue = affiliate.orders.reduce((orderSum, order) => orderSum + order.total, 0);
      return sum + Math.floor(affiliateRevenue * (affiliate.commissionRate / 100));
    }, 0);

    const topAffiliates = affiliates
      .map(affiliate => {
        const affiliateRevenue = affiliate.orders.reduce((sum, order) => sum + order.total, 0);
        const earnings = Math.floor(affiliateRevenue * (affiliate.commissionRate / 100));
        return {
          id: affiliate.id,
          promoCode: affiliate.promoCode,
          earnings,
          orders: affiliate.orders.length
        };
      })
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);

    // Monthly Data (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const [monthRevenue, monthOrders, monthCustomers] = await Promise.all([
        prisma.order.aggregate({
          where: {
            status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] },
            createdAt: { gte: monthStart, lt: monthEnd }
          },
          _sum: { total: true }
        }),
        prisma.order.count({
          where: {
            status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] },
            createdAt: { gte: monthStart, lt: monthEnd }
          }
        }),
        prisma.user.count({
          where: {
            role: 'USER',
            createdAt: { gte: monthStart, lt: monthEnd }
          }
        })
      ]);

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue._sum.total || 0,
        orders: monthOrders,
        customers: monthCustomers
      });
    }

    const reportData = {
      salesReport: {
        totalRevenue: revenue,
        totalOrders: orders,
        averageOrderValue,
        revenueGrowth,
        ordersGrowth
      },
      productReport: {
        topProducts: topProductsWithNames,
        lowStockProducts
      },
      customerReport: {
        totalCustomers,
        newCustomers,
        returningCustomers: totalCustomers - newCustomers,
        customerGrowth
      },
      affiliateReport: {
        totalAffiliates: affiliates.length,
        totalCommissions,
        topAffiliates
      },
      monthlyData
    };

    // Populate cache
    reportCache.set(cacheKey, { data: reportData, expires: now + CACHE_TTL_MS });

    return NextResponse.json(reportData, {
      headers: { 'Cache-Control': 'private, max-age=60' }
    });

  } catch (error) {
    console.error('Reports fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
