"use client";
import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/Button";

// Type definitions to match the API response
type Customer = {
  name: string;
  phone: string | null;
} | null;

type TransactionRecord = {
  id?: number | string;
  date: string;
  customerId: number | string | null;
  billNo: string;
  paymentMethod: string;
  paymentStatus: string;
  totalPrice: number;
  amountPaid: number;
  customer: Customer;
};

const DailyReport: React.FC = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setStartDate(newStart);
    if (endDate && endDate < newStart) {
      setEndDate("");
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  const fetchData = async () => {
    if (!startDate || !endDate) return alert("Select both dates");
    try {
      setLoading(true);
      const res = await axios.post("/api/reports", {
        start: startDate,
        end: endDate,
      });
      setData(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  // UPDATED handleDownload function with the fix
  const handleDownload = async (format: 'pdf' | 'xlsx') => {
    if (!startDate || !endDate) return alert("Select both dates");
    try {
      setLoading(true);
      const res = await axios.get("/api/reports", {
        params: { start: startDate, end: endDate, format: format },
        responseType: "blob",
      });

      const contentDisposition = res.headers['content-disposition'];
      let filename = `report.${format}`; // Default fallback filename

      if (contentDisposition) {
        // THE FIX: This is a more robust regex to extract the filename.
        // It specifically looks for the value inside double quotes.
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);

        if (filenameMatch && filenameMatch[1]) {
          // Use the captured group which is guaranteed to be just the filename
          filename = filenameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(`${format.toUpperCase()} download failed`);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(
    (row) => row.paymentStatus.toLowerCase() === "paid"
  );

  const totalPriceSum = filteredData.reduce(
    (sum, row) => sum + row.totalPrice,
    0
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl md:text-2xl font-semibold mb-6 ">Report Details</h1>

      <div className="flex flex-col sm:flex-row sm:flex-wrap md:items-center gap-3 md:gap-4">
        <input
          type="date"
          className="border p-2 rounded w-full sm:w-[180px] md:w-[200px]"
          value={startDate}
          onChange={handleStartDateChange}
        />
        <input
          type="date"
          min={startDate}
          className="border p-2 rounded w-full sm:w-[180px] md:w-[200px]"
          value={endDate}
          onChange={handleEndDateChange}
        />
        <Button className="w-full sm:w-auto" onClick={fetchData} disabled={loading}>
          {loading ? 'Fetching...' : 'Fetch Report'}
        </Button>
        <Button className="w-full sm:w-auto" onClick={() => handleDownload('pdf')} disabled={loading}>
          Download PDF
        </Button>
        <Button className="w-full sm:w-auto" onClick={() => handleDownload('xlsx')} disabled={loading}>
          Download Excel
        </Button>
      </div>

      {/* The rest of the component remains the same... */}
      {loading && <p className="text-gray-600 mt-4">Loading...</p>}
      {filteredData.length > 0 && (
        <div className="overflow-x-auto mt-6">
          <table className="w-full border text-sm text-left min-w-[800px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Customer Name</th>
                <th className="p-2 border">Customer Phone</th>
                <th className="p-2 border">Bill No</th>
                <th className="p-2 border">Payment Method</th>
                <th className="p-2 border">Total Price</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={row.id || `row-${index}`}>
                  <td className="p-2 border">{row.date.split("T")[0]}</td>
                  <td className="p-2 border">{row.customer?.name ?? 'N/A'}</td>
                  <td className="p-2 border">{row.customer?.phone ?? 'N/A'}</td>
                  <td className="p-2 border">{row.companyBillNo}</td>
                  <td className="p-2 border">{row.paymentMethod}</td>
                  <td className="p-2 border">₹{row.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-semibold">
                <td className="p-2 border" colSpan={5}>Total</td>
                <td className="p-2 border">₹{totalPriceSum.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {!loading && data.length > 0 && filteredData.length === 0 && (
        <p className="mt-4 text-red-500">No paid transactions found in this date range.</p>
      )}
    </div>
  );
};

export default DailyReport;