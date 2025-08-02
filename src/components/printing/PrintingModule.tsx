// app/printing/page.tsx
'use client';
import React from 'react';  // Add this import

import { useState, Fragment } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import JsBarcode from 'jsbarcode';
import { Dialog, Transition } from '@headlessui/react';

interface ProductDetail {
  productName: string;
  quantity: number;
}

interface CustomerDetails {
  name: string;
  flat_no?: string;
  street?: string;
  district?: string;
  state?: string;
  pincode?: string;
  phone: string;
}

interface OrganisationDetails {
  shopName: string;
  flatno?: string;
  street: string;
  district: string;
  state: string;
  pincode: string;
  phone: string;
}

interface BillDetails {
  bill_no: string | number;
  date: string;
  time: string;
}

interface Bill {
  bill_id: string | number;
  customer_details: CustomerDetails;
  organisation_details: OrganisationDetails;
  bill_details: BillDetails;
  product_details: ProductDetail[];
  shipping_details?: {
    method_name: string;
    method_type: string;
    base_rate: number;
    weight_charge: number;
    total_weight: number;
    total_cost: number;
  } | null;
}

export default function PrintingModule() {
  const [billId, setBillId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [printedBillIds, setPrintedBillIds] = useState<number[]>([]);
  const [billsCount, setBillsCount] = useState(0);

  const handleSinglePrint = async () => {
    if (!billId) {
      alert('Please enter a bill ID');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/printing/print-bill/${billId}`);
      
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = await response.json();
      await printBills([data]);
      
      // Set the bill ID for confirmation
      setPrintedBillIds([parseInt(data.bill_id.toString())]);
      setNeedsConfirmation(true);
      
    } catch (error) {
      console.error('Print error:', error);
      alert('Error fetching bill details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkPrint = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/printing/bulkPrinting');
      
      if (!response.ok) {
        throw new Error('Failed to fetch bills');
      }

      const data = await response.json();
      setBillsCount(data.bills.length);

      if (data.bills.length === 0) {
        alert('No bills available for printing');
        return;
      }

      await printBills(data.bills);
      
      // Store bill IDs for confirmation
      setPrintedBillIds(data.bills.map((bill: Bill) => parseInt(bill.bill_id.toString())));
      setNeedsConfirmation(true);
      
    } catch (error) {
      console.error('Bulk print error:', error);
      alert('Error during printing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmPrintStatus = async (status: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/printing/confirm-print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          billIds: printedBillIds,
          status
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update bill status');
      }
      
      const data = await response.json();
      setNeedsConfirmation(false);
      setPrintedBillIds([]);
      
    } catch (error) {
      console.error('Error confirming print status:', error);
      alert('Failed to update bill status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const printBills = async (bills: Bill[]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Unable to open print window. Please disable your pop-up blocker and try again.');
      return;
    }
  
    const printContent = generatePrintContent(bills);
    
    // Create and trigger automatic download
    const blob = new Blob([printContent], { type: 'text/html' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `bills_${new Date().getTime()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  
    // Display content in print window
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  
    printWindow.onload = function () {
      setTimeout(() => {
        try {
          printWindow.focus();
          printWindow.print();
        } catch (error) {
          console.error("Print error:", error);
          alert("There was an error while trying to print. Please try again.");
        } finally {
          printWindow.close();
        }
      }, 500);
    };
  
    // Cleanup
    URL.revokeObjectURL(downloadUrl);
  };

  const generatePrintContent = (bills: Bill[]) => {
    const styles = `
      <style>
        @media print {
          @page {
            size: 4in 4in;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .label-container {
            width: 100%;
            height: 100%;
            page-break-after: always;
          }
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .label-container {
          width: 4in;
          padding: 4px;
          height: 4in;
          margin: 0 auto;
          box-sizing: border-box;
          page-break-after: always;
        }
        .label {
          border: 1px solid black;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          margin: 0 !important;
          border-bottom: 1px solid black;
          padding: 4px 6px;
          min-height: 45px;
          box-sizing: border-box;
        }
        .logo {
          font-weight: bold;
          font-size: 14px;
        }
        .address-box {
          border-bottom: 1px solid black;
          padding: 6px;
          font-size: 12px;
          flex: 0 0 auto;
        }
        .address-box p {
          font-size: 14px !important;
          padding: 0 !important;
          margin: 6px 0;
        }
        .address-box h2 {
          margin: 0 0 0.05in 0;
          font-size: 16px;
        }
        .sender-details {
          display: flex;
          justify-content: space-between;
          padding: 6px;
          border-bottom: 1px solid black;
          box-sizing: border-box;
          flex: 0 0 auto;
          font-size: 11px;
        }
        .sender-details div strong {
          font-size: 12px;
        }
        .items {
          padding: 6px;
          overflow: hidden;
          display: flex;
        }
        .items-header {
          font-weight: bold;
          margin-bottom: 4px;
        }
        .items-content {
          display: flex;
          flex-direction: row;
        }
        .barcode {
          text-align: center;
          padding: 0;
          margin: 0;
          line-height: 1;
        }
        .barcode img {
          height: 40px;
          padding: 0 !important;
          margin: 0 !important;
          display: block;
          vertical-align: middle;
        }
        .weight {
          padding-bottom: 14px;
        }
        .billId {
          font-size: 12px;
        }
      </style>
    `;

    const billsHTML = bills.map(bill => {
      const itemsList = bill.product_details
        .map(product => `${product.productName} x ${product.quantity}`)
        .join("\n");

      const canvas = document.createElement('canvas');
      JsBarcode(canvas, bill.bill_details.bill_no.toString(), {
        format: "CODE128",
        width: 1,
        height: 20,
        displayValue: false
      });
      const barcodeDataUrl = canvas.toDataURL("image/png");

      return `
        <div class="label-container">
          <div class="label">
            <div class="header">
              <div class="logo">${bill.organisation_details.shopName}</div>
              <div class="barcode">
                <img src="${barcodeDataUrl}" alt="Barcode ${bill.bill_details.bill_no}">
              </div>
              <div class="billId">Bill ID: ${bill.bill_details.bill_no}</div>
            </div>
            <div class="address-box">
              <h2>TO:</h2>
              <p>
                ${bill.customer_details.name}<br>
                ${bill.customer_details.flat_no ? bill.customer_details.flat_no + ', ' : ''}${bill.customer_details.street || ''}<br>
                ${bill.customer_details.district || ''}<br>
                ${bill.customer_details.state || ''} - ${bill.customer_details.pincode || ''}<br>
                Phone: ${bill.customer_details.phone}
              </p>
            </div>
            <div class="sender-details">
              <div>
                <strong>From:</strong><br>
                ${bill.organisation_details.shopName}<br>
                ${bill.organisation_details.flatno ? bill.organisation_details.flatno + ', ' : ''}${bill.organisation_details.street}<br>
                ${bill.organisation_details.district}, ${bill.organisation_details.state}<br>
                ${bill.organisation_details.pincode}<br>
                Phone: ${bill.organisation_details.phone}
              </div>
              <div>
                <strong>Date:</strong> ${bill.bill_details.date}<br>
                <strong>Shipping Details:</strong> ${bill?.shipping_details?.method_name || 'Informing soon'}<br><br>
                <strong class='weight'>Weight:</strong> <br>
                <strong>Packed By:</strong> 
              </div>
            </div>
            <div class="items">
              <div class="items-content">${itemsList}</div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Print Bills</title>
          ${styles}
        </head>
        <body>
          ${billsHTML}
        </body>
      </html>
    `;
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-4 sm:p-6 space-y-6">
      {/* Single Print Section */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Print Single Bill</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            type="text"
            placeholder="Enter Bill ID"
            value={billId}
            onChange={(e) => setBillId(e.target.value)}
            className="w-full"
            disabled={isLoading || needsConfirmation}
          />
          <Button
            onClick={handleSinglePrint}
            disabled={isLoading || needsConfirmation}
            className="w-full sm:w-40"
          >
            {isLoading ? 'Printing...' : 'Print Bill'}
          </Button>
        </div>
      </div>

      {/* Bulk Print Section */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Bulk Printing</h2>
        <Button
          onClick={handleBulkPrint}
          disabled={isLoading || needsConfirmation}
          className="w-full"
        >
          {isLoading ? `Preparing Bills...` : 'Print All Processing Bills'}
        </Button>
      </div>
      
      {/* Print Confirmation Modal using Headless UI */}
      <Transition appear show={needsConfirmation} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-50" 
          onClose={() => {}}  // Empty function to prevent closing on Escape/outside click
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-60" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Print Confirmation
                  </Dialog.Title>
                  
                  <div className="mt-3 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
                    <p className="text-sm text-yellow-800">
                      {printedBillIds.length === 1 
                        ? "Did you successfully print the shipping label?" 
                        : `Did you successfully print all ${printedBillIds.length} shipping labels?`}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                    <Button
                      onClick={() => confirmPrintStatus('printed')}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isLoading ? 'Processing...' : 'Yes, printing completed'}
                    </Button>
                    <Button
                      onClick={() => confirmPrintStatus('processing')}
                      disabled={isLoading}
                      className="bg-gray-500 hover:bg-gray-600 text-white"
                    >
                      {isLoading ? 'Processing...' : 'No, return to processing'}
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
