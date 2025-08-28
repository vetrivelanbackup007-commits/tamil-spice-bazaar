import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/server/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has an affiliate account
    const existingAffiliate = await prisma.affiliate.findUnique({
      where: { userId: session.user.id }
    });

    if (existingAffiliate) {
      return NextResponse.json({ error: 'Affiliate account already exists' }, { status: 400 });
    }

    // Generate unique promo code
    const baseCode = session.user.name?.replace(/\s+/g, '').toUpperCase().slice(0, 6) || 'SPICE';
    let promoCode = baseCode;
    let counter = 1;

    // Ensure promo code is unique
    while (await prisma.affiliate.findUnique({ where: { promoCode } })) {
      promoCode = `${baseCode}${counter}`;
      counter++;
    }

    const affiliate = await prisma.affiliate.create({
      data: {
        userId: session.user.id,
        promoCode,
      }
    });

    return NextResponse.json({ 
      affiliate: {
        id: affiliate.id,
        promoCode: affiliate.promoCode,
        totalEarnings: affiliate.totalEarnings
      }
    });

  } catch (error) {
    console.error('Affiliate registration error:', error);
    return NextResponse.json({ error: 'Failed to register affiliate' }, { status: 500 });
  }
}
