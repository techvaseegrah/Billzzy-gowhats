'use client';

import React from 'react';

type Mandate = {
  id: number;
  merchantTranId: string;
  UMN: string | null;
  amount: number;
  status: string;
  payerVA: string;
  payerName: string | null;
  txnInitDate: string | null;
  txnCompletionDate: string | null;
};

type ActiveMandate = {
  id: number;
  organisationId: number;
  UMN: string | null;
  amount: number;
  status: string;
  payerVA: string;
  payerName: string | null;
  payerMobile: string | null;
  mandateSeqNo: number;
};

interface MandateHistoryProps {
  mandates: Mandate[];
  activeMandate: ActiveMandate | null;
  endDate?: string | null;
}

export function MandateHistory({ mandates, activeMandate, endDate }: MandateHistoryProps) {
  return (
    <div className="max-w-5xl mx-auto ">
      <h1 className="text-2xl font-bold mb-4">Billing & Mandate History</h1>

      {/* Active Mandate */}
      <div className="mb-6 p-4 border rounded-md shadow-sm bg-white">
        <h2 className="text-xl font-semibold mb-4">Current Active Mandate</h2>
        {activeMandate ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-600">Amount</span>
                <span className="font-medium">₹{activeMandate.amount}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-600">Status</span>
                <span className="font-medium">{activeMandate.status}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-600">Payer VPA</span>
                <span className="font-medium break-all">{activeMandate.payerVA}</span>
              </div>
              {activeMandate.payerName && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600">Payer Name</span>
                  <span className="font-medium">{activeMandate.payerName}</span>
                </div>
              )}
              {endDate && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600">Next Execution Date</span>
                  <span className="font-medium">{new Date(endDate).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No active mandate found.</p>
        )}
      </div>

      {/* Mandate History */}
      <div className="p-4 border rounded-md shadow-sm bg-white overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Mandate History</h2>
        {mandates && mandates.length > 0 ? (
          <div className="min-w-full">
            {/* Desktop View */}
            <table className="w-full text-left hidden md:table">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payer VPA</th>
                  <th className="py-3 px-4">Init Date</th>
                  <th className="py-3 px-4">Completion Date</th>
                </tr>
              </thead>
              <tbody>
                {mandates.map((mandate) => (
                  <tr key={mandate.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">₹{mandate.amount}</td>
                    <td className="py-3 px-4">{mandate.status}</td>
                    <td className="py-3 px-4 break-all">{mandate.payerVA}</td>
                    <td className="py-3 px-4">
                      {mandate.txnInitDate
                        ? new Date(mandate.txnInitDate).toLocaleString()
                        : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      {mandate.txnCompletionDate
                        ? new Date(mandate.txnCompletionDate).toLocaleString()
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {mandates.map((mandate) => (
                <div
                  key={mandate.id}
                  className="border rounded-lg p-4 space-y-3 hover:bg-gray-50"
                >
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount</span>
                    <span className="font-medium">₹{mandate.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="font-medium">{mandate.status}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">Payer VPA</span>
                    <span className="font-medium break-all">{mandate.payerVA}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">Init Date</span>
                    <span className="font-medium">
                      {mandate.txnInitDate
                        ? new Date(mandate.txnInitDate).toLocaleString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">Completion Date</span>
                    <span className="font-medium">
                      {mandate.txnCompletionDate
                        ? new Date(mandate.txnCompletionDate).toLocaleString()
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No mandates history found.</p>
        )}
      </div>
    </div>
  );
}