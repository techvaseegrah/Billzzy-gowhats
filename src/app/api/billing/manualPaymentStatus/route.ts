// app/api/billing/payment-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { billId, paymentStatus, status } = await request.json();

    const updatedBill = await prisma.transactionRecord.update({
      where: { id: billId },
      data: {
        paymentStatus,
        status,
      },
    });

    return NextResponse.json(updatedBill, { status: 200 });
  } catch (error) {
    console.error('Payment status update error:', error);
    return NextResponse.json(
      { message: 'Failed to update payment status' }, 
      { status: 500 }
    );
  }
}