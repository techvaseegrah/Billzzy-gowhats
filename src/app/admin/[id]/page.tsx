// app/admin/[id]/page.tsx
import { prisma } from '@/lib/prisma';
import React from 'react';

const formatDate = (date: Date | null) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};

/**
 * Next.js automatically provides the `params` prop for dynamic routes.
 * e.g. /admin/123 => params.id = "123"
 */
interface MandatePageProps {
  params: { id: string };
}

export default async function MandatePage({ params }: MandatePageProps) {
  const organisationId = Number(params.id);

  // Fetch the organisation basic info (optional, for display)
  const organisation = await prisma.organisation.findUnique({
    where: { id: organisationId },
    select: {
      id: true,
      name: true,
      shopName: true,
      endDate: true,

    },
  });

  if (!organisation) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold">Organisation not found</h1>
      </div>
    );
  }

  // Fetch active mandate (if any)
  const activeMandate = await prisma.activeMandate.findUnique({
    where: { organisationId },
    select: {
      id: true,
      UMN: true,
      amount: true,
      status: true,
      payerVA: true,
      payerName: true,
      payerMobile: true,
      notified: true,

    },
  });

  // Fetch entire mandate history
  const mandateHistory = await prisma.mandate.findMany({
    where: { organisationId },
    select: {
      id: true,
      amount: true,
      status: true,
      txnCompletionDate: true, // <--- ensure these fields exist
    },
  });

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Mandate Details for {organisation.name} ({organisation.shopName})
      </h1>

      {/* Active Mandate */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold">Active Mandate</h2>
        {activeMandate ? (
          <div className="mt-2 p-4 border rounded bg-white shadow">
            <p><strong>ID:</strong> {activeMandate.id}</p>
            <p><strong>UMN:</strong> {activeMandate.UMN || 'N/A'}</p>
            <p><strong>Amount:</strong> {activeMandate.amount ?? 'N/A'}</p>
            <p><strong>Status:</strong> {activeMandate.status}</p>
            <p><strong>PayerVA:</strong> {activeMandate.payerVA}</p>
            <p><strong>PayerName:</strong> {activeMandate.payerName ?? 'N/A'}</p>
            <p><strong>Notified:</strong> {activeMandate.notified ? 'Yes' : 'No'}</p>
            <p><strong>End date:</strong> {organisation.endDate ? formatDate(organisation.endDate) : 'N/A'}</p>


          </div>
        ) : (
          <p className="text-gray-600 mt-2">No active mandate found.</p>
        )}
      </div>

      {/* Mandate History */}
      <div>
        <h2 className="text-xl font-semibold">Mandate History</h2>
        {mandateHistory.length > 0 ? (
          <div className="mt-2 space-y-2">
            {mandateHistory.map((m) => (
              <div key={m.id} className="p-4 border rounded bg-white shadow">
                <p><strong>Mandate ID:</strong> {m.id}</p>
                <p><strong>Amount:</strong> {m.amount ?? 'N/A'}</p>
                <p><strong>Status:</strong> {m.status ?? 'N/A'}</p>
                <p><strong>Transaction Completion:</strong> {formatDate(m.txnCompletionDate)}</p>
           
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 mt-2">No mandate history available.</p>
        )}
      </div>
    </div>
  );
}
