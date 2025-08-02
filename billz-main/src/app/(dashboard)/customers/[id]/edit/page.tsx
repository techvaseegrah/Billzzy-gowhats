// app/customers/[id]/edit/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { EditCustomerForm } from '@/components/customers/EditCustomerForm';
import { notFound, redirect } from 'next/navigation';
import React from 'react';  // Add this import

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditCustomerPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const customerId = parseInt(params.id);
  
  if (isNaN(customerId)) {
    notFound();
  }

  try {
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        organisationId: parseInt(session.user.id)
      }
    });

    if (!customer) {
      notFound();
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Customer</h1>
          <p className="text-gray-600">Update customer information</p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <EditCustomerForm customer={customer} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching customer:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">
            Error loading customer data. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}

export const metadata = {
  title: 'Edit Customer | Billing App',
  description: 'Edit customer information',
};