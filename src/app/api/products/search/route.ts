import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Build where clause
    const where: any = {};

    // Text search
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } }
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      where.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice) * 100; // Convert to paise
      if (maxPrice) where.price.lte = parseInt(maxPrice) * 100; // Convert to paise
    }

    // Only show products with stock
    where.stock = { gt: 0 };

    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'stock') {
      orderBy.stock = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // Execute query
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    // Get available categories for filters
    const categories = await prisma.product.groupBy({
      by: ['category'],
      where: { stock: { gt: 0 } },
      _count: true
    });

    // Get price range
    const priceRange = await prisma.product.aggregate({
      where: { stock: { gt: 0 } },
      _min: { price: true },
      _max: { price: true }
    });

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        categories: categories.map(c => ({
          name: c.category,
          count: c._count
        })),
        priceRange: {
          min: Math.floor((priceRange._min.price || 0) / 100),
          max: Math.ceil((priceRange._max.price || 0) / 100)
        }
      }
    });

  } catch (error) {
    console.error('Product search error:', error);
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
  }
}
