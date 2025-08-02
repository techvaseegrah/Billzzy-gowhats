// app/api/billing/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-options';
import { Prisma } from '@prisma/client';
import { processTransaction } from '@/lib/transaction';
import moment from 'moment-timezone';

interface BillItem {
  productId: number;
  quantity: number;
  total: number;
}

interface CustomerDetails {
  name: string;
  phone: string;
}

interface PaymentDetails {
  method: string;
  amountPaid: number;
}

interface BillRequest {
  items: BillItem[];
  customerDetails: CustomerDetails;
  paymentDetails: PaymentDetails;
  total: number;
}

function serializeDecimal(value: any): number {
  if (typeof value === 'object' && value !== null && typeof value.toNumber === 'function') {
    return value.toNumber();
  }
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

function serializeDate(date: Date | null): string {
  if (!date) return '';
  try {
    // Convert to Indian timezone and format
    return moment(date).tz('Asia/Kolkata').format('YYYY-MM-DD');
  } catch {
    return '';
  }
}

function serializeTime(time: Date | null): string {
  if (!time) return '';
  try {
    return moment(time).tz('Asia/Kolkata').format('hh:mm A');
  } catch {
    return '';
  }
}

function getCurrentIndianDateTime() {
  const indianDateTime = moment().tz('Asia/Kolkata');
    // Get current Indian date and time
  
    // Format date as YYYY-MM-DD
    const indianDate = indianDateTime.format('YYYY-MM-DD');
    
    // Format time as HH:mm:ss
    const indianTime = indianDateTime.format('HH:mm:ss');
  return {
    date:indianDate,
    time: indianTime
  };
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const data: BillRequest = await request.json();

    if (!data.items?.length || !data.customerDetails || !data.paymentDetails || !data.total) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
        },
        { status: 400 }
      );
    }

    const organisationId = parseInt(session.user.id, 10);

    // Get current Indian date and time
    const { date, time } = getCurrentIndianDateTime();

    // Add date and time to the transaction data
    const transactionData = {
      ...data,
      date,
      time
    };

    const transactionId = await processTransaction(transactionData, organisationId);

    const bill = await prisma.transactionRecord.findUnique({
      where: { id: transactionId },
      include: {
        organisation: true,
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!bill) {
      throw new Error('Failed to retrieve bill details');
    }

    const response = {
      id: bill.id,
      billNo: bill.billNo,
      totalPrice: serializeDecimal(bill.totalPrice),
      date: serializeDate(bill.date),
      time: serializeTime(bill.time), // Using the new time serializer
      status: bill.status,
      organisation: bill.organisation
        ? {
            name: bill.organisation.name || '',
            shopName: bill.organisation.shopName || '',
            flatNo: bill.organisation.flatNo || '',
            street: bill.organisation.street || '',
            district: bill.organisation.district || '',
            state: bill.organisation.state || '',
            pincode: bill.organisation.pincode || '',
            phone: bill.organisation.mobileNumber || '',
            websiteAddress: bill.organisation.websiteAddress || '',
          }
        : null,
      customer: {
        id: bill.customer?.id,
        name: bill.customer?.name || 'Walk-in Customer',
        phone: bill.customer?.phone || '-',
      },
      items: bill.items.map((item) => ({
        id: item.id,
        quantity: serializeDecimal(item.quantity),
        totalPrice: serializeDecimal(item.totalPrice),
        product: {
          id: item.product.id,
          name: item.product.name || '',
          SKU: item.product.SKU || '',
          sellingPrice: serializeDecimal(item.product.sellingPrice),
        },
      })),
    };


    const serializableResponse = JSON.parse(JSON.stringify(response));

    return NextResponse.json(
      {
        success: true,
        data: serializableResponse,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('API Error:', {
      message: error.message,
      stack: error.stack,
    });

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database operation failed',
          code: error.code,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}