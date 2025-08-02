// components/CustomerForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {  toast } from 'react-toastify';
import React from 'react';  // Add this import

interface CustomerFormProps {
  initialData?: {
    id?: number;
    name: string;
    phone: string;
    email?: string;
    flatNo?: string;
    street?: string;
    district?: string;
    state?: string;
    pincode?: string;
  };
  isEditing?: boolean;
}

export function CustomerForm({ initialData, isEditing = false }: CustomerFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    flatNo: initialData?.flatNo || '',
    street: initialData?.street || '',
    district: initialData?.district || '',
    state: initialData?.state || '',
    pincode: initialData?.pincode || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = isEditing 
        ? `/api/customers/${initialData?.id}` 
        : '/api/customers';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
      }

      toast.success(isEditing ? 'Customer updated!' : 'Customer added!');
      router.refresh();
      router.push('/customers');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Customer name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="Phone number"
            pattern="[0-9]{10}"
            title="Please enter a valid 10-digit phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Flat No
          </label>
          <Input
            type="text"
            name="flatNo"
            value={formData.flatNo}
            onChange={handleChange}
            placeholder="Flat/House number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Street
          </label>
          <Input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="Street address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            District
          </label>
          <Input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleChange}
            placeholder="District"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            State
          </label>
          <Input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="State"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Pincode
          </label>
          <Input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder="Pincode"
            pattern="[0-9]{6}"
            title="Please enter a valid 6-digit pincode"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/customers')}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEditing ? 'Update Customer' : 'Add Customer'}
        </Button>
      </div>
    </form>
  );
}