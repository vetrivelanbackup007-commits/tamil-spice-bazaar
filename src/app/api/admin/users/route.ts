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

    // Fetch users with order statistics
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { orders: true }
        },
        orders: {
          select: { total: true },
          where: { status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] } }
        }
      }
    });

    return NextResponse.json({ users });

  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
