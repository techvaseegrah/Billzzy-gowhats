'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Cell
} from 'recharts';
import { Card } from '../ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/ChartSelect';
import React from 'react';  // Add this import

interface DashboardChartsProps {
  organisationId: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-lg font-semibold text-indigo-600">
          ₹{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-indigo-600">
          Quantity: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const timeRanges = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: '3months', label: 'Last 3 Months' },
  { value: 'year', label: 'This Year' },
];

export default function DashboardCharts({ organisationId }: DashboardChartsProps) {
  const [salesData, setSalesData] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const [salesResponse, productsResponse] = await Promise.all([
          fetch(`/api/analytics/sales?organisationId=${organisationId}&timeRange=${timeRange}`),
          fetch(`/api/analytics/top-product?organisationId=${organisationId}&timeRange=${timeRange}`)
        ]);

        const salesData = await salesResponse.json();
        const productsData = await productsResponse.json();

        setSalesData(salesData);
        setTopProducts(productsData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [organisationId, timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-0">Sales Overview</h2>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={salesData?.data || []}
                margin={{ top: 10, right: 20, left: 40, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickLine={{ stroke: '#E5E7EB' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickLine={{ stroke: '#E5E7EB' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                  dot={{ fill: '#8B5CF6', r: 4 }}
                  activeDot={{ r: 6, fill: '#7C3AED' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <Card className="w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Top Selling Products</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={topProducts?.data || []}
                margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#A78BFA" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis 
                  dataKey="name"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB' }}
                  interval={0}
                  height={50}
                  textAnchor="middle"
                  angle={window.innerWidth < 768 ? 45 : 0}
                />
                <YAxis
                  tickFormatter={(value) => value.toString()}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                  content={<CustomBarTooltip />}
                />
                <Bar 
                  dataKey="quantity"
                  fill="url(#barGradient)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                >
                  {(topProducts?.data || []).map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill="url(#barGradient)"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
}