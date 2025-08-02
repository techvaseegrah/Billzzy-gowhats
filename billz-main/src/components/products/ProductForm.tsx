'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { toast } from 'react-toastify';
import React from 'react';  // Add this import

interface Category {
  id: number;
  name: string;
}

interface ProductFormProps {
  initialData?: {
    id?: number;
    name: string;
    SKU: string;
    netPrice: number;
    sellingPrice: number;
    quantity: number;
    categoryId?: number;
  };
  categories: Category[];
}

export default function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    SKU: initialData?.SKU || '',
    netPrice: initialData?.netPrice || 0,
    sellingPrice: initialData?.sellingPrice || 0,
    quantity: initialData?.quantity || 0,
    categoryId: initialData?.categoryId || '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      SKU: '',
      netPrice: '',
      sellingPrice: '',
      quantity: '',
      categoryId: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    if (formData.SKU.length < 2) {
      toast.error('SKU must have 2 letters')
      setIsLoading(false);

      return
    }

    try {
      const url = initialData?.id ? `/api/products/${initialData.id}` : '/api/products';

      const response = await fetch(url, {
        method: initialData?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          netPrice: Number(formData.netPrice),
          sellingPrice: Number(formData.sellingPrice),
          quantity: Number(formData.quantity),
          categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save product');
        toast.error(data.error || 'Failed to save product');
        return;
      }
      setSuccess('Product was Added Successfully')
      resetForm();

      router.refresh();

      return data;

    } catch (error: any) {
      
      toast.error(error.message)
      const errorMessage = error.message || 'Failed to save product';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;

  setFormData(prev => ({
    ...prev,
    [name]: name === 'SKU' ? value.toUpperCase() : value,
  }));
};

  return (
<form onSubmit={handleSubmit} className="space-y-6 w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow">
      
      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-100 text-green-700 border border-green-300 rounded">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded">
          {error}
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Input
          label="Product Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full"
        />

        <Input
          label="SKU"
          name="SKU"
          value={formData.SKU}
          onChange={handleChange}
          required
          className="w-full"
        />

        <Input
          label="Net Price"
          type="number"
          name="netPrice"
          value={formData.netPrice}
          onChange={handleChange}
          min="0"
          step="0.01"
          required
          className="w-full"
        />

        <Input
          label="Selling Price"
          type="number"
          name="sellingPrice"
          value={formData.sellingPrice}
          onChange={handleChange}
          min="0"
          step="0.01"
          required
          className="w-full"
        />

        <Input
          label="Quantity"
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="0"
          required
          className="w-full"
        />

        <Select
          label="Category"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          
          className="w-full"
        >
          <option value="">Select Category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full sm:w-auto"
        >
          {initialData?.id ? 'Update' : 'Create'} Product
        </Button>
      </div>
    </form>
  );
}