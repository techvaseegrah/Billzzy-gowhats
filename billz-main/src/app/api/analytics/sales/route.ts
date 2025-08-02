// app/api/analytics/sales/route.ts
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

    // Get sales data
    const sales = await prisma.transactionRecord.groupBy({
      by: ['date'],
      where: {
        paymentStatus: 'PAID',
        organisationId: parseInt(organisationId!),
        date: {
          gte: startDate,
          lte: today,
        },
      },
      _sum: {
        totalPrice: true,
      },
    });

    // Format data for the chart
    const formattedData = sales.map((sale) => ({
      date: sale.date.toISOString().split('T')[0],
      sales: sale._sum.totalPrice || 0,
    }));

    // Sort by date
    formattedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    

    return NextResponse.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error('Error fetching sales data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}