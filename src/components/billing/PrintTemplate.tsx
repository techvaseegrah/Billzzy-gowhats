// components/printing/PrintTemplate.tsx
'use client';

import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface PrintTemplateProps {
  bill_id: string | number;
  customer_details: {
    name: string;
    flat_no?: string;
    street?: string;
    district?: string;
    state?: string;
    pincode?: string;
    phone: string;
  };
  organisation_details: {
    shop_name: string;
    flatno?: string;
    street: string;
    district: string;
    state: string;
    pincode: string;
    phone: string;
  };
  bill_details: {
    bill_no: string | number;
    date: string;
    time: string;
  };
  product_details: Array<{
    productName: string;
    quantity: number;
  }>;
}

const PrintTemplate: React.FC<PrintTemplateProps> = ({
  bill_id,
  customer_details,
  organisation_details,
  bill_details,
  product_details,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      JsBarcode(canvasRef.current, bill_id.toString(), {
        format: "CODE128",
        width: 1,
        height: 20,
        displayValue: false
      });
    }
  }, [bill_id]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Unable to open print window. Please disable your pop-up blocker and try again.");
      return;
    }

    const itemsList = product_details
      .map((product) => `${product.productName} x ${product.quantity}`)
      .join("\n");

    const barcodeDataUrl = canvasRef.current?.toDataURL("image/png");

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
      </style>
    `;

    const printContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Thermal Label</title>
        ${styles}
      </head>
      <body>
        <div class="label-container">
          <div class="label">
            <div class="header">
              <div class="logo">${organisation_details.shopName}</div>
              <div class="barcode">
                <img src="${barcodeDataUrl}" alt="Barcode ${bill_id}">
              </div>
              <div>Bill ID: ${bill_id}</div>
            </div>
            <div class="address-box">
              <h2>TO:</h2>
              <p>
                ${customer_details.name}<br>
                ${customer_details.flat_no || ''}, ${customer_details.street || ''}<br>
                ${customer_details.district || ''}<br>
                ${customer_details.state || ''} - ${customer_details.pincode || ''}<br>
                Phone: ${customer_details.phone}
              </p>
            </div>
            <div class="sender-details">
              <div>
                <strong>From:</strong><br>
                ${organisation_details.shop_name}<br>
                ${organisation_details.flatno || ''}, ${organisation_details.street}<br>
                ${organisation_details.district}, ${organisation_details.state}<br>
                ${organisation_details.pincode}<br>
                Phone: ${organisation_details.phone}
              </div>
              <div>
                <strong>Date:</strong> ${bill_details.date}<br>
                <strong>Time:</strong> ${bill_details.time}
              </div>
            </div>
            <div class="items">
              <div class="items-content">${itemsList}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

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
  };

  return (
    <div className="hidden">
      <canvas ref={canvasRef} />
      <button id="printButton" onClick={handlePrint} className="hidden">
        Print
      </button>
    </div>
  );
};

export default PrintTemplate;