import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function POST(request: NextRequest) {
  try {
    const { promoCode } = await request.json();

    if (!promoCode) {
      return NextResponse.json({ error: 'Promo code required' }, { status: 400 });
    }

    const affiliate = await prisma.affiliate.findUnique({
      where: { promoCode }
    });

    if (!affiliate) {
      return NextResponse.json({ error: 'Invalid promo code' }, { status: 404 });
    }

    // Record the click
    await prisma.affiliateClick.create({
      data: {
        affiliateId: affiliate.id
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Affiliate click error:', error);
    return NextResponse.json({ error: 'Failed to record click' }, { status: 500 });
  }
}
