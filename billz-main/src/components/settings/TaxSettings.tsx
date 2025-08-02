'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

type Tax = {
  name: string;
  type: 'Percentage' | 'Fixed';
  value: number;
  autoApply: boolean;
};

export const TaxSettings = () => {
  const [tax, setTax] = useState<Tax>({
    name: 'GST',
    type: 'Percentage',
    value: 18,
    autoApply: true,
  });

  useEffect(() => {
    axios.get('/api/settings/tax').then((res) => {
      if (res.data.tax) setTax(res.data.tax);
    });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, value, checked } = e.target;
    setTax((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const saveTax = async () => {
    try {
      await axios.post('/api/settings/tax', tax);
      toast.success('Tax saved successfully!'); // Using toast instead of alert
    } catch (err) {
      console.error(err);
      toast.error('Failed to save tax.'); // Using toast instead of alert
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Tax Settings</h2>

      <div className="bg-white p-6 shadow-md rounded-lg space-y-6 border">
        <div>
          <label className="block text-sm font-semibold mb-1">Tax Name</label>
          <input
            type="text"
            name="name"
            value={tax.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., GST"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Tax Type</label>
          <select
            name="type"
            value={tax.type}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="Percentage">Percentage</option>
            <option value="Fixed">Fixed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Tax Value</label>
          <input
            type="number"
            name="value"
            value={tax.value}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 18"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="autoApply"
            checked={tax.autoApply}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-sm text-gray-700">Auto-apply this tax</label>
        </div>

        <div className="text-right pt-4">
          <button
            onClick={saveTax}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          >
            Save Tax
          </button>
        </div>

      </div>
    </div>
  );
};