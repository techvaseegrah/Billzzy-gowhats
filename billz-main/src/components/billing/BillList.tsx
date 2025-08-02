// components/billing/BillList.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatDate } from '@/lib/utils';
import { toast } from 'react-toastify';
import { Modal } from '@/components/ui/Modal';
import React from 'react';  // Add this import
import { EditBillModal } from './EditBillModal';

interface Bill {
  id: number;
  billNo: number;
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:MM AM/PM'
  totalPrice: number;
  status: string;
  billingMode: string;
  customer: {
    name: string;
    phone: string;
    district?: string;
    state?: string;
  };
  items: Array<{
    id: number;
    productName: string;
    quantity: number;
    totalPrice: number;
  }>;
  paymentMethod?: string;
  amountPaid?: number;
  balance?: number;
  trackingNumber?: string | null;
  weight?: number | null;
}

interface BillListProps {
  initialBills: Bill[];
  mode: 'online' | 'offline';
}

export function BillList({ initialBills, mode }: BillListProps) {
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hasTrackingFilter, setHasTrackingFilter] = useState('all');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [totalCount, setTotalCount] = useState(0);

  // State variables for tracking modal
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingBillId, setTrackingBillId] = useState<number | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [weight, setWeight] = useState('');
  const trackingInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBills(currentPage);
  }, [searchQuery, dateFilter, statusFilter, hasTrackingFilter]);



  const fetchBills = async (page: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        mode,
        date: dateFilter,
        status: statusFilter,
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
  
      if (hasTrackingFilter !== 'all') {
        params.append('hasTracking', hasTrackingFilter);
      }
  
      const response = await fetch(`/api/billing/search?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bills');
      }
  
      const data = await response.json();
      
      // Verify the data structure in development
      console.log('Fetched bills:', data);
  
      setBills(data.bills);
      setTotalCount(data.totalCount);
      setCurrentPage(page);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch bills. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Call this function when component mounts or filters change
  useEffect(() => {
    fetchBills(currentPage);
  }, [searchQuery, dateFilter, statusFilter, hasTrackingFilter]);
  
  // Update bill function for editing
  const handleUpdateBill = async (items: BillItem[]) => {
    try {
      console.log('Updating bill:', billToEdit.id, items);
      
      const response = await fetch(`/api/billing/${billToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update bill');
      }
  
      await fetchBills(currentPage);
      toast.success('Bill updated successfully');
      setIsEditModalOpen(false);
      setBillToEdit(null);
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update bill');
    }
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [billToEdit, setBillToEdit] = useState<any>(null);



  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (bills.some(bill => bill.paymentMethod === 'razorpay_link' &&
      bill.paymentStatus !== 'PAID' && bill.paymentStatus !== 'FAILED')) {
      intervalId = setInterval(() => {
        fetchBills(currentPage);
      }, 5000); // Poll every 5 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [bills]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleHasTrackingFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHasTrackingFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    fetchBills(page);
  };

  const handleStatusChange = async (billId: number, newStatus: string) => {
    if (newStatus === 'shipped') {
      setTrackingBillId(billId);
      setIsTrackingModalOpen(true);
      // Focus input on next tick after modal opens
      setTimeout(() => {
        trackingInputRef.current?.focus();
      }, 100);
    } else {
      await updateStatus(billId, newStatus);
    }
  };

  const handleTrackingFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      handleTrackingSubmit();
    }
  };

  const updateStatus = async (billId: number, newStatus: string) => {

    try {
      const response = await fetch('/api/billing/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billId, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // First update local state
      setBills(prevBills =>
        prevBills.map((bill) =>
          bill.id === billId ? { ...bill, status: newStatus } : bill
        )
      );

      await fetchBills(currentPage);

      // Force a client-side navigation to refresh the page
      router.refresh();

      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update status');
    }
  };

  const handleTrackingSubmit = async () => {
    if (!trackingBillId || !trackingNumber) {
      toast.error('Tracking number is required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/billing/tracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId: trackingBillId,
          trackingNumber,
          weight: weight ? parseFloat(weight) : null,
          status: 'sent' // Update status as per your requirements
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tracking details');
      }

      // Update the local state
      setBills(
        bills.map((bill) =>
          bill.id === trackingBillId
            ? {
              ...bill,
              status: 'shipped',
              trackingNumber,
              weight: weight ? parseFloat(weight) : null,
            }
            : bill
        )
      );

      await fetchBills(currentPage);

      // Force a client-side navigation to refresh the page
      router.refresh();


      toast.success('Tracking details updated and SMS sent successfully');

    } catch (error) {
      toast.error('Failed to update tracking details');
    } finally {
      setIsLoading(false);
      setIsTrackingModalOpen(false);
      setTrackingBillId(null);
      setTrackingNumber('');
      setWeight('');
    }
  };



  const handleDelete = async (billId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/billing/${billId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete bill');
      }

      setBills(bills.filter((bill) => bill.id !== billId));
      toast.success('Bill deleted successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete bill');
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
    }
  };


  const handlePaymentStatusChange = async (billId: number, newPaymentStatus: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/billing/manualPaymentStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId,
          paymentStatus: newPaymentStatus,
          status: newPaymentStatus === 'PAID' ? 'processing' : 'paymentPending'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      // Update local state
      setBills(prevBills =>
        prevBills.map(bill =>
          bill.id === billId ? {
            ...bill,
            paymentStatus: newPaymentStatus,
            status: newPaymentStatus === 'PAID' ? 'processing' : 'paymentPending'
          } : bill
        )
      );

      await fetchBills(currentPage);
      router.refresh();
      toast.success('Payment status updated successfully');
    } catch (error) {
      console.error('Payment status update error:', error);
      toast.error('Failed to update payment status');
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteAll = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/billing/all/${mode}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete bills');
      }

      setBills([]);
      toast.success('All bills deleted successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete bills');
    } finally {
      setIsLoading(false);
      setIsDeleteAllModalOpen(false);
    }
  };

  console.log('bills:', bills);
  

  return (



    <>
      {/* Search and Filters - Responsive */}
      <div className="space-y-4 md:space-y-0">
        {/* Mobile View Filters */}
        <div className="flex flex-col space-y-3 md:hidden">
          <Input
            type="search"
            placeholder="Search bills..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full"
          />
          <div className="grid grid-cols-3 gap-3">
            <Select
              value={dateFilter}
              onChange={handleDateFilterChange}
              className="w-full"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </Select>
            {mode === "online" && (
              <>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="w-full"
                >
                  <option value="all">All Status</option>
                  <option value="paymentPending">Payment Pending</option>
                  <option value="processing">Processing</option>
                  <option value="printed">Printed</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                </Select>
                <Select
                  value={hasTrackingFilter}
                  onChange={handleHasTrackingFilterChange}
                  className="w-full col-span-2"
                >
                  <option value="all">All Tracking</option>
                  <option value="true">With Tracking</option>
                  <option value="false">Without Tracking</option>
                </Select>
              </>
            )}
          </div>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteAllModalOpen(true)}
            disabled={bills.length === 0}
            className="w-full"
          >
            Delete All Bills
          </Button>
        </div>

        {/* Desktop View Filters */}
        <div className="hidden md:flex md:flex-wrap md:justify-between md:items-center  md:gap-4">
          <div className="flex gap-4 flex-1">
            <Input
              type="search"
              placeholder="Search bills..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="max-w-xs"
            />
            <Select
              value={dateFilter}
              onChange={handleDateFilterChange}
              className="w-40"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </Select>
            {mode === "online" && (
              <>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="w-40"
                >
                  <option value="all">All Status</option>
                  <option value="paymentPending">Payment Pending</option>
                  <option value="processing">Processing</option>
                  <option value="printed">Printed</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                </Select>
                <Select
                  value={hasTrackingFilter}
                  onChange={handleHasTrackingFilterChange}
                  className="w-40"
                >
                  <option value="all">All Tracking</option>
                  <option value="true">With Tracking</option>
                  <option value="false">Without Tracking</option>
                </Select>
              </>
            )}
          </div>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteAllModalOpen(true)}
            disabled={bills.length === 0}
          >
            Delete All Bills
          </Button>
        </div>
      </div>

      

      {/* Bills Display */}
      <div className="bg-white shadow-lg mt-[1rem] rounded-lg overflow-hidden">
        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden  sm:block">
          <table className="min-w-full divide-y divide-gray-200 table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Bill No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Customer Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Order Details
                </th>
                {mode === 'offline' && (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Amount Paid
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Balance
                    </th>
                  </>
                )}
                {mode === 'online' && (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Tracking Info
                    </th>
                  </>
                )}

                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y  divide-gray-200">
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  {/* Bill No */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {bill.billNo}
                  </td>

                  {/* Date & Time */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    <div>{formatDate(bill.date)}</div>
                    <div className="text-xs text-gray-500">{bill.time}</div>
                    {bill.isEdited ? <span className="text-xs text-gray-500">Edited</span> : null}

                  </td>

                  {/* Customer Details */}
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="font-medium">{bill.customer.name}</div>
                    <div className="text-gray-500">{bill.customer.phone}</div>
                    {mode === 'online' && bill.customer.district && bill.customer.state && (
                      <div className="text-xs text-gray-500">
                        {bill.customer.district}, {bill.customer.state}
                      </div>
                    )}
                  </td>

                  {/* Order Details */}
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="space-y-1">
                      {bill.items.map((item) => (
                        <div key={item.id} className="text-sm">
                          <span className="cursor-default" title={item.productName}>
                            {item.SKU} × {item.quantity} = ₹{item.totalPrice}
                          </span>
                        </div>
                      ))}
                      {
                        bill.shipping ? <div className="font-semibold">Shipping: {bill?.shipping.methodName} (₹{bill?.shipping.totalCost})</div> : <>null</>

                      }
                      <div className="font-semibold">Total: ₹{bill.totalPrice}</div>
                    </div>
                  </td>

                  {/* Offline Specific Columns */}
                  {mode === 'offline' && (
                    <>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {bill.paymentMethod}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        ₹{bill.amountPaid}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        ₹{bill.balance}
                      </td>
                    </>
                  )}

                  {/* Online Specific Columns */}
                  {mode === 'online' && (
                    <>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 w-[150px]">
                        <section className="flex justify-between items-center mb-2">
                          <div className="text-[13px] text-gray-600">Payment:</div>
                          {bill.paymentStatus === 'processing' ? (
                            <div className='w-[120px] ml-4'>
                              <div
                                className={`
                          text-[12px]   px-3 py-[2px] rounded-full font-medium inline-block
                          ${bill.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : ''}
                          ${bill.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' : ''}
                          ${bill.paymentStatus === 'PENDING' ? 'bg-orange-100 text-orange-800' : ''}
                          ${bill.paymentStatus === 'EXPIRED' ? 'bg-gray-100 text-gray-800' : ''}
                        `}
                              >
                                {bill.paymentStatus}
                              </div>

                            </div>
                          ) : (
                            <div className='w-[120px]'>
                              <select
                                value={bill.paymentStatus || ''}
                                onChange={(e) => handlePaymentStatusChange(bill.id, e.target.value)}
                                className=" text-sm border rounded-full px-2  py-1"
                                disabled={isLoading}
                              >
                                <option value="">Select Status</option>
                                <option value="PAID">Paid</option>
                                <option value="FAILED">Failed</option>
                              </select>
                            </div>
                          )}
                        </section>
                        <section className="flex justify-between items-center">
                          <div className="text-[13px] text-gray-600">Order:</div>
                          <section className='w-[120px] '>
                            <div
                              className={`
                        text-[12px] px-3 py-[2px] rounded-full font-medium inline-block uppercase
                        ${bill.status === 'paymentPending' ? 'bg-orange-100 text-orange-800' : ''}
                        ${bill.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${bill.status === 'printed' ? 'bg-blue-100 text-blue-800' : ''}
                        ${bill.status === 'packed' ? 'bg-violet-100 text-violet-800' : ''}
                        ${bill.status === 'shipped' ? 'bg-green-100 text-green-800' : ''}
                      `}
                            >
                              {bill.status}
                            </div>
                          </section>


                        </section>

                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {bill.trackingNumber ? (
                          <div>
                            <div>{bill.trackingNumber}</div>
                            {bill.weight && (
                              <div className="text-xs text-gray-500">
                                Weight: {bill.weight} kg
                              </div>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}


                      </td>



                      {/* Add Edit button in your bill actions */}

                    </>
                  )}

                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {bill.notes ? bill.notes : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setBillToDelete(bill.id);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                      {(bill.status === 'processing' || bill.status === 'paymentPending') && (
                        <Button
                          variant="outline"

                          onClick={() => {
                            setBillToEdit(bill);
                            setIsEditModalOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      )}

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="block sm:hidden p-4  space-y-4">
          {bills.map((bill) => (
            <div
              key={bill.id}
              className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
            >
              {/* Bill No */}
              <div className="flex justify-between py-1">
                <span className="text-gray-600 font-medium">Bill No:</span>
                <span className="text-gray-800">{bill.billNo}</span>
              </div>

              {/* Date & Time */}
              <div className="flex justify-between py-1">
                <span className="text-gray-600 font-medium">Date & Time:</span>
                <div className="text-right">
                  <div className="text-gray-800">{formatDate(bill.date)}</div>
                  <div className="text-xs text-gray-500">{bill.time}</div>
                  {bill.isEdited ? <span className="text-xs text-gray-500">Edited</span> : null}

                </div>
              </div>

              {/* Customer Details */}
              <div className="flex justify-between py-1">
                <span className="text-gray-600 font-medium">Customer:</span>
                <div className="text-right">
                  <div className="text-gray-800">{bill.customer.name}</div>
                  <div className="text-gray-500 text-sm">{bill.customer.phone}</div>
                  {mode === 'online' && bill.customer.district && bill.customer.state && (
                    <div className="text-xs text-gray-500">
                      {bill.customer.district}, {bill.customer.state}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Details */}
              <div className="border-t my-2 py-2">
                <div className="text-gray-600 font-medium mb-1">Order Details:</div>
                <div className="space-y-1 text-sm text-gray-800">
                  {bill.items.map((item) => (
                    <div key={item.id}>
                      {item.SKU} × {item.quantity} = ₹{item.totalPrice}
                    </div>
                  ))}
                  {
                    bill.shipping ? <div className="font-semibold">Shipping: ₹{bill?.shipping.methodName}</div> : <>null</>

                  }
                  <div className="font-semibold">Total: ₹{bill.totalPrice}</div>
                </div>
              </div>

              {mode === 'offline' && (
                <>
                  {/* Payment Method */}
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600 font-medium">Payment:</span>
                    <span className="text-gray-800">{bill.paymentMethod}</span>
                  </div>

                  {/* Amount Paid & Balance */}
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600 font-medium">Amount Paid:</span>
                    <span className="text-gray-800">₹{bill.amountPaid}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600 font-medium">Balance:</span>
                    <span className="text-gray-800">₹{bill.balance}</span>
                  </div>
                </>
              )}

              {mode === 'online' && (
                <>
                  {/* Online Payment & Order Status */}
                  <div className="border-t my-2 py-2">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600 font-medium">Payment Status:</span>
                      {bill.paymentMethod === 'razorpay_link' ? (
                        <div
                          className={`
                      text-[12px] px-3 py-1 rounded-full font-medium  inline-block
                      ${bill.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : ''}
                      ${bill.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' : ''}
                      ${bill.paymentStatus === 'PENDING' ? 'bg-orange-100 text-orange-800' : ''}
                      ${bill.paymentStatus === 'EXPIRED' ? 'bg-gray-100 text-gray-800' : ''}
                    `}
                        >
                          {bill.paymentStatus}
                        </div>
                      ) : (
                        <select
                          value={bill.paymentStatus || ''}
                          onChange={(e) => handlePaymentStatusChange(bill.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                          disabled={isLoading}
                        >
                          <option value="">Select Status</option>
                          <option value="PAID">Paid</option>
                          <option value="FAILED">Failed</option>
                        </select>
                      )}
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-gray-600 font-medium">Order Status:</span>
                      <div
                        className={`
                    text-[12px] px-3 py-1 rounded-full text-left font-medium inline-block uppercase
                    ${bill.status === 'paymentPending' ? 'bg-orange-100 text-orange-800' : ''}
                    ${bill.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${bill.status === 'printed' ? 'bg-blue-100 text-blue-800' : ''}
                    ${bill.status === 'packed' ? 'bg-violet-100 text-violet-800' : ''}
                    ${bill.status === 'shipped' ? 'bg-green-100 text-green-800' : ''}
                  `}
                      >
                        {bill.status}
                      </div>
                    </div>
                  </div>

                  {/* Tracking Info */}
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600 font-medium">Tracking Info:</span>
                    <span className="text-gray-800">
                      {bill.trackingNumber ? (
                        <>
                          <div>{bill.trackingNumber}</div>
                          {bill.weight && (
                            <div className="text-xs text-gray-500">
                              Weight: {bill.weight} kg
                            </div>
                          )}
                        </>
                      ) : (
                        '-'
                      )}
                    </span>
                  </div>
                </>
              )}

              {/* Notes */}
              <div className="border-t my-2 pt-2">
                <div className="text-gray-600 font-medium">Notes:</div>
                <div className="text-gray-800 text-sm">
                  {bill.notes ? bill.notes : '-'}
                  {bill.status}

                </div>
              </div>


            </div>
          ))}
        </div>
      </div>

      {/* Responsive Pagination Controls */}
      <div className="mt-4 space-y-3 sm:space-y-0 sm:flex sm:justify-between sm:items-center">
        <div className="text-sm text-gray-600 text-center sm:text-left">
          Showing {(currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, totalCount)} of {totalCount} bills
        </div>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-center">
            <Button
              variant="secondary"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="w-24 sm:w-auto"
            >
              Previous
            </Button>
            <div className="text-sm">
              <span className="hidden sm:inline">Page </span>
              {currentPage} / {Math.ceil(totalCount / pageSize)}
            </div>
            <Button
              variant="secondary"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= Math.ceil(totalCount / pageSize) || isLoading}
              className="w-24 sm:w-auto"
            >
              Next
            </Button>
          </div>
        </div>
        {isEditModalOpen && (
          <EditBillModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setBillToEdit(null);
            }}
            bill={billToEdit}
            onSave={handleUpdateBill}
          />
        )}

        {/* Delete confirmation modal */}
        {isDeleteModalOpen && (
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Confirm Delete"
          >
            <div className="p-6">
              <p>Are you sure you want to delete this bill?</p>
              <div className="mt-4 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(billToDelete!)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete all confirmation modal */}
        {isDeleteAllModalOpen && (
          <Modal
            isOpen={isDeleteAllModalOpen}
            onClose={() => setIsDeleteAllModalOpen(false)}
            title="Confirm Delete All"
          >
            <div className="p-6">
              <p>Are you sure you want to delete all bills?</p>
              <div className="mt-4 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteAllModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAll}
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting...' : 'Delete All'}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
}


