import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const { id, days } = await request.json();

  try {
    const org = await prisma.organisation.findUnique({
      where: { id: Number(id) },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organisation not found' }, { status: 404 });
    }

    const newEndDate = new Date(org.endDate);
    newEndDate.setDate(newEndDate.getDate() + Number(days));

    await prisma.organisation.update({
      where: { id: Number(id) },
      data: { 
        endDate: newEndDate,
        subscriptionType: "pro",
        smsCount: 0
      },
    });

    return NextResponse.json({ message: 'Subscription extended successfully' });
  } catch (error) {
    console.error('Error extending subscription:', error);
    return NextResponse.json({ error: 'Failed to extend subscription' }, { status: 500 });
  }
}