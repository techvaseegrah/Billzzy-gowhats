// app/api/razorpay/disconnect/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const organisationId = parseInt(session.user.id);

    await prisma.organisation.update({
      where: { id: organisationId },
      data: {
        razorpayAccessToken: null,
        razorpayRefreshToken: null,
        razorpayTokenExpiresAt: null,
        razorpayAccountId: null,
        razorpayState: null,
        razorpayStateExpiresAt: null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Razorpay integration disconnected successfully'
    });

  } catch (error) {
    console.error('Razorpay disconnection error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Razorpay integration' },
      { status: 500 }
    );
  }
}