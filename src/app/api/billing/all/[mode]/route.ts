// app/api/billing/all/[mode]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-options';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ mode: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params
    const { mode } = await params;

    if (mode !== 'online' && mode !== 'offline') {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }

    // First delete related transaction items
    await prisma.transactionItem.deleteMany({
      where: {
        transaction: {
          organisationId: parseInt(session.user.id),
          billingMode: mode
        }
      }
    });

    // Then delete the transaction records
    await prisma.transactionRecord.deleteMany({
      where: {
        organisationId: parseInt(session.user.id),
        billingMode: mode
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete bills' },
      { status: 500 }
    );
  }
}