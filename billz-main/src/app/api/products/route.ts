import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-options';


// Modified GET handler in /api/products/route.ts
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('sku') || '';
    const categoryId = searchParams.get('category') || '';

    // Limit query results and optimize fields
    const products = await prisma.product.findMany({
      where: {
        organisationId: parseInt(session.user.id),
        ...(searchTerm && {
          OR: [
            { SKU: { contains: searchTerm } },
            { name: { contains: searchTerm } }
          ]
        }),
        ...(categoryId && { categoryId: parseInt(categoryId) })
      },
      select: {
        id: true,
        name: true, 
        SKU: true,
        sellingPrice: true,
        quantity: true,
        inventory: {
          where: { organisationId: parseInt(session.user.id) },
          select: { quantity: true },
          take: 1
        }
      },
      // take: 10, // Limit results
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(products);

  } catch (error) {
    console.error('Product search error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);



    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      SKU,
      netPrice,
      sellingPrice,
      quantity,
      categoryId,
    } = body;



    // Check if SKU exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        SKU,
        organisationId: parseInt(session.user.id),
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'SKU already exists' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        SKU,
        netPrice,
        sellingPrice,
        quantity,
        categoryId,
        organisationId: parseInt(session.user.id),
        seller: "", // Add this required field

      },
      include: {
        category: true,
      },
    });

    // Create initial inventory record
    await prisma.inventory.create({
      data: {
        productId: product.id,
        categoryId: product.categoryId,
        organisationId: parseInt(session.user.id),
        quantity: product.quantity,
      },
    });



    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully'
    }, { status: 201 });

  } catch (error) {
    // More detailed error logging
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.message
    }, { status: 500 });
  }
}