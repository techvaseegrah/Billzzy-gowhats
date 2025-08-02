// components/dashboard/DateFilter.tsx
import React from 'react';
import { Calendar } from 'lucide-react';

interface DateFilterProps {
    startDate: string;
    endDate: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    onFilterApply: () => void;
    onReset: () => void;
    onAllTime: () => void;  // New prop for All Time
    isLoading: boolean;
  }

export default function DateFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onFilterApply,
  onReset,
  onAllTime,  // Add this prop
  data,
  isLoading
}: DateFilterProps) {
    console.log(data);
    
  return (
    <div className="md:flex items-center justify-between space-x-4 mb-4  hidden  ">
      {/* <Calendar className="text-gray-500 w-5 h-5" /> */}
      <div className="flex items-center space-x-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-gray-500">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={onFilterApply}
          disabled={!startDate || !endDate || isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors disabled:bg-blue-300"
        >
          {isLoading ? 'Loading...' : 'Apply Filter'}
        </button>
        <button
          onClick={onAllTime}
          disabled={isLoading}
          className="bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600 transition-colors disabled:bg-green-300"
        >
          All Time
        </button>
        <button
          onClick={onReset}
          disabled={isLoading}
          className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-md text-sm"
        >
          Reset
        </button>
      </div>
      <div className="flex justify-center   items-center mb-4">
          <h2 className="text-xl font-semibold">{data?.session.user?.name} </h2><h1> - </h1>
          <p className="text-gray-500 text-[14px]"> ({data?.session.user?.shopName})</p>
      
        {/* Rest of the header content */}
      </div>
    </div>
  );
}