'use client';

import {
  CurrencyRupeeIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  TruckIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';
import RecentTransactions from './RecentTransactions';
import DashboardCharts from './DashboardCharts';
import DateFilter from './DateFilter';
import { PackageMinusIcon, Printer } from 'lucide-react';
import React from 'react';  // Add this import

interface Product {
  id: number;
  name: string;
  quantity: number;
}

interface FilteredStats {
  totalOrders: number;
  totalSales: number;
}

interface DashboardStatsProps {
  data: {
    todayStats: {
      _sum: {
        totalPrice: number | null;
      };
      _count: number;
    };
    totalProducts: number;
    lowStockProducts: Product[];
    recentTransactions: any[];
    smsCount: number;
    totalCustomers: number;
    ordersNeedingTracking: number;
    packingOrdersCount: number;
    printedOrdersCount: number;
    organisationId: string;
  };
}

export default function DashboardStats({ data, session }: DashboardStatsProps) {
  const [showLowStockTooltip, setShowLowStockTooltip] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateQuantity, setUpdateQuantity] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Date filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filteredStats, setFilteredStats] = useState<FilteredStats | null>(null);

  const handleAllTime = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analytics/filtered-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          allTime: true,  // New flag for all time
          organisationId: data.organisationId,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch filtered data');

      const filteredData = await response.json();
      setFilteredStats(filteredData);
      // Clear date inputs when using All Time
      setStartDate('');
      setEndDate('');
    } catch (error) {
      console.error('Error fetching all time data:', error);
      toast.error('Failed to fetch all time data');
    } finally {
      setIsLoading(false);
    }
  };


  const handleUpdateStock = async () => {
    if (!updateQuantity || parseInt(updateQuantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch('/api/products/bulkUpdateStock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: data.lowStockProducts.map(product => product.id),
          quantityToAdd: parseInt(updateQuantity)
        }),
      });

      if (!response.ok) throw new Error('Failed to update stock');

      toast.success('Stock updated successfully');
      setIsUpdateModalOpen(false);
      setUpdateQuantity('');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update stock');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFilterApply = async () => {
    if (!startDate || !endDate) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/analytics/filtered-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          organisationId: data.organisationId,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch filtered data');

      const filteredData = await response.json();
      setFilteredStats(filteredData);
    } catch (error) {
      console.error('Error fetching filtered data:', error);
      toast.error('Failed to fetch filtered data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setFilteredStats(null);
  };

  const stats = [
    {
      name: filteredStats
        ? startDate || endDate
          ? "Filtered Sales"
          : "All Time Sales"
        : "Today's Sales",
      value: `₹${(filteredStats?.totalSales ?? data.todayStats._sum.totalPrice ?? 0).toFixed(2)}`,
      icon: CurrencyRupeeIcon,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
      valueColor: 'text-blue-700',
    },
    {
      name: filteredStats
        ? startDate || endDate
          ? "Filtered Orders"
          : "All Time Orders"
        : "Today's Orders",
      value: (filteredStats?.totalOrders ?? data.todayStats._count).toString(),
      icon: DocumentTextIcon,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-500',
      valueColor: 'text-green-700',
    },
    {
      name: 'Total Products',
      value: data.totalProducts.toString(),
      icon: ShoppingBagIcon,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-500',
      valueColor: 'text-purple-700',
    },
    {
      name: 'Low Stock Items',
      value: data.lowStockProducts.length.toString(),
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-500',
      valueColor: 'text-red-700',
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <DateFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onFilterApply={handleFilterApply}
        onReset={handleReset}
        onAllTime={handleAllTime}  // Add this
        isLoading={isLoading}
        data={data}
      />


      <div className="">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <motion.div
              key={stat.name}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className={`relative rounded-xl shadow-sm ${stat.bgColor}`}
              onMouseEnter={() =>
                stat.name === 'Low Stock Items' && setShowLowStockTooltip(true)
              }
              onMouseLeave={() => setShowLowStockTooltip(false)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${stat.iconColor}`}>
                      {stat.name}
                    </div>
                    <div className={`mt-2 text-2xl font-bold ${stat.valueColor}`}>
                      {stat.value}
                    </div>
                  </div>
                  <div className="flex flex-col justify-between h-[100%] items-center space-x-2">
                    <div className={`p-3 rounded-lg cursor-pointer ${stat.bgColor} ${stat.iconColor}`}>
                      <stat.icon
                        onClick={() => {
                          if (stat.name === 'Low Stock Items') {
                            setIsUpdateModalOpen(true);
                          }
                        }}
                        className={`h-6 w-6 ${stat.iconColor}`}
                      />
                    </div>
                  </div>
                </div>

                {stat.name === 'Low Stock Items' && showLowStockTooltip && data.lowStockProducts.length > 0 && (
                  <div className="absolute z-10 w-64 p-4 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 -right-2 top-full">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Low Stock Products:
                    </h4>
                    <ul className="space-y-2">
                      {data.lowStockProducts.map((product) => (
                        <li key={product.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{product.name}</span>
                          <span className="font-medium text-red-500">
                            {product.quantity} left
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {(stat.name === "Today's Sales" || stat.name === "Filtered Sales" ||
                stat.name === "Today's Orders" || stat.name === "Filtered Orders") && (
                  <div className="h-1 w-full bg-gray-200 rounded-b-xl">
                    <div
                      className={`h-full ${stat.name.includes('Sales') ? 'bg-blue-500' : 'bg-green-500'
                        } rounded-b-xl`}
                      style={{ width: '70%' }}
                    />
                  </div>
                )}
            </motion.div>
          ))}
        </div>

        <div className="mt-6">
          <DashboardCharts organisationId={parseInt(data.organisationId)} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="md:w-1/2 p-2">
          <div className="bg-white shadow-sm rounded-lg p-4 overflow-y-scroll h-[31vh]">
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
            <RecentTransactions data={data.recentTransactions} />
          </div>
        </div>

        <div className="md:w-1/2 p-2 flex flex-col space-y-4">
          <div className="flex flex-row h-[15vh] space-x-4">
            <div className="w-1/3 bg-indigo-50 text-indigo-500 shadow-sm rounded-lg p-4 flex flex-col items-center justify-center">
              <TruckIcon className="h-6 w-6" />
              <div className="mt-2 text-sm font-medium">Tracking Numbers Needed</div>
              <div className="text-2xl font-bold text-indigo-700">{data.ordersNeedingTracking}</div>
            </div>
            <div className="w-1/3 bg-yellow-50 text-yellow-500 shadow-sm rounded-lg p-4 flex flex-col items-center justify-center">
              <PackageMinusIcon className="h-6 w-6" />
              <div className="mt-2 text-sm font-medium">Packing Orders</div>
              <div className="text-2xl font-bold text-yellow-700">{data.packingOrdersCount}</div>
            </div>
            <div className="w-1/3 bg-green-50 text-green-500 shadow-sm rounded-lg p-4 flex flex-col items-center justify-center">
              <Printer className="h-6 w-6" />
              <div className="mt-2 text-sm font-medium">Printed Orders</div>
              <div className="text-2xl font-bold text-green-700">{data.printedOrdersCount}</div>
            </div>
          </div>

          <div className="flex flex-row space-x-4">
            <div className="w-1/2 bg-teal-50 text-teal-500 shadow-sm rounded-lg p-4 flex flex-col items-center justify-center">
              <UserGroupIcon className="h-6 w-6" />
              <div className="mt-2 text-sm font-medium">Total Customers</div>
              <div className="text-2xl font-bold text-teal-700">{data.totalCustomers}</div>
            </div>
            <div className="w-1/2 bg-pink-50 text-pink-500 shadow-sm rounded-lg p-4 flex flex-col items-center justify-center">
              <ChatBubbleLeftIcon className="h-6 w-6" />
              <div className="mt-2 text-sm font-medium">Total SMS Cost</div>
              <div className="text-2xl font-bold text-pink-700">₹{(data.smsCount * 0.30).toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg p-6 max-w-sm w-full">
            <Dialog.Title className="text-lg font-medium mb-4">
              Update Stock Quantity
            </Dialog.Title>

            <p className="text-sm text-gray-600 mb-4">
              Enter the quantity to add to all low stock products:
            </p>

            <input
              type="number"
              value={updateQuantity}
              onChange={(e) => setUpdateQuantity(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
              placeholder="Enter quantity to add"
              min="1"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStock}
                disabled={isUpdating}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                {isUpdating ? 'Updating...' : 'Update Stock'}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}