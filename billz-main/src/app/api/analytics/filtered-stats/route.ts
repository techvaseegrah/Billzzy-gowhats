import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// app/api/dashboard/filtered-stats/route.ts

export async function POST(request: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
  
      const { startDate, endDate, allTime, organisationId } = await request.json();
  
      let dateFilter = {};
      
      if (!allTime) {
        const startDateTime = new Date(startDate);
        startDateTime.setHours(0, 0, 0, 0);
  
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
  
        dateFilter = {
          date: {
            gte: startDateTime,
            lte: endDateTime,
          }
        };
      }

      // Get online paid transactions
      const onlinePaidStats = await prisma.transactionRecord.aggregate({
        where: {
          organisationId: parseInt(organisationId),
          ...dateFilter,
          billingMode: 'online',
          paymentStatus: 'PAID',
        },
        _sum: {
          totalPrice: true,
        },
        _count: true,
      });

      // Get all offline transactions (regardless of payment status)
      const offlineStats = await prisma.transactionRecord.aggregate({
        where: {
          organisationId: parseInt(organisationId),
          ...dateFilter,
          billingMode: 'offline',
        },
        _sum: {
          totalPrice: true,
        },
        _count: true,
      });

      // Calculate total orders and revenue
      const totalOrders = (onlinePaidStats._count || 0) + (offlineStats._count || 0);
      const totalSales = (onlinePaidStats._sum.totalPrice || 0) + (offlineStats._sum.totalPrice || 0);
  
      return NextResponse.json({
        totalOrders: totalOrders,
        totalSales: totalSales,
      });
    } catch (error) {
      console.error('Error in filtered-stats route:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  }