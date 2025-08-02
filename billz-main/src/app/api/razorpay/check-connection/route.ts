// app/api/razorpay/check-connection/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organisation = await prisma.organisation.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { razorpayAccessToken: true }
    });

    return NextResponse.json({
      isConnected: !!organisation?.razorpayAccessToken
    });
  } catch (error) {
    console.error('Failed to check Razorpay connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}