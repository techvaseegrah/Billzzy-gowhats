import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-options';

interface CustomError extends Error {
  message: string;
}

export interface Bill {
  id: number;
  billNo: number;
  date: string;
  time: string;
  totalPrice: number;
  status: string;
  billingMode: string;
  customer: {
    name: string;
    phone: string;
    district?: string;
    state?: string;
  };
  paymentMethod: string;
  amountPaid: number;
  balance: number;
  trackingNumber: string | null;
  weight: number | null;
  isEdited: boolean;
  paymentStatus: string;
  notes: string | null;
  items: Array<{
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    totalPrice: number;
    SKU: string;
    price: number;
    availableQuantity: number;
  }>;
  shipping?: {
    methodName: string;
    methodType: string;
    totalCost: number;
    baseRate: number | null;
    weightCharge: number | null;
    totalWeight: number | null;
  } | null;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const mode = searchParams.get('mode') || 'online';
    const dateFilter = searchParams.get('date') || 'all';
    const statusFilter = searchParams.get('status') || 'all';
    const hasTracking = searchParams.get('hasTracking') || 'all';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '10')));

    const whereClause: any = {
      organisationId: parseInt(session.user.id),
      billingMode: mode,
    };

    if (statusFilter !== 'all') {
      whereClause.status = statusFilter;
    }

    if (query) {
      const billNo = parseInt(query);
      whereClause.OR = [
        ...(isNaN(billNo) ? [] : [{ billNo }]),
        {
          customer: {
            OR: [
              { name: { contains: query } },
              { phone: { contains: query } },
            ],
          },
        },
      ];
    }

    // Date filtering
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === 'today') {
        whereClause.date = {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        };
      } else if (dateFilter === 'week') {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        whereClause.date = {
          gte: weekStart,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        };
      } else if (dateFilter === 'month') {
        whereClause.date = {
          gte: new Date(today.getFullYear(), today.getMonth(), 1),
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        };
      }
    }

    if (hasTracking === 'true') {
      whereClause.trackingNumber = { not: null };
    } else if (hasTracking === 'false') {
      whereClause.trackingNumber = null;
    }

    const totalCount = await prisma.transactionRecord.count({
      where: whereClause,
    });

    const bills = await prisma.transactionRecord.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
            district: true,
            state: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        TransactionShipping: true,
      },
      orderBy: { companyBillNo: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const formattedBills: Bill[] = bills.map((bill) => ({
      id: bill.id,
      billNo: bill.companyBillNo,
      date: bill.date.toISOString(),
      time: new Date(bill.time).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }),
      totalPrice: bill.totalPrice,
      status: bill.status,
      billingMode: bill.billingMode,
      customer: bill.customer || { name: 'Walk-in Customer', phone: '-' },
      paymentMethod: bill.paymentMethod,
      amountPaid: bill.amountPaid,
      balance: bill.balance,
      trackingNumber: bill.trackingNumber,
      weight: bill.weight,
      isEdited: bill.isEdited,
      paymentStatus: bill.paymentStatus,
      notes: bill.notes,
      items: bill.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        SKU: item.product.SKU,
        price: item.product.sellingPrice,
        availableQuantity: item.product.quantity,
      })),
      shipping: bill.TransactionShipping?.[0] ? {
        methodName: bill.TransactionShipping[0].methodName,
        methodType: bill.TransactionShipping[0].methodType,
        totalCost: bill.TransactionShipping[0].totalCost,
        baseRate: bill.TransactionShipping[0].baseRate,
        weightCharge: bill.TransactionShipping[0].weightCharge,
        totalWeight: bill.TransactionShipping[0].totalWeight,
      } : null,
    }));

    return NextResponse.json({ bills: formattedBills, totalCount });

  } catch (error: unknown) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search bills' },
      { status: 500 }
    );
  }
}