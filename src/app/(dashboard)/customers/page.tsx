// app/customers/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import CustomerList from '@/components/customers/CustomerList';
import { redirect } from 'next/navigation';
import React from 'react';  // Add this import

export default async function CustomersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  try {
    const customers = await prisma.customer.findMany({
      where: {
        organisationId: parseInt(session.user.id)
      },
      include: {
        _count: {
          select: { transactions: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return (
      <div className="container mx-auto px-2 md:py-8">
        <div className="mb-6 hidden md:block">
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer information</p>
        </div>
        
        <CustomerList initialCustomers={customers} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching customers:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">
            Error loading customers. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}

// Add metadata for the page
export const metadata = {
  title: 'Customers | Billing App',
  description: 'Manage your customers and their information',
};