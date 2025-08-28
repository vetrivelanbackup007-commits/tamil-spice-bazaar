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

    const affiliate = await prisma.affiliate.findUnique({
      where: { userId: session.user.id },
      include: {
        clicks: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!affiliate) {
      return NextResponse.json({ error: 'Affiliate account not found' }, { status: 404 });
    }

    // Calculate stats
    const totalClicks = await prisma.affiliateClick.count({
      where: { affiliateId: affiliate.id }
    });

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyClicks = await prisma.affiliateClick.count({
      where: {
        affiliateId: affiliate.id,
        createdAt: { gte: thisMonth }
      }
    });

    return NextResponse.json({
      affiliate: {
        ...affiliate,
        stats: {
          totalClicks,
          monthlyClicks,
          totalEarnings: affiliate.totalEarnings
        }
      }
    });

  } catch (error) {
    console.error('Affiliate fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch affiliate data' }, { status: 500 });
  }
}
