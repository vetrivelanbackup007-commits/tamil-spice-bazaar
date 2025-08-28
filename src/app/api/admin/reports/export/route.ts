import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/server/db';

function toCSV(rows: string[][]): string {
  // Add BOM for Excel compatibility
  const bom = '\uFEFF';
  return bom + rows.map(r => r.map(cell => `"${(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Sales KPIs
    const [totalRevenue, totalOrders, previousRevenue, previousOrders] = await Promise.all([
      prisma.order.aggregate({
        where: { status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] }, createdAt: { gte: startDate } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.order.count({
        where: { status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] }, createdAt: { gte: startDate } },
      }),
      prisma.order.aggregate({
        where: {
          status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000), lt: startDate },
        },
        _sum: { total: true },
      }),
      prisma.order.count({
        where: {
          status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000), lt: startDate },
        },
      }),
    ]);

    const revenue = totalRevenue._sum.total || 0;
    const orders = totalOrders;
    const prevRevenue = previousRevenue._sum.total || 0;
    const prevOrders = previousOrders;

    const revenueGrowth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
    const ordersGrowth = prevOrders > 0 ? ((orders - prevOrders) / prevOrders) * 100 : 0;
    const averageOrderValue = orders > 0 ? revenue / orders : 0;

    // Top products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: { status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] }, createdAt: { gte: startDate } } },
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });
    const topProductsWithNames = await Promise.all(
      topProducts.map(async (item) => {
        const [product, orderItems] = await Promise.all([
          prisma.product.findUnique({ where: { id: item.productId }, select: { name: true } }),
          prisma.orderItem.findMany({
            where: {
              productId: item.productId,
              order: { status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] }, createdAt: { gte: startDate } },
            },
            select: { price: true, quantity: true },
          }),
        ]);
        const revenue = orderItems.reduce((sum, oi) => sum + oi.price * oi.quantity, 0);
        return { id: item.productId, name: product?.name || 'Unknown Product', totalSold: item._sum.quantity || 0, revenue };
      })
    );

    // Affiliates summary
    const affiliates = await prisma.affiliate.findMany({
      include: {
        orders: {
          where: { status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] }, createdAt: { gte: startDate } },
        },
      },
    });
    const topAffiliates = affiliates
      .map((a) => {
        const aRevenue = a.orders.reduce((s, o) => s + o.total, 0);
        const earnings = Math.floor(aRevenue * (a.commissionRate / 100));
        return { id: a.id, promoCode: a.promoCode, earnings, orders: a.orders.length };
      })
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);

    // Monthly data (6 months)
    const monthlyData: { month: string; revenue: number; orders: number; customers: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const [monthRevenue, monthOrders, monthCustomers] = await Promise.all([
        prisma.order.aggregate({
          where: { status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] }, createdAt: { gte: monthStart, lt: monthEnd } },
          _sum: { total: true },
        }),
        prisma.order.count({ where: { status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] }, createdAt: { gte: monthStart, lt: monthEnd } } }),
        prisma.user.count({ where: { role: 'USER', createdAt: { gte: monthStart, lt: monthEnd } } }),
      ]);

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue._sum.total || 0,
        orders: monthOrders,
        customers: monthCustomers,
      });
    }

    // Build CSV
    const rows: string[][] = [];
    rows.push(['Overview Report']);
    rows.push(['Period (days)', String(days)]);
    rows.push([]);

    rows.push(['KPI', 'Value']);
    rows.push(['Total Revenue (₹)', (revenue / 100).toFixed(2)]);
    rows.push(['Total Orders', String(orders)]);
    rows.push(['Average Order Value (₹)', (averageOrderValue / 100).toFixed(2)]);
    rows.push(['Revenue Growth (%)', revenueGrowth.toFixed(2)]);
    rows.push(['Orders Growth (%)', ordersGrowth.toFixed(2)]);
    rows.push([]);

    rows.push(['Monthly Trends']);
    rows.push(['Month', 'Revenue (₹)', 'Orders', 'Customers']);
    for (const m of monthlyData) {
      rows.push([m.month, (m.revenue / 100).toFixed(2), String(m.orders), String(m.customers)]);
    }
    rows.push([]);

    rows.push(['Top Products']);
    rows.push(['Name', 'Total Sold', 'Revenue (₹)']);
    for (const p of topProductsWithNames) {
      rows.push([p.name, String(p.totalSold), (p.revenue / 100).toFixed(2)]);
    }
    rows.push([]);

    rows.push(['Top Affiliates']);
    rows.push(['Promo Code', 'Orders', 'Earnings (₹)']);
    for (const a of topAffiliates) {
      rows.push([a.promoCode, String(a.orders), (a.earnings / 100).toFixed(2)]);
    }

    const csv = toCSV(rows);
    const filename = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, max-age=60',
      },
    });
  } catch (error) {
    console.error('Reports export error:', error);
    return NextResponse.json({ error: 'Failed to export report' }, { status: 500 });
  }
}
