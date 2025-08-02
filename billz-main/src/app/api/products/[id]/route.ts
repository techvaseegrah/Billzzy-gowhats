import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-options';

// PATCH endpoint for quantity updates
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { quantity } = body;

    const product = await prisma.product.findFirst({
      where: {
        id: parseInt(params.id),
        organisationId: parseInt(session.user.id),
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Update product quantity
      const product = await tx.product.update({
        where: {
          id: parseInt(params.id),
        },
        data: {
          quantity: {
            increment: quantity,
          },
        },
      });

      // Update inventory
      await tx.inventory.updateMany({
        where: {
          productId: parseInt(params.id),
          organisationId: parseInt(session.user.id),
        },
        data: {
          quantity: {
            increment: quantity,
          },
        },
      });

      return product;
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Update quantity error:', error);
    return NextResponse.json(
      { error: 'Failed to update quantity' },
      { status: 500 }
    );
  }
}

// PUT endpoint for full product updates
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const {
      name,
      SKU,
      netPrice,
      sellingPrice,
      quantity,
      category,
    } = body;

    const existingProduct = await prisma.product.findUnique({
      where: {
        id: parseInt(id),
        organisationId: parseInt(session.user.id),
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const categoryId = category && typeof category === 'object' ? category.id : null;

    // Create an updateData object without netPrice initially
    const updateData: any = {
      name,
      SKU,
      sellingPrice: parseFloat(sellingPrice),
      quantity: parseInt(quantity),
      categoryId,
    };

    // Only add netPrice to updateData if it exists
    if (netPrice !== undefined && netPrice !== null) {
      updateData.netPrice = parseFloat(netPrice);
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: {
          id: parseInt(id),
          organisationId: parseInt(session.user.id),
        },
        data: updateData,
      });

      await tx.inventory.updateMany({
        where: {
          productId: parseInt(id),
          organisationId: parseInt(session.user.id),
        },
        data: {
          quantity: parseInt(quantity),
          categoryId,
        },
      });

      return updatedProduct;
    }, {
      timeout: 30000
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        error: 'Product not found or you do not have permission to update it'
      }, { status: 404 });
    }

    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'A product with this SKU already exists'
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.message,
    }, { status: 409 });
  }
}
// DELETE endpoint
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const product = await prisma.product.findFirst({
      where: {
        id: parseInt(params.id),
        organisationId: parseInt(session.user.id),
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.inventory.deleteMany({
        where: {
          productId: parseInt(params.id),
          organisationId: parseInt(session.user.id),
        },
      }),
      prisma.product.delete({
        where: {
          id: parseInt(params.id),
        },
      }),
    ]);

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}