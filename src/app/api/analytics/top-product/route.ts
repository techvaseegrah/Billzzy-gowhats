// app/api/analytics/top-products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const organisationId = searchParams.get('organisationId');
    const timeRange = searchParams.get('timeRange') || 'week';

    const today = new Date();
    let startDate = new Date();

    // Set date range based on selected time period
    switch (timeRange) {
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate.setDate(today.getDate() - 7);
    }

    // Get top selling products
    const topProducts = await prisma.transactionItem.groupBy({
      by: ['productId'],
      where: {
        transaction: {
          paymentStatus: 'PAID',

          organisationId: parseInt(organisationId!),
          date: {
            gte: startDate,
            lte: today,
          },
        },
      },
      _sum: {
        quantity: true,
        totalPrice: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });

    // Get product details for the top selling products
    const productIds = topProducts.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    // Format data for the chart
    const formattedData = topProducts.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        name: product?.SKU || 'Unknown Product',
        quantity: item._sum.quantity || 0,
        revenue: item._sum.totalPrice || 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error('Error fetching top products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}