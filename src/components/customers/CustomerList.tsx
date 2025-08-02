// This is a Next.js API route that handles customer-related operations.
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {Button} from '../ui/Button';
import {Input} from '../ui/Input';
import {Modal} from '../ui/Modal';
import { toast } from 'react-toastify';
import React from 'react';  // Add this import

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  _count: {
    transactions: number;
  };
}

interface CustomerListProps {
  initialCustomers: Customer[];
}

export default function CustomerList({ initialCustomers }: CustomerListProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState(initialCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setCustomers(initialCustomers);
      return;
    }

    const response = await fetch(`/api/customers?search=${encodeURIComponent(query)}`);
    const data = await response.json();
    setCustomers(data);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/customers/${deleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setCustomers(customers.filter(c => c.id !== deleteId));
      toast.success('Customer deleted successfully!');

      router.refresh();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.success('Customer deleted failed!');

    } finally {
      setIsLoading(false);
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="w-1/3">
          <Input
            type="search"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Link href="/customers/add">
          <Button>Add Customer</Button>
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orders
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {customer.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {customer.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {customer.email || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {customer._count.transactions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    <Link href={`/customers/${customer.id}/edit`}>
                      <Button size="sm" variant="secondary">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteId(customer.id)}
                      // disabled={customer._count.transactions > 0}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Customer"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this customer? This action cannot be undone.
          </p>
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={() => setDeleteId(null)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            isLoading={isLoading}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}