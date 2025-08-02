// app/customers/add/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { redirect } from 'next/navigation';
import React from 'react';  // Add this import


export default async function AddCustomerPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Customer</h1>
        <p className="text-gray-600">Enter customer information below</p>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <CustomerForm />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Add Customer | Billing App',
  description: 'Add a new customer to your billing system',
};