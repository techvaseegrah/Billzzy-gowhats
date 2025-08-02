import { Card } from '../ui/Card';
// import  ScrollArea  from '../ui/ScrollArea';
import React from 'react';  // Add this import

interface RecentTransaction {
  id: number;
  customerName: string;
  mobileNumber: string;
  amount: number;
  paymentMode: string;
  date: string;
}

const mockTransactions: RecentTransaction[] = [
  {
    id: 1,
    customerName: "Rahul Kumar",
    mobileNumber: "9876543210",
    amount: 1800.00,
    paymentMode: "Cash",
    date: "2024-02-22"
  },
  {
    id: 2,
    customerName: "Priya Singh",
    mobileNumber: "9876543211",
    amount: 2500.50,
    paymentMode: "UPI",
    date: "2024-02-22"
  },
  // Add more mock transactions...
];

interface BottomSectionProps {
  customerCount: number;
  smsCount: number;
}

export default function BottomSection({ customerCount, smsCount }: BottomSectionProps) {
  const smsCost = smsCount * 0.25;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      {/* Recent Transactions */}
      <Card className="lg:col-span-2 bg-white">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h2>
          <div className="h-[40vh]">
            <div className="space-y-4">
              {mockTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{transaction.customerName}</p>
                        <p className="text-sm text-gray-500">{transaction.mobileNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-indigo-600">
                          ₹{transaction.amount.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </p>
                        <p className="text-sm text-gray-500">{transaction.paymentMode}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="space-y-6">
        {/* Customer Count Card */}
        <Card className="bg-white">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {customerCount.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </Card>

        {/* SMS Cost Card */}
        <Card className="bg-white">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">SMS Cost</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{smsCost.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {smsCount.toLocaleString()} messages
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}