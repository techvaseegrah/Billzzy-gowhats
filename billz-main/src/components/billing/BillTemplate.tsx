// components/billing/BillTemplate.tsx

import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BillTemplateProps {
  billData: {
    bill_id: number;
    billNo: number;
    date: string;
    time: string;
    total_amount: number;
    customer_details: {
      id: number;
      name: string;
      phone: string;
      flat_no?: string;
      street?: string;
      district?: string;
      state?: string;
      pincode?: string;
    };
    organisation_details: {
      id: number;
      shop_name: string;
      flatno?: string;
      street: string;
      district: string;
      city: string;
      state: string;
      country: string;
      pincode: string;
      phone: string;
    };
    product_details: {
      productName: string;
      SKU: string;
      quantity: number;
      unitPrice: number;
      amount: number;
    }[];
  };
}

const BillTemplate: React.FC<BillTemplateProps> = ({ billData }) => {
  const barcodeRef = useRef<SVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, billData.billNo.toString(), {
        format: 'CODE128',
        width: 1,
        height: 40,
        displayValue: false,
      });
    }
  }, [billData.billNo]);

  return (
    <div className="label-container">
      <div className="label">
        {/* Header Section */}
        <div className="header">
          <div className="logo">{billData.organisation_details.shop_name}</div>
          <div className="barcode">
            <svg ref={barcodeRef}></svg>
          </div>
          <div>Bill ID: {billData.bill_id}</div>
        </div>

        {/* Customer Details */}
        <div className="address-box">
          <h2>TO:</h2>
          <p>
            {billData.customer_details.name}<br />
            {billData.customer_details.flat_no}, {billData.customer_details.street}<br />
            {billData.customer_details.district}<br />
            {billData.customer_details.state} - {billData.customer_details.pincode}<br />
            Phone: {billData.customer_details.phone}
          </p>
        </div>

        {/* Organisation Details */}
        <div className="sender-details">
          <div>
            <strong>From:</strong><br />
            {billData.organisation_details.shop_name}<br />
            {billData.organisation_details.flatno}, {billData.organisation_details.street}<br />
            {billData.organisation_details.district}, {billData.organisation_details.state}<br />
            {billData.organisation_details.pincode}<br />
            Phone: {billData.organisation_details.phone}
          </div>
          <div>
            <strong>Date:</strong> {billData.date}<br />
            <strong>Time:</strong> {billData.time}<br />
            <strong>Items:</strong> {billData.product_details.length}
          </div>
        </div>

        {/* Items List */}
        <div className="items">
          <h4>ITEMS:</h4>
          <ul>
            {billData.product_details.map((product, index) => (
              <li key={index}>
                {index + 1}. {product.productName} (Qty: {product.quantity}) - ₹{product.amount.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer with Total Amount */}
        <div className="footer">
          <strong>Total Amount:</strong> ₹{billData.total_amount.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default BillTemplate;
