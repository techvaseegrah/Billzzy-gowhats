// pages/dashboard/index.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import DashboardStats from '@/components/dashboard/DashboardStats';
import React from 'react';  // Add this import

// Update your import statements as necessary

async function getDashboardData(organisationId: string) {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const [
    todayStats,
    totalProducts,
    lowStockProducts,
    recentTransactions,
    organisationData,
    totalCustomers,
    ordersNeedingTracking,
    packingOrdersCount,
   printedOrdersCount,
  ] = await Promise.all([
    // Today's stats
    prisma.transactionRecord.aggregate({
      where: {
        organisationId: parseInt(organisationId),
        paymentStatus: 'PAID' ,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _sum: {
        totalPrice: true,
      },
      _count: true,
    }),

    // Total products
    prisma.product.count({
      where: {
        organisationId: parseInt(organisationId),
      },
    }),

    // Low stock products
    prisma.product.findMany({
      where: {
        organisationId: parseInt(organisationId),
        quantity: {
          lte: 10,
        },
      },
    }),

    // Recent transactions
    prisma.transactionRecord.findMany({
      where: {
        organisationId: parseInt(organisationId),
        paymentStatus: 'PAID'  // Added this condition
      },
      include: {
        customer: true,
      },
      orderBy: {
        date: 'desc',
      },
    }),

    // SMS count from organisation
    prisma.organisation.findUnique({
      where: {
        id: parseInt(organisationId),
      },
      select: {
        smsCount: true,
      },
    }),

    // Total customers
    prisma.customer.count({
      where: {
        organisationId: parseInt(organisationId),
      },
    }),

    // Orders needing tracking numbers
    prisma.transactionRecord.count({
      where: {
        organisationId: parseInt(organisationId),
        billingMode: 'online',
        status: {
          in: ['processing', 'printed','packed']
        } ,
               trackingNumber: null,
      },
    }),

    // Packing orders count
    prisma.transactionRecord.count({
      where: {
        organisationId: parseInt(organisationId),
        billingMode: 'online',
        status: {
          in: ['processing','printed' ]
        }
      
      },
    }),

    // Dispatch orders count
    prisma.transactionRecord.count({
      where: {
        organisationId: parseInt(organisationId),
        billingMode: 'online',
        status: {
          in: ['processing' ]
        }
      },
    })
  ]);

  return {
    todayStats,
    totalProducts,
    lowStockProducts,
    recentTransactions,
    smsCount: organisationData?.smsCount || 0,
    totalCustomers,
    ordersNeedingTracking,
    packingOrdersCount,
    printedOrdersCount,
  };
}

// pages/dashboard/index.tsx

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
console.log(session,"db");

  const data = await getDashboardData(session.user.id);

  return (
    <div className="h-[100vh]  flex flex-col">
      {/* Main Content */}
      <div className="flex-1  py-4">
        <DashboardStats data={{ ...data, organisationId: session.user.id,session }} />
      </div>
    </div>
  );
}
