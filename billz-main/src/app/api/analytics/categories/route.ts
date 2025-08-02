// app/api/analytics/categories/route.ts
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

    // Get sales by category
    const categorySales = await prisma.transactionItem.groupBy({
      by: ['product.categoryId'],
      where: {
        transaction: {
          organisationId: parseInt(organisationId!),
          date: {
            gte: startDate,
            lte: today,
          },
        },
      },
      _sum: {
        totalPrice: true,
      },
    });

    // Get category names
    const categoryIds = categorySales
      .map((item) => item.categoryId)
      .filter((id): id is number => id !== null);

    const categories = await prisma.productCategory.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
    });

    // Format data for the chart
    const formattedData = categorySales.map((item) => {
      const category = categories.find((c) => c.id === item.categoryId);
      return {
        name: category?.name || 'Uncategorized',
        value: item._sum.totalPrice || 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error('Error fetching category data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}