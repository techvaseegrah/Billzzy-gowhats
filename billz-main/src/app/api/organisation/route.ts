// app/api/getOrganisation/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';

export async function GET(request: NextRequest) {
  // Retrieve the session
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Assuming the session.user.id corresponds to organisation.id
    
    const orgId = session.user.id;

    const organisation = await prisma.organisation.findUnique({
      where: { id: Number(orgId) },
      select: {
        id: true,
        email: true,
        name: true,
        shopName: true,
        endDate: true,
        subscriptionType: true,
        smsCount: true,
        monthlyUsage:true
      },
    });

    if (!organisation) {
      return NextResponse.json({ error: 'Organisation not found' }, { status: 404 });
    }

    return NextResponse.json({ organisation });
  } catch (error) {
    console.error('Error fetching organisation:', error.message);
    return NextResponse.json({ error: 'Failed to fetch organisation data' }, { status: 500 });
  }
}
