// File: app/billing/process_submission/[id]/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductTable } from '@/components/billing/ProductTable';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-toastify';
import type { BillItem } from '@/types/billing';
import JsBarcode from 'jsbarcode';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ProcessSubmissionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState(null);
  const [items, setItems] = useState<BillItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch the submission details
    const fetchSubmission = async () => {
      try {
        const response = await fetch(`/api/billing/customerSubmission/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch submission');
        }
        const data = await response.json();
        setSubmission(data.submission);
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch submission');
      }
    };

    fetchSubmission();
  }, [id]);

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error('Please add at least one item.');
      return;
    }

    setIsLoading(true);

    try {
      // Create bill
      const response = await fetch('/api/billing/online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: submission.customerId,
          items,
          billingMode: 'online',
        }),
      });

      const data = await response.json();
      

      if (!response.ok) {
        toast.error(data.details)
        return
      }

      // Generate and print the bill
      // generateAndPrintBill(data);

      // Update submission status to 'processed'
      await fetch(`/api/billing/customerSubmission/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'processed' }),
      });

      toast.success('Bill created and printed successfully!');
      router.push('/billing/pendingBills');
    } catch (error) {
      console.error(error);
      // toast.error(error instanceof Error ? error.message : 'Failed to create bill');
    } finally {
      setIsLoading(false);
    }
  };


  // function generateAndPrintBill(data) {
  //   const printWindow = window.open("", "_blank");
  
  //   if (!printWindow) {
  //     alert("Unable to open print window. Please disable your pop-up blocker and try again.");
  //     return;
  //   }
  
  //   // Format items list with line breaks for better readability
  //   const itemsList = data.product_details.map((product) => 
  //     `${product.productName} x ${product.quantity}`
  //   ).join("\n");
  
  //   const billId = data.bill_id.toString();
  
  //   // Create barcode
  //   const canvas = document.createElement('canvas');
  //   JsBarcode(canvas, billId, {
  //     format: "CODE128",
  //     width: 1,
  //     height: 20,
  //     displayValue: false
  //   });
  //   const barcodeDataUrl = canvas.toDataURL("image/png");
  
  //   const styles = `
  //     <style>
  //       @media print {
  //         @page {
  //           size: 4in 4in;
  //           margin: 0;
  //         }
  //         body {
  //           margin: 0;
  //           padding: 0;
  //         }
  //         .label-container {
  //           width: 100%;
  //           height: 100%;
  //           page-break-after: always;
  //         }
  //       }
  //       body {
  //         font-family: Arial, sans-serif;
  //         font-size: 12px;
  //         margin: 0;
  //         padding: 0;
  //         box-sizing: border-box;
  //       }
  //       .label-container {
  //         width: 4in;
  //         padding: 4px;
  //         height: 4in;
  //         margin: 0 auto;
  //         box-sizing: border-box;
  //         page-break-after: always;
  //       }
  //       .label {
  //         border: 1px solid black;
  //         width: 100%;
  //         height: 100%;
  //         display: flex;
  //         flex-direction: column;
  //         margin: 0;
  //         padding: 0;
  //         box-sizing: border-box;
  //       }
  //       .header {
  //         display: flex;
  //         justify-content: space-between;
  //         align-items: center;
  //         font-size: 14px;
  //         margin: 0 !important;
  //         border-bottom: 1px solid black;
  //         padding: 4px 6px;
  //         min-height: 45px;
  //         box-sizing: border-box;
  //       }
  //       .logo {
  //         font-weight: bold;
  //         font-size: 14px;
  //       }
  //       .address-box {
  //         border-bottom: 1px solid black;
  //         padding: 6px;
  //         font-size: 12px;
  //         flex: 0 0 auto;
  //       }
  //       .address-box p {
  //         font-size: 14px !important;
  //         padding: 0 !important;
  //         margin: 6px 0;
  //       }
  //       .address-box h2 {
  //         margin: 0 0 0.05in 0;
  //         font-size: 16px;
  //       }
  //       .sender-details {
  //         display: flex;
  //         justify-content: space-between;
  //         padding: 6px;
  //         border-bottom: 1px solid black;
  //         box-sizing: border-box;
  //         flex: 0 0 auto;
  //         font-size: 11px;
  //       }
  //       .sender-details div strong {
  //         font-size: 12px;
  //       }
  //       .items {
  //         padding: 6px;
  //         overflow: hidden;
  //         display: flex;
  //       }
  //       .items-header {
  //         font-weight: bold;
  //         margin-bottom: 4px;
  //       }
  //       .items-content {
         
  //         display:flex;
  //         flex-direction:row;          
  //       }
  //       .barcode {
  //         text-align: center;
  //         padding: 0;
  //         margin: 0;
  //         line-height: 1;
  //       }
  //       .barcode img {
  //         height: 40px;
  //         padding: 0 !important;
  //         margin: 0 !important;
  //         display: block;
  //         vertical-align: middle;
  //       }
  //     </style>
  //   `;
  
  //   const labelContent = `
  //     <!DOCTYPE html>
  //     <html lang="en">
  //     <head>
  //       <meta charset="UTF-8">
  //       <title>Thermal Label</title>
  //       ${styles}
  //     </head>
  //     <body>
  //       <div class="label-container">
  //         <div class="label">
  //           <div class="header">
  //             <div class="logo">${data.organisation_details.shop_name}</div>
  //             <div class="barcode">
  //               <img src="${barcodeDataUrl}" alt="Barcode ${billId}">
  //             </div>
  //             <div>Bill ID: ${data.bill_id}</div>
  //           </div>
  //           <div class="address-box">
  //             <h2>TO:</h2>
  //             <p>
  //               ${data.customer_details.name}<br>
  //               ${data.customer_details.flat_no || ''}, ${data.customer_details.street || ''}<br>
  //               ${data.customer_details.district || ''}<br>
  //               ${data.customer_details.state || ''} - ${data.customer_details.pincode || ''}<br>
  //               Phone: ${data.customer_details.phone}
  //             </p>
  //           </div>
  //           <div class="sender-details">
  //             <div>
  //               <strong>From:</strong><br>
  //               ${data.organisation_details.shop_name}<br>
  //               ${data.organisation_details.flatno || ''}, ${data.organisation_details.street}<br>
  //               ${data.organisation_details.district}, ${data.organisation_details.state}<br>
  //               ${data.organisation_details.pincode}<br>
  //               Phone: ${data.organisation_details.phone}
  //             </div>
  //             <div>
  //               <strong>Date:</strong> ${data.bill_details.date}
  //             </div>
  //           </div>
  //           <div class="items">
  //             <div class="items-content">${itemsList}</div>
  //           </div>
  //         </div>
  //       </div>
  //     </body>
  //     </html>
  //   `;
  
  //   printWindow.document.open();
  //   printWindow.document.write(labelContent);
  //   printWindow.document.close();
  
  //   printWindow.onload = function () {
  //     setTimeout(() => {
  //       try {
  //         printWindow.focus();
  //         printWindow.print();
  //       } catch (error) {
  //         console.error("Print error:", error);
  //         alert("There was an error while trying to print. Please try again.");
  //       } finally {
  //         printWindow.close();
  //       }
  //     }, 500);
  //   };
  // }


  if (!submission) {
   return <div className="h-[100vh] w-[100%] flex items-center justify-center">
    <LoadingSpinner />
  </div>  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Process Submission</h1>
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Customer Details</h2>
        <div className="space-y-2">
          <div><strong>Name:</strong> {submission.customer.name}</div>
          <div><strong>Phone:</strong> {submission.customer.phone}</div>
          <div><strong>Address:</strong> {`${submission.customer.flatNo || ''}, ${submission.customer.street || ''}, ${submission.customer.district || ''}, ${submission.customer.state || ''}, ${submission.customer.pincode || ''}`}</div>
          <div><strong>Notes:</strong> {submission.notes}</div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 mt-6">
        <h2 className="text-lg font-medium mb-4">Add Products</h2>
        <ProductTable onChange={setItems} />
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={items.length === 0 || isLoading}
        >
          {isLoading ? 'Creating Bill...' : 'Create Bill'}
        </Button>
      </div>
    </div>
  );
}
