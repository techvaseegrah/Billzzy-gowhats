// app/api/razorpay/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

interface WebhookPayload {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment_link?: {
      entity: {
        id: string;
        notes: {
          bill_no: string;
        };
        payment_id?: string;
        status: string;
        amount: number;
      };
    };
    payment?: {
      entity: {
        notes: {
          bill_no: string;
        };
        amount: number;
        status: string;
      };
    };
  };
}



export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    const signature = request.headers.get('x-razorpay-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const webhookData = JSON.parse(body) as WebhookPayload;

    switch (webhookData.event) {
      case 'payment_link.paid': {
        const billNo = parseInt(webhookData.payload.payment_link?.entity.notes.bill_no || '');
        if (isNaN(billNo)) {
          throw new Error('Invalid bill number in payment link notes');
        }

        const amount = webhookData.payload.payment_link.entity.amount / 100;

        const transaction = await prisma.transactionRecord.update({
          where: { billNo },
          data: {
            amountPaid: amount,
            balance: 0,
            paymentMethod: 'razorpay_link',
            paymentId: webhookData.payload.payment_link.entity.payment_id,
            paymentStatus: 'PAID',
            status: 'processing'
          },
          include: {
            customer: true,
            organisation: true
          }
        });



        break;
      }

      case 'payment_link.failed':
        case 'payment.failed': {
          const notes = webhookData.event === 'payment.failed'
            ? webhookData.payload.payment?.entity.notes
            : webhookData.payload.payment_link?.entity.notes;
        
          const billNo = parseInt(notes?.bill_no || '');
          if (isNaN(billNo)) {
            throw new Error('Invalid bill number in payment notes');
          }
        
          // First check if transaction exists and isn't already paid
          const existingTransaction = await prisma.transactionRecord.findUnique({
            where: { billNo }
          });
        
          if (existingTransaction && existingTransaction.paymentStatus !== 'PAID') {
            await prisma.transactionRecord.update({
              where: { billNo },
              data: {
                paymentStatus: 'FAILED'
              },
              include: {
                customer: true,
                organisation: true
              }
            });
          }
        
          break;
        }
        
        case 'payment_link.expired': {
          const billNo = parseInt(webhookData.payload.payment_link?.entity.notes.bill_no || '');
          if (isNaN(billNo)) {
            throw new Error('Invalid bill number in payment link notes');
          }
        
          // First check if transaction exists and isn't already paid
          const existingTransaction = await prisma.transactionRecord.findUnique({
            where: { billNo }
          });
        
          if (existingTransaction && existingTransaction.paymentStatus !== 'PAID') {
            await prisma.transactionRecord.update({
              where: { billNo },
              data: {
                paymentStatus: 'EXPIRED'
              },
              include: {
                customer: true,
                organisation: true
              }
            });
          }
        
          break;
        }
    }

    revalidatePath('/transactions/online');
    revalidatePath('/dashboard');

    return NextResponse.json({ 
      status: 'success',
      event: webhookData.event,
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    // console.error('Webhook processing error:', error);
    return NextResponse.json({ 
      error: 'Webhook processing failed', 
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}