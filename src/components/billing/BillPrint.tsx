'use client';

import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/Button';
import { formatDate, formatCurrency } from '@/lib/utils';
import React from 'react';  // Add this import

interface BillPrintProps {
  bill: {
    billNo: number;
    date: string;
    time: string;
    totalPrice: number;
    amountPaid?: number;
    balance?: number;
    paymentMethod?: string;
    customer: {
      name: string;
      phone: string;
    };
    items: Array<{
      product: {
        name: string;
        SKU: string;
      };
      quantity: number;
      totalPrice: number;
    }>;
    organisation: {
      shopName: string;
      flatNo: string;
      street: string;
      district: string;
      state: string;
      pincode: string;
      mobileNumber: string;
      gstNumber?: string;
    };
  };
}

export function BillPrint({ bill }: BillPrintProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: `
      @page {
        size: 80mm 297mm;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
      }
    `
  });

  return (
    <div>
      <div className="mb-4 flex justify-end space-x-4">
        <Button onClick={handlePrint}>
          Print Bill
        </Button>
      </div>

      <div ref={printRef} className="p-4 max-w-[80mm] mx-auto bg-white">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold">{bill.organisation.shopName}</h1>
          <p className="text-sm">
            {bill.organisation.flatNo}, {bill.organisation.street}
          </p>
          <p className="text-sm">
            {bill.organisation.district}, {bill.organisation.state}
          </p>
          <p className="text-sm">
            PIN: {bill.organisation.pincode}
          </p>
          <p className="text-sm">
            Phone: {bill.organisation.mobileNumber}
          </p>
          {bill.organisation.gstNumber && (
            <p className="text-sm">
              GST: {bill.organisation.gstNumber}
            </p>
          )}
        </div>

        {/* Bill Details */}
        <div className="border-t border-b border-dashed py-2 mb-4">
          <p className="text-sm">
            Bill No: {bill.billNo}
          </p>
          <p className="text-sm">
            Date: {formatDate(bill.date)} {formatDate(bill.time, 'time')}
          </p>
          <p className="text-sm">
            Customer: {bill.customer.name}
          </p>
          <p className="text-sm">
            Phone: {bill.customer.phone}
          </p>
        </div>

        {/* Items */}
        <div className="mb-4">
          <div className="text-xs border-b">
            <div className="grid grid-cols-12 gap-1 font-bold">
              <div className="col-span-5">Item</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Rate</div>
              <div className="col-span-3 text-right">Amount</div>
            </div>
          </div>

          {bill.items.map((item, index) => (
            <div key={index} className="text-xs py-1 border-b">
              <div className="grid grid-cols-12 gap-1">
                <div className="col-span-5">{item.product.name}</div>
                <div className="col-span-2 text-right">{item.quantity}</div>
                <div className="col-span-2 text-right">
                  {formatCurrency(item.totalPrice / item.quantity)}
                </div>
                <div className="col-span-3 text-right">
                  {formatCurrency(item.totalPrice)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t border-double text-sm">
          <div className="flex justify-between py-1">
            <span>Total Amount:</span>
            <span>{formatCurrency(bill.totalPrice)}</span>
          </div>

          {bill.paymentMethod && (
            <>
              <div className="flex justify-between py-1">
                <span>Payment Method:</span>
                <span>{bill.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Amount Paid:</span>
                <span>{formatCurrency(bill.amountPaid || 0)}</span>
              </div>
              <div className="flex justify-between py-1 font-bold">
                <span>Balance:</span>
                <span>{formatCurrency(bill.balance || 0)}</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-xs">
          <p>Thank you for your business!</p>
          <p>Visit again!</p>
        </div>
      </div>
    </div>
  );
}