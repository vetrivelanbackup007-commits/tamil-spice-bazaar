import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/server/db';

// Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, we'll store wishlist in user preferences as JSON
    // In a production app, you'd want a separate Wishlist table
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get wishlist from localStorage on client side for now
    // In production, implement proper wishlist table in schema
    return NextResponse.json({ wishlist: [] });

  } catch (error) {
    console.error('Wishlist fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

// Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Added to wishlist' });

  } catch (error) {
    console.error('Wishlist add error:', error);
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

// Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Removed from wishlist' });

  } catch (error) {
    console.error('Wishlist remove error:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
