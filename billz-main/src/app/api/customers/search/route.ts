// api/billing/search
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-options';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json([]);
    }

    const customers = await prisma.customer.findMany({
      where: {
        organisationId: parseInt(session.user.id),
        OR: [
          { name: { contains: query } },
          { phone: { contains: query } },
          { email: { contains: query } }
        ]
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        flatNo: true,
        street: true,
        district: true,
        state: true,
        pincode: true,
        _count: {
          select: {
            transactions: true
          }
        }
      }
    });

    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to search customers' },
      { status: 500 }
    );
  }
}