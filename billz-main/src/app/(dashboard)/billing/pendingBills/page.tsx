'use client';

import React from 'react';
import Link from 'next/link';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

interface CustomerSubmission {
  id: number;
  notes: string;
  createdAt: string;
  customer: {
    id: number;
    name: string;
    phone: string;
    email: string;
  };
}

export default function PendingBillsPage() {
  const router = useRouter();

  const fetcher = (url: string) =>
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .catch((error) => {
        throw error;
      });

  const { data, error } = useSWR<{ submissions: CustomerSubmission[] }>(
    '/api/billing/customer_submission?status=pending',
    fetcher
  );

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      const response = await fetch(`/api/billing/customerSubmission/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete submission');
      }

      toast.success('Submission deleted successfully');
      // Refresh the data
      mutate('/api/billing/customer_submission?status=pending');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete submission');
    }
  };

  if (error) {
    return <div className="p-4">Failed to load pending bills.</div>;
  }

  if (!data || !data.submissions) {
    return (
      <div className="h-[100vh] w-[100%] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const submissions = data.submissions;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Pending Bills</h1>
      
      {/* Desktop Table View */}
     <section className=' '>
     <div className="overflow-x-auto">
      {submissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {submission.customer.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {submission.customer.phone}
                      </div>
                      <div className="text-sm text-gray-500">
                        {submission.customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {submission.notes || 'None'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-4">
                        <Link
                          href={`/billing/processSubmission/${submission.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Process
                        </Link>
                        <button
                          onClick={() => handleDelete(submission.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No pending bills at the moment.</p>
        )}
      </div>

     </section>

      {/* Mobile Card View */}
      {/* <div className="md:hidden">
        {submissions.length > 0 ? (
          <ul className="space-y-4">
            {submissions.map((submission) => (
              <li key={submission.id} className="border rounded p-4">
                <div className="space-y-2">
                  <div>
                    <p className="text-lg font-semibold">{submission.customer.name}</p>
                    <p className="text-sm text-gray-600">{submission.customer.phone}</p>
                    <p className="text-sm text-gray-600">{submission.customer.email}</p>
                    <p className="text-sm text-gray-600">
                      Notes: {submission.notes || 'None'}
                    </p>
                  </div>
                  <div className="flex justify-end space-x-4 pt-2 border-t">
                    <Link
                      href={`/billing/processSubmission/${submission.id}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Process
                    </Link>
                    <button
                      onClick={() => handleDelete(submission.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No pending bills at the moment.</p>
        )}
      </div> */}
    </div>
  );
}