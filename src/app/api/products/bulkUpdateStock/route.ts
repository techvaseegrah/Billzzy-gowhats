import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productIds, quantityToAdd } = await request.json();
    const organisationId = parseInt(session.user.id);

    if (!Array.isArray(productIds) || !quantityToAdd || quantityToAdd <= 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Update products and inventory in a transaction
    await prisma.$transaction(async (prisma) => {
      // Update products
      await Promise.all(productIds.map(async (productId) => {
        // Update product quantity
        await prisma.product.update({
          where: {
            id: productId,
            organisationId
          },
          data: {
            quantity: {
              increment: quantityToAdd
            }
          }
        });

        // Update or create inventory record
        await prisma.inventory.upsert({
          where: {
            productId_organisationId: {
              productId,
              organisationId
            }
          },
          update: {
            quantity: {
              increment: quantityToAdd
            }
          },
          create: {
            productId,
            organisationId,
            quantity: quantityToAdd
          }
        });
      }));
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    );
  }
}