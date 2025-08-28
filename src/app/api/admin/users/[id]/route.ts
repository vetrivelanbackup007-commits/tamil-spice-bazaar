import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/server/db';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { role } = await request.json();
    
    if (!role || !['USER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { role }
    });

    return NextResponse.json({ user: updatedUser });

  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
