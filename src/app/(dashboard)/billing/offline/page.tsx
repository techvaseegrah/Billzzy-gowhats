
'use client';


export interface CustomerDetails {
  id?: number;
  name: string;
  phone: string;
}

export interface BillItem {
  productId: number;
  quantity: number;
  price: number;
  total: number;
}

export interface PaymentDetails {
  method: string;
  amountPaid: string;
}

export interface CustomerSuggestion {
  id: number;
  phone: string;
  name: string;
}

// pages/billing/offline.tsx
import React from 'react';  // Add this import

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { ProductTable, ProductTableRef } from '@/components/billing/ProductTable';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { toast } from 'react-toastify';
// import type { CustomerDetails, BillItem, PaymentDetails, CustomerSuggestion } from '@/types/billing';
import 'react-toastify/dist/ReactToastify.css';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
];

const initialCustomerState: CustomerDetails = {
  name: '',
  phone: '',
};

const initialPaymentState: PaymentDetails = {
  method: 'cash',
  amountPaid: '',
};

export default function OfflineBillingPage() {

  const router = useRouter();
  const [items, setItems] = useState<BillItem[]>([]);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>(initialCustomerState);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>(initialPaymentState);
  const [suggestions, setSuggestions] = useState<CustomerSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');

  const productTableRef = useRef<ProductTableRef>(null);
  const debouncedPhone = useDebounce(customerDetails.phone, 300);

  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Add this keyboard handler function
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleCustomerSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  useEffect(() => {
    const fetchCustomerSuggestions = async () => {
      if (debouncedPhone.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/api/customers/search?q=${debouncedPhone}`);
        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }

        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        toast.error('Failed to fetch customer suggestions');
      }
    };

    fetchCustomerSuggestions();
  }, [debouncedPhone, customerDetails.phone]);

  const handleCustomerSelect = (customer: CustomerSuggestion) => {
    setCustomerDetails({
      id: customer.id,
      phone: customer.phone,
      name: customer.name
    });
    setShowSuggestions(false);

    setTimeout(() => {
      productTableRef.current?.focusFirstProductInput();
    }, 100);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateBalance = () => {
    const total = calculateTotal();
    const amountPaid = parseFloat(paymentDetails.amountPaid) || 0;
    return Math.max(0, amountPaid - total);
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    if (!customerDetails.name || !customerDetails.phone) {
      toast.error('Please enter customer details');
      return;
    }

    if (!paymentDetails.amountPaid) {
      toast.error('Please enter amount paid');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customerDetails,
          paymentDetails: {
            ...paymentDetails,
            amountPaid: parseFloat(paymentDetails.amountPaid),
          },
          total: calculateTotal(),
          notes: notes.trim() || null
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create bill');
      }

      toast.success('Bill created successfully');

      // Reset form
  
      setCustomerDetails(initialCustomerState);
      setPaymentDetails(initialPaymentState);
      setItems([]);
      setNotes('');
      productTableRef.current?.resetTable(); // <--- Important

      if (result.data) {
        handlePrintBill(result.data);
      }

      router.push('/billing/offline');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create bill';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const generateBillContent = (billData: any) => {
    const { organisation, customer, items, billNo, date, totalPrice } = billData;

    if (!organisation) {
      throw new Error('Organisation details missing');
    }

    const totalQuantity = items.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0
    );

    const formattedDate = new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });


    const amountPaid = parseFloat(paymentDetails.amountPaid);
    const balance = calculateBalance();

    const totalProfit = items.reduce((sum: number, item: any) => {
      const costPrice = item.product.costPrice ?? 0;
      const sellingPrice = item.product.sellingPrice ?? 0;
      return sum + (sellingPrice - costPrice) * item.quantity;
    }, 0);

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Bill #${billNo}</title>
        <style>
          @media print {
            @page { margin: 10mm; }
            body { margin: 0; }
          }
          body { 
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
          }
          .container { 
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .shop-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .address {
            margin-bottom: 15px;
          }
          .bill-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f8f8f8;
          }
          .totals {


            display:flex; 
            justify-content:space-between;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
          }
            .t1,.t2{
            margin:0;
            padding:0;
            }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="shop-name">${organisation.shopName}</div>
            <div class="address">
              ${organisation.flatNo}, ${organisation.street}<br>
              ${organisation.district}, ${organisation.state} - ${organisation.pincode}<br>
              Phone: ${organisation.phone}
              ${organisation.websiteAddress ? `<br>Website: ${organisation.websiteAddress}` : ''}
            </div>
          </div>

          <div class="bill-info">
            <div>
              <strong>Bill No:</strong> ${billNo}<br>
               <strong>Date:</strong> ${formattedDate}
            </div>
            <div>
              <strong>Customer:</strong> ${customer.name}<br>
              <strong>Phone:</strong> ${customer.phone}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item: any) => `
                <tr>
                  <td>${item.product.name}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.product.sellingPrice.toFixed(2)}</td>
                  <td>₹${item.totalPrice.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
  <tr>
    <td colspan="3" style="text-align: right; font-weight: bold;">Grand Total</td>
    <td><strong>₹${totalPrice?.toFixed(2) ?? '0.00'}</strong></td>
  </tr>
</tfoot>

          </table>

       

               <div class="bill-info">
            <div>
              <strong>Total Quantity:</strong> ${totalQuantity}<br>
               <strong>Payment Method:</strong> ${paymentDetails.method}

            </div>
            <div>
              <strong>Amount Paid:</strong> ₹${amountPaid.toFixed(2)}<br>
              <strong>Balance:</strong> ₹${balance.toFixed(2)}

            </div>
          </div>

          <div class="footer">
            <p>We value your trust in choosing our products!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handlePrintBill = (billData: any) => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Failed to open print window');
      }

      const billContent = generateBillContent(billData);
      printWindow.document.write(billContent);
      printWindow.document.close();

      printWindow.onload = () => {
        setTimeout(() => {
          try {
            printWindow.print();
            printWindow.close();
          } catch (error) {
            console.error('Print error:', error);
            toast.error('Failed to print bill');
          }
        }, 500);
      };
    } catch (error) {
      console.error('Bill generation error:', error);
      toast.error('Failed to generate bill');
    }
  };

  return (
    <div className="space-y-6 md:mt-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Customer Details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Input
              label="Phone Number"
              value={customerDetails.phone}
              onChange={(e) => {
                setCustomerDetails(prev => ({
                  ...prev,
                  phone: e.target.value,
                }));
                setShowSuggestions(true);
                setSelectedIndex(-1); // Reset selection when typing
              }}
              onKeyDown={handleKeyDown}
              pattern="[0-9]{10}"
              required
              placeholder="Enter phone number"
            />
            {showSuggestions && customerDetails.phone.length < 10 && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
              >
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.phone}
                    className={`p-2 cursor-pointer ${index === selectedIndex
                        ? 'bg-indigo-100'
                        : 'hover:bg-gray-100'
                      }`}
                    onClick={() => handleCustomerSelect(suggestion)}
                  >
                    <div className="flex justify-between">
                      <span>{suggestion.phone}</span>
                      <span>{suggestion.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Input
            label="Customer Name"
            value={customerDetails.name}
            onChange={(e) => setCustomerDetails(prev => ({
              ...prev,
              name: e.target.value,
            }))}
            required
            placeholder="Enter customer name"
          />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Add Products</h2>
        <ProductTable
          ref={productTableRef}
          onChange={setItems}
        />
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Payment Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Payment Method"
            value={paymentDetails.method}
            onChange={(e) => setPaymentDetails(prev => ({
              ...prev,
              method: e.target.value,
            }))}
            options={PAYMENT_METHODS}
            required
          />
          <Input
            label="Amount Paid"
            type="number"
            value={paymentDetails.amountPaid}
            onChange={(e) => setPaymentDetails(prev => ({
              ...prev,
              amountPaid: e.target.value,
            }))}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="mt-4 text-right">
          <p className="text-lg">Total: ₹{calculateTotal().toFixed(2)}</p>
          <p className="text-lg text-gray-600">Balance: ₹{calculateBalance().toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-medium">Notes</h2>
          <span className="text-sm text-gray-500">(Optional)</span>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes here..."
          className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md">{error}</div>
      )}

      <div className="flex justify-end space-x-4">
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